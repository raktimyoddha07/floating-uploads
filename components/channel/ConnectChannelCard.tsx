"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube, Plus, Users } from "lucide-react";

export function ConnectChannelCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="glass-card flex flex-col items-center justify-center text-center p-8 border-dashed">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Youtube className="h-10 w-10 text-primary" />
      </div>
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-2xl font-bold">No Channels Connected</CardTitle>
        <CardDescription className="text-base mt-2">
          Connect your YouTube channel to start assigning uploaders securely.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-6">
        <Button size="lg" className="rounded-full shadow-lg font-semibold px-8" onClick={() => console.log('Mock OAuth Flow triggered')}>
          <Youtube className="mr-2 h-5 w-5" />
          Connect YouTube Channel
        </Button>
      </CardContent>
    </Card>
  );
}

export function AddUploaderModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg">
          <UserPlus className="mr-2 h-4 w-4" />
          Appoint Uploader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass">
        <DialogHeader>
          <DialogTitle>Appoint New Uploader</DialogTitle>
          <DialogDescription>
            Grant a user permission to create upload requests for your channel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" placeholder="john_doe_8214" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel" className="text-right">
              Channel
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c1">Nature Hub</SelectItem>
                <SelectItem value="c2">Gaming Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="permission" className="text-right">
              Permission
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select permission type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHORTS">Shorts Only</SelectItem>
                <SelectItem value="LONG_VIDEO">Long Videos Only</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="rounded-full">Appoint Uploader</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Ensure UserPlus is imported
import { UserPlus } from "lucide-react";
