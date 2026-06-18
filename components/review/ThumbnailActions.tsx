"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ThumbnailActions({
  requestId,
  canEdit,
  hasThumbnail,
}: {
  requestId: string;
  canEdit: boolean;
  hasThumbnail: boolean;
}) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  if (!canEdit || !hasThumbnail) {
    return null;
  }

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      const response = await fetch("/api/review-request", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          thumbnailUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to remove thumbnail", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleRemove} disabled={isRemoving}>
      {isRemoving ? "Removing..." : "Remove Thumbnail"}
    </Button>
  );
}
