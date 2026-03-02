import {
  Scale, ScrollText, Landmark, ClipboardList, Newspaper, BookOpen,
  BarChart3, FileText, Building2, Globe, FileWarning, PenLine,
  Bot, MessageCircle, Film, FolderOpen, Mic, Earth,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Scale, ScrollText, Landmark, ClipboardList, Newspaper, BookOpen,
  BarChart3, FileText, Building2, Globe, FileWarning, PenLine,
  Bot, MessageCircle, Film, FolderOpen, Mic, Earth,
};

export function TypeIcon({ iconName, size = 18, className = '' }: {
  iconName: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICON_MAP[iconName];
  return Icon ? <Icon size={size} className={className} /> : null;
}
