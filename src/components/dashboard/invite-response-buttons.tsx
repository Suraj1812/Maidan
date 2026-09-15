"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { respondToInvite } from "@/lib/actions";

export function InviteResponseButtons({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      const result = await respondToInvite(inviteId, accept);
      if (!result.ok) toast.error(result.error);
      else toast.success(accept ? "Joined the squad" : "Invite declined");
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => respond(true)} className="bg-maidan-lime text-maidan-navy-deep hover:bg-maidan-lime/90">
        Accept
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => respond(false)}>
        Decline
      </Button>
    </div>
  );
}
