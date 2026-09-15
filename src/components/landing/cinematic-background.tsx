"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Full-bleed layered background: gradient mesh + particles + scanline + grid.
 * Reacts to page scroll for parallax depth. Pure CSS/SVG — no heavy assets.
 */
export function CinematicBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -420]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 25]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-maidan-navy-deep">
      {/* base gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.3_0.08_45/0.35),transparent),radial-gradient(ellipse_60%_50%_at_90%_20%,oklch(0.35_0.1_245/0.3),transparent),radial-gradient(ellipse_60%_60%_at_10%_80%,oklch(0.3_0.1_128/0.22),transparent)]" />

      {/* drifting orbs */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -left-40 top-[10%] h-[32rem] w-[32rem] rounded-full bg-maidan-saffron/20 blur-[110px]"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute -right-32 top-[35%] h-[28rem] w-[28rem] rounded-full bg-maidan-blue/25 blur-[100px]"
      />
      <motion.div
        style={{ y: y3, rotate }}
        className="absolute left-[30%] top-[70%] h-[24rem] w-[24rem] rounded-full bg-maidan-lime/15 blur-[110px]"
      />

      {/* grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.35] mask-fade-bottom" />

      {/* scanline sweep */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden opacity-20">
        <div className="animate-scan h-1/3 w-full bg-gradient-to-b from-transparent via-maidan-lime/40 to-transparent" />
      </div>

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,oklch(0.08_0.02_264/0.9)_100%)]" />

      {/* film grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
