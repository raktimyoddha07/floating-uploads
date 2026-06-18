import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, latestPayment] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.payment.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ user, latestPayment });
  } catch (error) {
    console.error("Failed to fetch settings data", error);
    return NextResponse.json({ error: "Failed to fetch settings data" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { name?: string; username?: string };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(typeof body.name === "string" ? { name: body.name.trim() || null } : {}),
        ...(typeof body.username === "string" ? { username: body.username.trim() || null } : {}),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Failed to update settings", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
