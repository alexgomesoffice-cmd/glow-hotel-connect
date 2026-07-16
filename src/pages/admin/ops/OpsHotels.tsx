// Hotels CRM list — Hotel · City · Owner · Hotel Admin · Pending Draft · Health · Bookings · Revenue · Status.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { HOTELS } from "@/data/adminCases";
import { HealthBadge, OpsSectionHeader, OpsTable, OpsTd, OpsTh, VersionBadge } from "@/components/admin/ops/primitives";
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
  const [verif, setVerif] = useState("all");
  const [city, setCity] = useState("all");
  const cities = Array.from(new Set(HOTELS.map((h) => h.city))).sort();

  const rows = useMemo(
    () =>
      HOTELS.filter((h) => {
        if (verif !== "all" && h.verification !== verif) return false;
        if (city !== "all" && h.city !== city) return false;
        if (q && !h.name.toLowerCase().includes(q.toLowerCase()) && !h.city.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [q, verif, city],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-6 py-5">
      <OpsSectionHeader
        title="Hotels"
        description={`${rows.length} properties · CRM view — not for approvals`}
      />
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
        <select value={verif} onChange={(e) => setVerif(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">All verification</option>
          <option value="verified">Verified</option>
          <option value="partial">Partial</option>
          <option value="unverified">Unverified</option>
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <OpsTable>
        <thead>
          <tr>
            <OpsTh>Hotel</OpsTh>
            <OpsTh className="w-32">City</OpsTh>
            <OpsTh className="w-40">Owner</OpsTh>
            <OpsTh className="w-40">Hotel Admin</OpsTh>
            <OpsTh className="w-28">Pending Draft</OpsTh>
            <OpsTh className="w-24 text-right">Health</OpsTh>
            <OpsTh className="w-24 text-right">Bookings 30d</OpsTh>
            <OpsTh className="w-32 text-right">Revenue 30d</OpsTh>
            <OpsTh className="w-28">Status</OpsTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id} className="cursor-pointer hover:bg-secondary/40">
              <OpsTd>
                <Link to={`/admin/hotels/${h.id}`} className="flex items-center gap-2 hover:underline">
                  <div className="grid h-7 w-7 place-items-center rounded-sm bg-secondary text-[10px] font-semibold">{h.logo}</div>
                  <div><div className="text-[13px]">{h.name}</div></div>
                </Link>
              </OpsTd>
              <OpsTd className="text-xs text-muted-foreground">{h.city}</OpsTd>
              <OpsTd>
                <div className="text-[13px]">{h.ownerName}</div>
                <div className="text-[11px] text-muted-foreground">{h.ownerEmail}</div>
              </OpsTd>
              <OpsTd>
                <div className="text-[13px]">{h.adminName}</div>
                <div className="text-[11px] text-muted-foreground">{h.adminEmail}</div>
              </OpsTd>
              <OpsTd>
                {h.hasPendingDraft ? (
                  <Link to={`/admin/work-queue?status=pending`} className="inline-flex rounded-sm border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-400 hover:bg-amber-500/20">
                    Draft pending
                  </Link>
                ) : (
                  <span className="text-[11px] text-muted-foreground">—</span>
                )}
              </OpsTd>
              <OpsTd className="text-right"><HealthBadge score={h.health} /></OpsTd>
              <OpsTd className="text-right font-mono text-xs tabular-nums text-muted-foreground">{h.bookings30d}</OpsTd>
              <OpsTd className="text-right font-mono text-xs tabular-nums">৳{h.revenue30d.toLocaleString()}</OpsTd>
              <OpsTd><VersionBadge v={h.status} /></OpsTd>
            </tr>
          ))}
        </tbody>
      </OpsTable>
    </div>
  );
};

export default OpsHotels;
