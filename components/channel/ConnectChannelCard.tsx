"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PlaySquare, UserPlus } from "lucide-react";

export function ConnectChannelCard({ onConnect }: { onConnect?: () => void }) {
  return (
    <Card className="glass-card border-dashed">
      <CardContent className="flex flex-col items-center justify-center text-center py-12 px-8">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <PlaySquare className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Channels Connected</h3>
        <p className="text-base text-muted-foreground max-w-md mb-6">
          Connect your YouTube channel to start assigning uploaders securely.
        </p>
        <Button
          size="lg"
          className="rounded-full shadow-lg font-semibold px-8"
          onClick={onConnect}
        >
          <PlaySquare className="mr-2 h-5 w-5" />
          Connect YouTube Channel
        </Button>
      </CardContent>
    </Card>
  );
}

type ChannelOption = {
  id: string;
  name: string;
};

export function AddUploaderModal({
  channels,
  onSubmit,
}: {
  channels: ChannelOption[];
  onSubmit: (payload: {
    username: string;
    channelId: string;
    permission: "SHORTS" | "LONG_VIDEO" | "BOTH";
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [channelId, setChannelId] = useState(channels[0]?.id || "");
  const [permission, setPermission] = useState<
    "SHORTS" | "LONG_VIDEO" | "BOTH"
  >("BOTH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username || !channelId) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ username, channelId, permission });
      setOpen(false);
      setUsername("");
      setChannelId(channels[0]?.id || "");
      setPermission("BOTH");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full shadow-lg"
          disabled={channels.length === 0}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Appoint Uploader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass">
        <DialogHeader>
          <DialogTitle>Appoint New Uploader</DialogTitle>
          <DialogDescription>
            Grant a user permission to create upload requests for your channel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              placeholder="john_doe_8214"
              className="col-span-3"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel" className="text-right">
              Channel
            </Label>
            <Select value={channelId} onValueChange={setChannelId}>
              <SelectTrigger className="col-span-3 w-full">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="permission" className="text-right">
              Permission
            </Label>
            <Select
              value={permission}
              onValueChange={(value) =>
                setPermission(value as "SHORTS" | "LONG_VIDEO" | "BOTH")
              }
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select permission type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHORTS">Shorts Only</SelectItem>
                <SelectItem value="LONG_VIDEO">Long Videos Only</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="rounded-full"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving..." : "Appoint Uploader"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
