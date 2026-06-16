"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-24 text-center space-y-6">
      <h2 className="text-4xl font-bold tracking-tight">404</h2>
      <h3 className="text-2xl font-semibold">Page Not Found</h3>
      <p className="text-muted-foreground max-w-md">
        We could not find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link href="/">
        <Button className="rounded-full shadow-lg">Return Home</Button>
      </Link>
    </div>
  );
}
