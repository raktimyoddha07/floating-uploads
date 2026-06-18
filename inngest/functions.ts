import { inngest } from "./client";
import { prisma } from "@/lib/prisma";

export const processUploadJob = inngest.createFunction(
  { id: "process-upload-job", event: "upload/process" },
  async ({ event, step }) => {
    const { requestId } = event.data;

    // Step 1: Update request status
    await step.run("mark-processing", async () => {
      await prisma.uploadRequest.update({
        where: { id: requestId },
        data: { status: "UPLOADING" },
      });
    });

    // Step 2: Simulate interacting with YouTube API
    await step.sleep("simulate-upload-time", "1m");

    // Step 3: Complete the upload
    await step.run("mark-uploaded", async () => {
      await prisma.uploadRequest.update({
        where: { id: requestId },
        data: { status: "UPLOADED" },
      });
    });

    return { success: true, requestId };
  },
);
