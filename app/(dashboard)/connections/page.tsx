import { authOptions } from "@/auth";
import { channelService } from "@/modules/channels/services/channel.service";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ConnectChannelCard } from "@/components/channel/ConnectChannelCard";

import { DisconnectChannelButton } from "@/components/channel/DisconnectChannelButton";

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && "id" in session.user ? session.user.id : null;

  if (!userId) {
    redirect("/login");
  }

  const channels = await channelService.getOwnerChannels(userId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
          <p className="text-muted-foreground">
            View and manage all connected YouTube channels in one place.
          </p>
        </div>
        <Link href="/api/youtube/auth">
          <Button>Connect YouTube Channel</Button>
        </Link>
      </div>

      {channels.length === 0 ? (
        <Link href="/api/youtube/auth">
          <ConnectChannelCard />
        </Link>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => (
            <Link key={channel.id} href={`/connections/${channel.id}`}>
              <Card className="h-full cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border bg-muted shrink-0">
                        {channel.pictureUrl ? (
                          <Image
                            src={channel.pictureUrl}
                            alt={channel.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                            {channel.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate">{channel.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {channel.handle || "No handle available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0">
                      <DisconnectChannelButton
                        channelId={channel.id}
                        channelName={channel.name}
                        variant="ghost"
                        className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive px-2 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Uploaders</p>
                      <p className="font-semibold mt-2">{channel._count.assignments}</p>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Pending Review</p>
                      <p className="font-semibold mt-2">{channel._count.requests}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
