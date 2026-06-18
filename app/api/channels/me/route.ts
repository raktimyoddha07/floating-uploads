import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId =
      session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await prisma.uploaderAssignment.findMany({
      where: {
        uploaderId: userId,
        revokedAt: null,
      },
      include: {
        channel: true,
      },
      orderBy: {
        grantedAt: "desc",
      },
    });

    return NextResponse.json({
      channels: assignments.map((assignment) => ({
        id: assignment.channel.id,
        name: assignment.channel.name,
        permission: assignment.permission,
      })),
    });
  } catch (error) {
    console.error("Failed to load uploader channels", error);
    return NextResponse.json(
      { error: "Failed to load channels" },
      { status: 500 },
    );
  }
}
