"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UploaderAssignmentRow = {
  id: string;
  permission: "SHORTS" | "LONG_VIDEO" | "BOTH";
  grantedAt: string;
  channel: {
    id: string;
    name: string;
  };
  uploader: {
    name: string | null;
    username: string | null;
    image: string | null;
  };
};

export function UploaderTable({
  assignments,
  onUpdatePermissionAction,
  onRemoveAction,
}: {
  assignments: UploaderAssignmentRow[];
  onUpdatePermissionAction?: (
    assignmentId: string,
    permission: "SHORTS" | "LONG_VIDEO" | "BOTH",
  ) => Promise<void>;
  onRemoveAction?: (assignmentId: string) => void;
}) {
  const [editingAssignment, setEditingAssignment] =
    useState<UploaderAssignmentRow | null>(null);
  const [nextPermission, setNextPermission] = useState<
    "SHORTS" | "LONG_VIDEO" | "BOTH"
  >("BOTH");

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/40 p-8 text-center text-muted-foreground">
        No uploaders have been assigned yet.
      </div>
    );
  }

  const openPermissionDialog = (assignment: UploaderAssignmentRow) => {
    setEditingAssignment(assignment);
    setNextPermission(assignment.permission);
  };

  const handlePermissionSave = async () => {
    if (!editingAssignment || !onUpdatePermissionAction) {
      return;
    }

    await onUpdatePermissionAction(editingAssignment.id, nextPermission);
    setEditingAssignment(null);
  };

  return (
    <>
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
              <TableRow
                key={assignment.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={assignment.uploader.image || undefined}
                        alt={assignment.uploader.name || "Uploader"}
                      />
                      <AvatarFallback>
                        {(
                          assignment.uploader.name ||
                          assignment.uploader.username ||
                          "U"
                        )
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {assignment.uploader.name || "Unknown uploader"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{assignment.uploader.username || "no_username"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {assignment.channel.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      assignment.permission === "BOTH" ? "default" : "secondary"
                    }
                    className="rounded-full"
                  >
                    {assignment.permission.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(assignment.grantedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openPermissionDialog(assignment)}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Update Permission
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onRemoveAction?.(assignment.id)}
                      >
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

      <Dialog
        open={editingAssignment !== null}
        onOpenChange={(open) => !open && setEditingAssignment(null)}
      >
        <DialogContent className="glass sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Update Permission</DialogTitle>
            <DialogDescription>
              Choose the uploader permission for this channel assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select
              value={nextPermission}
              onValueChange={(value) =>
                setNextPermission(value as "SHORTS" | "LONG_VIDEO" | "BOTH")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHORTS">Shorts Only</SelectItem>
                <SelectItem value="LONG_VIDEO">Long Videos Only</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingAssignment(null)}
            >
              Cancel
            </Button>
            <Button onClick={handlePermissionSave}>Update Permission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
