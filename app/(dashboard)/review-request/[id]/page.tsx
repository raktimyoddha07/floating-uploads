import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";
import { ReviewActionButtons } from "@/components/review/ReviewActionButtons";
import { ReviewMetadataEditor } from "@/components/review/ReviewMetadataEditor";

function getTypeLabel(type: string) {
  return type === "SHORTS" ? "Shorts" : "Long Video";
}

function getStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default async function ReviewRequestDetailPage({
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
  const request = await uploadRequestService.getRequestById(id);

  if (!request) {
    notFound();
  }

  const canReview = request.channel.ownerId === userId;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Link
        href="/review-request"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reviews
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {request.title || "Untitled upload"}
            </h1>
            <Badge variant="secondary">{getStatusLabel(request.status)}</Badge>
          </div>
          <p className="text-muted-foreground">
            Submitted by{" "}
            {request.uploader.name ||
              request.uploader.email ||
              "Unknown uploader"}{" "}
            • {getTypeLabel(request.type)}
          </p>
        </div>
        <ReviewActionButtons requestId={request.id} canReview={canReview} />
      </div>

      {request.note ? (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg p-4 text-sm">
          <span className="font-semibold">Uploader Note:</span> {request.note}
        </div>
      ) : null}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card overflow-hidden">
            <div className="aspect-video bg-black/90 w-full relative group flex items-center justify-center overflow-hidden">
              {request.videoUrl ? (
                <video
                  controls
                  className="h-full w-full"
                  src={request.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center">
                  <UploadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No video uploaded yet</p>
                  <p className="text-xs text-muted-foreground/60">
                    ID: {request.id}
                  </p>
                </div>
              )}
            </div>
            <CardContent className="p-4 flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/10">
              <div>
                Channel:{" "}
                <span className="font-medium text-foreground">
                  {request.channel.name}
                </span>
              </div>
              <div>
                Type:{" "}
                <span className="font-medium text-foreground">
                  {getTypeLabel(request.type)}
                </span>
              </div>
              <div>
                Status:{" "}
                <span className="font-medium text-foreground">
                  {getStatusLabel(request.status)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
              <CardDescription>Current request details</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewMetadataEditor
                requestId={request.id}
                initialTitle={request.title || ""}
                initialDescription={request.description || ""}
                initialThumbnailUrl={request.thumbnailUrl || null}
                canEdit={canReview}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
