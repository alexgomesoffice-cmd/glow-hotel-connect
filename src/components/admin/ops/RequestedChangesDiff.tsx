// Reusable PR-style diff renderer for Requested Changes.
import { cn } from "@/lib/utils";
import { AmenityDiff, DiffField, GalleryDiff, RoomPriceDiff } from "@/data/adminCases";
import { Minus, Plus, ArrowRight } from "lucide-react";

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

export const FieldDiffRow = ({ field }: { field: DiffField }) => (
  <div className="grid grid-cols-[160px_1fr_1fr] gap-0 border-b border-border/40 last:border-b-0">
    <div className="border-r border-border/40 bg-secondary/30 px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
      {field.label}
    </div>
    <div className="border-r border-border/40 bg-red-500/[0.04] px-3 py-2 font-mono text-xs">
      <span className="text-muted-foreground">
        {field.current === null || field.current === "" ? <em className="italic">(empty)</em> : String(field.current)}
      </span>
    </div>
    <div className="bg-emerald-500/[0.06] px-3 py-2 font-mono text-xs text-emerald-300">
      {field.requested === null || field.requested === "" ? <em className="italic">(empty)</em> : String(field.requested)}
    </div>
  </div>
);

export const TextDiffBlock = ({ current, requested }: { current: string; requested: string }) => {
  const { left, right } = wordDiff(current, requested);
  return (
    <div className="grid grid-cols-2 gap-0 border-b border-border/40 last:border-b-0">
      <div className="border-r border-border/40 bg-red-500/[0.04] p-3 text-sm leading-relaxed">
        <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-400">
          <Minus className="h-3 w-3" /> Current
        </div>
        <div>
          {left.map((t, i) => (
            <span
              key={i}
              className={cn(t.removed && "rounded-sm bg-red-500/20 px-0.5 text-red-200 line-through decoration-red-400/50")}
            >
              {t.w}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-emerald-500/[0.06] p-3 text-sm leading-relaxed">
        <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-400">
          <Plus className="h-3 w-3" /> Requested
        </div>
        <div>
          {right.map((t, i) => (
            <span key={i} className={cn(t.added && "rounded-sm bg-emerald-500/20 px-0.5 text-emerald-200")}>
              {t.w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AmenitiesDiffBlock = ({ diff }: { diff: AmenityDiff }) => (
  <div className="grid grid-cols-2 gap-0 border-b border-border/40 last:border-b-0">
    <div className="border-r border-border/40 p-3">
      <div className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-400">
        <Plus className="h-3 w-3" /> Added ({diff.added.length})
      </div>
      <div className="flex flex-wrap gap-1.5">
        {diff.added.map((a) => (
          <span key={a} className="rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
            {a}
          </span>
        ))}
        {diff.added.length === 0 && <span className="text-xs italic text-muted-foreground">none</span>}
      </div>
    </div>
    <div className="p-3">
      <div className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-400">
        <Minus className="h-3 w-3" /> Removed ({diff.removed.length})
      </div>
      <div className="flex flex-wrap gap-1.5">
        {diff.removed.map((a) => (
          <span key={a} className="rounded-sm border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs text-red-300 line-through decoration-red-400/50">
            {a}
          </span>
        ))}
        {diff.removed.length === 0 && <span className="text-xs italic text-muted-foreground">none</span>}
      </div>
    </div>
  </div>
);

export const GalleryDiffBlock = ({ diff }: { diff: GalleryDiff }) => (
  <div className="space-y-3 border-b border-border/40 p-3 last:border-b-0">
    {diff.added.length > 0 && (
      <div>
        <div className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-400">
          <Plus className="h-3 w-3" /> Added ({diff.added.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {diff.added.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="h-16 w-24 rounded-sm object-cover ring-2 ring-emerald-500/60"
            />
          ))}
        </div>
      </div>
    )}
    {diff.removed.length > 0 && (
      <div>
        <div className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-400">
          <Minus className="h-3 w-3" /> Removed ({diff.removed.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {diff.removed.map((src) => (
            <img key={src} src={src} alt="" className="h-16 w-24 rounded-sm object-cover ring-2 ring-red-500/60 grayscale" />
          ))}
        </div>
      </div>
    )}
    {diff.reordered && (
      <div>
        <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Reorder</div>
        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-muted-foreground">
          {diff.reordered.before.map((f, i) => (
            <span key={i} className="rounded-sm bg-secondary px-1.5 py-0.5">{f}</span>
          ))}
          <ArrowRight className="mx-1 h-3 w-3" />
          {diff.reordered.after.map((f, i) => (
            <span key={i} className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-primary">{f}</span>
          ))}
        </div>
      </div>
    )}
  </div>
);

export const RoomsDiffBlock = ({ rooms }: { rooms: RoomPriceDiff[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border/40 bg-secondary/30 text-[10px] uppercase tracking-wider text-muted-foreground">
          <th className="px-3 py-2 text-left">Room</th>
          <th className="px-3 py-2 text-right">Price</th>
          <th className="px-3 py-2 text-right">Inventory</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map((r) => {
          const priceChanged = r.currentPrice !== r.requestedPrice;
          const invChanged = r.currentInventory !== r.requestedInventory;
          return (
            <tr key={r.roomId} className="border-b border-border/40 last:border-b-0">
              <td className="px-3 py-2 text-[13px]">{r.name}</td>
              <td className="px-3 py-2 text-right font-mono text-xs">
                {priceChanged ? (
                  <span>
                    <span className="text-red-400 line-through">${r.currentPrice}</span>
                    <ArrowRight className="mx-1 inline h-3 w-3" />
                    <span className="text-emerald-300">${r.requestedPrice}</span>
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
                    <span className="text-emerald-300">{r.requestedInventory}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">{r.currentInventory}</span>
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
