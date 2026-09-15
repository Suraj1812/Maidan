"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { resolveDispute } from "@/lib/actions";
import type { Dispute } from "@/types/database";

interface DisputeWithChallenge extends Dispute {
  challenge: { id: string; title: string } | null;
}

export function DisputeResolutionCard({ dispute }: { dispute: DisputeWithChallenge }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function resolve(overturn: boolean) {
    if (notes.trim().length < 3) {
      toast.error("Add a short note explaining the ruling");
      return;
    }
    startTransition(async () => {
      const result = await resolveDispute({
        dispute_id: dispute.id,
        action: overturn ? "Overturned result" : "Upheld original result",
        notes,
        overturn,
      });
      if (result.ok) {
        toast.success("Dispute resolved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <Link href={`/challenges/${dispute.challenge?.id}`} className="font-display text-lg tracking-wide hover:text-maidan-lime">
        {dispute.challenge?.title ?? "Challenge"}
      </Link>
      <p className="mt-2 text-sm text-foreground/70">{dispute.reason}</p>
      <p className="mt-1 text-xs text-foreground/40">Filed {new Date(dispute.created_at).toLocaleString("en-IN")}</p>

      <div className="mt-4 space-y-2">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ruling notes (required)…" />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={pending} onClick={() => resolve(false)} variant="outline">
            Uphold result
          </Button>
          <Button size="sm" disabled={pending} onClick={() => resolve(true)} className="bg-red-500/80 text-white hover:bg-red-500">
            Overturn result
          </Button>
        </div>
      </div>
    </div>
  );
}
