import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Send, Trash2, Clock, Check, X, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KPI, SectionCard, StatusPill, Timeline, FieldReviewBadge, EmptyState } from "@/components/hotel-admin/primitives";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { useHotelStore, cooldownRemainingMs, updateStore, formatDate, formatDateTime } from "@/data/hotelAdminStore";

const HotelAdminDraftCenter = () => {
  const navigate = useNavigate();
  const draft = useHotelStore((s) => s.draft);
  const verificationRequests = useHotelStore((s) => s.verificationRequests);
  const [confirm, setConfirm] = useState<null | "discard" | "submit">(null);


  const cd = cooldownRemainingMs(draft);
  const hrs = Math.floor(cd / 3600000);
  const mins = Math.floor((cd % 3600000) / 60000);

  const submitDraft = () => {
    updateStore((s) => ({
      ...s, draft: s.draft ? {
        ...s.draft, status: "submitted", submittedAt: new Date().toISOString(),
        cooldownUntil: new Date(Date.now() + 24 * 3600000).toISOString(),
        timeline: [...s.draft.timeline, { at: new Date().toISOString(), label: "Submitted for review", by: "Maria Garcia" }],
      } : s.draft,
    }));
    toast({ title: "Draft submitted", description: "System admin will review your changes shortly." });
    setConfirm(null);
  };

  const discardDraft = () => {
    updateStore((s) => ({ ...s, draft: null }));
    toast({ title: "Draft discarded" });
    setConfirm(null);
    navigate("/hotel-admin/listing");
  };

  const approvedCount = draft?.fields.filter((f) => f.review === "approved").length ?? 0;
  const rejectedCount = draft?.fields.filter((f) => f.review === "rejected").length ?? 0;
  const pendingCount = draft?.fields.filter((f) => f.review === "pending").length ?? 0;

  const pendingReqs = verificationRequests.filter((r) => r.status === "pending");
  const reviewedReqs = verificationRequests.filter((r) => r.status !== "pending");

  const VerificationPanel = (
    <SectionCard title="Verification Requests" description="Protected-field changes awaiting system admin verification" icon={ShieldCheck}>
      {verificationRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No verification requests. Protected fields (Business, Owner, Bank) create requests here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">Field</th>
                <th className="text-left py-2 pr-4">Current</th>
                <th className="text-left py-2 pr-4">Requested</th>
                <th className="text-left py-2 pr-4">Submitted</th>
                <th className="text-left py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...pendingReqs, ...reviewedReqs].map((r) => (
                <tr key={r.id} className="border-b border-border/40 align-top">
                  <td className="py-3 pr-4 font-medium">{r.label}<p className="text-[10px] text-muted-foreground uppercase mt-0.5">{r.scope}</p></td>
                  <td className="py-3 pr-4 text-muted-foreground line-clamp-2">{r.currentValue}</td>
                  <td className="py-3 pr-4 line-clamp-2">{r.requestedValue}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{formatDateTime(r.submittedAt)}</td>
                  <td className="py-3 pr-4">
                    <StatusPill
                      label={r.status}
                      tone={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "amber"}
                    />
                    {r.reviewNote && <p className="text-xs text-destructive mt-1">{r.reviewNote}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );

  if (!draft) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Draft Center</h1>
          <p className="text-muted-foreground text-sm">All your pending listing changes and verification requests in one place</p>
        </div>
        <Card>
          <CardContent className="p-10">
            <EmptyState
              icon={ClipboardList}
              title="No pending draft"
              description="Edits from Property appear here as a single draft awaiting review."
              action={<Button variant="hero" onClick={() => navigate("/hotel-admin/listing")}>Open Property</Button>}
            />
          </CardContent>
        </Card>
        {VerificationPanel}
      </div>
    );
  }

  const canSubmit = (draft.status === "draft" || draft.status === "rejected") && cd === 0;
  const cooldownBlockingSubmit = (draft.status === "draft" || draft.status === "rejected") && cd > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Draft Center</h1>
          <p className="text-muted-foreground text-sm">Track your pending listing changes and verification requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirm("discard")}><Trash2 className="h-4 w-4 mr-2" /> Discard Draft</Button>
          {(draft.status === "draft" || draft.status === "rejected") && (
            <Button
              variant="hero"
              size="sm"
              disabled={!canSubmit}
              onClick={() => canSubmit
                ? setConfirm("submit")
                : toast({ title: "Submission locked", description: `Cooldown active — try again in ${hrs}h ${mins}m.` })}
            >
              <Send className="h-4 w-4 mr-2" /> {cooldownBlockingSubmit ? "Locked" : "Submit for Review"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KPI title="Status" value={draft.status} icon={ClipboardList} color="from-slate-500 to-slate-700" />
        <KPI title="Modified Fields" value={draft.fields.length} icon={RefreshCw} color="from-blue-500 to-indigo-500" />
        <KPI title="Approved" value={approvedCount} icon={Check} color="from-green-500 to-emerald-500" />
        <KPI title="Rejected" value={rejectedCount} icon={X} color="from-red-500 to-rose-500" />
        <KPI title="Pending" value={pendingCount} icon={Clock} color="from-amber-500 to-orange-500" />
        <KPI title="Cooldown" value={cd > 0 ? `${hrs}h ${mins}m` : "Unlocked"} icon={Clock} color="from-purple-500 to-pink-500" hint={draft.submittedAt ? `Submitted ${formatDate(draft.submittedAt)}` : ""} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Modified Fields" description="Field-level review status from system admin" icon={ClipboardList}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-muted-foreground border-b border-border">
                    <th className="text-left py-2 pr-4">Field</th>
                    <th className="text-left py-2 pr-4">Current</th>
                    <th className="text-left py-2 pr-4">Pending</th>
                    <th className="text-left py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.fields.map((f) => (
                    <tr key={f.path} className="border-b border-border/40 align-top">
                      <td className="py-3 pr-4 font-medium">{f.label}</td>
                      <td className="py-3 pr-4 text-muted-foreground line-clamp-2">{f.currentValue}</td>
                      <td className="py-3 pr-4 line-clamp-2">{f.pendingValue}</td>
                      <td className="py-3 pr-4">
                        <FieldReviewBadge state={f.review} />
                        {f.feedback && <p className="text-xs text-destructive mt-1">{f.feedback}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {VerificationPanel}
        </div>
        <aside>
          <SectionCard title="Timeline" icon={Clock}>
            <Timeline items={draft.timeline.slice().reverse()} />
          </SectionCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm === "discard"}
        onOpenChange={(v) => !v && setConfirm(null)}
        title="Discard this draft?"
        description="Are you sure you want to discard your pending listing changes? This cannot be undone."
        variant="destructive"
        confirmLabel="Discard"
        onConfirm={discardDraft}
      />
      <ConfirmDialog
        open={confirm === "submit"}
        onOpenChange={(v) => !v && setConfirm(null)}
        title="Submit draft for review?"
        description="Are you sure you want to submit this draft? Editing will be locked for 24 hours while system admin reviews it."
        confirmLabel="Submit"
        onConfirm={submitDraft}
      />
    </div>
  );
};


export default HotelAdminDraftCenter;
