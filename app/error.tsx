"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center space-y-6">
      <h2 className="text-3xl font-bold text-destructive">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred. Please try again or contact support if the issue persists.
      </p>
      <Button 
        onClick={() => reset()}
        className="rounded-full shadow-lg"
      >
        Try again
      </Button>
    </div>
  );
}
