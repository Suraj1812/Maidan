"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { completeOnboarding } from "@/lib/actions";
import type { College } from "@/types/database";

export function OnboardingForm({ colleges, email }: { colleges: College[]; email: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [collegeId, setCollegeId] = useState<string>("");
  const [addingCollege, setAddingCollege] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await completeOnboarding({
            username: fd.get("username"),
            full_name: fd.get("full_name"),
            college_id: collegeId && !addingCollege ? collegeId : null,
            new_college_name: addingCollege ? fd.get("new_college_name") : undefined,
            new_college_city: addingCollege ? fd.get("new_college_city") : undefined,
            city: fd.get("city") || undefined,
            bio: fd.get("bio") || undefined,
          });
          if (result.ok) {
            router.push("/dashboard");
            router.refresh();
          } else {
            setError(result.error);
          }
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" required placeholder="Your name" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" required placeholder="lowercase_handle" pattern="^[a-z0-9_]{3,20}$" />
        <p className="text-xs text-foreground/40">3–20 characters, lowercase letters, numbers and underscores.</p>
      </div>

      <div className="space-y-1.5">
        <Label>College</Label>
        {!addingCollege ? (
          <>
            <Select value={collegeId} onValueChange={(value) => setCollegeId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your college" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setAddingCollege(true)}
              className="text-xs font-medium text-maidan-lime hover:underline"
            >
              Can&apos;t find your college? Add it
            </button>
            {email && (
              <p className="text-xs text-foreground/40">
                Signing up with your college email ({email}) auto-verifies your college membership if it matches.
              </p>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <Input name="new_college_name" placeholder="College name" required={addingCollege} />
            <Input name="new_college_city" placeholder="City" required={addingCollege} />
            <button
              type="button"
              onClick={() => setAddingCollege(false)}
              className="text-xs font-medium text-foreground/50 hover:underline"
            >
              Pick from the list instead
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="city">City (optional, if different from college)</Label>
        <Input id="city" name="city" placeholder="Your city" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio (optional)</Label>
        <Textarea id="bio" name="bio" maxLength={280} placeholder="What do you bring to the Maidan?" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90">
        {pending ? "Saving…" : "Enter the Maidan"}
      </Button>
    </form>
  );
}
