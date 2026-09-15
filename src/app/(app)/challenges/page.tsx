import Link from "next/link";
import { Plus, Swords } from "lucide-react";
import { getAllChallenges, getCategories } from "@/lib/data";
import { getIcon } from "@/lib/icon-map";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  accepted: "Accepted",
  in_progress: "In progress",
  evidence_submitted: "Evidence in",
  voting: "Voting",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  const { status, category } = await searchParams;
  const [challenges, categories] = await Promise.all([getAllChallenges(status, category), getCategories()]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Challenges</h1>
          <p className="mt-1 text-sm text-foreground/60">Real call-outs between real squads.</p>
        </div>
        <Link href="/challenges/new" className={buttonVariants({ className: "bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90" })}>
          <Plus className="mr-1 h-4 w-4" /> Throw a challenge
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterLink label="All" href="/challenges" active={!status} />
        {["open", "voting", "completed"].map((s) => (
          <FilterLink key={s} label={STATUS_LABEL[s]} href={`/challenges?status=${s}`} active={status === s} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((c) => (
          <FilterLink key={c.slug} label={c.name} href={`/challenges?category=${c.slug}`} active={category === c.slug} small />
        ))}
      </div>

      {challenges.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => {
            const cat = c.category as unknown as { name: string; icon: string } | null;
            const challenger = c.challenger as unknown as { name: string } | null;
            const opponent = c.opponent as unknown as { name: string } | null;
            const Icon = getIcon(cat?.icon ?? "trophy");
            return (
              <Link
                key={c.id}
                href={`/challenges/${c.id}`}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-maidan-gold">
                    <Icon className="h-3.5 w-3.5" /> {cat?.name ?? "Challenge"}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {STATUS_LABEL[c.status] ?? c.status}
                  </Badge>
                </div>
                <h3 className="mt-3 font-display text-lg leading-tight tracking-wide">{c.title}</h3>
                <p className="mt-2 text-xs text-foreground/50">
                  {challenger?.name ?? "?"} {opponent ? `vs ${opponent.name}` : "· open call"}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <Swords className="mx-auto mb-3 h-7 w-7 text-foreground/30" />
          <p className="font-medium">No challenges match this filter</p>
          <p className="mt-1 text-sm text-foreground/50">Throw the first one and get the arena moving.</p>
        </div>
      )}
    </div>
  );
}

function FilterLink({ label, href, active, small }: { label: string; href: string; active?: boolean; small?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${small ? "text-xs" : "text-sm"} transition-colors ${
        active ? "border-maidan-saffron bg-maidan-saffron/15 text-maidan-saffron" : "border-white/15 text-foreground/60 hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
}
