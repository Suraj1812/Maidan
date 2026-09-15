import Link from "next/link";
import { Crown, Building2, MapPin, User } from "lucide-react";
import { getTopSquads, getTopColleges, getTopCities, getTopPlayers } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function LeaderboardPage() {
  const [squads, colleges, cities, players] = await Promise.all([
    getTopSquads(50),
    getTopColleges(50),
    getTopCities(50),
    getTopPlayers(50),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">Leaderboard</h1>
      <p className="mt-1 text-sm text-foreground/60">Ranked purely by completed challenges. No seeding, no shortcuts.</p>

      <Tabs defaultValue="squads" className="mt-8">
        <TabsList>
          <TabsTrigger value="squads">Squads</TabsTrigger>
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>

        <TabsContent value="squads" className="mt-4">
          <Board
            icon={Crown}
            empty="No squads have scored points yet."
            rows={squads.map((s) => ({
              key: s.squad_id,
              rank: s.rank,
              name: s.name,
              sub: s.college_name ?? "Independent",
              points: s.points,
              href: `/squads/${s.slug}`,
            }))}
          />
        </TabsContent>

        <TabsContent value="colleges" className="mt-4">
          <Board
            icon={Building2}
            empty="No colleges have scored points yet."
            rows={colleges.map((c) => ({ key: c.college_id, rank: c.rank, name: c.name, sub: c.city, points: c.total_points }))}
          />
        </TabsContent>

        <TabsContent value="cities" className="mt-4">
          <Board
            icon={MapPin}
            empty="No cities have scored points yet."
            rows={cities.map((c) => ({ key: c.city, rank: c.rank, name: c.city, sub: `${c.college_count} colleges`, points: c.total_points }))}
          />
        </TabsContent>

        <TabsContent value="players" className="mt-4">
          <Board
            icon={User}
            empty="No players have scored points yet."
            rows={players.map((p) => ({
              key: p.user_id,
              rank: p.rank,
              name: p.full_name,
              sub: p.college_name ?? `@${p.username}`,
              points: p.points,
              href: `/u/${p.username}`,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface Row {
  key: string;
  rank: number;
  name: string;
  sub: string;
  points: number;
  href?: string;
}

function Board({ rows, empty, icon: Icon }: { rows: Row[]; empty: string; icon: React.ComponentType<{ className?: string }> }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
        <Icon className="mx-auto mb-3 h-7 w-7 text-foreground/30" />
        <p className="text-sm text-foreground/50">{empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {rows.map((r) => {
        const content = (
          <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 font-display text-sm text-foreground/70">
              {r.rank}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.name}</p>
              <p className="truncate text-xs text-foreground/50">{r.sub}</p>
            </div>
            <div className="font-display text-lg tabular-nums text-maidan-gold">{r.points}</div>
          </div>
        );
        return r.href ? (
          <Link key={r.key} href={r.href}>
            {content}
          </Link>
        ) : (
          <div key={r.key}>{content}</div>
        );
      })}
    </div>
  );
}
