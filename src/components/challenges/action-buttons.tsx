"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { acceptChallenge, openVoting, castVote, raiseDispute } from "@/lib/actions";

export function AcceptChallengeButton({ challengeId, opponentSquadId }: { challengeId: string; opponentSquadId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      className="bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90"
      onClick={() =>
        startTransition(async () => {
          const result = await acceptChallenge(challengeId, opponentSquadId);
          if (result.ok) {
            toast.success("Challenge accepted");
            router.refresh();
          } else toast.error(result.error);
        })
      }
    >
      Accept challenge
    </Button>
  );
}

export function OpenVotingButton({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      variant="outline"
      onClick={() =>
        startTransition(async () => {
          const result = await openVoting(challengeId);
          if (result.ok) {
            toast.success("Voting is open — 72 hours on the clock");
            router.refresh();
          } else toast.error(result.error);
        })
      }
    >
      Open public voting
    </Button>
  );
}

export function VoteButtons({
  challengeId,
  challengerId,
  challengerName,
  opponentId,
  opponentName,
  disabled,
  disabledReason,
}: {
  challengeId: string;
  challengerId: string;
  challengerName: string;
  opponentId: string;
  opponentName: string;
  disabled: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function vote(squadId: string) {
    startTransition(async () => {
      const result = await castVote({ challenge_id: challengeId, voted_squad: squadId });
      if (result.ok) {
        toast.success("Vote cast");
        router.refresh();
      } else toast.error(result.error);
    });
  }

  if (disabled) {
    return <p className="text-xs text-foreground/40">{disabledReason ?? "You can't vote on this challenge"}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={pending} onClick={() => vote(challengerId)} className="bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90">
        Vote {challengerName}
      </Button>
      <Button size="sm" disabled={pending} onClick={() => vote(opponentId)} className="bg-maidan-blue text-white hover:bg-maidan-blue/90">
        Vote {opponentName}
      </Button>
    </div>
  );
}

export function DisputeForm({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-red-400 hover:underline">
        Raise a dispute
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Explain what's wrong with this challenge's outcome (min 20 characters)…"
        maxLength={1000}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pending || reason.trim().length < 20}
          onClick={() =>
            startTransition(async () => {
              const result = await raiseDispute({ challenge_id: challengeId, reason });
              if (result.ok) {
                toast.success("Dispute filed — a moderator will review it");
                setOpen(false);
                router.refresh();
              } else toast.error(result.error);
            })
          }
        >
          Submit dispute
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
