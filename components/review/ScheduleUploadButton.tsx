"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

export function ScheduleUploadButton({
  requestId,
  canReview,
}: {
  requestId: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!canReview) {
    return null;
  }

  const handleSchedule = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/upload-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          action: "schedule",
          scheduledFor,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      setOpen(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to schedule upload", error);
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setOpen(true)}>
        <Clock className="mr-2 h-4 w-4" /> Schedule
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Schedule Upload</DialogTitle>
            <DialogDescription>
              Choose a future date and time for this approved upload.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="datetime-local"
            value={scheduledFor}
            onChange={(event) => setScheduledFor(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={isSaving || !scheduledFor}>
              {isSaving ? "Scheduling..." : "Schedule Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
