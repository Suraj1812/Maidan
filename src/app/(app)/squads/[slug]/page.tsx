import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, Crown, Swords } from "lucide-react";
import { getSquadBySlug } from "@/lib/data";
import { InviteMemberForm } from "@/components/squads/invite-member-form";
import { LeaveSquadButton } from "@/components/squads/leave-squad-button";
import { getIcon } from "@/lib/icon-map";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  accepted: "Accepted",
  in_progress: "In progress",
  evidence_submitted: "Evidence in",
  voting: "Voting",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

export default async function SquadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getSquadBySlug(slug);
  if (!result) notFound();

  const { squad, members, challenges, viewerId } = result;
  const isCaptain = viewerId === squad.captain_id;
  const isMember = members.some((m) => (m.profile as unknown as { id: string })?.id === viewerId);
  const college = squad.college as unknown as { name: string; city: string } | null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-maidan-gold/60 bg-gradient-to-br from-maidan-saffron/30 to-maidan-blue/30 font-display text-2xl">
            {squad.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl tracking-wide">{squad.name}</h1>
            <p className="mt-1 text-sm text-foreground/60">{college ? `${college.name} · ${college.city}` : "Independent squad"}</p>
            {squad.bio && <p className="mt-2 max-w-md text-sm text-foreground/70">{squad.bio}</p>}
          </div>
        </div>
        <div className="flex items-center gap-6 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3">
          <Stat label="Wins" value={squad.wins} color="text-maidan-lime" />
          <Stat label="Losses" value={squad.losses} color="text-foreground/60" />
          <Stat label="Points" value={squad.points} color="text-maidan-gold" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
              <Swords className="h-4 w-4 text-maidan-saffron" /> Challenge history
            </h2>
            {isMember && (
              <Link href={`/challenges/new?squad=${squad.id}`} className="text-xs font-semibold text-maidan-lime hover:underline">
                Throw a challenge
              </Link>
            )}
          </div>
          {challenges.length > 0 ? (
            <div className="space-y-2">
              {challenges.map((c) => {
                const Icon = getIcon((c.category as unknown as { icon: string } | null)?.icon ?? "trophy");
                const won = c.winner_squad === squad.id;
                const lost = c.winner_squad && c.winner_squad !== squad.id;
                return (
                  <Link
                    key={c.id}
                    href={`/challenges/${c.id}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-maidan-gold" />
                      <span className="text-sm font-medium">{c.title}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={won ? "border-maidan-lime/50 text-maidan-lime" : lost ? "border-red-500/40 text-red-400" : ""}
                    >
                      {won ? "Won" : lost ? "Lost" : STATUS_LABEL[c.status] ?? c.status}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center text-sm text-foreground/50">
              No challenges yet — throw the first one.
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
            <Shield className="h-4 w-4 text-maidan-blue" /> Roster ({members.length})
          </h2>
          <div className="space-y-2">
            {members.map((m) => {
              const p = m.profile as unknown as { id: string; username: string; full_name: string; points: number };
              return (
                <Link
                  key={p.id}
                  href={`/u/${p.username}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-2">
                    {m.role === "captain" && <Crown className="h-3.5 w-3.5 text-maidan-gold" />}
                    <span className="text-sm">{p.full_name}</span>
                  </div>
                  <span className="text-xs text-foreground/40">{p.points} pts</span>
                </Link>
              );
            })}
          </div>

          {isCaptain && (
            <div className="mt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Invite a teammate</h3>
              <InviteMemberForm squadId={squad.id} />
            </div>
          )}

          {isMember && !isCaptain && (
            <div className="mt-6">
              <LeaveSquadButton squadId={squad.id} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`font-display text-xl tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-foreground/40">{label}</p>
    </div>
  );
}
