// Reusable enterprise UI primitives for the Ops admin.
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CaseStatus, CaseVersionBadge, STATUS_LABEL } from "@/data/adminCases";

export const OpsSectionHeader = ({
  title,
  description,
  right,
  className,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex items-end justify-between border-b border-border/60 pb-3", className)}>
    <div>
      <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
    {right && <div className="flex items-center gap-2">{right}</div>}
  </div>
);

export const StatusBadge = ({ status }: { status: CaseStatus }) => {
  const map: Record<CaseStatus, string> = {
    pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    rejected: "border-red-500/40 bg-red-500/10 text-red-400",
  };
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", map[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
};

export const VersionBadge = ({ v }: { v: CaseVersionBadge }) => {
  const map: Record<CaseVersionBadge, string> = {
    Published: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    Draft: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
    "Pending Review": "border-amber-500/40 bg-amber-500/10 text-amber-400",
    Rejected: "border-red-500/40 bg-red-500/10 text-red-400",
    Archived: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  };
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", map[v])}>
      {v}
    </span>
  );
};

// Waiting time is informational only — no SLA / breach concept.
export const WaitingCell = ({ label }: { label: string }) => (
  <span className="font-mono text-xs tabular-nums text-muted-foreground">{label}</span>
);

export const OpsCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("rounded-md border border-border/60 bg-card", className)}>{children}</div>
);

export const KpiTile = ({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "danger" | "warning" | "success";
}) => {
  const toneMap = {
    default: "text-foreground",
    danger: "text-red-400",
    warning: "text-amber-400",
    success: "text-emerald-400",
  } as const;
  return (
    <div className="rounded-md border border-border/60 bg-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", toneMap[tone])}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
};

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-sm border border-border/60 bg-secondary/60 px-1 font-mono text-[10px] text-muted-foreground">
    {children}
  </kbd>
);

export const OpsTable = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("overflow-x-auto rounded-md border border-border/60 bg-card", className)}>
    <table className="w-full border-collapse text-sm">{children}</table>
  </div>
);

export const OpsTh = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th
    className={cn(
      "sticky top-0 z-10 border-b border-border/60 bg-card px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
      className,
    )}
  >
    {children}
  </th>
);

export const OpsTd = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn("border-b border-border/40 px-3 py-2.5 align-middle", className)}>{children}</td>
);

export const HealthBadge = ({ score }: { score: number }) => {
  const tone = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  return <span className={cn("font-mono text-xs tabular-nums", tone)}>{score}</span>;
};
