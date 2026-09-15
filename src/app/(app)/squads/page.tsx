import Link from "next/link";
import { Plus, Shield } from "lucide-react";
import { getAllSquads } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";

export default async function SquadsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const squads = await getAllSquads(q);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Squads</h1>
          <p className="mt-1 text-sm text-foreground/60">Every crew competing on Maidan, ranked by real points.</p>
        </div>
        <Link href="/squads/new" className={buttonVariants({ className: "bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90" })}>
          <Plus className="mr-1 h-4 w-4" /> Found a squad
        </Link>
      </div>

      <form className="mt-6" action="/squads">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search squads…"
          className="w-full max-w-sm rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-foreground/40 focus:border-maidan-saffron"
        />
      </form>

      {squads.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {squads.map((s) => (
            <Link
              key={s.id}
              href={`/squads/${s.slug}`}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
            >
              <p className="font-display tracking-wide">{s.name}</p>
              <p className="mt-1 text-xs text-foreground/50">
                {(s.college as unknown as { name: string; city: string } | null)?.name ?? "Independent squad"}
              </p>
              <p className="mt-3 text-xs text-foreground/60">
                {s.wins}W · {s.losses}L · {s.points} pts
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <Shield className="mx-auto mb-3 h-7 w-7 text-foreground/30" />
          <p className="font-medium">{q ? "No squads match your search" : "No squads have formed yet"}</p>
          <p className="mt-1 text-sm text-foreground/50">Be the first to found one and put your college on the map.</p>
        </div>
      )}
    </div>
  );
}
