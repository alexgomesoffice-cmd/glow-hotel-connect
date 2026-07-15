// Hotel Workspace: tabbed OS for a single hotel.
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { casesForHotel, findHotel, formatRelative } from "@/data/adminCases";
import { KpiTile, OpsCard, OpsSectionHeader, StatusBadge, VersionBadge } from "@/components/admin/ops/primitives";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

const TABS = ["Overview", "Property", "Rooms", "Bookings", "Staff", "Commercial", "Activity"] as const;
type Tab = (typeof TABS)[number];

const OpsHotelWorkspace = () => {
  const { id } = useParams();
  const h = findHotel(Number(id));
  const [tab, setTab] = useState<Tab>("Overview");
  const [confirm, setConfirm] = useState<null | string>(null);
  const { toast } = useToast();

  if (!h) return <div className="p-8 text-sm text-muted-foreground">Hotel not found.</div>;
  const cases = casesForHotel(h.id);
  const draftLocked = cases.some((c) => c.version === "Draft" || c.version === "Pending Review");

  const doQuick = (action: string) => {
    setConfirm(null);
    toast({ title: `${action} — ${h.name}` });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-4">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/admin/hotels" className="rounded-sm border border-border/60 bg-secondary/40 p-1 hover:bg-secondary">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <div className="grid h-9 w-9 place-items-center rounded-sm bg-secondary text-xs font-bold">{h.logo}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold">{h.name}</h1>
            <VersionBadge v={h.status} />
          </div>
          <div className="text-xs text-muted-foreground">{h.city} · Owner {h.ownerName}</div>
        </div>
        <Button size="sm" variant="secondary" className="h-8"><MoreHorizontal className="h-4 w-4" /></Button>
      </div>

      <div className="mb-4 flex flex-wrap border-b border-border/60">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13px]",
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiTile label="Hotel Status" value={<span className="text-base">{h.status}</span>} />
            <KpiTile label="Verification" value={<span className="text-base capitalize">{h.verification}</span>} tone={h.verification === "verified" ? "success" : "warning"} />
            <KpiTile label="Pending Cases" value={cases.length} tone={cases.length > 0 ? "warning" : "default"} />
            <KpiTile label="Health Score" value={h.health} sub="out of 100" />
            <KpiTile label="Subscription" value={<span className="text-base capitalize">{h.subscription}</span>} />
            <KpiTile label="Revenue 30d" value={`$${h.revenue30d.toLocaleString()}`} tone="success" />
            <KpiTile label="Owner" value={<span className="text-sm">{h.ownerName}</span>} sub={h.ownerEmail} />
            <KpiTile label="Hotel Admin" value={<span className="text-sm">{h.adminName}</span>} sub={h.adminEmail} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <OpsCard className="lg:col-span-2">
              <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Pending Cases</div>
              <ul className="divide-y divide-border/40 text-sm">
                {cases.length === 0 && <li className="px-3 py-4 text-center text-xs text-muted-foreground">No open cases.</li>}
                {cases.map((c) => (
                  <li key={c.id}>
                    <Link to={`/admin/cases/${c.id}`} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50">
                      <span className="font-mono text-xs text-muted-foreground">{c.number}</span>
                      <span className="flex-1 truncate">{c.summary}</span>
                      <StatusBadge status={c.status} />
                      <span className="font-mono text-[11px] text-muted-foreground">{formatRelative(c.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </OpsCard>
            <OpsCard>
              <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Quick Actions</div>
              <div className="divide-y divide-border/40 text-sm">
                {["Suspend", "Publish", "Feature", "Reset Password", "Deactivate"].map((a) => (
                  <button
                    key={a}
                    onClick={() => setConfirm(a)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-secondary/50"
                  >
                    <span>{a}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Confirm</span>
                  </button>
                ))}
              </div>
            </OpsCard>
          </div>
        </div>
      )}

      {tab === "Property" && (
        <div className="space-y-3">
          {draftLocked && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              A Draft is currently under review. Editing is locked until the case resolves.
            </div>
          )}
          {["General", "Location", "Contacts", "Policies", "Amenities", "Gallery"].map((s) => (
            <OpsCard key={s}>
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                <div className="text-[13px] font-semibold">{s}</div>
                <Button size="sm" variant="secondary" className="h-7 text-xs" disabled={draftLocked}>Edit</Button>
              </div>
              <div className="px-3 py-3 text-xs text-muted-foreground">Read-only preview of {s.toLowerCase()} data.</div>
            </OpsCard>
          ))}
        </div>
      )}

      {tab === "Rooms" && (
        <OpsCard className="p-4 text-xs text-muted-foreground">Room Types · Rooms · Pricing · Availability tables live here.</OpsCard>
      )}
      {tab === "Bookings" && (
        <OpsCard className="p-4 text-xs text-muted-foreground">Dense bookings table for this hotel.</OpsCard>
      )}
      {tab === "Staff" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <OpsCard className="p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Owner</div>
            <div className="mt-1 text-sm">{h.ownerName}</div>
            <div className="text-xs text-muted-foreground">{h.ownerEmail}</div>
          </OpsCard>
          <OpsCard className="p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Hotel Admin</div>
            <div className="mt-1 text-sm">{h.adminName}</div>
            <div className="text-xs text-muted-foreground">{h.adminEmail}</div>
            <div className="mt-2 flex gap-2">
              {["Block", "Deactivate", "Reset Password", "Force Logout"].map((a) => (
                <Button key={a} size="sm" variant="secondary" className="h-7 text-[11px]" onClick={() => setConfirm(a)}>{a}</Button>
              ))}
            </div>
          </OpsCard>
        </div>
      )}
      {tab === "Commercial" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {["Subscription", "Advertisement", "Featured", "Invoices", "Payments", "Commission"].map((s) => (
            <OpsCard key={s} className="p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s}</div>
              <div className="mt-1 text-sm text-muted-foreground">—</div>
            </OpsCard>
          ))}
        </div>
      )}
      {tab === "Activity" && (
        <OpsCard className="p-4">
          <ol className="relative space-y-3 pl-4">
            <span className="absolute left-1.5 top-1 bottom-1 w-px bg-border/60" />
            {cases.flatMap((c) => c.timeline.map((e) => ({ ...e, caseNo: c.number }))).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).map((e) => (
              <li key={`${e.caseNo}-${e.id}`} className="relative text-sm">
                <span className="absolute -left-[9px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <div className="text-[13px]">
                  <span className="font-mono text-xs text-muted-foreground">{e.caseNo}</span>{" "}
                  <span className="font-medium">{e.actor}</span> <span className="text-muted-foreground">{e.message}</span>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">{formatRelative(e.at)}</div>
              </li>
            ))}
          </ol>
        </OpsCard>
      )}

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`${confirm ?? ""} ${h.name}?`}
        description={`Are you sure you want to ${confirm?.toLowerCase()} this record? This will be logged in the activity timeline.`}
        confirmLabel={confirm ?? "Confirm"}
        variant={confirm === "Suspend" || confirm === "Deactivate" || confirm === "Block" ? "destructive" : "default"}
        onConfirm={() => doQuick(confirm ?? "")}
      />
    </div>
  );
};

export default OpsHotelWorkspace;
