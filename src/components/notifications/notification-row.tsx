"use client";

import Link from "next/link";
import { useTransition } from "react";
import { markNotificationRead } from "@/lib/actions";
import type { Notification } from "@/types/database";

export function NotificationRow({ notification }: { notification: Notification }) {
  const [, startTransition] = useTransition();

  return (
    <Link
      href={notification.link ?? "#"}
      onClick={() => {
        if (!notification.read)
          startTransition(async () => {
            await markNotificationRead(notification.id);
          });
      }}
      className={`block rounded-xl border px-4 py-3 text-sm transition-colors hover:bg-white/[0.06] ${
        notification.read ? "border-white/8 bg-white/[0.02] text-foreground/60" : "border-maidan-lime/30 bg-maidan-lime/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{notification.title}</p>
          {notification.body && <p className="mt-0.5 text-foreground/50">{notification.body}</p>}
        </div>
        <span className="shrink-0 text-[10px] text-foreground/30">
          {new Date(notification.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>
    </Link>
  );
}
