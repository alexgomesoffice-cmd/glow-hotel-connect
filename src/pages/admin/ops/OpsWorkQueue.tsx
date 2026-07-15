// Work Queue: dense inbox of Cases (like Linear / Gmail).
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { CASES, CASE_TYPE_LABEL, CaseType, formatRelative, formatWaiting } from "@/data/adminCases";
import { OpsSectionHeader, OpsTable, OpsTd, OpsTh, PriorityDot, StatusBadge, WaitingCell } from "@/components/admin/ops/primitives";
import { cn } from "@/lib/utils";

const TABS: { key: "all" | CaseType | "urgent"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "registration", label: "Registrations" },
  { key: "property", label: "Property" },
  { key: "legal", label: "Legal" },
  { key: "identity", label: "Identity" },
  { key: "bank", label: "Bank" },
  { key: "publication", label: "Publication" },
  { key: "urgent", label: "Urgent" },
];

const OpsWorkQueue = () => {
  const [params, setParams] = useSearchParams();
  const initialTab = (params.get("type") as any) || "all";
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>(initialTab);
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return CASES.filter((c) => {
      if (tab === "urgent") {
        if (c.priority !== "P1" && !formatWaiting(c.createdAt, c.slaHours).breached) return false;
      } else if (tab !== "all") {
        if (c.type !== tab) return false;
      }
      if (status !== "all" && c.status !== status) return false;
      if (priority !== "all" && c.priority !== priority) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.hotelName.toLowerCase().includes(q) &&
          !c.number.toLowerCase().includes(q) &&
          !c.submittedBy.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tab, status, priority, query]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-6 py-5">
      <OpsSectionHeader
        title="Work Queue"
        description={`${rows.length} case${rows.length === 1 ? "" : "s"} matching filters`}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border/60">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              if (t.key === "all") params.delete("type");
              else params.set("type", t.key);
              setParams(params, { replace: true });
            }}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13px] transition-colors",
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="waiting_info">Waiting Info</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60"
        >
          <option value="all">All priorities</option>
          <option value="P1">P1 · Critical</option>
          <option value="P2">P2 · High</option>
          <option value="P3">P3 · Normal</option>
        </select>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs hover:bg-secondary">
          <Filter className="h-3.5 w-3.5" /> More
        </button>
      </div>

      <OpsTable>
        <thead>
          <tr>
            <OpsTh className="w-10"></OpsTh>
            <OpsTh className="w-16">Priority</OpsTh>
            <OpsTh className="w-28">Case #</OpsTh>
            <OpsTh className="w-32">Type</OpsTh>
            <OpsTh>Hotel</OpsTh>
            <OpsTh className="w-40">Submitted By</OpsTh>
            <OpsTh className="w-28">Created</OpsTh>
            <OpsTh className="w-24">Waiting</OpsTh>
            <OpsTh className="w-32">Assignee</OpsTh>
            <OpsTh className="w-28">Status</OpsTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const w = formatWaiting(c.createdAt, c.slaHours);
            return (
              <tr key={c.id} className="cursor-pointer hover:bg-secondary/40">
                <OpsTd className="text-center">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </OpsTd>
                <OpsTd>
                  <PriorityDot priority={c.priority} />
                </OpsTd>
                <OpsTd>
                  <Link to={`/admin/cases/${c.id}`} className="font-mono text-xs text-foreground hover:underline">
                    {c.number}
                  </Link>
                </OpsTd>
                <OpsTd>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {CASE_TYPE_LABEL[c.type]}
                  </span>
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
                  <div className="truncate text-[13px]">{c.submittedBy}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{c.submittedByEmail}</div>
                </OpsTd>
                <OpsTd>
                  <span className="font-mono text-xs text-muted-foreground">{formatRelative(c.createdAt)}</span>
                </OpsTd>
                <OpsTd>
                  <WaitingCell label={w.label} breached={w.breached} />
                </OpsTd>
                <OpsTd>
                  {c.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <div className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary">
                        {c.assignee.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-xs">{c.assignee}</span>
                    </div>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">Unassigned</span>
                  )}
                </OpsTd>
                <OpsTd>
                  <StatusBadge status={c.status} />
                </OpsTd>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
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
