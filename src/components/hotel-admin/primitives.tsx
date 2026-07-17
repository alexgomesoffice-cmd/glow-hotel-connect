/**
 * Hotel Admin shared primitives — KPI card, SectionCard, StatusPill, Timeline,
 * DraftBanner, EmptyState, EditDrawerShell. Reuses existing theme tokens.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LucideIcon, Check, X, Clock, AlertTriangle } from "lucide-react";

// ---------- KPI ----------
export const KPI = ({
  title, value, delta, trend, icon: Icon, color = "from-green-500 to-emerald-500", hint,
}: {
  title: string; value: string | number; delta?: string; trend?: "up" | "down" | "flat";
  icon: LucideIcon; color?: string; hint?: string;
}) => (
  <Card className="relative overflow-hidden hover-lift">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {(delta || hint) && (
            <p className={cn(
              "text-xs mt-1",
              trend === "up" && "text-green-500",
              trend === "down" && "text-destructive",
              !trend && "text-muted-foreground",
            )}>
              {delta || hint}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shrink-0", color)}>
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
      <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r", color)} />
    </CardContent>
  </Card>
);

// ---------- SectionCard ----------
export const SectionCard = ({
  title, description, icon: Icon, action, children, className,
}: {
  title: string; description?: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode; className?: string;
}) => (
  <Card className={cn("overflow-hidden", className)}>
    <CardHeader className="border-b border-border/50 flex flex-row items-start justify-between gap-4 space-y-0">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shrink-0">
            <Icon className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </CardHeader>
    <CardContent className="p-5">{children}</CardContent>
  </Card>
);

// ---------- Status Pill ----------
const pillColors: Record<string, string> = {
  green: "bg-green-500/10 text-green-500 border-green-500/20",
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  red: "bg-destructive/10 text-destructive border-destructive/20",
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  gray: "bg-muted text-muted-foreground border-border",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export const StatusPill = ({
  label, tone = "gray", icon: Icon, className,
}: {
  label: string; tone?: keyof typeof pillColors; icon?: LucideIcon; className?: string;
}) => (
  <span className={cn(
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
    pillColors[tone],
    className,
  )}>
    {Icon && <Icon className="h-3 w-3" />}
    {label}
  </span>
);

// ---------- Timeline ----------
export const Timeline = ({
  items,
}: { items: { at: string; label: string; by?: string; tone?: keyof typeof pillColors }[] }) => (
  <ol className="relative border-l border-border/60 ml-2 space-y-4">
    {items.map((item, i) => (
      <li key={i} className="pl-6 relative">
        <span className={cn(
          "absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-background",
          item.tone === "red" ? "bg-destructive" :
          item.tone === "amber" ? "bg-amber-500" :
          item.tone === "green" ? "bg-green-500" : "bg-primary",
        )} />
        <p className="text-sm font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(item.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          {item.by && ` · ${item.by}`}
        </p>
      </li>
    ))}
  </ol>
);

// ---------- Draft Banner ----------
export const DraftBanner = ({
  hasDraft, cooldownRemainingMs, modifiedCount, status, onOpen,
}: {
  hasDraft: boolean; cooldownRemainingMs: number; modifiedCount: number;
  status: string; onOpen: () => void;
}) => {
  if (!hasDraft) {
    return (
      <div className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Listing is up to date</p>
            <p className="text-xs text-muted-foreground">No pending draft. Edits open a new draft for review.</p>
          </div>
        </div>
      </div>
    );
  }
  const hrs = Math.floor(cooldownRemainingMs / 3600000);
  const mins = Math.floor((cooldownRemainingMs % 3600000) / 60000);
  const locked = cooldownRemainingMs > 0 && status === "submitted";
  return (
    <div className={cn(
      "rounded-xl border px-4 py-3 flex items-center justify-between gap-4",
      locked ? "bg-amber-500/5 border-amber-500/30" : "bg-blue-500/5 border-blue-500/30",
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          locked ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-500",
        )}>
          {locked ? <Clock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">
            Pending draft · {modifiedCount} modified {modifiedCount === 1 ? "field" : "fields"} · <span className="capitalize">{status}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {locked
              ? `Under review — edits unlock in ${hrs}h ${mins}m`
              : "You can continue editing this draft; changes group into the same submission."}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onOpen}>Open Draft Center</Button>
    </div>
  );
};

// ---------- Empty State ----------
export const EmptyState = ({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description?: string; action?: ReactNode;
}) => (
  <div className="text-center py-12">
    <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <p className="mt-4 font-medium">{title}</p>
    {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ---------- Edit Drawer Shell ----------
export const EditDrawer = ({
  open, onOpenChange, title, description, onSave, onCancel, children, saveLabel = "Save to Draft", disabled,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string;
  onSave: () => void; onCancel?: () => void; children: ReactNode; saveLabel?: string; disabled?: boolean;
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>
      <div className="py-6 space-y-4">{children}</div>
      <SheetFooter>
        <Button variant="ghost" onClick={() => { onCancel?.(); onOpenChange(false); }}>Cancel</Button>
        <Button variant="hero" onClick={onSave} disabled={disabled}>{saveLabel}</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

// ---------- Review helpers ----------
export const FieldReviewBadge = ({ state }: { state: "pending" | "approved" | "rejected" }) => {
  if (state === "approved") return <StatusPill label="Approved" tone="green" icon={Check} />;
  if (state === "rejected") return <StatusPill label="Rejected" tone="red" icon={X} />;
  return <StatusPill label="Pending" tone="amber" icon={Clock} />;
};
