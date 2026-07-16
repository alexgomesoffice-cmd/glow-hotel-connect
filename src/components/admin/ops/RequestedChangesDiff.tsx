// PR-style diff renderer with per-field / per-item Reject action.
// Approve is implicit — anything still "pending" at submit is approved.
import { cn } from "@/lib/utils";
import { AmenityDiff, DiffField, GalleryDiff, RoomPriceDiff, FieldReviewState } from "@/data/adminCases";
import { Minus, Plus, ArrowRight, X, RotateCcw, ShieldAlert } from "lucide-react";

// Very lightweight word-level diff.
const wordDiff = (a: string, b: string) => {
  const aw = a.split(/(\s+)/);
  const bw = b.split(/(\s+)/);
  const setA = new Set(aw);
  const setB = new Set(bw);
  return {
    left: aw.map((w) => ({ w, removed: !setB.has(w) })),
    right: bw.map((w) => ({ w, added: !setA.has(w) })),
  };
};

const RejectButton = ({
  state,
  onToggle,
  disabled,
}: {
  state: FieldReviewState | undefined;
  onToggle: () => void;
  disabled?: boolean;
}) => {
  const rejected = state === "rejected";
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-sm border px-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
        rejected
          ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
          : "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
        disabled && "cursor-not-allowed opacity-40",
      )}
      title={rejected ? "Undo reject" : "Reject this field"}
    >
      {rejected ? <><RotateCcw className="h-3 w-3" /> Undo</> : <><X className="h-3 w-3" /> Reject</>}
    </button>
  );
};

const RejectedTag = () => (
  <span className="inline-flex items-center gap-1 rounded-sm border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-red-300">
    <X className="h-3 w-3" /> Rejected · will not publish
  </span>
);

export const FieldDiffRow = ({
  field,
  readOnly,
  onReject,
}: {
  field: DiffField;
  readOnly?: boolean;
  onReject?: (key: string) => void;
}) => {
  const rejected = field.state === "rejected";
  const approved = field.state === "approved";
  return (
    <div className={cn("grid grid-cols-[160px_1fr_1fr_auto] gap-0 border-b border-border/40 last:border-b-0", rejected && "opacity-60")}>
      <div className="border-r border-border/40 bg-secondary/30 px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {field.label}
          {field.protected && <ShieldAlert className="h-3 w-3 text-amber-400" title="Protected field" />}
        </div>
        {rejected && <div className="mt-1"><RejectedTag /></div>}
      </div>
      <div className="border-r border-border/40 bg-red-500/[0.04] px-3 py-2 font-mono text-xs">
        <span className="text-muted-foreground">
          {field.current === null || field.current === "" ? <em className="italic">(empty)</em> : String(field.current)}
        </span>
      </div>
      <div className={cn("bg-emerald-500/[0.06] px-3 py-2 font-mono text-xs", rejected ? "text-muted-foreground line-through" : "text-emerald-300")}>
        {field.requested === null || field.requested === "" ? <em className="italic">(empty)</em> : String(field.requested)}
      </div>
      <div className="flex items-center gap-1 px-2 py-2">
        {!readOnly && !approved && (
          <RejectButton state={field.state} onToggle={() => onReject?.(field.key)} />
        )}
      </div>
    </div>
  );
};

export const TextDiffBlock = ({
  current,
  requested,
  state,
  readOnly,
  onReject,
}: {
  current: string;
  requested: string;
  state?: FieldReviewState;
  readOnly?: boolean;
  onReject?: () => void;
}) => {
  const { left, right } = wordDiff(current, requested);
  const rejected = state === "rejected";
  return (
    <div className={cn(rejected && "opacity-60")}>
      <div className="grid grid-cols-2 gap-0 border-b border-border/40 last:border-b-0">
        <div className="border-r border-border/40 bg-red-500/[0.04] p-3 text-sm leading-relaxed">
          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-400">
            <Minus className="h-3 w-3" /> Current
          </div>
          <div>
            {left.map((t, i) => (
              <span key={i} className={cn(t.removed && "rounded-sm bg-red-500/20 px-0.5 text-red-200 line-through decoration-red-400/50")}>
                {t.w}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-emerald-500/[0.06] p-3 text-sm leading-relaxed">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-400">
              <Plus className="h-3 w-3" /> Requested
            </div>
            {!readOnly && state !== "approved" && (
              <RejectButton state={state} onToggle={() => onReject?.()} />
            )}
          </div>
          <div>
            {right.map((t, i) => (
              <span key={i} className={cn(!rejected && t.added && "rounded-sm bg-emerald-500/20 px-0.5 text-emerald-200")}>
                {t.w}
              </span>
            ))}
          </div>
          {rejected && <div className="mt-2"><RejectedTag /></div>}
        </div>
      </div>
    </div>
  );
};

export const AmenitiesDiffBlock = ({
  diff,
  readOnly,
  onReject,
}: {
  diff: AmenityDiff;
  readOnly?: boolean;
  onReject?: (bucket: "added" | "removed", key: string) => void;
}) => (
  <div className="grid grid-cols-2 gap-0 border-b border-border/40 last:border-b-0">
    {(["added", "removed"] as const).map((bucket) => {
      const items = diff[bucket];
      const colorLabel = bucket === "added" ? "text-emerald-400" : "text-red-400";
      const Icon = bucket === "added" ? Plus : Minus;
      return (
        <div key={bucket} className={cn("p-3", bucket === "added" && "border-r border-border/40")}>
          <div className={cn("mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wider", colorLabel)}>
            <Icon className="h-3 w-3" /> {bucket === "added" ? "Added" : "Removed"} ({items.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {items.map((a) => {
              const rejected = a.state === "rejected";
              return (
                <span
                  key={a.key}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs",
                    bucket === "added"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/40 bg-red-500/10 text-red-300 line-through decoration-red-400/50",
                    rejected && "opacity-50",
                  )}
                >
                  <span className={cn(rejected && "line-through")}>{a.name}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onReject?.(bucket, a.key)}
                      className="rounded-sm p-0.5 hover:bg-black/20"
                      title={rejected ? "Undo reject" : "Reject this item"}
                    >
                      {rejected ? <RotateCcw className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    </button>
                  )}
                </span>
              );
            })}
            {items.length === 0 && <span className="text-xs italic text-muted-foreground">none</span>}
          </div>
        </div>
      );
    })}
  </div>
);

export const GalleryDiffBlock = ({
  diff,
  readOnly,
  onReject,
}: {
  diff: GalleryDiff;
  readOnly?: boolean;
  onReject?: (bucket: "added" | "removed", key: string) => void;
}) => (
  <div className="space-y-3 border-b border-border/40 p-3 last:border-b-0">
    {(["added", "removed"] as const).map((bucket) => {
      const items = diff[bucket];
      if (items.length === 0) return null;
      const ring = bucket === "added" ? "ring-emerald-500/60" : "ring-red-500/60";
      const Icon = bucket === "added" ? Plus : Minus;
      const color = bucket === "added" ? "text-emerald-400" : "text-red-400";
      return (
        <div key={bucket}>
          <div className={cn("mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wider", color)}>
            <Icon className="h-3 w-3" /> {bucket === "added" ? "Added" : "Removed"} ({items.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((g) => {
              const rejected = g.state === "rejected";
              return (
                <div key={g.key} className="relative">
                  <img
                    src={g.src}
                    alt=""
                    className={cn(
                      "h-16 w-24 rounded-sm object-cover ring-2",
                      ring,
                      bucket === "removed" && "grayscale",
                      rejected && "opacity-40",
                    )}
                  />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onReject?.(bucket, g.key)}
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground hover:bg-red-500/20 hover:text-red-300"
                      title={rejected ? "Undo reject" : "Reject this image"}
                    >
                      {rejected ? <RotateCcw className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

export const RoomsDiffBlock = ({
  rooms,
  readOnly,
  onReject,
}: {
  rooms: RoomPriceDiff[];
  readOnly?: boolean;
  onReject?: (roomId: string) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border/40 bg-secondary/30 text-[10px] uppercase tracking-wider text-muted-foreground">
          <th className="px-3 py-2 text-left">Room</th>
          <th className="px-3 py-2 text-right">Price</th>
          <th className="px-3 py-2 text-right">Inventory</th>
          <th className="px-3 py-2 text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map((r) => {
          const rejected = r.state === "rejected";
          const priceChanged = r.currentPrice !== r.requestedPrice;
          const invChanged = r.currentInventory !== r.requestedInventory;
          return (
            <tr key={r.roomId} className={cn("border-b border-border/40 last:border-b-0", rejected && "opacity-60")}>
              <td className="px-3 py-2 text-[13px]">
                {r.name}
                {rejected && <span className="ml-2 inline-block"><RejectedTag /></span>}
              </td>
              <td className="px-3 py-2 text-right font-mono text-xs">
                {priceChanged ? (
                  <span>
                    <span className="text-red-400 line-through">${r.currentPrice}</span>
                    <ArrowRight className="mx-1 inline h-3 w-3" />
                    <span className={cn(rejected ? "text-muted-foreground line-through" : "text-emerald-300")}>${r.requestedPrice}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">${r.currentPrice}</span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-mono text-xs">
                {invChanged ? (
                  <span>
                    <span className="text-red-400 line-through">{r.currentInventory}</span>
                    <ArrowRight className="mx-1 inline h-3 w-3" />
                    <span className={cn(rejected ? "text-muted-foreground line-through" : "text-emerald-300")}>{r.requestedInventory}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">{r.currentInventory}</span>
                )}
              </td>
              <td className="px-3 py-2 text-right">
                {!readOnly && r.state !== "approved" && (
                  <RejectButton state={r.state} onToggle={() => onReject?.(r.roomId)} />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export const DiffSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-md border border-border/60 bg-card">
    <div className="border-b border-border/60 bg-secondary/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </div>
    {children}
  </div>
);
