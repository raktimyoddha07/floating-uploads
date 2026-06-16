import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import "@/app/(public)/globals.css";

export const metadata = {
  title: "Dashboard - Upload Monitor YT",
  description: "Dashboard for Upload Monitor YT.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background to-secondary/20">
          <Sidebar />
          
          <div className="flex flex-1 flex-col overflow-hidden relative">
            {/* Ambient Background Glow for premium aesthetics */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            
            <Navbar />
            
            <main className="flex-1 overflow-y-auto p-6 md:p-8 z-10">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
