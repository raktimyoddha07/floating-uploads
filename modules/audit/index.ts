import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  action: string;
  entityId: string;
  entityType: string;
  actorId: string;
  details?: string;
}) {
  return prisma.auditLog.create({
    data: params,
  });
}
