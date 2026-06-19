"use"
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DisconnectChannelButtonProps {
  channelId: string;
  channelName: string;
  className?: string;
  redirectTo?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showText?: boolean;
}

export function DisconnectChannelButton({
  channelId,
  channelName,
  className,
  redirectTo,
  variant = "destructive",
  showText = true,
}: DisconnectChannelButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to disconnect the channel "${channelName}"? This will revoke access for all assigned uploaders and delete all pending/draft requests.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/channels?id=${channelId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to disconnect channel");
      }

      router.refresh();
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error: any) {
      alert(error.message || "An error occurred while disconnecting the channel");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={showText ? "sm" : "icon"}
      className={className}
      disabled={isDeleting}
      onClick={handleDisconnect}
      title={`Disconnect ${channelName}`}
    >
      {isDeleting ? (
        <Loader2 className={showText ? "mr-2 h-4 w-4 animate-spin" : "h-4 w-4 animate-spin"} />
      ) : (
        <Trash2 className={showText ? "mr-2 h-4 w-4" : "h-4 w-4"} />
      )}
      {showText && (isDeleting ? "Disconnecting..." : "Disconnect")}
    </Button>
  );
}
