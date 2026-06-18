import { authOptions } from "@/auth";
import { channelService } from "@/modules/channels/services/channel.service";
import { uploaderService } from "@/modules/uploaders/services/uploader.service";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AppointUploaderClient } from "./page.client";

export default async function AppointUploaderPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && "id" in session.user ? session.user.id : null;

  if (!userId) {
    redirect("/login");
  }

  const channels = await channelService.getOwnerChannels(userId);
  const assignments = await uploaderService.getOwnerAssignments(userId);
  const hasChannels = channels.length > 0;

  return (
    <AppointUploaderClient
      channels={channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
      }))}
      assignments={assignments.map((assignment) => ({
        id: assignment.id,
        permission: assignment.permission,
        grantedAt: assignment.grantedAt.toISOString(),
        channel: assignment.channel,
        uploader: assignment.uploader,
      }))}
      hasChannels={hasChannels}
    />
  );
}
