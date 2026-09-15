import Link from "next/link";
import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-maidan-navy-deep/80 px-4 py-10 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 font-display text-lg">
          <Trophy className="h-4 w-4 text-maidan-saffron" />
          <span className="text-gradient-hero">MAIDAN</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-foreground/60">
          <Link href="/challenges" className="hover:text-maidan-lime">
            Challenges
          </Link>
          <Link href="/squads" className="hover:text-maidan-lime">
            Squads
          </Link>
          <Link href="/leaderboard" className="hover:text-maidan-lime">
            Leaderboard
          </Link>
          <Link href="/moderation" className="hover:text-maidan-lime">
            Moderation
          </Link>
        </nav>
        <p className="text-xs text-foreground/40">© {new Date().getFullYear()} Maidan. Apna Maidan. Apni Takkar.</p>
      </div>
    </footer>
  );
}
