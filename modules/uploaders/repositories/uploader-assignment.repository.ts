import { prisma } from "@/lib/prisma";
import { PermissionType } from "@prisma/client";

export class UploaderAssignmentRepository {
  async assignUploader(data: {
    ownerId: string;
    uploaderId: string;
    channelId: string;
    permission: PermissionType;
  }) {
    const existingAssignment = await prisma.uploaderAssignment.findFirst({
      where: {
        ownerId: data.ownerId,
        uploaderId: data.uploaderId,
        channelId: data.channelId,
      },
    });

    if (existingAssignment) {
      return prisma.uploaderAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          permission: data.permission,
          revokedAt: null,
          grantedAt: new Date(),
        },
      });
    }

    return prisma.uploaderAssignment.create({ data });
  }

  async findByChannelId(channelId: string) {
    return prisma.uploaderAssignment.findMany({
      where: { channelId, revokedAt: null },
      include: {
        uploader: {
          select: { id: true, name: true, username: true, image: true },
        },
        channel: {
          select: { id: true, name: true },
        },
      },
      orderBy: { grantedAt: "desc" },
    });
  }

  async findByOwnerId(ownerId: string) {
    return prisma.uploaderAssignment.findMany({
      where: { ownerId, revokedAt: null },
      include: {
        uploader: {
          select: { id: true, name: true, username: true, image: true },
        },
        channel: {
          select: { id: true, name: true },
        },
      },
      orderBy: { grantedAt: "desc" },
    });
  }

  async updatePermission(id: string, permission: PermissionType) {
    return prisma.uploaderAssignment.update({
      where: { id },
      data: { permission },
    });
  }

  async revoke(id: string) {
    return prisma.uploaderAssignment.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}

export const uploaderAssignmentRepository = new UploaderAssignmentRepository();
