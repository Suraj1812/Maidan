"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSquad } from "@/lib/actions";

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

export function CreateSquadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await createSquad({
            name: fd.get("name"),
            slug: fd.get("slug"),
            bio: fd.get("bio") || undefined,
          });
          if (result.ok) {
            router.push(`/squads/${slug}`);
            router.refresh();
          } else {
            setError(result.error);
          }
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Squad name</Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Warzone Warriors"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Squad URL</Label>
        <div className="flex items-center rounded-lg border border-input bg-transparent focus-within:border-maidan-saffron">
          <span className="pl-3 text-sm text-foreground/40">maidan.app/squads/</span>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="w-full bg-transparent py-2 pr-3 text-sm outline-none"
            placeholder="warzone-warriors"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio (optional)</Label>
        <Textarea id="bio" name="bio" maxLength={280} placeholder="What's your squad's story?" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90">
        {pending ? "Founding squad…" : "Found squad"}
      </Button>
    </form>
  );
}
