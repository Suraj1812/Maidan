import { CreateSquadForm } from "@/components/squads/create-squad-form";

export default function NewSquadPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl tracking-wide">Found a squad</h1>
      <p className="mt-1 text-sm text-foreground/60">You&apos;ll be the captain — you can invite teammates right after.</p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <CreateSquadForm />
      </div>
    </div>
  );
}
