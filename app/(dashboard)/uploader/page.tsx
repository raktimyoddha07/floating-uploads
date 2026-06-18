"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Tv2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UploaderRequestList } from "@/components/uploader/UploaderRequestList";
import { Badge } from "@/components/ui/badge";

type ChannelOption = {
  id: string;
  name: string;
  permission: "SHORTS" | "LONG_VIDEO" | "BOTH";
};

type UploaderRequest = {
  id: string;
  title: string | null;
  description: string | null;
  note: string | null;
  type: "SHORTS" | "LONG_VIDEO";
  channelId: string;
  status: string;
  channel: {
    id: string;
    name: string;
  };
  createdAt: string;
};

export default function UploaderSectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("LONG_VIDEO");
  const [channelId, setChannelId] = useState("");
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const [requests, setRequests] = useState<UploaderRequest[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bootstrapData = async () => {
    try {
      setIsBootstrapping(true);

      const [channelsResponse, requestsResponse] = await Promise.all([
        fetch("/api/channels/me"),
        fetch("/api/uploads/my"),
      ]);

      if (channelsResponse.ok) {
        const channelsData = (await channelsResponse.json()) as {
          channels: ChannelOption[];
        };
        setChannels(channelsData.channels);
        const initialChannelId = channelsData.channels[0]?.id || "";
        setChannelId(
          (currentChannelId) =>
            currentChannelId || initialChannelId,
        );
        
        // Auto-select type based on permission if not set
        if (channelsData.channels.length > 0) {
           const initialChannel = channelsData.channels[0];
           if (initialChannel.permission === "SHORTS") setType("SHORTS");
           else if (initialChannel.permission === "LONG_VIDEO") setType("LONG_VIDEO");
        }
      }

      if (requestsResponse.ok) {
        const requestsData = (await requestsResponse.json()) as {
          requests: UploaderRequest[];
        };
        setRequests(requestsData.requests);
      }
    } catch (error) {
      console.error("Failed to bootstrap uploader data", error);
    } finally {
      setIsBootstrapping(false);
    }
  };

  // Auto-load on mount — no manual refresh needed
  useEffect(() => {
    void bootstrapData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChannel =
    channels.find((channel) => channel.id === channelId) || null;

  const filteredRequests = useMemo(() => {
    if (!channelId) return requests;
    return requests.filter((request) => request.channelId === channelId);
  }, [requests, channelId]);

  // Auto-select type when switching channels
  useEffect(() => {
    if (activeChannel) {
      if (activeChannel.permission === "SHORTS") {
        setType("SHORTS");
      } else if (activeChannel.permission === "LONG_VIDEO") {
        setType("LONG_VIDEO");
      }
    }
  }, [activeChannel]);

  const activeDraftCount = filteredRequests.filter(
    (r) => r.status === "DRAFT",
  ).length;
  const pendingReviewCount = filteredRequests.filter(
    (r) => r.status === "PENDING_REVIEW",
  ).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadComplete(false);
      setErrorMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !channelId) return;

    setIsUploading(true);
    setProgress(0);
    setErrorMessage(null);
    setUploadComplete(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("note", note);
    formData.append("type", type);
    formData.append("channelId", channelId);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Upload failed");
      }

      clearInterval(interval);
      setProgress(100);
      setUploadComplete(true);
      setFile(null);
      setTitle("");
      setDescription("");
      setNote("");
      await bootstrapData();
    } catch (error) {
      console.error("Upload failed", error);
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      clearInterval(interval);
      setIsUploading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    const response = await fetch(`/api/upload-requests?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok) await bootstrapData();
  };

  const handleSubmitDraft = async (id: string) => {
    const response = await fetch("/api/upload-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "submit" }),
    });
    if (response.ok) await bootstrapData();
  };

  const handleUpdateDraft = async (payload: {
    id: string;
    title: string;
    description: string;
    note: string;
    type: "SHORTS" | "LONG_VIDEO";
    channelId: string;
  }) => {
    const response = await fetch("/api/upload-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, action: "update-draft" }),
    });
    if (response.ok) await bootstrapData();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Uploader Workspace
          </h1>
          <p className="text-muted-foreground">
            Select a channel, create requests, and track their progress.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => void bootstrapData()}
          disabled={isBootstrapping}
          className="shrink-0"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isBootstrapping ? "animate-spin" : ""}`}
          />
          {isBootstrapping ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {isBootstrapping && channels.length === 0 ? (
        /* Loading skeleton */
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your channels...</span>
        </div>
      ) : channels.length === 0 ? (
        /* No channels */
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground space-y-2">
          <Tv2 className="h-10 w-10 mx-auto opacity-40" />
          <p className="font-medium">No channels assigned yet</p>
          <p className="text-sm">
            Ask the channel owner to grant you uploader access.
          </p>
        </div>
      ) : (
        /* Main split-pane layout */
        <div className="flex gap-6 min-h-0">
          {/* ── Left: channel sidebar ── */}
          <aside className="w-56 shrink-0 flex flex-col gap-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground px-1 mb-1">
              Channels ({channels.length})
            </p>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {channels.map((channel) => {
                const isActive = channel.id === channelId;
                const chReqs = requests.filter(
                  (r) => r.channelId === channel.id,
                );
                const pending = chReqs.filter(
                  (r) => r.status === "PENDING_REVIEW",
                ).length;
                const drafts = chReqs.filter(
                  (r) => r.status === "DRAFT",
                ).length;

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setChannelId(channel.id)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/30 shadow-sm"
                        : "border border-transparent hover:bg-muted/40"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}
                    >
                      {channel.name}
                    </p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {drafts > 0 && (
                        <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                          {drafts} draft{drafts > 1 ? "s" : ""}
                        </span>
                      )}
                      {pending > 0 && (
                        <span className="text-[10px] bg-yellow-500/15 text-yellow-500 rounded-full px-2 py-0.5">
                          {pending} review
                        </span>
                      )}
                      {drafts === 0 && pending === 0 && (
                        <span className="text-[10px] text-muted-foreground/50">
                          No requests
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Right: content ── */}
          {activeChannel ? (
            <div className="flex-1 min-w-0 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              {/* Upload form */}
              <Card className="glass-card">
                <form onSubmit={handleUpload}>
                  <CardHeader>
                    <CardTitle>New Upload Request</CardTitle>
                    <CardDescription>
                      Channel:{" "}
                      <span className="text-foreground font-medium">
                        {activeChannel.name}
                      </span>{" "}
                      &bull;{" "}
                      <Badge variant="outline" className="text-xs rounded-full">
                        {activeDraftCount} draft
                      </Badge>{" "}
                      <Badge
                        variant="outline"
                        className="text-xs rounded-full ml-1"
                      >
                        {pendingReviewCount} pending
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="type">Video Type</Label>
                      <Select 
                        value={type} 
                        onValueChange={setType}
                        disabled={activeChannel?.permission === "SHORTS" || activeChannel?.permission === "LONG_VIDEO"}
                      >
                        <SelectTrigger id="type" className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {(!activeChannel || activeChannel.permission === "BOTH" || activeChannel.permission === "SHORTS") && (
                            <SelectItem value="SHORTS">Shorts</SelectItem>
                          )}
                          {(!activeChannel || activeChannel.permission === "BOTH" || activeChannel.permission === "LONG_VIDEO") && (
                            <SelectItem value="LONG_VIDEO">Long Video</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">YouTube Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter an engaging title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note">Note to Owner (Optional)</Label>
                      <Input
                        id="note"
                        placeholder="E.g., Please review the intro sequence..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Video File</Label>
                      {!uploadComplete ? (
                        <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                          <p className="text-sm font-medium mb-1">
                            Drag & drop your video here
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            MP4, MOV up to 10GB
                          </p>
                          <Input
                            type="file"
                            accept="video/*"
                            className="max-w-xs cursor-pointer"
                            onChange={handleFileChange}
                            required
                          />
                        </div>
                      ) : (
                        <div className="border border-green-500/20 bg-green-500/10 rounded-xl p-6 flex flex-col items-center text-center">
                          <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                          <p className="font-medium text-green-600 dark:text-green-400">
                            Upload Complete
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Saved as draft for {activeChannel.name}.
                          </p>
                        </div>
                      )}

                      {(isUploading || progress > 0) && !uploadComplete && (
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {errorMessage && (
                        <p className="text-sm text-destructive mt-2">
                          {errorMessage}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter video description..."
                        className="min-h-24"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </CardContent>

                  <div className="p-6 pt-0 flex justify-end gap-3">
                    <Button variant="outline" type="button" disabled>
                      Save Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={!file || !channelId || isUploading}
                      className="rounded-full shadow-lg"
                    >
                      {isUploading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {!isUploading && "Send Request"}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Request list */}
              <UploaderRequestList
                requests={filteredRequests}
                channels={channels}
                onDeleteDraftAction={handleDeleteDraft}
                onSubmitDraftAction={handleSubmitDraft}
                onUpdateDraftAction={handleUpdateDraft}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a channel from the left to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
