"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileVideo,
  Settings,
  PlugZap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
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
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-base font-semibold">Floating Uploads</h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {routes.map((route) => {
          const isActive =
            pathname === route.href || pathname.startsWith(`${route.href}/`);
          const Icon = route.icon;

          return (
            <Link
              key={route.href}
              href={route.href}
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
    </aside>
  );
}
