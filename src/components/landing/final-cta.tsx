"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { KineticHeading, FadeUp } from "./reveal";
import { ParticleField } from "./particle-field";

export function FinalCTA() {
  return (
    <section className="relative flex min-h-[90svh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      <ParticleField count={30} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,oklch(0.72_0.19_45/0.18),transparent)]"
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-maidan-gold/50 bg-maidan-gold/10"
      >
        <Trophy className="h-7 w-7 text-maidan-gold" />
      </motion.div>

      <KineticHeading
        text="Your Maidan is waiting."
        className="relative z-10 font-display text-5xl leading-[0.95] sm:text-7xl lg:text-8xl"
      />

      <FadeUp delay={0.2} className="relative z-10 mt-6 max-w-lg text-foreground/70">
        Pick your squad, pick your fight, and let the crowd crown the winner. Apna Maidan. Apni Takkar.
      </FadeUp>

      <FadeUp delay={0.35} className="relative z-10 mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/signup"
          className={buttonVariants({
            size: "lg",
            className: "h-13 bg-maidan-saffron px-10 text-base font-semibold text-maidan-navy-deep glow-saffron hover:bg-maidan-saffron/90",
          })}
        >
          Join the Maidan
        </Link>
        <Link
          href="/squads"
          className={buttonVariants({
            size: "lg",
            variant: "outline",
            className: "h-13 border-white/20 bg-white/5 px-10 text-base backdrop-blur hover:bg-white/10",
          })}
        >
          Explore Squads
        </Link>
      </FadeUp>
    </section>
  );
}
