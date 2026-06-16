"use client";

import { Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/50 backdrop-blur-xl px-6 shadow-sm">
      <div className="flex flex-1 items-center justify-end gap-4">
        {/* Notification Bell */}
        <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
        </button>
        
        {/* Profile Dropdown Placeholder */}
        <button className="flex items-center gap-2 rounded-full border p-1 pr-3 transition-colors hover:bg-accent">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Account</span>
        </button>
      </div>
    </header>
  );
}
