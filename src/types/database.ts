// Hand-maintained types mirroring supabase/migrations/*.sql.
// Regenerate with `supabase gen types typescript` once the project is linked for full accuracy.

export type UserRole = "user" | "moderator" | "admin";
export type SquadMemberRole = "captain" | "member";
export type InviteStatus = "pending" | "accepted" | "declined" | "revoked";
export type ChallengeStatus =
  | "open"
  | "accepted"
  | "in_progress"
  | "evidence_submitted"
  | "voting"
  | "completed"
  | "disputed"
  | "cancelled";
export type EvidenceMediaType = "video" | "photo";
export type DisputeStatus = "open" | "reviewing" | "resolved_upheld" | "resolved_overturned" | "dismissed";
export type NotificationType =
  | "squad_invite"
  | "invite_accepted"
  | "challenge_received"
  | "challenge_accepted"
  | "evidence_submitted"
  | "voting_started"
  | "challenge_completed"
  | "dispute_raised"
  | "dispute_resolved"
  | "badge_awarded";

export interface College {
  id: string;
  name: string;
  city: string;
  state: string | null;
  email_domain: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  college_id: string | null;
  college_verified: boolean;
  city: string | null;
  role: UserRole;
  points: number;
  created_at: string;
}

export interface Squad {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  college_id: string | null;
  captain_id: string;
  wins: number;
  losses: number;
  points: number;
  created_at: string;
}

export interface SquadMember {
  squad_id: string;
  user_id: string;
  role: SquadMemberRole;
  joined_at: string;
}

export interface SquadInvite {
  id: string;
  squad_id: string;
  invited_user_id: string;
  invited_by: string;
  status: InviteStatus;
  created_at: string;
  responded_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string | null;
  category_id: string;
  created_by_squad: string;
  opponent_squad: string | null;
  status: ChallengeStatus;
  deadline: string;
  voting_ends_at: string | null;
  winner_squad: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  challenge_id: string;
  squad_id: string;
  uploaded_by: string;
  media_url: string;
  media_type: EvidenceMediaType;
  caption: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  challenge_id: string;
  voter_id: string;
  voted_squad: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  challenge_id: string;
  raised_by: string;
  reason: string;
  status: DisputeStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface ModerationAction {
  id: string;
  dispute_id: string;
  moderator_id: string;
  action: string;
  notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  awarded_at: string;
}

export interface SquadLeaderboardRow {
  squad_id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  college_id: string | null;
  college_name: string | null;
  city: string | null;
  wins: number;
  losses: number;
  points: number;
  rank: number;
}

export interface CollegeLeaderboardRow {
  college_id: string;
  name: string;
  city: string;
  total_wins: number;
  total_losses: number;
  total_points: number;
  active_squads: number;
  rank: number;
}

export interface CityLeaderboardRow {
  city: string;
  total_wins: number;
  total_points: number;
  college_count: number;
  active_squads: number;
  rank: number;
}

export interface PlayerLeaderboardRow {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  college_id: string | null;
  college_name: string | null;
  points: number;
  rank: number;
}
