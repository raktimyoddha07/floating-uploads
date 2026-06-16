import { prisma } from "@/lib/prisma";
import { UploadRequestStatus, UploadType } from "@prisma/client";

export class UploadRequestRepository {
  async create(data: {
    uploaderId: string;
    channelId: string;
    title?: string;
    description?: string;
    note?: string;
    type: UploadType;
    status: UploadRequestStatus;
    videoUrl?: string;
  }) {
    return prisma.uploadRequest.create({ data });
  }

  async findById(id: string) {
    return prisma.uploadRequest.findUnique({
      where: { id },
      include: { channel: true, uploader: true, videoMetadata: true }
    });
  }

  async updateStatus(id: string, status: UploadRequestStatus) {
    return prisma.uploadRequest.update({
      where: { id },
      data: { status }
    });
  }

  async findByChannelOwner(ownerId: string) {
    return prisma.uploadRequest.findMany({
      where: { channel: { ownerId } },
      include: { uploader: true, channel: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const uploadRequestRepository = new UploadRequestRepository();
