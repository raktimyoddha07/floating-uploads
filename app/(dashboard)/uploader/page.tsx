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
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [uploadActionType, setUploadActionType] = useState<"draft" | "submit">("submit");

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

  const activeDraftCount = requests.filter(
    (r) => r.channelId === channelId && r.status === "DRAFT",
  ).length;
  const pendingReviewCount = requests.filter(
    (r) => r.channelId === channelId && r.status === "PENDING_REVIEW",
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
    formData.append("status", uploadActionType === "submit" ? "PENDING_REVIEW" : "DRAFT");

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
            Create requests and track their progress.
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
        /* Main layout without sidebar */
        <div className="flex flex-col gap-6 min-h-0">
          {/* Tabs header */}
          <div className="flex gap-2 bg-muted/40 p-1 rounded-full w-fit mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Requests
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === "new"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              New Upload Request
            </button>
          </div>

          {activeTab === "new" ? (
            <Card className="glass-card max-w-4xl">
              <form onSubmit={handleUpload}>
                <CardHeader>
                  <CardTitle>New Upload Request</CardTitle>
                  <CardDescription>
                    Select a channel and provide details for your upload request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="channel">Channel</Label>
                    <Select value={channelId} onValueChange={setChannelId}>
                      <SelectTrigger id="channel" className="w-full">
                        <SelectValue placeholder="Select a channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {activeChannel && (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="text-xs rounded-full">
                          {activeDraftCount} draft{activeDraftCount !== 1 ? 's' : ''}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs rounded-full ml-1"
                        >
                          {pendingReviewCount} pending
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Video Type</Label>
                        <Select 
                          value={type} 
                          onValueChange={setType}
                          disabled={activeChannel.permission === "SHORTS" || activeChannel.permission === "LONG_VIDEO"}
                        >
                          <SelectTrigger id="type" className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {(activeChannel.permission === "BOTH" || activeChannel.permission === "SHORTS") && (
                              <SelectItem value="SHORTS">Shorts</SelectItem>
                            )}
                            {(activeChannel.permission === "BOTH" || activeChannel.permission === "LONG_VIDEO") && (
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
                              {uploadActionType === "submit"
                                ? `Submitted request for review for ${activeChannel.name}.`
                                : `Saved as draft for ${activeChannel.name}.`}
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
                    </>
                  )}
                </CardContent>

                {activeChannel && (
                  <div className="p-6 pt-0 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      type="submit"
                      onClick={() => setUploadActionType("draft")}
                      disabled={!file || !channelId || isUploading}
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="submit"
                      onClick={() => setUploadActionType("submit")}
                      disabled={!file || !channelId || isUploading}
                      className="rounded-full shadow-lg"
                    >
                      {isUploading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {!isUploading && "Send Request"}
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          ) : (
            <UploaderRequestList
              requests={requests}
              channels={channels}
              onDeleteDraftAction={handleDeleteDraft}
              onSubmitDraftAction={handleSubmitDraft}
              onUpdateDraftAction={handleUpdateDraft}
            />
          )}
        </div>
      )}
    </div>
  );
}
