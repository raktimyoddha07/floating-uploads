"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for UI presentation
const assignments = [
  {
    id: "a1",
    uploader: { name: "John Doe", username: "john_doe_8214", image: "https://github.com/shadcn.png" },
    channelName: "Nature Hub",
    permission: "SHORTS",
    grantedAt: "2026-06-16T10:00:00Z",
  },
  {
    id: "a2",
    uploader: { name: "Alex Smith", username: "alex_gaming", image: "" },
    channelName: "Gaming Hub",
    permission: "BOTH",
    grantedAt: "2026-06-15T14:30:00Z",
  },
];

export function UploaderTable() {
  return (
    <div className="rounded-xl border bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Uploader</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Permission Type</TableHead>
            <TableHead>Granted Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id} className="group hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={assignment.uploader.image} alt={assignment.uploader.name} />
                    <AvatarFallback>{assignment.uploader.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{assignment.uploader.name}</span>
                    <span className="text-xs text-muted-foreground">@{assignment.uploader.username}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{assignment.channelName}</TableCell>
              <TableCell>
                <Badge variant={assignment.permission === "BOTH" ? "default" : "secondary"} className="rounded-full">
                  {assignment.permission.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(assignment.grantedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" /> Update Permission
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Uploader
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
