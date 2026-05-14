export function fmtDate(d: number | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "number" ? new Date(d) : new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtAcres(a: number | null | undefined): string {
  if (a == null) return "—";
  return `${a.toLocaleString(undefined, { maximumFractionDigits: 1 })} ac`;
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  sprayed: "Sprayed",
  skipped: "Skipped",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-[hsl(43_74%_88%)] text-[hsl(43_60%_25%)] border-[hsl(43_50%_70%)] dark:bg-[hsl(43_30%_22%)] dark:text-[hsl(43_70%_70%)] dark:border-[hsl(43_30%_35%)]",
  sprayed: "bg-[hsl(103_40%_88%)] text-[hsl(103_56%_25%)] border-[hsl(103_30%_70%)] dark:bg-[hsl(103_25%_20%)] dark:text-[hsl(97_45%_70%)] dark:border-[hsl(103_25%_35%)]",
  skipped: "bg-[hsl(0_30%_92%)] text-[hsl(0_50%_35%)] border-[hsl(0_30%_75%)] dark:bg-[hsl(0_25%_20%)] dark:text-[hsl(0_50%_70%)] dark:border-[hsl(0_25%_35%)]",
};
