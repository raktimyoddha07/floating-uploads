import { uploaderAssignmentRepository } from "../repositories/uploader-assignment.repository";
import { PermissionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class UploaderService {
  async assignUploader(
    ownerId: string,
    uploaderUsername: string,
    channelId: string,
    permission: PermissionType,
  ) {
    // 1. Find user by username
    const user = await prisma.user.findUnique({
      where: { username: uploaderUsername },
    });
    if (!user) throw new Error("User not found");

    // 2. Create assignment
    return uploaderAssignmentRepository.assignUploader({
      ownerId,
      uploaderId: user.id,
      channelId,
      permission,
    });
  }

  async getChannelUploaders(channelId: string) {
    return uploaderAssignmentRepository.findByChannelId(channelId);
  }

  async getOwnerAssignments(ownerId: string) {
    return uploaderAssignmentRepository.findByOwnerId(ownerId);
  }

  async updatePermission(assignmentId: string, permission: PermissionType) {
    return uploaderAssignmentRepository.updatePermission(
      assignmentId,
      permission,
    );
  }

  async revokeAccess(assignmentId: string) {
    return uploaderAssignmentRepository.revoke(assignmentId);
  }
}

export const uploaderService = new UploaderService();
