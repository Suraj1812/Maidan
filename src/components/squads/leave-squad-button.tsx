"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leaveSquad } from "@/lib/actions";

export function LeaveSquadButton({ squadId }: { squadId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await leaveSquad(squadId);
          if (result.ok) {
            toast.success("Left the squad");
            router.refresh();
          } else {
            toast.error(result.error);
          }
        })
      }
    >
      <LogOut className="mr-1.5 h-3.5 w-3.5" /> Leave squad
    </Button>
  );
}
