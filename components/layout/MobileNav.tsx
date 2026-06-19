"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileVideo,
  Settings,
  PlugZap,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Appoint Uploader", href: "/appoint-uploader", icon: UserPlus },
    { name: "Review Request", href: "/review-request", icon: FileVideo },
    { name: "Uploader Section", href: "/uploader", icon: Users },
    { name: "Connections", href: "/connections", icon: PlugZap },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden mr-2 px-2">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-background p-0">
        <SheetHeader className="h-16 flex items-start justify-center border-b px-6 py-0 m-0 text-left">
          <SheetTitle className="text-base font-semibold m-0 leading-10 flex items-center h-full">Floating Uploads</SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 px-3 py-4 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
          {routes.map((route) => {
            const isActive =
              pathname === route.href || pathname.startsWith(`${route.href}/`);
            const Icon = route.icon;

            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {route.name}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
