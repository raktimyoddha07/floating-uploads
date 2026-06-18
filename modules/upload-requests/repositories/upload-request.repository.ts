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
      include: { channel: true, uploader: true, videoMetadata: true },
    });
  }

  async findDetailedById(id: string) {
    return prisma.uploadRequest.findUnique({
      where: { id },
      include: { channel: true, uploader: true, videoMetadata: true },
    });
  }

  async updateStatus(id: string, status: UploadRequestStatus) {
    return prisma.uploadRequest.update({
      where: { id },
      data: { status },
    });
  }

  async schedule(id: string, scheduledFor: Date) {
    return prisma.uploadRequest.update({
      where: { id },
      data: {
        status: "SCHEDULED",
        scheduledFor,
      },
    });
  }

  async updateDraft(
    id: string,
    data: {
      title?: string;
      description?: string;
      note?: string;
      type?: UploadType;
      channelId?: string;
      thumbnailUrl?: string;
    },
  ) {
    return prisma.uploadRequest.update({
      where: { id },
      data,
    });
  }

  async deleteDraft(id: string) {
    return prisma.uploadRequest.delete({ where: { id } });
  }

  async findByUploader(uploaderId: string) {
    return prisma.uploadRequest.findMany({
      where: { uploaderId },
      include: { channel: true, videoMetadata: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findUploaderDraftById(id: string, uploaderId: string) {
    return prisma.uploadRequest.findFirst({
      where: {
        id,
        uploaderId,
        status: "DRAFT",
      },
      include: { channel: true },
    });
  }

  async findByChannelOwner(ownerId: string) {
    return prisma.uploadRequest.findMany({
      where: { channel: { ownerId } },
      include: { uploader: true, channel: true, videoMetadata: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const uploadRequestRepository = new UploadRequestRepository();
