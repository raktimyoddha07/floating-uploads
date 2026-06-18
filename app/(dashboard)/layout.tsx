import { ReactNode } from "react";
import { Outfit } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import "@/app/(public)/globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Dashboard - Floating Uploads",
  description: "Dashboard for Floating Uploads.",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.className} bg-background text-foreground antialiased min-h-screen`} suppressHydrationWarning>
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background to-secondary/20">
          <Sidebar />

          <div className="flex flex-1 flex-col overflow-hidden relative">
            {/* Ambient Background Glow for premium aesthetics */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

            <Navbar session={session} />

            <main className="flex-1 overflow-y-auto p-6 md:p-8 z-10">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
