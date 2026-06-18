import { authOptions } from "@/auth";
import { uploadRequestService } from "@/modules/upload-requests/services/upload-request.service";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function UploaderRequestDetailPage({
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

  if (!request || request.uploaderId !== userId) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Link href="/uploader" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Uploader Section
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{request.title || "Untitled upload"}</h1>
          <p className="text-muted-foreground">{request.channel.name}</p>
        </div>
        <Badge variant={request.status === "PENDING_REVIEW" ? "secondary" : request.status === "APPROVED" ? "default" : "outline"}>
          {request.status}
        </Badge>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="aspect-video bg-black/90 w-full flex items-center justify-center overflow-hidden">
          {request.videoUrl ? (
            <video controls className="h-full w-full" src={request.videoUrl}>
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Current uploader-side request view</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><strong>Type:</strong> {request.type}</div>
            <div><strong>Note:</strong> {request.note || "No note"}</div>
            <div><strong>Description:</strong> {request.description || "No description"}</div>
            <div><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
            <CardDescription>Track the lifecycle of this request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><strong>Status:</strong> {request.status}</div>
            <div><strong>Scheduled For:</strong> {request.scheduledFor ? new Date(request.scheduledFor).toLocaleString() : "Not scheduled"}</div>
            <div><strong>Thumbnail:</strong> {request.thumbnailUrl ? "Uploaded" : "Not uploaded"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
