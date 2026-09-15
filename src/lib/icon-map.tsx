import {
  Trophy,
  Music,
  Code,
  Gamepad2,
  Mic,
  Music2,
  Palette,
  Brain,
  Flame,
  Zap,
  Crown,
  Flag,
  ShieldCheck,
  Medal,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  music: Music,
  code: Code,
  "gamepad-2": Gamepad2,
  mic: Mic,
  "music-2": Music2,
  palette: Palette,
  brain: Brain,
  flame: Flame,
  zap: Zap,
  crown: Crown,
  flag: Flag,
  "shield-check": ShieldCheck,
  medal: Medal,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Trophy;
}

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? Trophy;
  return <Icon className={className} />;
}
