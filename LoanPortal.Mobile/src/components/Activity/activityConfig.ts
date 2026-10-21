import { AppNotification } from "@/api/models/Notification";

export type ActivityFilter = "all" | "borrowers" | "quotes" | "status" | "team";
export type ActivityKind = Exclude<ActivityFilter, "all"> | "other";

export const FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "borrowers", label: "Borrowers" },
  { key: "quotes", label: "Quotes" },
  { key: "status", label: "Status Changes" },
  { key: "team", label: "Team" },
];

// Backend notification `type` -> activity category. Only type 1 (new quote) is confirmed so far;
// add the remaining numeric types here as the backend defines them.
const TYPE_TO_KIND: Record<number, ActivityKind> = {
  1: "quotes",
};

export const kindOf = (n: AppNotification): ActivityKind => TYPE_TO_KIND[n.type] ?? "other";

export const matchesFilter = (n: AppNotification, filter: ActivityFilter) =>
  filter === "all" || kindOf(n) === filter;

export type ActivityGroup = { label: string; items: AppNotification[] };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Buckets (already newest-first) notifications into Today / Yesterday / This Week / Earlier. */
export function groupByDay(items: AppNotification[], now: Date = new Date()): ActivityGroup[] {
  const today = startOfDay(now);
  const DAY = 86_400_000;
  const buckets: ActivityGroup[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This Week", items: [] },
    { label: "Earlier", items: [] },
  ];
  for (const n of items) {
    const t = startOfDay(new Date(n.createdAt));
    const idx = t >= today ? 0 : t >= today - DAY ? 1 : t >= today - 6 * DAY ? 2 : 3;
    buckets[idx].items.push(n);
  }
  return buckets.filter((b) => b.items.length > 0);
}

/** "2h ago" for today; "Yesterday, 4:32 PM" for yesterday; "Sep 16, 2026" otherwise. */
export function formatActivityTime(iso: string, group: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (group === "Today") {
    const mins = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 60_000));
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }
  if (group === "Yesterday") {
    return `Yesterday, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
