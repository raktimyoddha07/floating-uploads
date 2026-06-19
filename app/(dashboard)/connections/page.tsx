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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Link key={channel.id} href={`/connections/${channel.id}`} className="group">
              <Card className="relative h-full overflow-hidden border border-border/40 bg-card/45 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 hover:translate-y-[-2px]">
                {/* Subtle primary glow indicator at the top */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all shrink-0">
                        {channel.pictureUrl ? (
                          <Image
                            src={channel.pictureUrl}
                            alt={channel.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-lg font-bold bg-muted text-muted-foreground">
                            {channel.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-lg font-semibold truncate text-foreground/90 group-hover:text-foreground transition-colors">{channel.name}</h3>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[10px] py-0 px-1.5 h-4 font-semibold rounded-full shrink-0">
                            YouTube
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {channel.handle || "@no_handle"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center shrink-0">
                      <DisconnectChannelButton
                        channelId={channel.id}
                        channelName={channel.name}
                        variant="ghost"
                        showText={false}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-secondary/20 p-3 border border-border/5">
                      <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Uploaders</p>
                      <p className="font-bold text-2xl mt-1 text-foreground/80">{channel._count.assignments}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/20 p-3 border border-border/5">
                      <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Pending Review</p>
                      <p className="font-bold text-2xl mt-1 text-foreground/80">{channel._count.requests}</p>
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
