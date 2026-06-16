"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, FileVideo, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const routes = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Appoint Uploader", href: "/appoint-uploader", icon: UserPlus },
    { name: "Review Request", href: "/review-request", icon: FileVideo },
    { name: "Uploader Section", href: "/uploader", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-background/50 backdrop-blur-xl md:flex z-20 shadow-lg">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Upload Monitor YT
        </h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          const Icon = route.icon;
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              {route.name}
              
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
