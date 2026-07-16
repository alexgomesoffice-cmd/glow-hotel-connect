// Work Queue: FIFO inbox of Cases (Drafts).
// Status tabs · change-type filter · no priority, no assignment.
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Search, ArrowUpRight } from "lucide-react";
import { CASES, CASE_TYPE_LABEL, CaseType, CaseStatus, formatRelative, formatWaiting } from "@/data/adminCases";
import { OpsSectionHeader, OpsTable, OpsTd, OpsTh, StatusBadge, WaitingCell } from "@/components/admin/ops/primitives";
import { cn } from "@/lib/utils";

type StatusTab = "pending" | "approved" | "rejected" | "all";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const OpsWorkQueue = () => {
  const [params, setParams] = useSearchParams();
  const initialTab = (params.get("status") as StatusTab) || "pending";
  const [tab, setTab] = useState<StatusTab>(initialTab);
  const [changeType, setChangeType] = useState<string>(params.get("type") || "all");
  const [hotel, setHotel] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [waiting, setWaiting] = useState<string>("all");
  const [sort, setSort] = useState<string>("fifo");
  const [query, setQuery] = useState("");

  const hotels = Array.from(new Set(CASES.map((c) => c.hotelName))).sort();
  const cities = Array.from(new Set(CASES.map((c) => c.hotelCity))).sort();

  const rows = useMemo(() => {
    return CASES.filter((c) => {
      if (tab !== "all" && c.status !== (tab as CaseStatus)) return false;
      if (changeType !== "all" && c.type !== changeType) return false;
      if (hotel !== "all" && c.hotelName !== hotel) return false;
      if (city !== "all" && c.hotelCity !== city) return false;
      if (dateRange !== "all") {
        const days = { "24h": 1, "7d": 7, "30d": 30 }[dateRange] ?? 9999;
        const ageDays = (Date.now() - new Date(c.createdAt).getTime()) / 86_400_000;
        if (ageDays > days) return false;
      }
      if (waiting !== "all") {
        const hours = formatWaiting(c.createdAt).elapsed;
        if (waiting === "gt_24" && hours < 24) return false;
        if (waiting === "gt_72" && hours < 72) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.hotelName.toLowerCase().includes(q) &&
          !c.number.toLowerCase().includes(q) &&
          !c.submittedBy.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    }).sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      if (sort === "newest") return tb - ta;
      return ta - tb; // FIFO: oldest first
    });
  }, [tab, changeType, hotel, city, dateRange, waiting, sort, query]);

  const updateParam = (k: string, v: string) => {
    if (v === "all" || !v) params.delete(k);
    else params.set(k, v);
    setParams(params, { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-6 py-5">
      <OpsSectionHeader
        title="Work Queue"
        description={`${rows.length} case${rows.length === 1 ? "" : "s"} · processed first-in-first-out · every admin sees the same queue`}
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border/60">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); updateParam("status", t.key === "pending" ? "" : t.key); }}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13px] transition-colors",
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search case #, hotel, submitter…"
            className="h-8 w-full rounded-sm border border-border/60 bg-secondary/40 pl-7 pr-2 text-xs outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
        </div>

        <select value={changeType} onChange={(e) => { setChangeType(e.target.value); updateParam("type", e.target.value); }}
          className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60">
          <option value="all">All change types</option>
          {(Object.keys(CASE_TYPE_LABEL) as CaseType[]).map((t) => (
            <option key={t} value={t}>{CASE_TYPE_LABEL[t]}</option>
          ))}
        </select>

        <select value={hotel} onChange={(e) => setHotel(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">All hotels</option>
          {hotels.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>

        <select value={city} onChange={(e) => setCity(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">Any date</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>

        <select value={waiting} onChange={(e) => setWaiting(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">Any waiting</option>
          <option value="gt_24">Waiting &gt; 24h</option>
          <option value="gt_72">Waiting &gt; 72h</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="fifo">Oldest first (FIFO)</option>
          <option value="newest">Newest first</option>
        </select>

        <button className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs hover:bg-secondary">
          <Filter className="h-3.5 w-3.5" /> Saved views
        </button>
      </div>

      <OpsTable>
        <thead>
          <tr>
            <OpsTh className="w-28">Case ID</OpsTh>
            <OpsTh>Hotel</OpsTh>
            <OpsTh className="w-36">Change Type</OpsTh>
            <OpsTh className="w-44">Submitted By</OpsTh>
            <OpsTh className="w-28">Submitted</OpsTh>
            <OpsTh className="w-24">Waiting</OpsTh>
            <OpsTh className="w-28">Status</OpsTh>
            <OpsTh className="w-20 text-right">Actions</OpsTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const w = formatWaiting(c.createdAt);
            return (
              <tr key={c.id} className="cursor-pointer hover:bg-secondary/40">
                <OpsTd>
                  <Link to={`/admin/cases/${c.id}`} className="font-mono text-xs text-foreground hover:underline">
                    {c.number}
                  </Link>
                </OpsTd>
                <OpsTd>
                  <Link to={`/admin/cases/${c.id}`} className="flex items-center gap-2 hover:underline">
                    <div className="grid h-6 w-6 place-items-center rounded-sm bg-secondary text-[9px] font-semibold">
                      {c.hotelName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px]">{c.hotelName}</div>
                      <div className="text-[11px] text-muted-foreground">{c.hotelCity}</div>
                    </div>
                  </Link>
                </OpsTd>
                <OpsTd>
                  <span className="inline-flex rounded-sm border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {CASE_TYPE_LABEL[c.type]}
                  </span>
                </OpsTd>
                <OpsTd>
                  <div className="truncate text-[13px]">{c.submittedBy}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{c.submittedByEmail}</div>
                </OpsTd>
                <OpsTd><span className="font-mono text-xs text-muted-foreground">{formatRelative(c.createdAt)}</span></OpsTd>
                <OpsTd><WaitingCell label={w.label} /></OpsTd>
                <OpsTd><StatusBadge status={c.status} /></OpsTd>
                <OpsTd className="text-right">
                  <Link to={`/admin/cases/${c.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    Review <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </OpsTd>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No cases match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </OpsTable>
    </div>
  );
};

export default OpsWorkQueue;
