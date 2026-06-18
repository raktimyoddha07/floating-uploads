"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AddUploaderModal,
  ConnectChannelCard,
} from "@/components/channel/ConnectChannelCard";
import {
  UploaderAssignmentRow,
  UploaderTable,
} from "@/components/uploader/UploaderTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlaySquare } from "lucide-react";

type ChannelOption = {
  id: string;
  name: string;
};

const ALL_CHANNELS = "__all__";

export function AppointUploaderClient({
  channels,
  assignments,
  hasChannels,
}: {
  channels: ChannelOption[];
  assignments: UploaderAssignmentRow[];
  hasChannels: boolean;
}) {
  const router = useRouter();
  const [selectedChannelId, setSelectedChannelId] = useState(ALL_CHANNELS);

  const filteredAssignments = useMemo(() => {
    if (selectedChannelId === ALL_CHANNELS) return assignments;
    return assignments.filter((a) => a.channel.id === selectedChannelId);
  }, [assignments, selectedChannelId]);

  const handleConnectChannel = () => {
    router.push("/api/youtube/auth");
  };

  const handleAddUploader = async (payload: {
    username: string;
    channelId: string;
    permission: "SHORTS" | "LONG_VIDEO" | "BOTH";
  }) => {
    const response = await fetch("/api/uploaders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error || "Failed to assign uploader");
    }

    router.refresh();
  };

  const handleRemoveUploader = async (assignmentId: string) => {
    const response = await fetch("/api/uploaders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assignmentId, revoke: true }),
    });

    if (response.ok) {
      router.refresh();
    }
  };

  const handleUpdatePermission = async (
    assignmentId: string,
    permission: "SHORTS" | "LONG_VIDEO" | "BOTH",
  ) => {
    const response = await fetch("/api/uploaders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assignmentId, permission }),
    });

    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Appoint Uploader
          </h1>
          <p className="text-muted-foreground">
            Manage uploader access for your connected YouTube channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChannels ? (
            <AddUploaderModal channels={channels} onSubmit={handleAddUploader} />
          ) : null}
        </div>
      </div>

      {!hasChannels ? (
        <ConnectChannelCard onConnect={handleConnectChannel} />
      ) : (
        <div className="space-y-6">
          {/* YouTube Account Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-9 w-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <PlaySquare className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  YouTube Account:
                </span>
                <Select
                  value={selectedChannelId}
                  onValueChange={setSelectedChannelId}
                >
                  <SelectTrigger className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Select YouTube account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CHANNELS}>All Channels</SelectItem>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleConnectChannel}
            >
              <PlaySquare className="mr-2 h-4 w-4" />
              Connect Another Account
            </Button>
          </div>

          {/* Active Assignments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Active Assignments
                {selectedChannelId !== ALL_CHANNELS && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    — {channels.find((c) => c.id === selectedChannelId)?.name}
                  </span>
                )}
              </h2>
            </div>
            <UploaderTable
              assignments={filteredAssignments}
              onRemoveAction={handleRemoveUploader}
              onUpdatePermissionAction={handleUpdatePermission}
            />
          </div>
        </div>
      )}
    </div>
  );
}

