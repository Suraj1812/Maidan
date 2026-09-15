import { getMyCaptainedSquads, getCategories } from "@/lib/data";
import { CreateChallengeForm } from "@/components/challenges/create-challenge-form";

export default async function NewChallengePage({ searchParams }: { searchParams: Promise<{ squad?: string }> }) {
  const { squad } = await searchParams;
  const [mySquads, categories] = await Promise.all([getMyCaptainedSquads(), getCategories()]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl tracking-wide">Throw a challenge</h1>
      <p className="mt-1 text-sm text-foreground/60">Call out a specific squad, or leave it open for anyone to accept.</p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <CreateChallengeForm mySquads={mySquads} categories={categories} presetSquadId={squad} />
      </div>
    </div>
  );
}
