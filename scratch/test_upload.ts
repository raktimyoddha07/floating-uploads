import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const requestId = "cmql5f58t000xj6ggd90ussh9";

  console.log("1. Fetching upload request from DB...");
  const req = await prisma.uploadRequest.findUnique({
    where: { id: requestId },
    include: { channel: true },
  });

  if (!req) { console.error("Request not found!"); return; }
  if (!req.videoUrl) { console.error("No videoUrl!"); return; }
  if (!req.channel.accessToken) { console.error("No accessToken!"); return; }

  console.log("   Status:", req.status);
  console.log("   VideoUrl:", req.videoUrl);
  console.log("   Token expires:", req.channel.tokenExpiresAt);

  // Check file path
  const relativePath = req.videoUrl.replace(/^\/uploads\//, "");
  const absolutePath = path.join(process.cwd(), "uploads", ...relativePath.split("/"));
  console.log("\n2. Checking file exists at:", absolutePath);
  console.log("   Exists:", fs.existsSync(absolutePath));

  if (!fs.existsSync(absolutePath)) {
    console.error("File NOT found! Looking for it in uploads dir...");
    const files = fs.readdirSync(path.join(process.cwd(), "uploads", "channels", req.channelId));
    console.log("   Files in channel dir:", files);
    return;
  }

  // Test OAuth client
  console.log("\n3. Setting up OAuth client...");
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/youtube/callback`
  );

  oauth2Client.setCredentials({
    access_token: req.channel.accessToken,
    refresh_token: req.channel.refreshToken ?? undefined,
  });

  // Test if token needs refresh
  if (req.channel.tokenExpiresAt && req.channel.tokenExpiresAt < new Date()) {
    console.log("   Token expired, refreshing...");
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      console.log("   Token refreshed successfully");
    } catch (e) {
      console.error("   Token refresh FAILED:", e);
      return;
    }
  } else {
    console.log("   Token is still valid (not expired)");
  }

  // Try listing channels to verify credentials work
  console.log("\n4. Testing YouTube API access...");
  try {
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const res = await youtube.channels.list({ part: ["snippet"], mine: true });
    console.log("   YouTube API OK! Channel:", res.data.items?.[0]?.snippet?.title);
  } catch (e: any) {
    console.error("   YouTube API FAILED:", e.message);
    console.error("   Details:", JSON.stringify(e.response?.data ?? {}, null, 2));
    return;
  }

  // Actually try uploading
  console.log("\n5. Attempting YouTube upload...");
  try {
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: req.title || "Test Upload",
          description: req.description || "",
          categoryId: "22",
        },
        status: { privacyStatus: "private" },
      },
      media: { body: fs.createReadStream(absolutePath) },
    });
    console.log("   Upload SUCCESS! Video ID:", response.data.id);
  } catch (e: any) {
    console.error("   Upload FAILED:", e.message);
    console.error("   Details:", JSON.stringify(e.response?.data ?? {}, null, 2));
  }
}

main()
  .catch(e => { console.error("Unhandled error:", e); })
  .finally(() => prisma.$disconnect());
