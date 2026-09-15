import Link from "next/link";
import { Trophy } from "lucide-react";
import { CinematicBackground } from "@/components/landing/cinematic-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CinematicBackground />
      <main className="flex min-h-svh flex-col items-center justify-center px-4 py-16">
        <Link href="/" className="mb-8 flex items-center gap-2 font-display text-2xl tracking-wide">
          <Trophy className="h-6 w-6 text-maidan-saffron" strokeWidth={2.4} />
          <span className="text-gradient-hero">MAIDAN</span>
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          {children}
        </div>
      </main>
    </>
  );
}
