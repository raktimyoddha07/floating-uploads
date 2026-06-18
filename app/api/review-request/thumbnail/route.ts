import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { uploadRequestRepository } from "@/modules/upload-requests/repositories/upload-request.repository";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";
import { storageService } from "@/modules/storage";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestId = formData.get("requestId") as string | null;

    if (!file || !requestId) {
      return NextResponse.json({ error: "Missing file or requestId" }, { status: 400 });
    }

    const request = await uploadRequestRepository.findById(requestId);

    if (!request || request.channel.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storedFile = await storageService.upload(buffer, {
      fileName: file.name,
      contentType: file.type,
      folder: `thumbnails/${requestId}`,
    });

    await uploadRequestService.updateDraft(requestId, {
      thumbnailUrl: storedFile.url,
    });

    return NextResponse.json({ thumbnailUrl: storedFile.url });
  } catch (error) {
    console.error("Failed to upload thumbnail", error);
    return NextResponse.json({ error: "Failed to upload thumbnail" }, { status: 500 });
  }
}
