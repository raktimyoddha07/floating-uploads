import { prisma } from "@/lib/prisma";
import { PermissionType } from "@prisma/client";

export class UploaderAssignmentRepository {
  async assignUploader(data: { ownerId: string; uploaderId: string; channelId: string; permission: PermissionType }) {
    return prisma.uploaderAssignment.create({ data });
  }

  async findByChannelId(channelId: string) {
    return prisma.uploaderAssignment.findMany({
      where: { channelId, revokedAt: null },
      include: {
        uploader: {
          select: { id: true, name: true, username: true, image: true }
        }
      }
    });
  }

  async updatePermission(id: string, permission: PermissionType) {
    return prisma.uploaderAssignment.update({
      where: { id },
      data: { permission }
    });
  }

  async revoke(id: string) {
    return prisma.uploaderAssignment.update({
      where: { id },
      data: { revokedAt: new Date() }
    });
  }
}

export const uploaderAssignmentRepository = new UploaderAssignmentRepository();
