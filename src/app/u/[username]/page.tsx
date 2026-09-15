import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Trophy } from "lucide-react";
import { getProfileByUsername } from "@/lib/data";
import { getCurrentProfile } from "@/lib/data";
import { getIcon } from "@/lib/icon-map";
import { CinematicBackground } from "@/components/landing/cinematic-background";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [result, viewer] = await Promise.all([getProfileByUsername(username), getCurrentProfile()]);
  if (!result) notFound();

  const { profile, badges, squads } = result;
  const college = profile.college as unknown as { name: string; city: string } | null;

  return (
    <>
      <CinematicBackground />
      <Navbar isAuthed={!!viewer} />
      <main className="mx-auto min-h-svh w-full max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-maidan-gold/60 bg-gradient-to-br from-maidan-saffron/30 to-maidan-blue/30 font-display text-2xl">
            {profile.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl tracking-wide">{profile.full_name}</h1>
            <p className="text-sm text-foreground/50">
              @{profile.username} {college && `· ${college.name}, ${college.city}`}
            </p>
            {profile.college_verified && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-maidan-lime">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified college member
              </span>
            )}
          </div>
        </div>

        {profile.bio && <p className="mt-4 text-sm text-foreground/70">{profile.bio}</p>}

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
          <Trophy className="h-4 w-4 text-maidan-gold" />
          <span className="font-display text-lg tabular-nums">{profile.points}</span>
          <span className="text-xs text-foreground/50">points</span>
        </div>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/70">Badges</h2>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {badges.map((b) => {
                const badge = b.badge as unknown as { id: string; name: string; description: string; icon: string };
                const Icon = getIcon(badge.icon);
                return (
                  <div
                    key={badge.id}
                    title={badge.description}
                    className="flex items-center gap-2 rounded-full border border-maidan-gold/40 bg-maidan-gold/10 px-3 py-1.5 text-xs font-medium"
                  >
                    <Icon className="h-3.5 w-3.5 text-maidan-gold" /> {badge.name}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-foreground/40">No badges earned yet.</p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/70">Squads</h2>
          {squads.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {squads.map((s, i) => {
                const squad = s.squad as unknown as { name: string; slug: string; wins: number; losses: number };
                return (
                  <Link
                    key={i}
                    href={`/squads/${squad.slug}`}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.07]"
                  >
                    <p className="font-medium">{squad.name}</p>
                    <p className="mt-1 text-xs text-foreground/50">
                      {s.role} · {squad.wins}W {squad.losses}L
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-foreground/40">Not in a squad yet.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
