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
      <Card>
        <CardContent className="p-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Track channels, upload requests, uploader activity, and pending
              actions from one place.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Connected Channels</CardDescription>
            <CardTitle className="text-3xl">{ownedChannels}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{uploadRequests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Collaborators</CardDescription>
            <CardTitle className="text-3xl">{assignments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unread Notifications</CardDescription>
            <CardTitle className="text-3xl">{unreadNotifications}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Review Queue</CardTitle>
          <CardDescription>
            Latest upload requests for your connected channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentRequests.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
              No upload requests yet.
            </div>
          ) : (
            recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-md border p-4"
              >
                <div>
                  <p className="text-sm font-medium">
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
