import { CinematicBackground } from "@/components/landing/cinematic-background";
import { Hero } from "@/components/landing/hero";
import { SquadsEntrance } from "@/components/landing/squads-entrance";
import { SkillCategories } from "@/components/landing/skill-categories";
import { LiveChallengeMoment } from "@/components/landing/live-challenge";
import { LeaderboardGlory } from "@/components/landing/leaderboard-glory";
import { FinalCTA } from "@/components/landing/final-cta";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import {
  getCategories,
  getTopSquads,
  getTopColleges,
  getLiveVotingChallenges,
  getPublicStats,
  getCurrentProfile,
} from "@/lib/data";

export default async function Home() {
  const [categories, squads, colleges, liveChallenges, stats, profile] = await Promise.all([
    getCategories(),
    getTopSquads(12),
    getTopColleges(6),
    getLiveVotingChallenges(6),
    getPublicStats(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <CinematicBackground />
      <Navbar isAuthed={!!profile} />
      <main className="relative">
        <Hero stats={stats} />
        <SquadsEntrance squads={squads} />
        <SkillCategories categories={categories} />
        <LiveChallengeMoment challenges={liveChallenges} />
        <LeaderboardGlory squads={squads} colleges={colleges} />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
