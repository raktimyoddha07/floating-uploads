import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Upload Monitor YT",
  description: "Manage your YouTube uploads securely.",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
