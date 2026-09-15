import { notFound } from "next/navigation";
import Link from "next/link";
import { Swords, Clock, ShieldAlert, Play } from "lucide-react";
import { getChallengeById } from "@/lib/data";
import { finalizeChallengeIfReady } from "@/lib/actions";
import { CategoryIcon } from "@/lib/icon-map";
import { Badge } from "@/components/ui/badge";
import { EvidenceUpload } from "@/components/challenges/evidence-upload";
import { AcceptChallengeButton, OpenVotingButton, VoteButtons, DisputeForm } from "@/components/challenges/action-buttons";

const STATUS_LABEL: Record<string, string> = {
  open: "Open call",
  accepted: "Accepted — in progress",
  in_progress: "In progress",
  evidence_submitted: "Evidence submitted",
  voting: "Voting live",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await finalizeChallengeIfReady(id);
  const result = await getChallengeById(id);
  if (!result) notFound();

  const { challenge, evidence, votes, disputes, viewerId, myMemberSquadIds } = result;
  const categoryIconSlug = (challenge.category as unknown as { icon: string } | null)?.icon ?? "trophy";
  const challenger = challenge.challenger as unknown as { id: string; name: string; slug: string; captain_id: string } | null;
  const opponent = challenge.opponent as unknown as { id: string; name: string; slug: string; captain_id: string } | null;

  const isChallengerCaptain = viewerId === challenger?.captain_id;
  const isOpponentCaptain = viewerId === opponent?.captain_id;
  const isParticipantCaptain = isChallengerCaptain || isOpponentCaptain;
  const viewerSquadInMatch = myMemberSquadIds.includes(challenger?.id ?? "__") ? challenger?.id : myMemberSquadIds.includes(opponent?.id ?? "__") ? opponent?.id : null;

  const challengerVotes = votes.filter((v) => v.voted_squad === challenger?.id).length;
  const opponentVotes = votes.filter((v) => v.voted_squad === opponent?.id).length;
  const alreadyVoted = votes.some((v) => v.voter_id === viewerId);
  const isSquadMemberOfEither = myMemberSquadIds.includes(challenger?.id ?? "__") || myMemberSquadIds.includes(opponent?.id ?? "__");

  const openDispute = disputes.find((d) => d.status === "open" || d.status === "reviewing");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-maidan-gold">
          <CategoryIcon slug={categoryIconSlug} className="h-3.5 w-3.5" /> {(challenge.category as unknown as { name: string } | null)?.name ?? "Challenge"}
          <Badge variant="outline" className="ml-2">
            {STATUS_LABEL[challenge.status] ?? challenge.status}
          </Badge>
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-wide sm:text-4xl">{challenge.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <Link href={`/squads/${challenger?.slug}`} className="font-semibold hover:text-maidan-lime">
            {challenger?.name ?? "TBD"}
          </Link>
          <Swords className="h-4 w-4 text-foreground/40" />
          {opponent ? (
            <Link href={`/squads/${opponent.slug}`} className="font-semibold hover:text-maidan-lime">
              {opponent.name}
            </Link>
          ) : (
            <span className="text-foreground/40">Open — any squad can accept</span>
          )}
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-foreground/50">
          <Clock className="h-3.5 w-3.5" />
          Deadline {new Date(challenge.deadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          {challenge.voting_ends_at && (
            <> · Voting ends {new Date(challenge.voting_ends_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</>
          )}
        </p>
      </div>

      {challenge.status === "open" && !challenger && null}
      {challenge.status === "open" && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-foreground/70">This is an open call-out. Any squad captain can accept it.</p>
          {myMemberSquadIds.length > 0 && viewerId !== challenger?.captain_id && (
            <div className="mt-3">
              {myMemberSquadIds
                .filter((sid) => sid !== challenger?.id)
                .slice(0, 1)
                .map((sid) => (
                  <AcceptChallengeButton key={sid} challengeId={challenge.id} opponentSquadId={sid} />
                ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">Description</h2>
        <p className="whitespace-pre-wrap text-sm text-foreground/80">{challenge.description}</p>
      </div>

      {challenge.rules && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">Rules</h2>
          <p className="whitespace-pre-wrap text-sm text-foreground/80">{challenge.rules}</p>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/70">Evidence ({evidence.length})</h2>
        {evidence.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {evidence.map((e) => (
              <div key={e.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                {e.media_type === "video" ? (
                  <video src={e.media_url} controls className="aspect-video w-full bg-black" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.media_url} alt={e.caption ?? "Evidence"} className="aspect-video w-full object-cover" />
                )}
                <div className="p-3 text-xs text-foreground/60">
                  {e.caption && <p className="mb-1 text-foreground/80">{e.caption}</p>}
                  Uploaded by {(e.uploader as unknown as { full_name: string } | null)?.full_name ?? "a squad member"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-foreground/50">
            No evidence submitted yet.
          </p>
        )}

        {isParticipantCaptain && viewerSquadInMatch && ["accepted", "in_progress", "evidence_submitted"].includes(challenge.status) && (
          <div className="mt-4">
            <EvidenceUpload challengeId={challenge.id} squadId={viewerSquadInMatch} userId={viewerId!} />
          </div>
        )}
      </div>

      {isParticipantCaptain && evidence.length > 0 && ["accepted", "in_progress", "evidence_submitted"].includes(challenge.status) && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-3 text-sm text-foreground/70 flex items-center gap-1.5">
            <Play className="h-4 w-4 text-maidan-lime" /> Ready to let the crowd decide?
          </p>
          <OpenVotingButton challengeId={challenge.id} />
        </div>
      )}

      {challenge.status === "voting" && challenger && opponent && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/70">Cast your vote</h2>
          <div className="mb-4 space-y-2 text-sm">
            <p>
              {challenger.name}: <span className="font-semibold">{challengerVotes}</span>
            </p>
            <p>
              {opponent.name}: <span className="font-semibold">{opponentVotes}</span>
            </p>
          </div>
          <VoteButtons
            challengeId={challenge.id}
            challengerId={challenger.id}
            challengerName={challenger.name}
            opponentId={opponent.id}
            opponentName={opponent.name}
            disabled={!viewerId || alreadyVoted || isSquadMemberOfEither}
            disabledReason={
              !viewerId
                ? "Log in to vote"
                : isSquadMemberOfEither
                  ? "Participants can't vote on their own challenge"
                  : alreadyVoted
                    ? "You already voted"
                    : undefined
            }
          />
        </div>
      )}

      {challenge.status === "completed" && challenge.winner_squad && (
        <div className="rounded-xl border border-maidan-lime/30 bg-maidan-lime/5 p-4 text-sm">
          <span className="font-semibold text-maidan-lime">
            {challenge.winner_squad === challenger?.id ? challenger?.name : opponent?.name}
          </span>{" "}
          won this challenge.
        </div>
      )}

      {openDispute && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
          <ShieldAlert className="h-4 w-4 shrink-0" /> This challenge has an open dispute and is under moderator review.
        </div>
      )}

      {isParticipantCaptain && challenge.status === "completed" && !openDispute && (
        <div>
          <DisputeForm challengeId={challenge.id} />
        </div>
      )}
    </div>
  );
}
