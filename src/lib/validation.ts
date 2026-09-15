import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "At least 3 characters")
  .max(20, "At most 20 characters")
  .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only");

export const onboardingSchema = z.object({
  username: usernameSchema,
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  college_id: z.string().uuid().nullable(),
  new_college_name: z.string().trim().max(120).optional(),
  new_college_city: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(280).optional(),
});

export const squadSchema = z.object({
  name: z.string().trim().min(3, "At least 3 characters").max(40),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  bio: z.string().trim().max(280).optional(),
});

export const squadInviteSchema = z.object({
  squad_id: z.string().uuid(),
  invited_user_id: z.string().uuid(),
});

export const challengeSchema = z
  .object({
    title: z.string().trim().min(5, "At least 5 characters").max(100),
    description: z.string().trim().min(20, "Describe the challenge in at least 20 characters").max(2000),
    rules: z.string().trim().max(2000).optional(),
    category_id: z.string().uuid(),
    created_by_squad: z.string().uuid(),
    opponent_squad: z.string().uuid().nullable().optional(),
    deadline: z.string().refine((v) => new Date(v).getTime() > Date.now() + 60 * 60 * 1000, {
      message: "Deadline must be at least 1 hour from now",
    }),
  })
  .refine((data) => data.opponent_squad !== data.created_by_squad, {
    message: "A squad cannot challenge itself",
    path: ["opponent_squad"],
  });

export const evidenceSchema = z.object({
  challenge_id: z.string().uuid(),
  squad_id: z.string().uuid(),
  media_url: z.string().url(),
  media_type: z.enum(["video", "photo"]),
  caption: z.string().trim().max(280).optional(),
});

export const voteSchema = z.object({
  challenge_id: z.string().uuid(),
  voted_squad: z.string().uuid(),
});

export const disputeSchema = z.object({
  challenge_id: z.string().uuid(),
  reason: z.string().trim().min(20, "Explain the dispute in at least 20 characters").max(1000),
});

export const disputeResolutionSchema = z.object({
  dispute_id: z.string().uuid(),
  action: z.string().trim().min(3).max(100),
  notes: z.string().trim().max(1000),
  overturn: z.boolean(),
});

export const MAX_EVIDENCE_BYTES = 100 * 1024 * 1024; // 100MB, matches storage bucket limit
export const ACCEPTED_EVIDENCE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
