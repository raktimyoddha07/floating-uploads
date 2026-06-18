"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wallet, AlertCircle, Settings2 } from "lucide-react";

type SettingsResponse = {
  user: {
    name: string | null;
    email: string | null;
    username: string | null;
  } | null;
  latestPayment: {
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  } | null;
};

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [payment, setPayment] =
    useState<SettingsResponse["latestPayment"]>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SettingsResponse;
        setName(data.user?.name || "");
        setEmail(data.user?.email || "");
        setUsername(data.user?.username || "");
        setPayment(data.latestPayment);
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username }),
      });
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Settings & Payments
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and billing details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" /> Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="john_doe_8214"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} disabled />
              <p className="text-[10px] text-muted-foreground">
                Contact support to change your email.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="rounded-full shadow-md w-full sm:w-auto"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-card border-primary/20 shadow-primary/5">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" /> Subscription
                </CardTitle>
                <CardDescription>Manage your active plan.</CardDescription>
              </div>
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground shadow-sm"
              >
                {payment?.status === "SUCCESS" ? "PRO PLAN" : "FREE PLAN"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-white/5">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Demo billing profile</p>
                  <p className="text-xs text-muted-foreground">
                    {payment
                      ? `${payment.currency.toUpperCase()} ${payment.amount}`
                      : "No payments yet"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled
              >
                Update
              </Button>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <p>
                {payment
                  ? `Latest payment status: ${payment.status} on ${new Date(payment.createdAt).toLocaleDateString()}.`
                  : "No billing activity yet. Payments can be wired next without changing this page structure."}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <Button
              className="w-full sm:w-auto rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
              disabled
            >
              View Invoice History
            </Button>
            <Button
              variant="link"
              className="px-0 text-muted-foreground text-xs h-auto"
              disabled
            >
              Cancel Subscription
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
