"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Postgres changes on the notifications table for the signed-in user
 * via Supabase Realtime, and surfaces a toast the instant a new row is inserted —
 * no polling.
 */
export function RealtimeNotificationListener({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as { title: string; body: string | null; link: string | null };
          toast(row.title, {
            description: row.body ?? undefined,
            action: row.link ? { label: "View", onClick: () => router.push(row.link!) } : undefined,
          });
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
