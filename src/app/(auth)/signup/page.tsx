"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/lib/actions/auth";

export default function SignupPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-maidan-lime" />
        <h1 className="font-display text-2xl tracking-wide">Check your inbox</h1>
        <p className="mt-2 text-sm text-foreground/60">
          We sent a confirmation link to your email. Click it to activate your account and set up your profile.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-maidan-lime hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wide">Join the Maidan</h1>
      <p className="mt-1 text-sm text-foreground/60">Use your college email if you have one — it verifies your college instantly.</p>

      <form
        className="mt-6 space-y-4"
        action={(formData) =>
          startTransition(async () => {
            setError(null);
            const result = await signUpAction(formData);
            if (result.ok) {
              setSent(true);
            } else {
              setError(result.error);
            }
          })
        }
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@college.edu" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60">
        Already on Maidan?{" "}
        <Link href="/login" className="font-medium text-maidan-lime hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
