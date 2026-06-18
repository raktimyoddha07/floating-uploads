import { prisma } from "@/lib/prisma";

export async function logActivity(userId: string, action: string, details?: string) {
  return prisma.activity.create({
    data: {
      userId,
      action,
      details,
    },
  });
}
