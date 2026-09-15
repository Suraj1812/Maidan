import Link from "next/link";
import { Trophy, Users2, Bell, Plus, Shield, BadgeCheck } from "lucide-react";
import { getCurrentProfileFull, getMySquads, getMyPendingInvites, getMyNotifications } from "@/lib/data";
import { InviteResponseButtons } from "@/components/dashboard/invite-response-buttons";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [profile, squads, invites, notifications] = await Promise.all([
    getCurrentProfileFull(),
    getMySquads(),
    getMyPendingInvites(),
    getMyNotifications(5),
  ]);

  if (!profile) return null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl tracking-wide">
            Welcome back, {profile.full_name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            {profile.college?.name ? `${profile.college.name} · ${profile.college.city}` : "No college set"}
            {profile.college_verified && (
              <span className="ml-2 inline-flex items-center gap-1 text-maidan-lime">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
          <Trophy className="h-4 w-4 text-maidan-gold" />
          <span className="font-display text-lg tabular-nums">{profile.points}</span>
          <span className="text-xs text-foreground/50">points</span>
        </div>
      </div>

      {invites.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
            <Bell className="h-4 w-4 text-maidan-saffron" /> Pending squad invites
          </h2>
          <div className="space-y-2">
            {invites.map((inv) => {
              const squad = inv.squad as unknown as { name: string; slug: string } | null;
              const inviter = inv.inviter as unknown as { full_name: string } | null;
              return (
                <div
                  key={inv.id}
                  className="flex flex-col items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center"
                >
                  <p className="text-sm">
                    <span className="font-medium">{inviter?.full_name ?? "Someone"}</span> invited you to join{" "}
                    <span className="font-medium text-maidan-lime">{squad?.name ?? "a squad"}</span>
                  </p>
                  <InviteResponseButtons inviteId={inv.id} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
            <Users2 className="h-4 w-4 text-maidan-blue" /> My squads
          </h2>
          <Link href="/squads/new" className={buttonVariants({ size: "sm", variant: "outline" })}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New squad
          </Link>
        </div>
        {squads.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {squads.map((s) => {
              const squad = s.squad as unknown as { id: string; name: string; slug: string; wins: number; losses: number; points: number };
              return (
                <Link
                  key={squad.id}
                  href={`/squads/${squad.slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display tracking-wide">{squad.name}</p>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {s.role}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-foreground/50">
                    {squad.wins}W · {squad.losses}L · {squad.points} pts
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyCard
            icon={Shield}
            title="You're not in a squad yet"
            body="Found one, or wait for an invite from a captain."
            href="/squads/new"
            cta="Found a squad"
          />
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
            <Bell className="h-4 w-4 text-maidan-lime" /> Recent notifications
          </h2>
          <Link href="/notifications" className="text-xs font-medium text-maidan-lime hover:underline">
            View all
          </Link>
        </div>
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "/notifications"}
                className={`block rounded-xl border px-4 py-3 text-sm transition-colors hover:bg-white/[0.06] ${
                  n.read ? "border-white/8 bg-white/[0.02] text-foreground/60" : "border-maidan-lime/30 bg-maidan-lime/5"
                }`}
              >
                <span className="font-medium">{n.title}</span>
                {n.body && <span className="text-foreground/50"> — {n.body}</span>}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyCard icon={Bell} title="No notifications yet" body="Squad activity and challenge updates will show up here." />
        )}
      </section>
    </div>
  );
}

function EmptyCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
      <Icon className="mx-auto mb-3 h-6 w-6 text-foreground/30" />
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-foreground/50">{body}</p>
      {href && cta && (
        <Link href={href} className="mt-4 inline-block text-sm font-semibold text-maidan-lime hover:underline">
          {cta} →
        </Link>
      )}
    </div>
  );
}
