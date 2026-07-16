// Case Review Workspace: PR-style diff review with per-field reject.
// No priority, no assignee, no reviewer. Bottom action bar has two options.
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, FileText, MessageSquare, X, ShieldAlert } from "lucide-react";
import {
  findCase,
  CASE_TYPE_LABEL,
  formatRelative,
  formatWaiting,
  countModifiedFields,
  CaseRecord,
  FieldReviewState,
} from "@/data/adminCases";
import {
  OpsCard,
  StatusBadge,
  VersionBadge,
  WaitingCell,
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
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

// Local review state mirrors the case's rejectable items.
interface ReviewState {
  fields: Record<string, FieldReviewState>;
  description: FieldReviewState;
  amenityAdded: Record<string, FieldReviewState>;
  amenityRemoved: Record<string, FieldReviewState>;
  galleryAdded: Record<string, FieldReviewState>;
  galleryRemoved: Record<string, FieldReviewState>;
  rooms: Record<string, FieldReviewState>;
}

const initialState = (c: CaseRecord): ReviewState => ({
  fields: Object.fromEntries(c.fields.map((f) => [f.key, f.state ?? "pending"])),
  description: c.descriptionDiff?.state ?? "pending",
  amenityAdded: Object.fromEntries((c.amenities?.added ?? []).map((a) => [a.key, a.state ?? "pending"])),
  amenityRemoved: Object.fromEntries((c.amenities?.removed ?? []).map((a) => [a.key, a.state ?? "pending"])),
  galleryAdded: Object.fromEntries((c.gallery?.added ?? []).map((g) => [g.key, g.state ?? "pending"])),
  galleryRemoved: Object.fromEntries((c.gallery?.removed ?? []).map((g) => [g.key, g.state ?? "pending"])),
  rooms: Object.fromEntries((c.rooms ?? []).map((r) => [r.roomId, r.state ?? "pending"])),
});

const toggleState = (s: FieldReviewState): FieldReviewState => (s === "rejected" ? "pending" : "rejected");

const OpsCaseReview = () => {
  const { id } = useParams();
  const c = findCase(id ?? "");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<null | "approveRemaining" | "rejectAll" | "info">(null);
  const [note, setNote] = useState("");
  const [review, setReview] = useState<ReviewState>(() => (c ? initialState(c) : ({} as ReviewState)));

  const readOnly = c?.status !== "pending";

  const counts = useMemo(() => {
    if (!c) return { rejected: 0, pending: 0 };
    const all: FieldReviewState[] = [
      ...Object.values(review.fields),
      review.description,
      ...Object.values(review.amenityAdded),
      ...Object.values(review.amenityRemoved),
      ...Object.values(review.galleryAdded),
      ...Object.values(review.galleryRemoved),
      ...Object.values(review.rooms),
    ].filter((s) => s !== undefined);
    return {
      rejected: all.filter((s) => s === "rejected").length,
      pending: all.filter((s) => s === "pending").length,
    };
  }, [review, c]);

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

  const w = formatWaiting(c.createdAt);

  const projectedFields = c.fields.map((f) => ({ ...f, state: review.fields[f.key] }));
  const projectedDescription = c.descriptionDiff
    ? { ...c.descriptionDiff, state: review.description }
    : undefined;
  const projectedAmenities = c.amenities
    ? {
        added: c.amenities.added.map((a) => ({ ...a, state: review.amenityAdded[a.key] })),
        removed: c.amenities.removed.map((a) => ({ ...a, state: review.amenityRemoved[a.key] })),
      }
    : undefined;
  const projectedGallery = c.gallery
    ? {
        added: c.gallery.added.map((g) => ({ ...g, state: review.galleryAdded[g.key] })),
        removed: c.gallery.removed.map((g) => ({ ...g, state: review.galleryRemoved[g.key] })),
      }
    : undefined;
  const projectedRooms = c.rooms?.map((r) => ({ ...r, state: review.rooms[r.roomId] }));

  const doAction = (kind: "approveRemaining" | "rejectAll" | "info") => {
    setConfirm(null);
    const msg =
      kind === "approveRemaining"
        ? `Approved ${counts.pending} pending change${counts.pending === 1 ? "" : "s"}`
        : kind === "rejectAll"
          ? "Entire request rejected"
          : "More info requested";
    toast({ title: msg, description: `${c.number} · ${c.hotelName}` });
    navigate("/admin/work-queue");
  };

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-4 pb-28">
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
        <span className="text-xs text-muted-foreground">Submitted by {c.submittedBy}</span>
        <div className="ml-auto flex items-center gap-3">
          <WaitingCell label={w.label} />
          <StatusBadge status={c.status} />
          <VersionBadge v={c.version} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* LEFT */}
        <div className="min-w-0 space-y-4">
          {/* Summary */}
          <OpsCard className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Case Summary</div>
              <div className="text-[11px] text-muted-foreground">
                {countModifiedFields(c)} modified field{countModifiedFields(c) === 1 ? "" : "s"} · last updated {formatRelative(c.lastUpdatedAt)}
              </div>
            </div>
            <p className="text-sm leading-relaxed">{c.summary}</p>
          </OpsCard>

          {/* Requested Changes */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold">Requested Changes</h2>
              <span className="text-[11px] text-muted-foreground">
                Reject any field you don't want to publish. Everything left pending will be approved.
              </span>
            </div>
            <div className="space-y-3">
              {projectedFields.length > 0 && (
                <DiffSection title="Fields">
                  {projectedFields.map((f) => (
                    <FieldDiffRow
                      key={f.key}
                      field={f}
                      readOnly={readOnly}
                      onReject={(key) =>
                        setReview((r) => ({ ...r, fields: { ...r.fields, [key]: toggleState(r.fields[key]) } }))
                      }
                    />
                  ))}
                </DiffSection>
              )}
              {projectedDescription && (
                <DiffSection title="Description">
                  <TextDiffBlock
                    current={projectedDescription.current}
                    requested={projectedDescription.requested}
                    state={projectedDescription.state}
                    readOnly={readOnly}
                    onReject={() => setReview((r) => ({ ...r, description: toggleState(r.description) }))}
                  />
                </DiffSection>
              )}
              {projectedAmenities && (
                <DiffSection title="Amenities">
                  <AmenitiesDiffBlock
                    diff={projectedAmenities}
                    readOnly={readOnly}
                    onReject={(bucket, key) =>
                      setReview((r) => {
                        const map = bucket === "added" ? r.amenityAdded : r.amenityRemoved;
                        const updated = { ...map, [key]: toggleState(map[key]) };
                        return bucket === "added"
                          ? { ...r, amenityAdded: updated }
                          : { ...r, amenityRemoved: updated };
                      })
                    }
                  />
                </DiffSection>
              )}
              {projectedGallery && (
                <DiffSection title="Gallery">
                  <GalleryDiffBlock
                    diff={projectedGallery}
                    readOnly={readOnly}
                    onReject={(bucket, key) =>
                      setReview((r) => {
                        const map = bucket === "added" ? r.galleryAdded : r.galleryRemoved;
                        const updated = { ...map, [key]: toggleState(map[key]) };
                        return bucket === "added"
                          ? { ...r, galleryAdded: updated }
                          : { ...r, galleryRemoved: updated };
                      })
                    }
                  />
                </DiffSection>
              )}
              {projectedRooms && projectedRooms.length > 0 && (
                <DiffSection title="Rooms & Pricing">
                  <RoomsDiffBlock
                    rooms={projectedRooms}
                    readOnly={readOnly}
                    onReject={(roomId) =>
                      setReview((r) => ({ ...r, rooms: { ...r.rooms, [roomId]: toggleState(r.rooms[roomId]) } }))
                    }
                  />
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

        {/* RIGHT · Review summary only (no assignment) */}
        <aside className="space-y-3 lg:sticky lg:top-16 h-fit">
          <OpsCard className="p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Review Summary</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Change type</span><span>{CASE_TYPE_LABEL[c.type]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Modified fields</span><span className="font-mono tabular-nums">{countModifiedFields(c)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Will publish</span><span className="font-mono tabular-nums text-emerald-400">{counts.pending}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Marked rejected</span><span className="font-mono tabular-nums text-red-400">{counts.rejected}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span>{formatRelative(c.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last update</span><span>{formatRelative(c.lastUpdatedAt)}</span></div>
            </div>
          </OpsCard>

          {c.fields.some((f) => f.protected) && (
            <OpsCard className="p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-400">
                <ShieldAlert className="h-3.5 w-3.5" /> Protected Fields
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                This case includes protected fields. Approving them will overwrite verified data on Live.
              </p>
            </OpsCard>
          )}
        </aside>
      </div>

      {/* Sticky bottom action bar */}
      {!readOnly && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-6 py-3">
            <div className="text-xs text-muted-foreground">
              {counts.rejected > 0
                ? `${counts.rejected} field${counts.rejected === 1 ? "" : "s"} marked rejected. Remaining ${counts.pending} will be published on approve.`
                : `All ${counts.pending} field${counts.pending === 1 ? "" : "s"} will be published.`}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="secondary"
                className="h-9 gap-2 border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                onClick={() => setConfirm("rejectAll")}
              >
                <X className="h-4 w-4" /> Reject Entire Request
              </Button>
              <Button
                className="h-9 gap-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                variant="ghost"
                onClick={() => setConfirm("approveRemaining")}
                disabled={counts.pending === 0}
              >
                <Check className="h-4 w-4" /> Approve Remaining Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm === "approveRemaining"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Approve remaining changes?"
        description={`Are you sure you want to approve the ${counts.pending} remaining pending change${counts.pending === 1 ? "" : "s"} on ${c.number}? Rejected fields will keep their current Live values.`}
        confirmLabel="Approve"
        onConfirm={() => doAction("approveRemaining")}
      />
      <ConfirmDialog
        open={confirm === "rejectAll"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Reject entire request?"
        description={`Are you sure you want to reject ${c.number}? The submitter will be notified and no fields will be applied.`}
        confirmLabel="Reject request"
        variant="destructive"
        onConfirm={() => doAction("rejectAll")}
      />
    </div>
  );
};

export default OpsCaseReview;
