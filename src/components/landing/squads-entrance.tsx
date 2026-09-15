"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Users2 } from "lucide-react";
import { KineticHeading, FadeUp } from "./reveal";
import type { SquadLeaderboardRow } from "@/types/database";

function Emblem({ squad, i }: { squad: SquadLeaderboardRow; i: number }) {
  const initials = squad.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      className="animate-float-slow mx-4 flex w-56 shrink-0 flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
      style={{ animationDelay: `${(i % 5) * 0.4}s` }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-maidan-gold/60 bg-gradient-to-br from-maidan-saffron/30 to-maidan-blue/30 font-display text-xl glow-saffron">
        {initials}
      </div>
      <div className="text-center">
        <p className="font-display text-sm tracking-wide">{squad.name}</p>
        <p className="mt-0.5 text-xs text-foreground/50">{squad.college_name ?? squad.city ?? "Unclaimed turf"}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-foreground/60">
        <span className="flex items-center gap-1 text-maidan-lime">
          <Shield className="h-3 w-3" /> {squad.wins}W
        </span>
        <span>{squad.points} pts</span>
      </div>
    </motion.div>
  );
}

export function SquadsEntrance({ squads }: { squads: SquadLeaderboardRow[] }) {
  const hasSquads = squads.length > 0;
  const row = hasSquads ? [...squads, ...squads] : [];

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-maidan-blue">
          <Users2 className="h-4 w-4" /> The Roll Call
        </FadeUp>
        <KineticHeading
          text="Squads enter the arena."
          className="font-display text-4xl leading-[0.95] sm:text-6xl lg:text-7xl"
        />
        <FadeUp delay={0.15} className="mt-6 max-w-xl text-foreground/60">
          Every crew that steps onto Maidan starts at zero and earns its name through real challenges — no
          purchased clout, no inflated records.
        </FadeUp>
      </div>

      <div className="mt-16 space-y-6">
        {hasSquads ? (
          <div className="mask-fade-edges overflow-hidden">
            <div className="animate-marquee flex w-max">
              {row.map((s, i) => (
                <Emblem key={`${s.squad_id}-${i}`} squad={s} i={i} />
              ))}
            </div>
          </div>
        ) : (
          <FadeUp className="mx-auto max-w-md rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-14 text-center">
            <Shield className="mx-auto mb-4 h-8 w-8 text-maidan-gold/70" />
            <p className="font-display text-lg tracking-wide">No squads have walked in yet</p>
            <p className="mt-2 text-sm text-foreground/50">
              Maidan is brand new — the first roster here could be yours. Found a squad and your college gets on
              the map.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-block rounded-full bg-maidan-saffron px-6 py-2 text-sm font-semibold text-maidan-navy-deep"
            >
              Found the first squad
            </Link>
          </FadeUp>
        )}
      </div>
    </section>
  );
}
