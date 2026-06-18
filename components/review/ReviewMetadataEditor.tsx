"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";
import { ThumbnailActions } from "@/components/review/ThumbnailActions";

export function ReviewMetadataEditor({
  requestId,
  initialTitle,
  initialDescription,
  initialThumbnailUrl,
  canEdit,
}: {
  requestId: string;
  initialTitle: string;
  initialDescription: string;
  initialThumbnailUrl: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialThumbnailUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/review-request", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          title,
          description,
          thumbnailUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to save review metadata", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThumbnailUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploadingThumbnail(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("requestId", requestId);

      const response = await fetch("/api/review-request/thumbnail", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      const data = (await response.json()) as { thumbnailUrl: string };
      setThumbnailUrl(data.thumbnailUrl);
      router.refresh();
    } catch (error) {
      console.error("Failed to upload thumbnail", error);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          readOnly={!canEdit}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          className="h-32"
          value={description}
          readOnly={!canEdit}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="space-y-2 pt-2">
        <Label>Thumbnail</Label>
        <div className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/20 overflow-hidden">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-muted-foreground flex flex-col items-center">
              <UploadCloud className="h-6 w-6 mb-1" />
              No thumbnail uploaded
            </span>
          )}
        </div>

        {canEdit ? (
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={isUploadingThumbnail}
            />
            <ThumbnailActions
              requestId={requestId}
              canEdit={canEdit}
              hasThumbnail={Boolean(thumbnailUrl)}
            />
          </div>
        ) : null}
      </div>

      {canEdit ? (
        <Button
          className="w-full rounded-full"
          onClick={handleSave}
          disabled={isSaving || isUploadingThumbnail}
        >
          {isSaving ? "Saving..." : "Save Metadata"}
        </Button>
      ) : null}
    </div>
  );
}
