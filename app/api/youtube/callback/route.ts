import { NextResponse, NextRequest } from "next/server";
import {
  getYouTubeTokens,
  getYouTubeChannelDetails,
} from "@/modules/channels/services/youtube.service";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user && "id" in session.user ? session.user.id : null;

  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/appoint-uploader?error=NoCode", req.url),
    );
  }

  try {
    const tokens = await getYouTubeTokens(code);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    const channelDetails = await getYouTubeChannelDetails({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
    });

    const youtubeId = channelDetails.id as string;
    const name = channelDetails.snippet?.title || "Unknown Channel";
    const pictureUrl = channelDetails.snippet?.thumbnails?.default?.url || null;
    const handle = channelDetails.snippet?.customUrl || null;

    // Save or update channel in database
    await prisma.channel.upsert({
      where: { youtubeId },
      create: {
        youtubeId,
        name,
        handle,
        pictureUrl,
        ownerId: userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
      update: {
        name,
        handle,
        pictureUrl,
        ownerId: userId,
        accessToken: tokens.access_token,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        ...(tokens.expiry_date
          ? { tokenExpiresAt: new Date(tokens.expiry_date) }
          : {}),
      },
    });

    return NextResponse.redirect(
      new URL("/appoint-uploader?success=ChannelConnected", req.url),
    );
  } catch (error) {
    console.error("YouTube connection error:", error);
    return NextResponse.redirect(
      new URL("/appoint-uploader?error=ConnectionFailed", req.url),
    );
  }
}
