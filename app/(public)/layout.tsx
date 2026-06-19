import "./globals.css";
import { ReactNode } from "react";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Floating Uploads",
  description: "Manage your YouTube uploads securely.",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} bg-background text-foreground antialiased min-h-screen`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
