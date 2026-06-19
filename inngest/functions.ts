import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";

export const processUploadJob = inngest.createFunction(
  { id: "process-upload-job", event: "upload/process" },
  async ({ event, step }) => {
    const { requestId } = event.data as { requestId: string };

    // Step 1: Fetch request + channel tokens
    const uploadRequest = await step.run("fetch-request", async () => {
      const req = await prisma.uploadRequest.findUnique({
        where: { id: requestId },
        include: {
          channel: true,
        },
      });

      if (!req) throw new Error(`Upload request ${requestId} not found`);
      if (!req.videoUrl) throw new Error("No video file attached to this request");
      if (!req.channel.accessToken) throw new Error("Channel has no access token. Owner must re-connect their Google account.");

      return req;
    });

    // Step 2: Mark as UPLOADING
    await step.run("mark-uploading", async () => {
      await prisma.uploadRequest.update({
        where: { id: requestId },
        data: { status: "UPLOADING" },
      });
    });

    // Step 3: Upload to YouTube
    const youtubeVideoId = await step.run("upload-to-youtube", async () => {
      // Build OAuth2 client from channel tokens
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXTAUTH_URL + "/api/auth/callback/google",
      );

      oauth2Client.setCredentials({
        access_token: uploadRequest.channel.accessToken,
        refresh_token: uploadRequest.channel.refreshToken ?? undefined,
      });

      // Auto-refresh access token if expired
      if (
        uploadRequest.channel.tokenExpiresAt &&
        uploadRequest.channel.tokenExpiresAt < new Date()
      ) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        await prisma.channel.update({
          where: { id: uploadRequest.channel.id },
          data: {
            accessToken: credentials.access_token,
            tokenExpiresAt: credentials.expiry_date
              ? new Date(credentials.expiry_date)
              : null,
          },
        });
        oauth2Client.setCredentials(credentials);
      }

      // Resolve the video file path from the stored URL
      // videoUrl is like /uploads/channels/xxx/timestamp-filename.mp4
      const relativePath = uploadRequest.videoUrl!.replace(/^\/uploads\//, "");
      const absolutePath = path.join(
        process.cwd(),
        "uploads",
        ...relativePath.split("/"),
      );

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Video file not found on disk: ${absolutePath}`);
      }

      const youtube = google.youtube({ version: "v3", auth: oauth2Client });

      // Determine category and whether it's a Short
      const isShort = uploadRequest.type === "SHORTS";

      const response = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: uploadRequest.title || "Untitled Video",
            description: uploadRequest.description || "",
            categoryId: "22", // "People & Blogs" — safe generic default
            // YouTube automatically classifies Shorts based on duration & aspect ratio
          },
          status: {
            privacyStatus: "public",
          },
        },
        media: {
          body: fs.createReadStream(absolutePath),
        },
      });

      const videoId = response.data.id;
      if (!videoId) throw new Error("YouTube did not return a video ID");

      return videoId;
    });

    // Step 4: Mark as UPLOADED and store YouTube video ID
    await step.run("mark-uploaded", async () => {
      await prisma.uploadRequest.update({
        where: { id: requestId },
        data: {
          status: "UPLOADED",
          // Store the YouTube URL in thumbnailUrl field for now (or you can add a youtubeVideoId column)
          thumbnailUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        },
      });

      // Notify uploader that video is now live on YouTube (as private)
      await prisma.notification.create({
        data: {
          userId: uploadRequest.uploaderId,
          type: "UPLOAD_COMPLETED",
          title: "Video uploaded to YouTube!",
          message: `"${uploadRequest.title || "Your video"}" was successfully uploaded to ${uploadRequest.channel.name} as a public video.`,
          link: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        },
      });
    });

    return { success: true, requestId, youtubeVideoId };
  },
);
