"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Clock, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ReviewRequestDetailPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch data based on params.id
  const reqId = params.id;
  const [isApproving, setIsApproving] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Link href="/review-request" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reviews
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Nature Documentary in 4K</h1>
            <Badge variant="secondary">PENDING</Badge>
          </div>
          <p className="text-muted-foreground">Submitted by John Doe • Long Video</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="destructive" className="flex-1 md:flex-none">
            <X className="mr-2 h-4 w-4" /> Decline
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">
            <Clock className="mr-2 h-4 w-4" /> Schedule
          </Button>
          <Button className="flex-1 md:flex-none rounded-full" onClick={() => setIsApproving(true)}>
            <Check className="mr-2 h-4 w-4" /> Approve & Upload
          </Button>
        </div>
      </div>

      {/* Optional Note Section */}
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg p-4 text-sm">
        <span className="font-semibold">Uploader Note:</span> Please review the intro sequence at 0:15 before approving.
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="glass-card overflow-hidden">
            <div className="aspect-video bg-black/90 w-full relative group flex items-center justify-center">
              {/* Fake Video Player Placeholder */}
              <div className="text-center">
                <UploadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Video Preview</p>
                <p className="text-xs text-muted-foreground/60">ID: {reqId}</p>
              </div>
            </div>
            <CardContent className="p-4 flex gap-4 text-sm text-muted-foreground bg-muted/10">
              <div>Resolution: <span className="font-medium text-foreground">1920x1080</span></div>
              <div>Size: <span className="font-medium text-foreground">824 MB</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Metadata Edit</CardTitle>
              <CardDescription>Modify before YouTube upload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" defaultValue="Nature Documentary in 4K" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" className="h-32" defaultValue="Discover the hidden wonders of the African safari..." />
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>Thumbnail</Label>
                <div className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <span className="text-xs font-medium text-muted-foreground flex flex-col items-center">
                    <UploadCloud className="h-6 w-6 mb-1" />
                    Upload Custom Thumbnail
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
