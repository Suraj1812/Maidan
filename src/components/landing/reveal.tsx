"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const wordVariants: Variants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
};

/** Kinetic headline: words slide up + reveal, staggered. */
export function KineticHeading({
  text,
  as: Tag = "h2",
  className = "",
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="inline-block">
        {words.map((word, i) => (
          <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.6 }}
              variants={wordVariants}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

export function FadeUp({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
