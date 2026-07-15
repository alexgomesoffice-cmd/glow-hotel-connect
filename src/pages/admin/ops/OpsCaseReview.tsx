// Case Review Workspace: PR-style review UI.
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  FileText,
  MessageSquare,
  MoreHorizontal,
  X,
  HelpCircle,
} from "lucide-react";
import { findCase, CASE_TYPE_LABEL, formatRelative, formatWaiting } from "@/data/adminCases";
import {
  OpsCard,
  PriorityDot,
  StatusBadge,
  VersionBadge,
  WaitingCell,
  Kbd,
} from "@/components/admin/ops/primitives";
import {
  AmenitiesDiffBlock,
  DiffSection,
  FieldDiffRow,
  GalleryDiffBlock,
  RoomsDiffBlock,
  TextDiffBlock,
} from "@/components/admin/ops/RequestedChangesDiff";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

const OpsCaseReview = () => {
  const { id } = useParams();
  const c = findCase(id ?? "");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<null | "approve" | "reject" | "info">(null);
  const [note, setNote] = useState("");

  if (!c) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Case not found.</p>
        <Link to="/admin/work-queue" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to Work Queue
        </Link>
      </div>
    );
  }

  const w = formatWaiting(c.createdAt, c.slaHours);
  const doAction = (kind: "approve" | "reject" | "info") => {
    setConfirm(null);
    const msg = kind === "approve" ? "Case approved" : kind === "reject" ? "Case rejected" : "More info requested";
    toast({ title: msg, description: `${c.number} · ${c.hotelName}` });
    navigate("/admin/work-queue");
  };

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-4">
      {/* Header strip */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/60 pb-3">
        <Link to="/admin/work-queue" className="rounded-sm border border-border/60 bg-secondary/40 p-1 hover:bg-secondary">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <span className="font-mono text-sm">{c.number}</span>
        <span className="rounded-sm border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {CASE_TYPE_LABEL[c.type]}
        </span>
        <Link to={`/admin/hotels/${c.hotelId}`} className="text-[13px] font-medium hover:underline">
          {c.hotelName}
        </Link>
        <span className="text-xs text-muted-foreground">· {c.hotelCity}</span>
        <span className="text-xs text-muted-foreground">Owner: {c.ownerName}</span>
        <span className="text-xs text-muted-foreground">Submitted by {c.submittedBy}</span>
        <div className="ml-auto flex items-center gap-3">
          <PriorityDot priority={c.priority} />
          <WaitingCell label={w.label} breached={w.breached} />
          <StatusBadge status={c.status} />
          <VersionBadge v={c.version} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div className="min-w-0 space-y-4">
          {/* Summary */}
          <OpsCard className="p-4">
            <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Case Summary</div>
            <p className="text-sm leading-relaxed">{c.summary}</p>
          </OpsCard>

          {/* Requested Changes */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold">Requested Changes</h2>
              <span className="text-[11px] text-muted-foreground">
                Only modified fields are shown · GitHub PR style
              </span>
            </div>
            <div className="space-y-3">
              {c.fields.length > 0 && (
                <DiffSection title="Fields">
                  {c.fields.map((f) => (
                    <FieldDiffRow key={f.label} field={f} />
                  ))}
                </DiffSection>
              )}
              {c.descriptionDiff && (
                <DiffSection title="Description">
                  <TextDiffBlock current={c.descriptionDiff.current} requested={c.descriptionDiff.requested} />
                </DiffSection>
              )}
              {c.amenities && (
                <DiffSection title="Amenities">
                  <AmenitiesDiffBlock diff={c.amenities} />
                </DiffSection>
              )}
              {c.gallery && (
                <DiffSection title="Gallery">
                  <GalleryDiffBlock diff={c.gallery} />
                </DiffSection>
              )}
              {c.rooms && c.rooms.length > 0 && (
                <DiffSection title="Rooms & Pricing">
                  <RoomsDiffBlock rooms={c.rooms} />
                </DiffSection>
              )}
            </div>
          </div>

          {/* Documents */}
          {c.documents.length > 0 && (
            <div>
              <h2 className="mb-2 text-[13px] font-semibold">Supporting Documents</h2>
              <OpsCard>
                <ul className="divide-y divide-border/40 text-sm">
                  {c.documents.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 px-3 py-2">
                      <img src={d.thumb} alt="" className="h-9 w-9 rounded-sm object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px]">{d.name}</div>
                        <div className="text-[11px] text-muted-foreground">{d.size} · {formatRelative(d.uploadedAt)}</div>
                      </div>
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              </OpsCard>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h2 className="mb-2 text-[13px] font-semibold">Timeline</h2>
            <OpsCard className="p-4">
              <ol className="relative space-y-3 pl-4">
                <span className="absolute left-1.5 top-1 bottom-1 w-px bg-border/60" />
                {c.timeline.map((e) => (
                  <li key={e.id} className="relative text-sm">
                    <span className="absolute -left-[9px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <div className="text-[13px]">
                      <span className="font-medium">{e.actor}</span>{" "}
                      <span className="text-muted-foreground">{e.message}</span>
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">{formatRelative(e.at)}</div>
                  </li>
                ))}
              </ol>
            </OpsCard>
          </div>

          {/* Internal Notes */}
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
              <MessageSquare className="h-3.5 w-3.5" /> Internal Notes
            </h2>
            <OpsCard>
              <ul className="divide-y divide-border/40 text-sm">
                {c.notes.map((n) => (
                  <li key={n.id} className="px-3 py-2.5">
                    <div className="mb-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">{n.author}</span>
                      <span>· {formatRelative(n.at)}</span>
                    </div>
                    <p className="text-[13px]">{n.body}</p>
                  </li>
                ))}
                {c.notes.length === 0 && (
                  <li className="px-3 py-4 text-center text-xs text-muted-foreground">No notes yet.</li>
                )}
              </ul>
              <div className="border-t border-border/60 p-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an internal note… (visible to admins only)"
                  rows={2}
                  className="w-full resize-none rounded-sm border border-border/60 bg-secondary/30 p-2 text-xs outline-none placeholder:text-muted-foreground focus:border-primary/60"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs"
                    onClick={() => {
                      if (!note.trim()) return;
                      toast({ title: "Note added" });
                      setNote("");
                    }}
                  >
                    Post note
                  </Button>
                </div>
              </div>
            </OpsCard>
          </div>
        </div>

        {/* RIGHT · Sticky action panel */}
        <aside className="lg:sticky lg:top-16 h-fit space-y-3">
          <OpsCard className="p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Actions</div>
            <div className="space-y-2">
              <Button
                className="h-9 w-full justify-start gap-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                variant="ghost"
                onClick={() => setConfirm("approve")}
              >
                <Check className="h-4 w-4" /> Approve
                <span className="ml-auto"><Kbd>A</Kbd></span>
              </Button>
              <Button
                className="h-9 w-full justify-start gap-2 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                variant="ghost"
                onClick={() => setConfirm("reject")}
              >
                <X className="h-4 w-4" /> Reject
                <span className="ml-auto"><Kbd>R</Kbd></span>
              </Button>
              <Button
                className="h-9 w-full justify-start gap-2"
                variant="secondary"
                onClick={() => setConfirm("info")}
              >
                <HelpCircle className="h-4 w-4" /> Request Info
              </Button>
            </div>
          </OpsCard>

          <OpsCard className="p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Assignment</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assignee</span>
                <select className="rounded-sm border border-border/60 bg-secondary/40 px-1.5 py-1">
                  <option>{c.assignee ?? "Unassigned"}</option>
                  <option>John Doe</option>
                  <option>Priya Ahmed</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Priority</span>
                <select className="rounded-sm border border-border/60 bg-secondary/40 px-1.5 py-1" defaultValue={c.priority}>
                  <option>P1</option>
                  <option>P2</option>
                  <option>P3</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <select className="rounded-sm border border-border/60 bg-secondary/40 px-1.5 py-1" defaultValue={c.status}>
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="waiting_info">Waiting Info</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reviewer</span>
                <span>John Doe</span>
              </div>
            </div>
          </OpsCard>

          <OpsCard className="p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>Case History</span>
              <MoreHorizontal className="h-3 w-3" />
            </div>
            <ol className="space-y-2 text-xs text-muted-foreground">
              {c.timeline.slice(-3).reverse().map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{e.message}</span>
                  <span className="font-mono text-[10px]">{formatRelative(e.at)}</span>
                </li>
              ))}
            </ol>
          </OpsCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm === "approve"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Approve this case?"
        description={`Are you sure you want to approve ${c.number}? The requested changes will be applied to the published version.`}
        confirmLabel="Approve"
        onConfirm={() => doAction("approve")}
      />
      <ConfirmDialog
        open={confirm === "reject"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Reject this case?"
        description={`Are you sure you want to reject ${c.number}? The submitter will be notified.`}
        confirmLabel="Reject"
        variant="destructive"
        onConfirm={() => doAction("reject")}
      />
      <ConfirmDialog
        open={confirm === "info"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Request more information?"
        description={`Send the submitter a request for additional information on ${c.number}?`}
        confirmLabel="Send request"
        onConfirm={() => doAction("info")}
      />
    </div>
  );
};

export default OpsCaseReview;
