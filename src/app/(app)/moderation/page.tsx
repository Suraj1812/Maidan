import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { isModerator, getOpenDisputes } from "@/lib/data";
import { DisputeResolutionCard } from "@/components/moderation/dispute-card";

export default async function ModerationPage() {
  const mod = await isModerator();
  if (!mod) redirect("/dashboard");

  const disputes = await getOpenDisputes();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl tracking-wide">Moderation queue</h1>
      <p className="mt-1 text-sm text-foreground/60">Open disputes awaiting a ruling.</p>

      {disputes.length > 0 ? (
        <div className="mt-8 space-y-4">
          {disputes.map((d) => (
            <DisputeResolutionCard key={d.id} dispute={d} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <ShieldAlert className="mx-auto mb-3 h-7 w-7 text-foreground/30" />
          <p className="text-sm text-foreground/50">No open disputes. The Maidan is clean.</p>
        </div>
      )}
    </div>
  );
}
