import { authOptions } from "@/auth";
import { channelService } from "@/modules/channels/services/channel.service";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { DisconnectChannelButton } from "@/components/channel/DisconnectChannelButton";

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user && "id" in session.user ? session.user.id : null;

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const channel = await channelService.getChannelDetails(id);

  if (!channel || channel.ownerId !== userId) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/connections" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Connections
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted shrink-0">
                {channel.pictureUrl ? (
                  <Image src={channel.pictureUrl} alt={channel.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {channel.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{channel.name}</h1>
                <p className="text-muted-foreground">{channel.handle || "No handle available"}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{channel._count.assignments} uploaders</Badge>
                  <Badge variant="outline">{channel._count.requests} pending review</Badge>
                  <Badge variant="outline">{channel.requests.length} total requests</Badge>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <DisconnectChannelButton
                channelId={channel.id}
                channelName={channel.name}
                redirectTo="/connections"
                className="w-full md:w-auto shadow-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Connected Uploaders</h2>
                <p className="text-sm text-muted-foreground">Everyone who currently has upload access to this channel.</p>
              </div>
              <div className="space-y-3">
                {channel.assignments.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No uploaders assigned yet.</div>
                ) : (
                  channel.assignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-md border p-4">
                      <p className="font-medium">{assignment.uploader.name || assignment.uploader.email || "Unknown uploader"}</p>
                      <p className="text-sm text-muted-foreground">@{assignment.uploader.username || "no_username"}</p>
                      <p className="text-xs text-muted-foreground mt-2">Permission: {assignment.permission}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Channel Upload Requests</h2>
              <p className="text-sm text-muted-foreground">Recent activity for this connected YouTube channel.</p>
            </div>
            <div className="space-y-3">
              {channel.requests.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No upload requests for this channel yet.</div>
              ) : (
                channel.requests.map((request) => (
                  <div key={request.id} className="rounded-md border p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{request.title || "Untitled upload"}</p>
                      <Badge variant={request.status === "PENDING_REVIEW" ? "secondary" : request.status === "APPROVED" ? "default" : "outline"}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.uploader.name || request.uploader.email || "Unknown uploader"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

