import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { uploadRequestRepository } from "@/modules/upload-requests/repositories/upload-request.repository";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/modules/acitivty";
import { logAudit } from "@/modules/audit";
import { inngest } from "@/inngest/client";
import { storageService } from "@/modules/storage";

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
      action?: "approve" | "reject" | "submit" | "update-draft" | "schedule";
      title?: string;
      description?: string;
      note?: string;
      type?: "SHORTS" | "LONG_VIDEO";
      channelId?: string;
      scheduledFor?: string;
    };

    if (!body.id || !body.action) {
      return NextResponse.json(
        { error: "Missing id or action" },
        { status: 400 },
      );
    }

    const request = await uploadRequestRepository.findById(body.id);

    if (!request) {
      return NextResponse.json(
        { error: "Upload request not found" },
        { status: 404 },
      );
    }

    if (body.action === "submit") {
      if (request.uploaderId !== userId || request.status !== "DRAFT") {
        return NextResponse.json({ error: "Forbidden or not in DRAFT status" }, { status: 403 });
      }

      const updated = await uploadRequestService.submitForReview(body.id);
      await logActivity(userId, "Submitted upload request", body.id);
      await logAudit({
        action: "UPLOAD_REQUEST_SUBMITTED",
        entityId: body.id,
        entityType: "UploadRequest",
        actorId: userId,
        details: "Uploader submitted draft for review",
      });
      return NextResponse.json({ request: updated });
    }

    if (body.action === "update-draft") {
      const editable = ["DRAFT", "PENDING_REVIEW"];
      if (request.uploaderId !== userId || !editable.includes(request.status)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updated = await uploadRequestService.updateDraft(body.id, {
        title: body.title,
        description: body.description,
        note: body.note,
        type: body.type,
        channelId: body.channelId,
      });

      await logActivity(userId, "Updated draft upload request", body.id);
      await logAudit({
        action: "UPLOAD_REQUEST_DRAFT_UPDATED",
        entityId: body.id,
        entityType: "UploadRequest",
        actorId: userId,
        details: "Uploader edited draft request",
      });

      return NextResponse.json({ request: updated });
    }

    if (request.channel.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (["schedule", "approve", "reject"].includes(body.action) && request.status !== "PENDING_REVIEW") {
      return NextResponse.json({ error: "Request is already processed or not pending review" }, { status: 400 });
    }

    if (body.action === "schedule") {
      if (!body.scheduledFor) {
        return NextResponse.json(
          { error: "Missing scheduledFor" },
          { status: 400 },
        );
      }

      const updated = await uploadRequestService.scheduleRequest(
        body.id,
        new Date(body.scheduledFor),
      );

      await logActivity(userId, "Scheduled upload request", body.id);
      await logAudit({
        action: "UPLOAD_REQUEST_SCHEDULED",
        entityId: body.id,
        entityType: "UploadRequest",
        actorId: userId,
        details: `Scheduled for ${body.scheduledFor}`,
      });

      return NextResponse.json({ request: updated });
    }

    const updated =
      body.action === "approve"
        ? await uploadRequestService.approveRequest(body.id)
        : await uploadRequestService.rejectRequest(body.id);

    if (body.action === "reject") {
      if (request.videoUrl) {
        try {
          await storageService.delete(request.videoUrl);
        } catch (e) {
          console.error("Failed to delete video on reject:", e);
        }
      }
      if (request.thumbnailUrl && !request.thumbnailUrl.startsWith("http")) {
        try {
          await storageService.delete(request.thumbnailUrl);
        } catch (e) {
          console.error("Failed to delete thumbnail on reject:", e);
        }
      }
    }

    // Trigger actual YouTube upload when owner approves
    if (body.action === "approve") {
      try {
        await inngest.send({
          name: "upload/process",
          data: { requestId: body.id },
        });
      } catch (inngestError) {
        console.error("Failed to enqueue YouTube upload task:", inngestError);
      }
    }

    await prisma.notification.create({
      data: {
        userId: request.uploaderId,
        type:
          body.action === "approve" ? "REQUEST_APPROVED" : "REQUEST_REJECTED",
        title:
          body.action === "approve" ? "Request approved" : "Request rejected",
        message: `Your upload request \"${request.title || "Untitled upload"}\" was ${body.action === "approve" ? "approved and queued for YouTube upload" : "rejected"}.`,
        link: `/review-request/${request.id}`,
      },
    });

    await logActivity(
      userId,
      body.action === "approve"
        ? "Approved upload request and triggered YouTube upload"
        : "Rejected upload request",
      body.id,
    );
    await logAudit({
      action:
        body.action === "approve"
          ? "UPLOAD_REQUEST_APPROVED"
          : "UPLOAD_REQUEST_REJECTED",
      entityId: body.id,
      entityType: "UploadRequest",
      actorId: userId,
      details: request.title || "Untitled upload",
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Upload request update error:", error);
    return NextResponse.json(
      { error: "Failed to update upload request" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId =
      session?.user && "id" in session.user ? session.user.id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const request = await uploadRequestRepository.findById(id);

    const deletable = ["DRAFT", "PENDING_REVIEW"];
    if (
      !request ||
      request.uploaderId !== userId ||
      !deletable.includes(request.status)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await uploadRequestService.deleteDraft(id);
    await logActivity(userId, "Deleted draft upload request", id);
    await logAudit({
      action: "UPLOAD_REQUEST_DRAFT_DELETED",
      entityId: id,
      entityType: "UploadRequest",
      actorId: userId,
      details: "Uploader deleted draft request",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload request delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete upload request" },
      { status: 500 },
    );
  }
}
