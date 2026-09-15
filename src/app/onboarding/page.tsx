import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColleges } from "@/lib/data";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { CinematicBackground } from "@/components/landing/cinematic-background";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (profile) redirect("/dashboard");

  const colleges = await getColleges();

  return (
    <>
      <CinematicBackground />
      <main className="flex min-h-svh flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <h1 className="font-display text-2xl tracking-wide">Set up your profile</h1>
          <p className="mt-1 text-sm text-foreground/60">One last step before you can build a squad and throw a challenge.</p>
          <div className="mt-6">
            <OnboardingForm colleges={colleges} email={user.email ?? null} />
          </div>
        </div>
      </main>
    </>
  );
}
