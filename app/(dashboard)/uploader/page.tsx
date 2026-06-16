"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function UploaderSectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    // Simulate progress for UI
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        clearInterval(interval);
        setProgress(100);
        setUploadComplete(true);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      clearInterval(interval);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Upload Request</h1>
        <p className="text-muted-foreground">
          Submit a new video to be reviewed and uploaded by the channel owner.
        </p>
      </div>

      <Card className="glass-card">
        <form onSubmit={handleUpload}>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
            <CardDescription>Fill in the details for the YouTube upload.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Target Channel */}
            <div className="space-y-2">
              <Label htmlFor="channel">Target Channel</Label>
              <Select defaultValue="c1">
                <SelectTrigger id="channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="c1">Nature Hub</SelectItem>
                  <SelectItem value="c2">Gaming Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Video Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Video Type</Label>
              <Select defaultValue="LONG_VIDEO">
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHORTS">Shorts</SelectItem>
                  <SelectItem value="LONG_VIDEO">Long Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">YouTube Title</Label>
              <Input id="title" placeholder="Enter an engaging title..." required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">YouTube Description</Label>
              <Textarea id="description" placeholder="Enter video description..." className="min-h-[120px]" />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note to Owner (Optional)</Label>
              <Input id="note" placeholder="E.g., Please review the intro sequence..." />
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Video File</Label>
              {!uploadComplete ? (
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium mb-1">Drag & drop your video here</p>
                  <p className="text-xs text-muted-foreground mb-4">MP4, MOV up to 10GB</p>
                  <Input 
                    type="file" 
                    accept="video/*" 
                    className="max-w-xs cursor-pointer" 
                    onChange={handleFileChange}
                    required
                  />
                </div>
              ) : (
                <div className="border border-green-500/20 bg-green-500/10 rounded-xl p-6 flex flex-col items-center text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                  <p className="font-medium text-green-600 dark:text-green-400">Upload Complete</p>
                  <p className="text-sm text-muted-foreground">Your video has been securely stored.</p>
                </div>
              )}

              {/* Progress Bar */}
              {(isUploading || progress > 0) && !uploadComplete && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>

          </CardContent>
          
          <div className="p-6 pt-0 flex justify-end gap-4">
            <Button variant="outline" type="button">Save Draft</Button>
            <Button type="submit" disabled={!file || isUploading || uploadComplete} className="rounded-full shadow-lg">
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isUploading && !uploadComplete && "Submit Request"}
              {uploadComplete && "Request Submitted"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
