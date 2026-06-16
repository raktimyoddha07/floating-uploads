"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import Link from "next/link";

export default function ReviewRequestPage() {
  // Mock requests data
  const pendingRequests = [
    {
      id: "req_1",
      uploaderName: "John Doe",
      title: "Nature Documentary in 4K",
      type: "LONG_VIDEO",
      date: "16 Jun 2026",
      status: "PENDING_REVIEW",
    },
    {
      id: "req_2",
      uploaderName: "Alex Smith",
      title: "Gaming Highlight #4",
      type: "SHORTS",
      date: "15 Jun 2026",
      status: "PENDING_REVIEW",
    }
  ];

  const reviewedRequests = [
    {
      id: "req_3",
      uploaderName: "John Doe",
      title: "Forest Walk 2026",
      type: "LONG_VIDEO",
      date: "14 Jun 2026",
      status: "UPLOADED",
    }
  ];

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
          Pending Review <Badge variant="secondary">{pendingRequests.length}</Badge>
        </h2>
        
        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
            No upload requests pending review.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map(req => (
              <Card key={req.id} className="glass-card hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant={req.type === "SHORTS" ? "outline" : "default"} className="mb-2">
                      {req.type === "SHORTS" ? "Shorts" : "Long Video"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{req.title}</CardTitle>
                  <CardDescription>By {req.uploaderName}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{req.date}</span>
                  <Link href={`/review-request/${req.id}`}>
                    <Button size="sm" variant="secondary" className="rounded-full shadow-sm">
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
          Reviewed Requests <Badge variant="outline">{reviewedRequests.length}</Badge>
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70 hover:opacity-100 transition-opacity">
          {reviewedRequests.map(req => (
            <Card key={req.id} className="bg-card/30 backdrop-blur-sm border-white/5 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2 bg-background/50">
                    {req.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-1 text-muted-foreground">{req.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{req.date}</span>
                <Link href={`/review-request/${req.id}`}>
                  <Button size="sm" variant="ghost">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
