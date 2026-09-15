"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inviteToSquad } from "@/lib/actions";
import { searchProfilesClient } from "@/lib/actions/search";

interface ProfileHit {
  id: string;
  username: string;
  full_name: string;
}

export function InviteMemberForm({ squadId }: { squadId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileHit[]>([]);
  const [searching, startSearch] = useTransition();
  const [inviting, startInvite] = useTransition();

  function onQueryChange(v: string) {
    setQuery(v);
    if (v.trim().length < 2) {
      setResults([]);
      return;
    }
    startSearch(async () => {
      const hits = await searchProfilesClient(v);
      setResults(hits);
    });
  }

  function invite(userId: string) {
    startInvite(async () => {
      const result = await inviteToSquad({ squad_id: squadId, invited_user_id: userId });
      if (result.ok) {
        toast.success("Invite sent");
        setQuery("");
        setResults([]);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by username…"
          className="pl-9"
        />
      </div>
      {searching && <p className="text-xs text-foreground/40">Searching…</p>}
      {results.length > 0 && (
        <div className="divide-y divide-white/5 rounded-lg border border-white/10 bg-white/[0.03]">
          {results.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-sm font-medium">{r.full_name}</p>
                <p className="text-xs text-foreground/50">@{r.username}</p>
              </div>
              <Button size="sm" variant="outline" disabled={inviting} onClick={() => invite(r.id)}>
                <UserPlus className="mr-1 h-3.5 w-3.5" /> Invite
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
