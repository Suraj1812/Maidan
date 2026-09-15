"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Radio, Swords, Trophy } from "lucide-react";
import { KineticHeading, FadeUp } from "./reveal";
import { ICONS } from "@/lib/icon-map";
import type { LiveChallenge } from "@/lib/data";

function VoteBar({ label, votes, total, color }: { label: string; votes: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground/80">{label}</span>
        <span className="tabular-nums text-foreground/50">
          {votes} vote{votes === 1 ? "" : "s"} · {pct}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function ChallengeCard({ c }: { c: LiveChallenge }) {
  const CategoryIcon = ICONS[c.category?.icon ?? "trophy"] ?? Trophy;
  const total = c.challenger_votes + c.opponent_votes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
    >
      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-400">
        <Radio className="h-3 w-3 animate-pulse" /> Live Vote
      </div>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-maidan-gold">
        <CategoryIcon className="h-3.5 w-3.5" /> {c.category?.name ?? "Challenge"}
      </div>
      <h3 className="mt-2 pr-20 font-display text-lg leading-tight tracking-wide">{c.title}</h3>

      <div className="mt-5 flex items-center gap-3 text-sm text-foreground/60">
        <span className="font-semibold text-foreground">{c.challenger?.name ?? "Challenger"}</span>
        <Swords className="h-3.5 w-3.5 text-maidan-saffron" />
        <span className="font-semibold text-foreground">{c.opponent?.name ?? "Opponent"}</span>
      </div>

      <div className="mt-4 space-y-3">
        <VoteBar label={c.challenger?.name ?? "Challenger"} votes={c.challenger_votes} total={total} color="var(--maidan-saffron)" />
        <VoteBar label={c.opponent?.name ?? "Opponent"} votes={c.opponent_votes} total={total} color="var(--maidan-blue)" />
      </div>

      <Link
        href={`/challenges/${c.id}`}
        className="mt-5 inline-block text-xs font-semibold uppercase tracking-wide text-maidan-lime hover:underline"
      >
        Watch &amp; cast your vote →
      </Link>
    </motion.div>
  );
}

export function LiveChallengeMoment({ challenges }: { challenges: LiveChallenge[] }) {
  const hasLive = challenges.length > 0;

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
          <Radio className="h-4 w-4" /> Happening Right Now
        </FadeUp>
        <KineticHeading text="The crowd decides the winner." className="font-display text-4xl leading-[0.95] sm:text-6xl lg:text-7xl" />
        <FadeUp delay={0.15} className="mt-6 max-w-xl text-foreground/60">
          Every match reaches a public vote. What you see below is the live, unedited tally straight from the
          database — nothing staged.
        </FadeUp>

        <div className="mt-14">
          {hasLive ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {challenges.map((c) => (
                <ChallengeCard key={c.id} c={c} />
              ))}
            </div>
          ) : (
            <FadeUp className="mx-auto max-w-md rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-14 text-center">
              <Swords className="mx-auto mb-4 h-8 w-8 text-maidan-gold/70" />
              <p className="font-display text-lg tracking-wide">No challenges are up for a vote right now</p>
              <p className="mt-2 text-sm text-foreground/50">
                Once a squad submits evidence, the challenge opens to public voting here in real time.
              </p>
              <Link
                href="/challenges"
                className="mt-5 inline-block rounded-full bg-maidan-saffron px-6 py-2 text-sm font-semibold text-maidan-navy-deep"
              >
                Browse open challenges
              </Link>
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  );
}
