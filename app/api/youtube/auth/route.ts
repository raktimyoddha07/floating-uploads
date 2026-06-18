import { NextResponse } from "next/server";
import { generateYouTubeAuthUrl } from "@/modules/channels/services/youtube.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && "id" in session.user ? session.user.id : null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = generateYouTubeAuthUrl();
  return NextResponse.redirect(url);
}
