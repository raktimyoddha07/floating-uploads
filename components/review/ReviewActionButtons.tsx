"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { ScheduleUploadButton } from "@/components/review/ScheduleUploadButton";

type ReviewAction = "approve" | "reject";

export function ReviewActionButtons({
  requestId,
  canReview,
}: {
  requestId: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);

  const handleAction = async (action: ReviewAction) => {
    try {
      setPendingAction(action);

      const response = await fetch("/api/upload-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: requestId, action }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      router.refresh();
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
    } finally {
      setPendingAction(null);
    }
  };

  if (!canReview) {
    return null;
  }

  return (
    <div className="flex gap-2 w-full md:w-auto">
      <Button
        variant="destructive"
        className="flex-1 md:flex-none"
        disabled={pendingAction !== null}
        onClick={() => handleAction("reject")}
      >
        {pendingAction === "reject" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <X className="mr-2 h-4 w-4" />
        )}
        Decline
      </Button>
      <ScheduleUploadButton requestId={requestId} canReview={canReview} />
      <Button
        className="flex-1 md:flex-none rounded-full"
        disabled={pendingAction !== null}
        onClick={() => handleAction("approve")}
      >
        {pendingAction === "approve" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Approve & Upload
      </Button>
    </div>
  );
}
