import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CinematicBackground } from "@/components/landing/cinematic-background";
import { RealtimeNotificationListener } from "@/components/notifications/realtime-listener";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/onboarding");

  return (
    <>
      <CinematicBackground />
      <RealtimeNotificationListener userId={user.id} />
      <Navbar isAuthed />
      <main className="mx-auto min-h-svh w-full max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </>
  );
}
