"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingSchema,
  squadSchema,
  squadInviteSchema,
  challengeSchema,
  evidenceSchema,
  voteSchema,
  disputeSchema,
  disputeResolutionSchema,
} from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in");
  return { supabase, user };
}

async function withinLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  limit: number,
  windowMinutes: number
) {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_action: action,
    p_limit: limit,
    p_window_minutes: windowMinutes,
  });
  if (error) throw error;
  return data === true;
}

// ============================================================
// Onboarding / profile
// ============================================================
export async function completeOnboarding(raw: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const input = onboardingSchema.parse(raw);

    let collegeId = input.college_id;

    if (!collegeId && input.new_college_name && input.new_college_city) {
      const { data: existing } = await supabase
        .from("colleges")
        .select("id")
        .ilike("name", input.new_college_name)
        .ilike("city", input.new_college_city)
        .maybeSingle();

      if (existing) {
        collegeId = existing.id as string;
      } else {
        const { data: created, error } = await supabase
          .from("colleges")
          .insert({ name: input.new_college_name, city: input.new_college_city })
          .select("id")
          .single();
        if (error) throw error;
        collegeId = created.id as string;
      }
    }

    let collegeVerified = false;
    if (collegeId) {
      const { data: college } = await supabase
        .from("colleges")
        .select("email_domain")
        .eq("id", collegeId)
        .maybeSingle();
      const domain = college?.email_domain as string | null | undefined;
      if (domain && user.email?.toLowerCase().endsWith("@" + domain.toLowerCase())) {
        collegeVerified = true;
      }
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: input.username,
      full_name: input.full_name,
      college_id: collegeId,
      college_verified: collegeVerified,
      city: input.city || null,
      bio: input.bio || null,
    });
    if (error) throw error;

    if (collegeVerified) {
      const { data: badge } = await supabase.from("badges").select("id").eq("slug", "verified-scholar").maybeSingle();
      if (badge) {
        await supabase.from("user_badges").insert({ user_id: user.id, badge_id: badge.id }).select().maybeSingle();
      }
    }

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

// ============================================================
// Squads
// ============================================================
export async function createSquad(raw: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const input = squadSchema.parse(raw);

    const allowed = await withinLimit(supabase, "create_squad", 3, 60 * 24);
    if (!allowed) return { ok: false, error: "You're creating squads too fast. Try again later." };

    const { data: profile } = await supabase.from("profiles").select("college_id").eq("id", user.id).maybeSingle();

    const { error } = await supabase.from("squads").insert({
      name: input.name,
      slug: input.slug,
      bio: input.bio || null,
      captain_id: user.id,
      college_id: profile?.college_id ?? null,
    });
    if (error) {
      if (error.code === "23505") return { ok: false, error: "That squad URL is already taken" };
      throw error;
    }

    revalidatePath("/squads");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function inviteToSquad(raw: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const input = squadInviteSchema.parse(raw);

    const allowed = await withinLimit(supabase, "squad_invite", 20, 60);
    if (!allowed) return { ok: false, error: "Too many invites sent. Slow down a little." };

    const { error } = await supabase.from("squad_invites").insert({
      squad_id: input.squad_id,
      invited_user_id: input.invited_user_id,
      invited_by: user.id,
    });
    if (error) {
      if (error.code === "23505") return { ok: false, error: "Already invited" };
      throw error;
    }

    const { data: squad } = await supabase.from("squads").select("name, slug").eq("id", input.squad_id).maybeSingle();
    await supabase.from("notifications").insert({
      user_id: input.invited_user_id,
      type: "squad_invite",
      title: "Squad invite",
      body: `You've been invited to join ${squad?.name ?? "a squad"}`,
      link: `/squads/${squad?.slug ?? ""}`,
    });

    revalidatePath(`/squads`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function respondToInvite(inviteId: string, accept: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    if (accept) {
      const { error } = await supabase.rpc("accept_squad_invite", { p_invite_id: inviteId });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("squad_invites")
        .update({ status: "declined", responded_at: new Date().toISOString() })
        .eq("id", inviteId);
      if (error) throw error;
    }
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function leaveSquad(squadId: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase.from("squad_members").delete().eq("squad_id", squadId).eq("user_id", user.id);
    if (error) throw error;
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

// ============================================================
// Challenges
// ============================================================
export async function createChallenge(raw: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const input = challengeSchema.parse(raw);

    const allowed = await withinLimit(supabase, "create_challenge", 10, 60 * 24);
    if (!allowed) return { ok: false, error: "Daily challenge limit reached. Try again tomorrow." };

    const { error } = await supabase.from("challenges").insert({
      title: input.title,
      description: input.description,
      rules: input.rules || null,
      category_id: input.category_id,
      created_by_squad: input.created_by_squad,
      opponent_squad: input.opponent_squad || null,
      status: input.opponent_squad ? "accepted" : "open",
      deadline: input.deadline,
    });
    if (error) throw error;

    revalidatePath("/challenges");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function acceptChallenge(challengeId: string, opponentSquadId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.rpc("accept_challenge", {
      p_challenge_id: challengeId,
      p_opponent_squad: opponentSquadId,
    });
    if (error) throw error;
    revalidatePath(`/challenges/${challengeId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function submitEvidence(raw: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const input = evidenceSchema.parse(raw);

    const allowed = await withinLimit(supabase, "submit_evidence", 20, 60);
    if (!allowed) return { ok: false, error: "Too many uploads. Slow down a little." };

    const { error } = await supabase.from("evidence").insert({
      challenge_id: input.challenge_id,
      squad_id: input.squad_id,
      uploaded_by: user.id,
      media_url: input.media_url,
      media_type: input.media_type,
      caption: input.caption || null,
    });
    if (error) throw error;

    await supabase
      .from("challenges")
      .update({ status: "evidence_submitted" })
      .eq("id", input.challenge_id)
      .in("status", ["accepted", "in_progress"]);

    revalidatePath(`/challenges/${input.challenge_id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function openVoting(challengeId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.rpc("open_voting", { p_challenge_id: challengeId });
    if (error) throw error;
    revalidatePath(`/challenges/${challengeId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function castVote(raw: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const input = voteSchema.parse(raw);

    const allowed = await withinLimit(supabase, "cast_vote", 60, 60);
    if (!allowed) return { ok: false, error: "Too many votes cast. Slow down a little." };

    const { error } = await supabase.from("votes").insert({
      challenge_id: input.challenge_id,
      voter_id: user.id,
      voted_squad: input.voted_squad,
    });
    if (error) {
      if (error.code === "23505") return { ok: false, error: "You already voted on this challenge" };
      throw error;
    }

    revalidatePath(`/challenges/${input.challenge_id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function finalizeChallengeIfReady(challengeId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("finalize_challenge", { p_challenge_id: challengeId });
}

// ============================================================
// Disputes
// ============================================================
export async function raiseDispute(raw: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const input = disputeSchema.parse(raw);

    const allowed = await withinLimit(supabase, "raise_dispute", 5, 60 * 24);
    if (!allowed) return { ok: false, error: "Too many disputes raised today." };

    const { error } = await supabase.from("disputes").insert({
      challenge_id: input.challenge_id,
      raised_by: user.id,
      reason: input.reason,
    });
    if (error) throw error;

    await supabase.from("challenges").update({ status: "disputed" }).eq("id", input.challenge_id);

    revalidatePath(`/challenges/${input.challenge_id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function resolveDispute(raw: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const input = disputeResolutionSchema.parse(raw);

    const { error } = await supabase.rpc("resolve_dispute", {
      p_dispute_id: input.dispute_id,
      p_action: input.action,
      p_notes: input.notes,
      p_overturn: input.overturn,
    });
    if (error) throw error;

    revalidatePath("/moderation");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

// ============================================================
// Notifications
// ============================================================
export async function markNotificationRead(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/notifications");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    if (error) throw error;
    revalidatePath("/notifications");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}
