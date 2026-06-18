import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && "id" in session.user ? session.user.id : null;

  if (!userId) {
    redirect("/login");
  }

  const [ownedChannels, uploadRequests, assignments, unreadNotifications] =
    await Promise.all([
      prisma.channel.count({ where: { ownerId: userId } }),
      prisma.uploadRequest.count({
        where: {
          OR: [{ uploaderId: userId }, { channel: { ownerId: userId } }],
        },
      }),
      prisma.uploaderAssignment.count({
        where: {
          ownerId: userId,
          revokedAt: null,
        },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

  const recentRequests = await prisma.uploadRequest.findMany({
    where: { channel: { ownerId: userId } },
    include: { uploader: true, channel: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const firstName = session.user?.name?.split(" ")[0] || "Creator";

  return (
    <div className="space-y-6">
      <Card className="glass-card overflow-hidden border-primary/20">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Track channels, upload requests, uploader activity, and pending
              actions from one place.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Connected Channels</CardDescription>
            <CardTitle className="text-3xl">{ownedChannels}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{uploadRequests}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Active Collaborators</CardDescription>
            <CardTitle className="text-3xl">{assignments}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Unread Notifications</CardDescription>
            <CardTitle className="text-3xl">{unreadNotifications}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm p-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Recent Review Queue</CardTitle>
          <CardDescription>
            Latest upload requests for your connected channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No upload requests yet.
            </div>
          ) : (
            recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border bg-background/30 p-4"
              >
                <div>
                  <p className="font-medium">
                    {request.title || "Untitled upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {request.channel.name} •{" "}
                    {request.uploader.name ||
                      request.uploader.email ||
                      "Unknown uploader"}
                  </p>
                </div>
                <Badge
                  variant={
                    request.status === "PENDING_REVIEW"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {request.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
