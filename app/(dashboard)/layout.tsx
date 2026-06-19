import { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import "@/app/(public)/globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Dashboard - Floating Uploads",
  description: "Dashboard for Floating Uploads.",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-background text-foreground antialiased min-h-screen`} suppressHydrationWarning>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Navbar session={session} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
