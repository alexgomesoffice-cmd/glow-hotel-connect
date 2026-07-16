// Activity Log — read-only dense table of every System Admin action.
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ACTIVITY_LOG } from "@/data/adminActivityLog";
import { OpsSectionHeader, OpsTable, OpsTd, OpsTh } from "@/components/admin/ops/primitives";
import { formatRelative } from "@/data/adminCases";

const OpsActivityLog = () => {
  const [q, setQ] = useState("");
  const [admin, setAdmin] = useState("all");
  const [action, setAction] = useState("all");
  const [date, setDate] = useState("all");

  const admins = Array.from(new Set(ACTIVITY_LOG.map((l) => l.admin))).sort();
  const actions = Array.from(new Set(ACTIVITY_LOG.map((l) => l.action))).sort();

  const rows = useMemo(
    () =>
      ACTIVITY_LOG.filter((l) => {
        if (admin !== "all" && l.admin !== admin) return false;
        if (action !== "all" && l.action !== action) return false;
        if (date !== "all") {
          const days = { "24h": 1, "7d": 7, "30d": 30 }[date] ?? 9999;
          const ageDays = (Date.now() - new Date(l.at).getTime()) / 86_400_000;
          if (ageDays > days) return false;
        }
        if (q) {
          const s = q.toLowerCase();
          if (!l.target.toLowerCase().includes(s) && !l.description.toLowerCase().includes(s)) return false;
        }
        return true;
      }).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [q, admin, action, date],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-6 py-5">
      <OpsSectionHeader title="Activity Log" description="Every System Admin action recorded, read-only." />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search target or description…"
            className="h-8 w-full rounded-sm border border-border/60 bg-secondary/40 pl-7 pr-2 text-xs outline-none focus:border-primary/60"
          />
        </div>
        <select value={admin} onChange={(e) => setAdmin(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">All admins</option>
          {admins.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">All actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={date} onChange={(e) => setDate(e.target.value)} className="h-8 rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs">
          <option value="all">Any date</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7d</option>
          <option value="30d">Last 30d</option>
        </select>
      </div>
      <OpsTable>
        <thead>
          <tr>
            <OpsTh className="w-40">Timestamp</OpsTh>
            <OpsTh className="w-40">System Admin</OpsTh>
            <OpsTh className="w-40">Action</OpsTh>
            <OpsTh className="w-56">Target</OpsTh>
            <OpsTh>Description</OpsTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id} className="hover:bg-secondary/40">
              <OpsTd>
                <div className="font-mono text-xs">{new Date(l.at).toLocaleString()}</div>
                <div className="text-[11px] text-muted-foreground">{formatRelative(l.at)}</div>
              </OpsTd>
              <OpsTd className="text-[13px]">{l.admin}</OpsTd>
              <OpsTd><span className="inline-flex rounded-sm border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{l.action}</span></OpsTd>
              <OpsTd className="text-[13px]">{l.target}</OpsTd>
              <OpsTd className="text-xs text-muted-foreground">{l.description}</OpsTd>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No activity matches.</td></tr>
          )}
        </tbody>
      </OpsTable>
    </div>
  );
};

export default OpsActivityLog;
