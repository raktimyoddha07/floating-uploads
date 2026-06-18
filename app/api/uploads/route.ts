import { NextRequest, NextResponse } from "next/server";
import { storageService } from "@/modules/storage";
import { inngest } from "@/inngest/client";
import { UploadType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId =
      session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const note = formData.get("note") as string;
    const type = formData.get("type") as UploadType;
    const channelId = formData.get("channelId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to Buffer for our StorageService
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storedFile = await storageService.upload(buffer, {
      fileName: file.name,
      contentType: file.type,
      folder: `channels/${channelId}`,
    });

    const uploadRequest = await uploadRequestService.createDraft(
      userId,
      channelId,
      type,
      {
        title,
        description,
        note,
        videoUrl: storedFile.url,
      },
    );

    // Trigger Inngest Background Job
    await inngest.send({
      name: "upload/process",
      data: {
        requestId: uploadRequest.id,
      },
    });

    return NextResponse.json({
      url: storedFile.url,
      storageKey: storedFile.key,
      requestId: uploadRequest.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
