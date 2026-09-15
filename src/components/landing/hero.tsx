"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Users, Trophy, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { PublicStats } from "@/lib/data";

export function Hero({ stats }: { stats: PublicStats }) {
  const statItems = [
    { icon: Users, label: "Players", value: stats.totalUsers },
    { icon: Trophy, label: "Challenges", value: stats.totalChallengesCompleted },
    { icon: MapPin, label: "Cities", value: stats.totalCities },
  ];

  return (
    <section className="relative isolate min-h-[780px] overflow-hidden bg-[#090c16] pb-12 pt-28 sm:min-h-[760px] sm:pb-16 sm:pt-32">
      <Image src="/images/maidan-hero-campus.png" alt="College students walking into a floodlit maidan at dusk" fill priority sizes="100vw" className="object-cover object-[65%_center] opacity-75" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,12,22,0.98)_0%,rgba(9,12,22,0.84)_34%,rgba(9,12,22,0.32)_68%,rgba(9,12,22,0.15)_100%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,12,22,0.96)_0%,transparent_44%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_12%_25%,rgba(243,157,57,0.16),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[640px] max-w-7xl flex-col justify-end px-5 sm:px-8 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f4bd64]"><span className="h-px w-10 bg-[#f4bd64]" /> India&apos;s college arena · Apna Maidan. Apni Takkar.</p>
          <h1 className="max-w-2xl font-display text-6xl leading-[0.88] tracking-[-0.03em] text-white sm:text-7xl md:text-8xl lg:text-[7.5rem]">SHOW UP.<span className="block text-[#f4bd64]">STAND OUT.</span></h1>
          <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-white/70 sm:text-lg">The place for college squads to compete, be seen, and earn every win. From the field to the stage to the screen.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className={buttonVariants({ size: "lg", className: "group h-13 rounded-none bg-[#f4bd64] px-7 text-base font-bold text-[#111521] hover:bg-[#ffd188]" })}>Find your squad <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/challenges" className={buttonVariants({ size: "lg", variant: "outline", className: "h-13 rounded-none border-white/30 bg-black/10 px-7 text-base text-white backdrop-blur-sm hover:bg-white/10 hover:text-white" })}><Play className="mr-2 h-4 w-4 fill-current" /> Watch the action</Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-14 grid max-w-2xl grid-cols-3 border-t border-white/20 pt-5">
          {statItems.map((item) => <div key={item.label} className="border-r border-white/15 px-4 first:pl-0 last:border-r-0"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.13em] text-white/55"><item.icon className="h-3.5 w-3.5 text-[#f4bd64]" /> {item.label}</div><p className="mt-1 font-display text-3xl tracking-wide text-white sm:text-4xl">{item.value.toLocaleString("en-IN")}</p></div>)}
        </motion.div>
      </div>
    </section>
  );
}
