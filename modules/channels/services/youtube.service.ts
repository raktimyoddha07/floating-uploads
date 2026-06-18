import { google } from "googleapis";
import fs from "fs";

export const getYouTubeAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/youtube/callback`
  );
};

export const generateYouTubeAuthUrl = () => {
  const oauth2Client = getYouTubeAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly"
    ],
    prompt: "consent" // Force to get refresh token
  });
  return url;
};

export const getYouTubeTokens = async (code: string) => {
  const oauth2Client = getYouTubeAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const uploadVideoToYouTube = async ({
  accessToken,
  refreshToken,
  videoPath,
  title,
  description,
  privacyStatus = "private",
}: {
  accessToken: string;
  refreshToken?: string;
  videoPath: string;
  title: string;
  description: string;
  privacyStatus?: string;
}) => {
  const oauth2Client = getYouTubeAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const fileSize = fs.statSync(videoPath).size;

  const res = await youtube.videos.insert(
    {
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
        },
        status: {
          privacyStatus,
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    },
    {
      onUploadProgress: (evt) => {
        const progress = (evt.bytesRead / fileSize) * 100;
        console.log(`[YouTube Upload] ${Math.round(progress)}% completed`);
      },
    }
  );

  return res.data;
};

export const getYouTubeChannelDetails = async ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken?: string;
}) => {
  const oauth2Client = getYouTubeAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const res = await youtube.channels.list({
    part: ["snippet"],
    mine: true,
  });

  if (!res.data.items || res.data.items.length === 0) {
    throw new Error("No YouTube channel found for this account.");
  }

  return res.data.items[0];
};
