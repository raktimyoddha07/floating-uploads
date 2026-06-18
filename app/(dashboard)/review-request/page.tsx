import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";
import { format } from "date-fns";
import { UploadRequestStatus, UploadType } from "@prisma/client";

function getTypeLabel(type: UploadType) {
  return type === "SHORTS" ? "Shorts" : "Long Video";
}

function getStatusBadgeVariant(
  status: UploadRequestStatus,
): "default" | "secondary" | "outline" {
  switch (status) {
    case "PENDING_REVIEW":
      return "secondary";
    case "APPROVED":
    case "UPLOADED":
      return "default";
    default:
      return "outline";
  }
}

export default async function ReviewRequestPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const requests = await uploadRequestService.getRequestsForOwner(
    session.user.id,
  );
  const pendingRequests = requests.filter(
    (request) => request.status === "PENDING_REVIEW",
  );
  const reviewedRequests = requests.filter(
    (request) => request.status !== "PENDING_REVIEW",
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Review Requests</h1>
        <p className="text-muted-foreground">
          Review, edit, and approve videos submitted by your uploaders.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Pending Review{" "}
          <Badge variant="secondary">{pendingRequests.length}</Badge>
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
            No upload requests pending review.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <Card
                key={request.id}
                className="glass-card hover:border-primary/30 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant={
                        request.type === "SHORTS" ? "outline" : "default"
                      }
                      className="mb-2"
                    >
                      {getTypeLabel(request.type)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">
                    {request.title || "Untitled upload"}
                  </CardTitle>
                  <CardDescription>
                    By{" "}
                    {request.uploader.name ||
                      request.uploader.email ||
                      "Unknown uploader"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex justify-between items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {format(request.createdAt, "dd MMM yyyy")}
                  </span>
                  <Link href={`/review-request/${request.id}`}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full shadow-sm"
                    >
                      <Eye className="mr-2 h-4 w-4" /> Review
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h2 className="text-xl font-semibold text-muted-foreground flex items-center gap-2">
          Reviewed Requests{" "}
          <Badge variant="outline">{reviewedRequests.length}</Badge>
        </h2>

        {reviewedRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-muted/10 border border-dashed rounded-xl">
            No reviewed requests yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70 hover:opacity-100 transition-opacity">
            {reviewedRequests.map((request) => (
              <Card
                key={request.id}
                className="bg-card/30 backdrop-blur-sm border-white/5 shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant={getStatusBadgeVariant(request.status)}
                      className="mb-2 bg-background/50"
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1 text-muted-foreground">
                    {request.title || "Untitled upload"}
                  </CardTitle>
                  <CardDescription>{request.channel.name}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex justify-between items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {format(request.createdAt, "dd MMM yyyy")}
                  </span>
                  <Link href={`/review-request/${request.id}`}>
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
