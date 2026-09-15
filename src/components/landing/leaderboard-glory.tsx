"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crown, TrendingUp, Building2 } from "lucide-react";
import { KineticHeading, FadeUp } from "./reveal";
import type { SquadLeaderboardRow, CollegeLeaderboardRow } from "@/types/database";

const RANK_COLOR: Record<number, string> = {
  1: "text-maidan-gold border-maidan-gold/50",
  2: "text-slate-300 border-slate-300/40",
  3: "text-amber-600 border-amber-600/40",
};

function LeaderRow({ rank, name, sub, points, i }: { rank: number; name: string; sub: string; points: number; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay: i * 0.06 }}
      className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 hover:bg-white/[0.06]"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display text-sm ${
          RANK_COLOR[rank] ?? "text-foreground/60 border-white/15"
        }`}
      >
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-xs text-foreground/50">{sub}</p>
      </div>
      <div className="flex items-center gap-1 font-display text-lg tabular-nums text-maidan-lime">
        {points}
        <TrendingUp className="h-3.5 w-3.5" />
      </div>
    </motion.div>
  );
}

export function LeaderboardGlory({
  squads,
  colleges,
}: {
  squads: SquadLeaderboardRow[];
  colleges: CollegeLeaderboardRow[];
}) {
  const hasData = squads.length > 0 || colleges.length > 0;

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-maidan-gold">
          <Crown className="h-4 w-4" /> Leaderboard Glory
        </FadeUp>
        <KineticHeading text="Climb it for real." className="font-display text-4xl leading-[0.95] sm:text-6xl lg:text-7xl" />
        <FadeUp delay={0.15} className="mt-6 max-w-xl text-foreground/60">
          Ranks update the instant a challenge is finalized. Nothing here is seeded, simulated, or bought.
        </FadeUp>

        {hasData ? (
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
                <Crown className="h-4 w-4 text-maidan-gold" /> Top Squads
              </h3>
              <div className="space-y-2">
                {squads.length > 0 ? (
                  squads.slice(0, 6).map((s, i) => (
                    <LeaderRow key={s.squad_id} rank={s.rank} name={s.name} sub={s.college_name ?? "Independent"} points={s.points} i={i} />
                  ))
                ) : (
                  <EmptyMini text="No squads have scored points yet" />
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
                <Building2 className="h-4 w-4 text-maidan-blue" /> Top Colleges
              </h3>
              <div className="space-y-2">
                {colleges.length > 0 ? (
                  colleges.slice(0, 6).map((c, i) => (
                    <LeaderRow key={c.college_id} rank={c.rank} name={c.name} sub={c.city} points={c.total_points} i={i} />
                  ))
                ) : (
                  <EmptyMini text="No colleges have scored points yet" />
                )}
              </div>
            </div>
          </div>
        ) : (
          <FadeUp className="mx-auto mt-14 max-w-md rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-14 text-center">
            <Crown className="mx-auto mb-4 h-8 w-8 text-maidan-gold/70" />
            <p className="font-display text-lg tracking-wide">The board is empty — for now</p>
            <p className="mt-2 text-sm text-foreground/50">
              Leaderboards fill up as real challenges get finalized. Be the squad that puts your college on it
              first.
            </p>
          </FadeUp>
        )}

        <FadeUp className="mt-10 text-center">
          <Link href="/leaderboard" className="text-sm font-semibold text-maidan-lime hover:underline">
            See the full leaderboard →
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function EmptyMini({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-foreground/40">{text}</div>;
}
