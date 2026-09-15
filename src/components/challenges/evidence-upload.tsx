"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { submitEvidence } from "@/lib/actions";
import { ACCEPTED_EVIDENCE_TYPES, MAX_EVIDENCE_BYTES } from "@/lib/validation";

export function EvidenceUpload({ challengeId, squadId, userId }: { challengeId: string; squadId: string; userId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a photo or video first");
      return;
    }
    if (!ACCEPTED_EVIDENCE_TYPES.includes(file.type)) {
      toast.error("Unsupported file type");
      return;
    }
    if (file.size > MAX_EVIDENCE_BYTES) {
      toast.error("File is larger than 100MB");
      return;
    }

    setUploading(true);
    setProgressLabel("Uploading…");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${userId}/${challengeId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("evidence").upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("evidence").getPublicUrl(path);

      setProgressLabel("Saving…");
      startTransition(async () => {
        const result = await submitEvidence({
          challenge_id: challengeId,
          squad_id: squadId,
          media_url: publicUrl,
          media_type: file.type.startsWith("video") ? "video" : "photo",
          caption: caption || undefined,
        });
        if (result.ok) {
          toast.success("Evidence submitted");
          if (inputRef.current) inputRef.current.value = "";
          setCaption("");
          router.refresh();
        } else {
          toast.error(result.error);
        }
        setUploading(false);
        setProgressLabel(null);
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      setProgressLabel(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Submit evidence</p>
      <Input ref={inputRef} type="file" accept="image/*,video/*" disabled={uploading} />
      <Input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        maxLength={280}
        disabled={uploading}
      />
      <Button type="submit" size="sm" disabled={uploading} className="bg-maidan-saffron text-maidan-navy-deep hover:bg-maidan-saffron/90">
        <Upload className="mr-1.5 h-3.5 w-3.5" /> {progressLabel ?? "Upload"}
      </Button>
    </form>
  );
}
