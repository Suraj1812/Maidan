import { Bell } from "lucide-react";
import { getMyNotifications } from "@/lib/data";
import { NotificationRow } from "@/components/notifications/notification-row";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";

export default async function NotificationsPage() {
  const notifications = await getMyNotifications(50);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">Notifications</h1>
        {notifications.some((n) => !n.read) && <MarkAllReadButton />}
      </div>

      {notifications.length > 0 ? (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <Bell className="mx-auto mb-3 h-7 w-7 text-foreground/30" />
          <p className="text-sm text-foreground/50">Nothing yet. Squad and challenge activity will land here.</p>
        </div>
      )}
    </div>
  );
}
