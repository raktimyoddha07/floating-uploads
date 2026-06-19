"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { UploadRequestStatus, UploadType } from "@prisma/client";

type RequestType = {
  id: string;
  title: string | null;
  description: string | null;
  note: string | null;
  type: UploadType;
  status: UploadRequestStatus;
  createdAt: Date | string;
  thumbnailUrl: string | null;
  uploader: {
    name: string | null;
    email: string | null;
  };
  channel: {
    id: string;
    name: string;
  };
};

function getTypeLabel(type: UploadType) {
  return type === "SHORTS" ? "Shorts" : "Long Video";
}

function getStatusBadgeVariant(
  status: UploadRequestStatus,
): "default" | "secondary" | "outline" {
  switch (status) {
    case "PENDING_REVIEW":
      return "secondary";
    case "APPROVED":
    case "UPLOADED":
      return "default";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default function ReviewRequestsClient({
  requests,
}: {
  requests: RequestType[];
}) {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending");

  const channelNames = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.channel.name)));
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (selectedChannel === "all") {
      return requests;
    }
    return requests.filter((r) => r.channel.name === selectedChannel);
  }, [requests, selectedChannel]);

  const pendingRequests = useMemo(() => {
    return filteredRequests.filter((r) => r.status === "PENDING_REVIEW");
  }, [filteredRequests]);

  const reviewedRequests = useMemo(() => {
    return filteredRequests.filter((r) => r.status !== "PENDING_REVIEW");
  }, [filteredRequests]);

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Review Requests</h1>
          <p className="text-muted-foreground">
            Review, edit, and approve videos submitted by your uploaders.
          </p>
        </div>
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="Filter by channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {channelNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all -mb-px ${
            activeTab === "pending"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Review ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("reviewed")}
          className={`ml-4 px-4 py-2 font-medium text-sm border-b-2 transition-all -mb-px ${
            activeTab === "reviewed"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Reviewed ({reviewedRequests.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "pending" ? (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-muted/10 border border-dashed rounded-xl">
              No pending review requests.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-card hover:bg-accent/40 hover:border-primary/20 transition-all gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 min-w-0">
                    <span className="font-semibold text-foreground truncate text-sm sm:text-base block">
                      {request.title || "Untitled upload"}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{request.channel.name}</span>
                      <span>•</span>
                      <span>By {request.uploader.name || request.uploader.email}</span>
                      <span>•</span>
                      <span>{format(new Date(request.createdAt), "dd MMM yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end w-full sm:w-auto gap-2 mt-2 sm:mt-0">
                    <Badge variant={request.type === "SHORTS" ? "secondary" : "outline"}>
                      {getTypeLabel(request.type)}
                    </Badge>
                    <Link href={`/review-request/${request.id}`} passHref>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviewedRequests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-muted/10 border border-dashed rounded-xl">
              No reviewed requests yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reviewedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-card/60 text-muted-foreground gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 min-w-0">
                    <span className="font-medium text-foreground/80 truncate text-sm sm:text-base block">
                      {request.title || "Untitled upload"}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{request.channel.name}</span>
                      <span>•</span>
                      <span>{format(new Date(request.createdAt), "dd MMM yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end w-full sm:w-auto gap-2 mt-2 sm:mt-0 shrink-0">
                    <Badge
                      variant={getStatusBadgeVariant(request.status)}
                      className="text-[10px] py-0.5 px-2.5 h-5 font-semibold uppercase tracking-wider"
                    >
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}