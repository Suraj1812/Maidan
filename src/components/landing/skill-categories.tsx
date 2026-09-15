"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, ArrowUpRight } from "lucide-react";
import { KineticHeading, FadeUp } from "./reveal";
import { getIcon } from "@/lib/icon-map";
import type { Category } from "@/types/database";

const FALLBACK_CATEGORIES: Pick<Category, "name" | "slug" | "icon" | "description">[] = [
  { name: "Dance", slug: "dance", icon: "music", description: "Solo and crew dance battles" },
  { name: "Coding", slug: "coding", icon: "code", description: "Hackathons, DSA duels, build-offs" },
  { name: "Gaming", slug: "gaming", icon: "gamepad-2", description: "Esports and casual showdowns" },
  { name: "Debate", slug: "debate", icon: "mic", description: "Parliamentary and open debate" },
  { name: "Sports", slug: "sports", icon: "trophy", description: "Cricket, football, athletics" },
  { name: "Music", slug: "music", icon: "music-2", description: "Bands, singing, instrumentals" },
  { name: "Design", slug: "design", icon: "palette", description: "UI/UX and poster duels" },
  { name: "Quiz", slug: "quiz", icon: "brain", description: "GK and subject quizzes" },
];

const GLOWS = ["glow-saffron", "glow-lime", "glow-blue", "glow-saffron"];

export function SkillCategories({ categories }: { categories: Category[] }) {
  const items = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-maidan-lime">
          <Layers className="h-4 w-4" /> Pick Your Battlefield
        </FadeUp>
        <KineticHeading text="Every skill has an arena." className="font-display text-4xl leading-[0.95] sm:text-6xl lg:text-7xl" />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((cat, i) => {
            const Icon = getIcon(cat.icon);
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                whileHover={{ y: -6 }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25 ${GLOWS[i % GLOWS.length]} hover:bg-white/[0.06]`}
              >
                <Link href={`/challenges?category=${cat.slug}`} className="absolute inset-0" aria-label={cat.name} />
                <Icon className="h-7 w-7 text-maidan-gold" strokeWidth={1.8} />
                <h3 className="mt-4 font-display text-lg tracking-wide">{cat.name}</h3>
                <p className="mt-1 text-xs text-foreground/50">{cat.description}</p>
                <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-maidan-lime" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
