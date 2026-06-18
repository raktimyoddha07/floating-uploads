import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { uploaderService } from "@/modules/uploaders/services/uploader.service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      username?: string;
      channelId?: string;
      permission?: "SHORTS" | "LONG_VIDEO" | "BOTH";
    };

    if (!body.username || !body.channelId || !body.permission) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const channel = await prisma.channel.findUnique({ where: { id: body.channelId } });
    if (!channel || channel.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assignment = await uploaderService.assignUploader(
      userId,
      body.username,
      body.channelId,
      body.permission,
    );

    const user = await prisma.user.findUnique({ where: { id: assignment.uploaderId } });
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "ACCESS_GRANTED",
          title: "Uploader access granted",
          message: `You can now upload content for ${channel.name}.`,
          link: "/uploader",
        },
      });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Failed to assign uploader", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to assign uploader" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      assignmentId?: string;
      permission?: "SHORTS" | "LONG_VIDEO" | "BOTH";
      revoke?: boolean;
    };

    if (!body.assignmentId) {
      return NextResponse.json({ error: "Missing assignmentId" }, { status: 400 });
    }

    const assignment = await prisma.uploaderAssignment.findUnique({
      where: { id: body.assignmentId },
    });

    if (!assignment || assignment.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.revoke) {
      await uploaderService.revokeAccess(body.assignmentId);
      return NextResponse.json({ success: true });
    }

    if (!body.permission) {
      return NextResponse.json({ error: "Missing permission" }, { status: 400 });
    }

    const updated = await uploaderService.updatePermission(body.assignmentId, body.permission);
    return NextResponse.json({ assignment: updated });
  } catch (error) {
    console.error("Failed to update uploader assignment", error);
    return NextResponse.json({ error: "Failed to update uploader assignment" }, { status: 500 });
  }
}
