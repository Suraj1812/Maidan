"use client";

import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const COLORS = ["var(--maidan-saffron)", "var(--maidan-lime)", "var(--maidan-blue)", "var(--maidan-gold)"];

export function ParticleField({ count = 28, className = "" }: { count?: number; className?: string }) {
  const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 37 + 11) % 100,
    size: 2 + ((i * 7) % 4),
    duration: 8 + ((i * 13) % 10),
    delay: (i * 5) % 8,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "-10%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
