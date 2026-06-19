import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && "id" in session.user ? session.user.id : null;

  if (!userId) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated on approvals, rejections, and upload activity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {notifications.length} notification{notifications.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <Link key={notification.id} href={notification.link || "/notifications"}>
                <div className={`rounded-md border p-4 transition-colors hover:bg-muted/50 ${notification.isRead ? "" : "bg-primary/5 border-primary/20"}`}>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{notification.title}</h3>
                      {!notification.isRead ? <Badge variant="secondary">New</Badge> : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
