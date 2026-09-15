"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return <div className="h-80 animate-pulse rounded-xl bg-white/5" />;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wide">Welcome back</h1>
      <p className="mt-1 text-sm text-foreground/60">Log in and get back on the Maidan.</p>

      <form
        className="mt-6 space-y-4"
        action={(formData) =>
          startTransition(async () => {
            setError(null);
            const result = await signInAction(formData);
            if (result.ok) {
              router.push(params.get("redirect") || "/dashboard");
              router.refresh();
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
          <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90">
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60">
        New to Maidan?{" "}
        <Link href="/signup" className="font-medium text-maidan-lime hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
