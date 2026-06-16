import { uploadRequestRepository } from "../repositories/upload-request.repository";
import { UploadRequestStatus, UploadType } from "@prisma/client";

export class UploadRequestService {
  async createDraft(uploaderId: string, channelId: string, type: UploadType) {
    return uploadRequestRepository.create({
      uploaderId,
      channelId,
      type,
      status: "DRAFT"
    });
  }

  async submitForReview(id: string) {
    // Basic validation could happen here
    return uploadRequestRepository.updateStatus(id, "PENDING_REVIEW");
  }

  async approveRequest(id: string) {
    return uploadRequestRepository.updateStatus(id, "APPROVED");
  }

  async rejectRequest(id: string) {
    return uploadRequestRepository.updateStatus(id, "REJECTED");
  }

  async getRequestsForOwner(ownerId: string) {
    return uploadRequestRepository.findByChannelOwner(ownerId);
  }
}

export const uploadRequestService = new UploadRequestService();
