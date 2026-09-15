import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Challenge,
  College,
  SquadLeaderboardRow,
  CollegeLeaderboardRow,
  CityLeaderboardRow,
  PlayerLeaderboardRow,
} from "@/types/database";

// Every function here degrades gracefully: if Supabase isn't configured yet
// (no env vars during local setup) or a query fails, we return empty data
// rather than throwing — the UI then shows an honest "nothing here yet" state.

export async function getColleges(): Promise<College[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("colleges").select("*").order("name");
    return (data as College[]) ?? [];
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("categories").select("*").order("name");
    return (data as Category[]) ?? [];
  } catch {
    return [];
  }
}

export async function getTopSquads(limit = 10): Promise<SquadLeaderboardRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("squad_leaderboard").select("*").limit(limit);
    return (data as SquadLeaderboardRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function getTopColleges(limit = 10): Promise<CollegeLeaderboardRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("college_leaderboard").select("*").limit(limit);
    return (data as CollegeLeaderboardRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function getTopCities(limit = 10): Promise<CityLeaderboardRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("city_leaderboard").select("*").limit(limit);
    return (data as CityLeaderboardRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function getTopPlayers(limit = 10): Promise<PlayerLeaderboardRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("player_leaderboard").select("*").limit(limit);
    return (data as PlayerLeaderboardRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function getOpenChallenges(limit = 12): Promise<(Challenge & { created_by_squad_name?: string; category_name?: string })[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("challenges")
      .select("*, category:categories(name, slug, icon), challenger:squads!challenges_created_by_squad_fkey(name, slug, avatar_url)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as unknown as (Challenge & { created_by_squad_name?: string; category_name?: string })[]) ?? [];
  } catch {
    return [];
  }
}

export interface LiveChallenge {
  id: string;
  title: string;
  voting_ends_at: string | null;
  category: { name: string; slug: string; icon: string } | null;
  challenger: { name: string; slug: string; avatar_url: string | null } | null;
  opponent: { name: string; slug: string; avatar_url: string | null } | null;
  challenger_votes: number;
  opponent_votes: number;
}

export async function getLiveVotingChallenges(limit = 8): Promise<LiveChallenge[]> {
  try {
    const supabase = await createClient();
    const { data: challenges } = await supabase
      .from("challenges")
      .select(
        "id, title, voting_ends_at, created_by_squad, opponent_squad, category:categories(name, slug, icon), challenger:squads!challenges_created_by_squad_fkey(name, slug, avatar_url), opponent:squads!challenges_opponent_squad_fkey(name, slug, avatar_url)"
      )
      .eq("status", "voting")
      .order("voting_ends_at", { ascending: true })
      .limit(limit);

    if (!challenges || challenges.length === 0) return [];

    const ids = challenges.map((c) => (c as unknown as { id: string }).id);
    const { data: votes } = await supabase.from("votes").select("challenge_id, voted_squad").in("challenge_id", ids);

    return (challenges as unknown as Array<Record<string, unknown>>).map((c) => {
      const cId = c.id as string;
      const challengerSquad = c.created_by_squad as string;
      const opponentSquad = c.opponent_squad as string | null;
      const relevantVotes = (votes ?? []).filter((v) => (v as { challenge_id: string }).challenge_id === cId);
      return {
        id: cId,
        title: c.title as string,
        voting_ends_at: c.voting_ends_at as string | null,
        category: (c.category as LiveChallenge["category"]) ?? null,
        challenger: (c.challenger as LiveChallenge["challenger"]) ?? null,
        opponent: (c.opponent as LiveChallenge["opponent"]) ?? null,
        challenger_votes: relevantVotes.filter((v) => (v as { voted_squad: string }).voted_squad === challengerSquad).length,
        opponent_votes: relevantVotes.filter((v) => (v as { voted_squad: string }).voted_squad === opponentSquad).length,
      };
    });
  } catch {
    return [];
  }
}

export interface PublicStats {
  totalUsers: number;
  totalSquads: number;
  totalColleges: number;
  totalChallengesCompleted: number;
  totalCities: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  try {
    const supabase = await createClient();
    const [users, squads, colleges, completed] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("squads").select("id", { count: "exact", head: true }),
      supabase.from("colleges").select("id", { count: "exact", head: true }),
      supabase.from("challenges").select("id", { count: "exact", head: true }).eq("status", "completed"),
    ]);
    const { data: cityRows } = await supabase.from("colleges").select("city");
    const cities = new Set((cityRows ?? []).map((r) => (r as { city: string }).city));

    return {
      totalUsers: users.count ?? 0,
      totalSquads: squads.count ?? 0,
      totalColleges: colleges.count ?? 0,
      totalChallengesCompleted: completed.count ?? 0,
      totalCities: cities.size,
    };
  } catch {
    return { totalUsers: 0, totalSquads: 0, totalColleges: 0, totalChallengesCompleted: 0, totalCities: 0 };
  }
}

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function getCurrentProfileFull() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(name, city)")
    .eq("id", user.id)
    .maybeSingle();
  return profile ? { ...profile, email: user.email } : null;
}

export async function getMySquads() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("squad_members")
    .select("role, squad:squads(id, name, slug, avatar_url, wins, losses, points)")
    .eq("user_id", user.id);
  return data ?? [];
}

export async function getMyPendingInvites() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("squad_invites")
    .select("id, created_at, squad:squads(name, slug, avatar_url), inviter:profiles!squad_invites_invited_by_fkey(username, full_name)")
    .eq("invited_user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getMyNotifications(limit = 30) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getUnreadNotificationCount() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getSquadBySlug(slug: string) {
  const supabase = await createClient();
  const { data: squad } = await supabase.from("squads").select("*, college:colleges(name, city)").eq("slug", slug).maybeSingle();
  if (!squad) return null;

  const { data: members } = await supabase
    .from("squad_members")
    .select("role, joined_at, profile:profiles(id, username, full_name, avatar_url, points)")
    .eq("squad_id", squad.id)
    .order("role");

  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, title, status, created_by_squad, opponent_squad, winner_squad, deadline, category:categories(name, icon)")
    .or(`created_by_squad.eq.${squad.id},opponent_squad.eq.${squad.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { squad, members: members ?? [], challenges: challenges ?? [], viewerId: user?.id ?? null };
}

export async function getChallengeById(id: string) {
  const supabase = await createClient();
  const { data: challenge } = await supabase
    .from("challenges")
    .select(
      "*, category:categories(name, slug, icon), challenger:squads!challenges_created_by_squad_fkey(id, name, slug, avatar_url, captain_id), opponent:squads!challenges_opponent_squad_fkey(id, name, slug, avatar_url, captain_id)"
    )
    .eq("id", id)
    .maybeSingle();
  if (!challenge) return null;

  const { data: evidence } = await supabase
    .from("evidence")
    .select("*, uploader:profiles(username, full_name)")
    .eq("challenge_id", id)
    .order("created_at", { ascending: false });

  const { data: votes } = await supabase.from("votes").select("voted_squad, voter_id").eq("challenge_id", id);

  const { data: disputes } = await supabase.from("disputes").select("*").eq("challenge_id", id).order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myMemberSquadIds: string[] = [];
  if (user) {
    const { data: memberships } = await supabase.from("squad_members").select("squad_id").eq("user_id", user.id);
    myMemberSquadIds = (memberships ?? []).map((m) => m.squad_id as string);
  }

  return {
    challenge,
    evidence: evidence ?? [],
    votes: votes ?? [],
    disputes: disputes ?? [],
    viewerId: user?.id ?? null,
    myMemberSquadIds,
  };
}

export async function getAllChallenges(status?: string, categorySlug?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("challenges")
      .select(
        "id, title, status, deadline, created_at, category:categories(name, slug, icon), challenger:squads!challenges_created_by_squad_fkey(name, slug, avatar_url), opponent:squads!challenges_opponent_squad_fkey(name, slug, avatar_url)"
      )
      .order("created_at", { ascending: false })
      .limit(30);

    if (status) query = query.eq("status", status);
    const { data } = await query;

    let rows = data ?? [];
    if (categorySlug) {
      rows = rows.filter((r) => (r as unknown as { category: { slug: string } | null }).category?.slug === categorySlug);
    }
    return rows;
  } catch {
    return [];
  }
}

export async function getAllSquads(search?: string) {
  try {
    const supabase = await createClient();
    let query = supabase.from("squads").select("*, college:colleges(name, city)").order("points", { ascending: false }).limit(60);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data } = await query;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getMyCaptainedSquads() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("squads").select("id, name, slug").eq("captain_id", user.id);
  return data ?? [];
}

export async function searchSquads(query: string) {
  if (query.trim().length < 2) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("squads").select("id, name, slug").ilike("name", `%${query}%`).limit(8);
  return data ?? [];
}

export async function searchProfiles(query: string) {
  if (query.trim().length < 2) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, username, full_name, avatar_url").ilike("username", `%${query}%`).limit(8);
  return data ?? [];
}

export async function isModerator() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return data?.role === "moderator" || data?.role === "admin";
  } catch {
    return false;
  }
}

export async function getOpenDisputes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("disputes")
    .select("*, challenge:challenges(id, title, created_by_squad, opponent_squad, winner_squad)")
    .in("status", ["open", "reviewing"])
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(name, city)")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;

  const { data: badges } = await supabase.from("user_badges").select("awarded_at, badge:badges(*)").eq("user_id", profile.id);
  const { data: squads } = await supabase
    .from("squad_members")
    .select("role, squad:squads(name, slug, avatar_url, wins, losses)")
    .eq("user_id", profile.id);

  return { profile, badges: badges ?? [], squads: squads ?? [] };
}
