import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/modules/acitivty";
import { logAudit } from "@/modules/audit";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId =
      session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("id");

    if (!channelId) {
      return NextResponse.json({ error: "Missing channel id" }, { status: 400 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    if (channel.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the channel (Cascade deletes assignments and upload requests)
    await prisma.channel.delete({
      where: { id: channelId },
    });

    await logActivity(userId, `Disconnected channel: ${channel.name}`, channelId);
    await logAudit({
      action: "CHANNEL_DISCONNECTED",
      entityId: channelId,
      entityType: "Channel",
      actorId: userId,
      details: `Disconnected channel ${channel.name} (${channel.handle || "no handle"})`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Channel disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect channel" },
      { status: 500 },
    );
  }
}
