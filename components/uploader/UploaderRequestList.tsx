"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useMemo, useState } from "react";

type RequestItem = {
  id: string;
  title: string | null;
  description?: string | null;
  note?: string | null;
  type?: "SHORTS" | "LONG_VIDEO";
  channelId?: string;
  status: string;
  channel: {
    id?: string;
    name: string;
  };
  createdAt: string;
};

type ChannelOption = {
  id: string;
  name: string;
  permission: "SHORTS" | "LONG_VIDEO" | "BOTH";
};

export function UploaderRequestList({
  requests,
  channels,
  onDeleteDraftAction,
  onSubmitDraftAction,
  onUpdateDraftAction,
}: {
  requests: RequestItem[];
  channels: ChannelOption[];
  onDeleteDraftAction: (id: string) => Promise<void>;
  onSubmitDraftAction: (id: string) => Promise<void>;
  onUpdateDraftAction: (payload: {
    id: string;
    title: string;
    description: string;
    note: string;
    type: "SHORTS" | "LONG_VIDEO";
    channelId: string;
  }) => Promise<void>;
}) {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [editingRequest, setEditingRequest] = useState<RequestItem | null>(
    null,
  );
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editType, setEditType] = useState<"SHORTS" | "LONG_VIDEO">(
    "LONG_VIDEO",
  );
  const [editChannelId, setEditChannelId] = useState("");

  const channelNames = useMemo(
    () => Array.from(new Set(requests.map((request) => request.channel.name))),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    if (selectedChannel === "all") {
      return requests;
    }

    return requests.filter(
      (request) => request.channel.name === selectedChannel,
    );
  }, [requests, selectedChannel]);

  const openDraftEditor = (request: RequestItem) => {
    setEditingRequest(request);
    setEditTitle(request.title || "");
    setEditDescription(request.description || "");
    setEditNote(request.note || "");
    setEditType(request.type || "LONG_VIDEO");
    setEditChannelId(request.channelId || channels[0]?.id || "");
  };

  // Auto-update editType if the selected channel in the draft editor is restricted
  const handleEditChannelChange = (channelId: string) => {
    setEditChannelId(channelId);
    const selectedChannel = channels.find((c) => c.id === channelId);
    if (selectedChannel) {
      if (selectedChannel.permission === "SHORTS") {
        setEditType("SHORTS");
      } else if (selectedChannel.permission === "LONG_VIDEO") {
        setEditType("LONG_VIDEO");
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!editingRequest) {
      return;
    }

    await onUpdateDraftAction({
      id: editingRequest.id,
      title: editTitle,
      description: editDescription,
      note: editNote,
      type: editType,
      channelId: editChannelId,
    });

    setEditingRequest(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Request Status
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor draft, review, and upload progress by channel.
          </p>
        </div>
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-full md:w-60">
            <SelectValue placeholder="Filter by channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {channelNames.map((channel) => (
              <SelectItem key={channel} value={channel}>
                {channel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/40 p-8 text-center text-muted-foreground">
          No upload requests found for the selected channel.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">
                    {request.title || "Untitled upload"}
                  </CardTitle>
                  <Badge
                    variant={
                      request.status === "PENDING_REVIEW"
                        ? "secondary"
                        : request.status === "APPROVED"
                          ? "default"
                          : "outline"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
                <CardDescription>{request.channel.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Created on{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/uploader/${request.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
                {request.status === "DRAFT" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDraftEditor(request)}
                    >
                      Edit Request
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSubmitDraftAction(request.id)}
                    >
                      Send Request
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteDraftAction(request.id)}
                    >
                      Delete Request
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={editingRequest !== null}
        onOpenChange={(open) => !open && setEditingRequest(null)}
      >
        <DialogContent className="glass sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>
              Update your request details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-channel">Channel</Label>
              <Select value={editChannelId} onValueChange={handleEditChannelChange}>
                <SelectTrigger id="edit-channel" className="w-full">
                  <SelectValue placeholder="Select channel" />
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
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={editType}
                onValueChange={(value) =>
                  setEditType(value as "SHORTS" | "LONG_VIDEO")
                }
                disabled={
                  channels.find((c) => c.id === editChannelId)?.permission === "SHORTS" || 
                  channels.find((c) => c.id === editChannelId)?.permission === "LONG_VIDEO"
                }
              >
                <SelectTrigger id="edit-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {(!channels.find((c) => c.id === editChannelId) || 
                    channels.find((c) => c.id === editChannelId)?.permission === "BOTH" || 
                    channels.find((c) => c.id === editChannelId)?.permission === "SHORTS") && (
                    <SelectItem value="SHORTS">Shorts</SelectItem>
                  )}
                  {(!channels.find((c) => c.id === editChannelId) || 
                    channels.find((c) => c.id === editChannelId)?.permission === "BOTH" || 
                    channels.find((c) => c.id === editChannelId)?.permission === "LONG_VIDEO") && (
                    <SelectItem value="LONG_VIDEO">Long Video</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-note">Note</Label>
              <Input
                id="edit-note"
                value={editNote}
                onChange={(event) => setEditNote(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                className="min-h-30"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRequest(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDraft}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
