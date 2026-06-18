import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { uploadRequestRepository } from "@/modules/upload-requests/repositories/upload-request.repository";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";
import { logActivity } from "@/modules/acitivty";
import { logAudit } from "@/modules/audit";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId =
      session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      id?: string;
      title?: string;
      description?: string;
      thumbnailUrl?: string | null;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const request = await uploadRequestRepository.findById(body.id);

    if (!request || request.channel.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await uploadRequestService.updateDraft(body.id, {
      title: body.title,
      description: body.description,
      thumbnailUrl:
        body.thumbnailUrl === null ? undefined : body.thumbnailUrl || undefined,
    });

    await logActivity(userId, "Updated review metadata", body.id);
    await logAudit({
      action: "UPLOAD_REQUEST_METADATA_UPDATED",
      entityId: body.id,
      entityType: "UploadRequest",
      actorId: userId,
      details: body.title || request.title || "Untitled upload",
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Failed to update review metadata", error);
    return NextResponse.json(
      { error: "Failed to update review metadata" },
      { status: 500 },
    );
  }
}
