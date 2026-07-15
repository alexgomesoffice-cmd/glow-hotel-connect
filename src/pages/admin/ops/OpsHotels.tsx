// Hotels CRM list — dense enterprise table.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { HOTELS } from "@/data/adminCases";
import { OpsSectionHeader, OpsTable, OpsTd, OpsTh, VersionBadge } from "@/components/admin/ops/primitives";
import { cn } from "@/lib/utils";

const verifChip = (v: "verified" | "unverified" | "partial") => {
  const map = {
    verified: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    partial: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    unverified: "border-red-500/40 bg-red-500/10 text-red-400",
  };
  return (
    <span className={cn("inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", map[v])}>
      {v}
    </span>
  );
};

const OpsHotels = () => {
  const [q, setQ] = useState("");
  const [sub, setSub] = useState("all");
  const rows = useMemo(
    () =>
      HOTELS.filter((h) => {
        if (sub !== "all" && h.subscription !== sub) return false;
        if (q && !h.name.toLowerCase().includes(q.toLowerCase()) && !h.city.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [q, sub],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-6 py-5">
      <OpsSectionHeader title="Hotels" description={`${rows.length} properties · CRM view, not for approval`} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search hotels or cities…"
            className="h-8 w-full rounded-sm border border-border/60 bg-secondary/40 pl-7 pr-2 text-xs outline-none focus:border-primary/60"
          />
        </div>
        <select value={sub} onChange={(e) => setSub(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">All subscriptions</option>
          <option value="trial">Trial</option>
          <option value="growth">Growth</option>
          <option value="scale">Scale</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      <OpsTable>
        <thead>
          <tr>
            <OpsTh>Hotel</OpsTh>
            <OpsTh className="w-32">City</OpsTh>
            <OpsTh className="w-28">Verification</OpsTh>
            <OpsTh className="w-28 text-right">Pending</OpsTh>
            <OpsTh className="w-24 text-right">Health</OpsTh>
            <OpsTh className="w-32 text-right">Revenue 30d</OpsTh>
            <OpsTh className="w-28">Subscription</OpsTh>
            <OpsTh className="w-32">Status</OpsTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id} className="cursor-pointer hover:bg-secondary/40">
              <OpsTd>
                <Link to={`/admin/hotels/${h.id}`} className="flex items-center gap-2 hover:underline">
                  <div className="grid h-7 w-7 place-items-center rounded-sm bg-secondary text-[10px] font-semibold">{h.logo}</div>
                  <div>
                    <div className="text-[13px]">{h.name}</div>
                    <div className="text-[11px] text-muted-foreground">{h.ownerName}</div>
                  </div>
                </Link>
              </OpsTd>
              <OpsTd className="text-xs text-muted-foreground">{h.city}</OpsTd>
              <OpsTd>{verifChip(h.verification)}</OpsTd>
              <OpsTd className="text-right">
                {h.pendingCases > 0 ? (
                  <Link to={`/admin/work-queue?type=all`} className="font-mono text-xs text-amber-400 hover:underline">
                    {h.pendingCases}
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">0</span>
                )}
              </OpsTd>
              <OpsTd className="text-right font-mono text-xs tabular-nums">
                <span className={cn(h.health >= 80 ? "text-emerald-400" : h.health >= 60 ? "text-amber-400" : "text-red-400")}>
                  {h.health}
                </span>
              </OpsTd>
              <OpsTd className="text-right font-mono text-xs tabular-nums">${h.revenue30d.toLocaleString()}</OpsTd>
              <OpsTd className="text-xs uppercase tracking-wider text-muted-foreground">{h.subscription}</OpsTd>
              <OpsTd><VersionBadge v={h.status} /></OpsTd>
            </tr>
          ))}
        </tbody>
      </OpsTable>
    </div>
  );
};

export default OpsHotels;
