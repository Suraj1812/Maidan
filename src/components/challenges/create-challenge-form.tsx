"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createChallenge } from "@/lib/actions";
import { searchSquadsClient } from "@/lib/actions/search";
import type { Category } from "@/types/database";

interface SquadOption {
  id: string;
  name: string;
  slug: string;
}

export function CreateChallengeForm({
  mySquads,
  categories,
  presetSquadId,
}: {
  mySquads: SquadOption[];
  categories: Category[];
  presetSquadId?: string;
}) {
  const router = useRouter();
  const [squadId, setSquadId] = useState(presetSquadId ?? mySquads[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [opponentQuery, setOpponentQuery] = useState("");
  const [opponent, setOpponent] = useState<SquadOption | null>(null);
  const [results, setResults] = useState<SquadOption[]>([]);
  const [searching, startSearch] = useTransition();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onOpponentQueryChange(v: string) {
    setOpponentQuery(v);
    setOpponent(null);
    if (v.trim().length < 2) {
      setResults([]);
      return;
    }
    startSearch(async () => {
      const hits = await searchSquadsClient(v);
      setResults(hits.filter((h) => h.id !== squadId));
    });
  }

  if (mySquads.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center text-sm text-foreground/50">
        You need to captain a squad before you can throw a challenge.
      </p>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);

        const deadlineLocal = fd.get("deadline") as string;
        const deadlineIso = deadlineLocal ? new Date(deadlineLocal).toISOString() : "";

        startTransition(async () => {
          const result = await createChallenge({
            title: fd.get("title"),
            description: fd.get("description"),
            rules: fd.get("rules") || undefined,
            category_id: categoryId,
            created_by_squad: squadId,
            opponent_squad: opponent?.id ?? null,
            deadline: deadlineIso,
          });
          if (result.ok) {
            router.push("/challenges");
            router.refresh();
          } else {
            setError(result.error);
          }
        });
      }}
    >
      <div className="space-y-1.5">
        <Label>Your squad</Label>
        <Select value={squadId} onValueChange={(value) => setSquadId(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a squad you captain" />
          </SelectTrigger>
          <SelectContent>
            {mySquads.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pick a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Freestyle Friday Showdown" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required minLength={20} placeholder="What's the challenge about?" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rules">Rules (optional)</Label>
        <Textarea id="rules" name="rules" placeholder="Judging criteria, format, constraints…" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deadline">Deadline</Label>
        <Input id="deadline" name="deadline" type="datetime-local" required />
      </div>

      <div className="space-y-1.5">
        <Label>Opponent (optional — leave blank to make it an open call-out)</Label>
        {opponent ? (
          <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm">
            {opponent.name}
            <button type="button" onClick={() => setOpponent(null)} className="text-xs text-foreground/50 hover:underline">
              Clear
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <Input value={opponentQuery} onChange={(e) => onOpponentQueryChange(e.target.value)} placeholder="Search squads…" className="pl-9" />
          </div>
        )}
        {searching && <p className="text-xs text-foreground/40">Searching…</p>}
        {results.length > 0 && !opponent && (
          <div className="divide-y divide-white/5 rounded-lg border border-white/10 bg-white/[0.03]">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setOpponent(r);
                  setResults([]);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5"
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90">
        {pending ? "Throwing challenge…" : "Throw challenge"}
      </Button>
    </form>
  );
}
