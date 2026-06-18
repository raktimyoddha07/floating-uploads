import { uploadRequestRepository } from "../repositories/upload-request.repository";
import { UploadType } from "@prisma/client";

export class UploadRequestService {
  async createDraft(
    uploaderId: string,
    channelId: string,
    type: UploadType,
    data?: {
      title?: string;
      description?: string;
      note?: string;
      videoUrl?: string;
    },
  ) {
    return uploadRequestRepository.create({
      uploaderId,
      channelId,
      type,
      title: data?.title,
      description: data?.description,
      note: data?.note,
      videoUrl: data?.videoUrl,
      status: "DRAFT",
    });
  }

  async submitForReview(id: string) {
    return uploadRequestRepository.updateStatus(id, "PENDING_REVIEW");
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
    return uploadRequestRepository.updateDraft(id, data);
  }

  async deleteDraft(id: string) {
    return uploadRequestRepository.deleteDraft(id);
  }

  async approveRequest(id: string) {
    return uploadRequestRepository.updateStatus(id, "APPROVED");
  }

  async scheduleRequest(id: string, scheduledFor: Date) {
    return uploadRequestRepository.schedule(id, scheduledFor);
  }

  async rejectRequest(id: string) {
    return uploadRequestRepository.updateStatus(id, "REJECTED");
  }

  async getRequestsForOwner(ownerId: string) {
    return uploadRequestRepository.findByChannelOwner(ownerId);
  }

  async getRequestsForUploader(uploaderId: string) {
    return uploadRequestRepository.findByUploader(uploaderId);
  }

  async getUploaderDraftById(id: string, uploaderId: string) {
    return uploadRequestRepository.findUploaderDraftById(id, uploaderId);
  }

  async getRequestById(id: string) {
    return uploadRequestRepository.findDetailedById(id);
  }
}

export const uploadRequestService = new UploadRequestService();
