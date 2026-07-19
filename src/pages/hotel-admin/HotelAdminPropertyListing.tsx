import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hotel, MapPin, Phone, FileText, Image as ImageIcon, Sparkles, ClipboardList,
  Edit3, Send, Save, Clock, ArrowRight, Building2, UserCircle2, ShieldCheck,
  Landmark, Star, CheckCircle2, AlertTriangle, Lock, ExternalLink, Globe,
  Instagram, Facebook, Mail, Camera, Trash2, Upload, Eye, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  useHotelStore, cooldownRemainingMs, updateStore, DraftField, PendingDraft,
  formatDate, formatDateTime,
} from "@/data/hotelAdminStore";
import ConfirmDialog from "@/components/ConfirmDialog";

/* ------------------------------------------------------------------ */
/* Section definitions                                                */
/* ------------------------------------------------------------------ */

type SectionKey =
  | "general" | "location" | "contacts" | "description" | "amenities"
  | "gallery" | "policies" | "business" | "owner" | "admin" | "documents";

type FieldDef = {
  path: string;
  label: string;
  currentValue: string;
  multiline?: boolean;
  locked?: boolean;      // never editable (e.g. country)
  helper?: string;
};

interface SectionMeta {
  key: SectionKey;
  title: string;
  description: string;
  icon: any;
  accent: string;        // gradient tail
  requiresApproval?: boolean;
  approvalNote?: string;
}

const SECTIONS: SectionMeta[] = [
  { key: "general",     title: "General Information",     icon: Hotel,        accent: "from-emerald-500 to-green-600",
    description: "Public identity of your hotel" },
  { key: "location",    title: "Location",                icon: MapPin,       accent: "from-sky-500 to-blue-600",
    description: "Where guests will find you" },
  { key: "contacts",    title: "Contact Information",     icon: Phone,        accent: "from-cyan-500 to-teal-600",
    description: "Phones, email and social channels" },
  { key: "description", title: "Description",             icon: FileText,     accent: "from-indigo-500 to-violet-600",
    description: "How your property is presented" },
  { key: "amenities",   title: "Amenities",               icon: Sparkles,     accent: "from-fuchsia-500 to-pink-600",
    description: "Everything guests can enjoy" },
  { key: "gallery",     title: "Gallery",                 icon: ImageIcon,    accent: "from-orange-500 to-amber-600",
    description: "Cover image and photo library" },
  { key: "policies",    title: "Policies",                icon: ClipboardList,accent: "from-lime-500 to-emerald-600",
    description: "Check-in, cancellation and house rules" },
  { key: "business",    title: "Business Information",    icon: Building2,    accent: "from-slate-500 to-slate-700",
    description: "Legal entity, licenses and tax IDs",
    requiresApproval: true,
    approvalNote: "Business information is verified by the System Administrator before publishing." },
  { key: "owner",       title: "Owner Information",       icon: UserCircle2,  accent: "from-purple-500 to-fuchsia-600",
    description: "Identity of the property owner",
    requiresApproval: true,
    approvalNote: "Owner identity changes require System Administrator verification." },
  { key: "admin",       title: "Hotel Admin Information", icon: ShieldCheck,  accent: "from-teal-500 to-emerald-600",
    description: "Your management profile on record",
    requiresApproval: true,
    approvalNote: "Login credentials (email/password) are managed in Account Settings." },
  { key: "documents",   title: "Documents",               icon: Landmark,     accent: "from-rose-500 to-red-600",
    description: "Verified property and business documents" },
];

/* ------------------------------------------------------------------ */
/* Field maps                                                          */
/* ------------------------------------------------------------------ */

const fieldsFor = (key: SectionKey, live: any, admin: any): FieldDef[] => {
  switch (key) {
    case "general": return [
      { path: "general.name",             label: "Hotel Name",          currentValue: live.general.name },
      { path: "general.type",             label: "Hotel Type",          currentValue: live.general.type },
      { path: "general.category",         label: "Category",            currentValue: live.general.category },
      { path: "general.starRating",       label: "Star Rating",         currentValue: String(live.general.starRating) },
      { path: "general.establishedYear",  label: "Established Year",    currentValue: String(live.general.establishedYear) },
      { path: "general.floors",           label: "Floors",              currentValue: String(live.general.floors) },
      { path: "general.totalRooms",       label: "Total Rooms",         currentValue: String(live.general.totalRooms) },
      { path: "general.summary",          label: "Short Description",   currentValue: live.general.summary, multiline: true },
    ];
    case "location": return [
      { path: "location.country",     label: "Country",     currentValue: live.location.country, locked: true, helper: "Country is set at hotel creation and cannot be changed." },
      { path: "location.division",    label: "Division / State", currentValue: live.location.division },
      { path: "location.city",        label: "City",        currentValue: live.location.city },
      { path: "location.area",        label: "Area",        currentValue: live.location.area },
      { path: "location.address",     label: "Street Address", currentValue: live.location.address, multiline: true },
      { path: "location.postalCode",  label: "Zip / Postal Code", currentValue: live.location.postalCode },
      { path: "location.latitude",    label: "Latitude",    currentValue: String(live.location.latitude) },
      { path: "location.longitude",   label: "Longitude",   currentValue: String(live.location.longitude) },
    ];
    case "contacts": return [
      { path: "business.email",              label: "Official Email",       currentValue: live.business.email },
      { path: "contacts.receptionPhone",     label: "Reception Number 1",   currentValue: live.contacts.receptionPhone },
      { path: "contacts.emergencyPhone",     label: "Reception Number 2",   currentValue: live.contacts.emergencyPhone },
      { path: "contacts.website",            label: "Website",              currentValue: live.contacts.website },
      { path: "contacts.social.facebook",    label: "Facebook",             currentValue: live.contacts.social.find((s: any) => s.platform === "Facebook")?.url ?? "" },
      { path: "contacts.social.instagram",   label: "Instagram",            currentValue: live.contacts.social.find((s: any) => s.platform === "Instagram")?.url ?? "" },
      { path: "contacts.reservationPhone",   label: "Reservation Phone",    currentValue: live.contacts.reservationPhone },
      { path: "owner.emergencyContact",      label: "Emergency Contact",    currentValue: live.owner.emergencyContact },
    ];
    case "description": return [
      { path: "description.short", label: "Short Description", currentValue: live.description.short, multiline: true },
      { path: "description.long",  label: "Full Description",  currentValue: live.description.long, multiline: true },
      { path: "description.languages", label: "Languages Spoken", currentValue: live.description.languages.join(", "), helper: "Comma separated" },
    ];
    case "policies": return Object.entries(live.policies).map(([k, v]) => ({
      path: `policies.${k}`,
      label: k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      currentValue: String(v),
      multiline: k === "cancellation" || k === "payment" || k === "children",
    }));
    case "business": return [
      { path: "business.businessName",         label: "Business Name",           currentValue: live.business.businessName },
      { path: "business.tradeLicense",         label: "Trade License Number",    currentValue: live.business.tradeLicense },
      { path: "business.tin",                  label: "TIN",                     currentValue: live.business.tin },
      { path: "business.vat",                  label: "VAT Registration",        currentValue: live.business.vat },
      { path: "business.businessRegistration", label: "Business Registration",   currentValue: live.business.businessRegistration },
      { path: "business.businessAddress",      label: "Business Address",        currentValue: live.business.businessAddress, multiline: true },
      { path: "business.email",                label: "Official Business Email", currentValue: live.business.email },
      { path: "business.phone",                label: "Official Business Phone", currentValue: live.business.phone },
    ];
    case "owner": return [
      { path: "owner.fullName",   label: "Full Name",         currentValue: live.owner.fullName },
      { path: "owner.email",      label: "Email",             currentValue: live.owner.email },
      { path: "owner.phone",      label: "Phone",             currentValue: live.owner.phone },
      { path: "owner.nid",        label: "National ID (NID)", currentValue: live.owner.nid },
      { path: "owner.passport",   label: "Passport",          currentValue: live.owner.passport },
      { path: "owner.address",    label: "Address",           currentValue: live.owner.address, multiline: true },
    ];
    case "admin": return [
      { path: "admin.name",             label: "Admin Name",       currentValue: admin?.name  ?? "" },
      { path: "admin.email",            label: "Email",            currentValue: admin?.email ?? "", locked: true, helper: "Change email in Account Settings." },
      { path: "admin.phone",            label: "Phone",            currentValue: admin?.phone ?? "" },
      { path: "admin.emergencyPhone",   label: "Emergency Phone",  currentValue: admin?.emergencyPhone ?? "" },
      { path: "admin.dob",              label: "Date of Birth",    currentValue: admin?.dob ?? "" },
      { path: "admin.nid",              label: "National ID (NID)", currentValue: admin?.nid ?? "" },
      { path: "admin.passport",         label: "Passport",         currentValue: admin?.passport ?? "" },
      { path: "admin.address",          label: "Address",          currentValue: admin?.address ?? "", multiline: true },
    ];
    default: return [];
  }
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const pendingByPath = (draft: PendingDraft | null) => {
  const m = new Map<string, DraftField>();
  draft?.fields.forEach((f) => m.set(f.path, f));
  return m;
};

const sectionPendingCount = (draft: PendingDraft | null, prefix: string) =>
  draft?.fields.filter((f) => f.path.startsWith(prefix)).length ?? 0;

const sectionRejectedCount = (draft: PendingDraft | null, prefix: string) =>
  draft?.fields.filter((f) => f.path.startsWith(prefix) && f.review === "rejected").length ?? 0;

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

const HotelAdminPropertyListing = () => {
  const navigate = useNavigate();
  const store = useHotelStore((s) => s);
  const { live, draft, staff, documents } = store;
  const hotelAdmin = staff.find((s) => s.role === "HOTEL_ADMIN");

  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [buffer, setBuffer] = useState<Record<string, string>>({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const cd = cooldownRemainingMs(draft);
  const pendingReview = !!draft && draft.status === "submitted";
  const editingLocked = pendingReview && cd > 0;
  const hasUnsubmittedChanges = !!draft && (draft.status === "draft" || draft.status === "rejected");
  const modifiedCount = draft?.fields.length ?? 0;

  const pendingMap = useMemo(() => pendingByPath(draft), [draft]);

  /* -------- write helpers -------- */

  const writeDraft = (changes: { path: string; label: string; currentValue: string; pendingValue: string }[]) => {
    if (!changes.length) { toast({ title: "No changes to save" }); return; }
    const now = new Date().toISOString();
    updateStore((s) => {
      const existing = s.draft;
      const nextFields: DraftField[] = existing ? [...existing.fields] : [];
      changes.forEach((c) => {
        const idx = nextFields.findIndex((x) => x.path === c.path);
        // If the new pending value equals the live value, remove from draft.
        if (c.pendingValue === c.currentValue) {
          if (idx >= 0) nextFields.splice(idx, 1);
          return;
        }
        const item: DraftField = { ...c, review: "pending" };
        if (idx >= 0) nextFields[idx] = item; else nextFields.push(item);
      });
      const next: PendingDraft = existing
        ? {
            ...existing,
            fields: nextFields,
            status: existing.status === "submitted" ? "submitted" : (existing.status === "rejected" ? "draft" : existing.status),
            updatedAt: now,
            timeline: [...existing.timeline, { at: now, label: `${changes.length} field${changes.length === 1 ? "" : "s"} updated`, by: hotelAdmin?.name ?? "Hotel Admin" }],
          }
        : {
            id: `draft-${Date.now()}`,
            status: "draft",
            fields: nextFields,
            createdAt: now,
            updatedAt: now,
            timeline: [
              { at: now, label: "Draft created", by: hotelAdmin?.name ?? "Hotel Admin" },
              { at: now, label: `${changes.length} field${changes.length === 1 ? "" : "s"} updated`, by: hotelAdmin?.name ?? "Hotel Admin" },
            ],
          };
      return { ...s, draft: nextFields.length === 0 ? null : next };
    });
  };

  const submitForReview = () => {
    if (!draft || !hasUnsubmittedChanges) return;
    const now = new Date().toISOString();
    updateStore((s) => ({
      ...s,
      draft: s.draft ? {
        ...s.draft,
        status: "submitted",
        submittedAt: now,
        cooldownUntil: new Date(Date.now() + 24 * 3600000).toISOString(),
        fields: s.draft.fields.map((f) => ({ ...f, review: "pending", feedback: undefined })),
        timeline: [...s.draft.timeline, { at: now, label: "Submitted for review", by: hotelAdmin?.name ?? "Hotel Admin" }],
      } : s.draft,
    }));
    toast({ title: "Submitted for review", description: "Editing is locked for 24 hours while your changes are reviewed." });
    setConfirmSubmit(false);
  };

  const discardDraft = () => {
    updateStore((s) => ({ ...s, draft: null }));
    toast({ title: "Draft discarded" });
    setConfirmDiscard(false);
  };

  /* -------- render -------- */

  const sectionPrefixMap: Record<SectionKey, string> = {
    general: "general.", location: "location.", contacts: "contacts.",
    description: "description.", amenities: "amenities", gallery: "gallery",
    policies: "policies.", business: "business.", owner: "owner.",
    admin: "admin.", documents: "documents.",
  };

  return (
    <div className="space-y-6">
      {/* Header ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 animate-fade-in-up">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Property</h1>
          <p className="text-muted-foreground text-sm max-w-2xl mt-1">
            Manage every aspect of your hotel's public information. Changes are first saved as Drafts.
            Submitting creates <span className="font-medium text-foreground">one Review Case</span> that will be reviewed by the System Admin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/hotel-admin/drafts")}>
            <ClipboardList className="h-4 w-4 mr-2" /> Draft Center
          </Button>
          {hasUnsubmittedChanges && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmDiscard(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Discard Draft
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={!hasUnsubmittedChanges} onClick={() => toast({ title: "Draft saved", description: `${modifiedCount} field${modifiedCount === 1 ? "" : "s"} kept in draft.` })}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button
            variant="hero"
            size="sm"
            disabled={!hasUnsubmittedChanges}
            onClick={() => setConfirmSubmit(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit For Review
          </Button>
        </div>
      </div>

      {/* Pending review banner ------------------------------------ */}
      {pendingReview && (
        <PendingReviewBanner draft={draft!} cd={cd} onOpen={() => navigate("/hotel-admin/drafts")} />
      )}

      {/* Unsubmitted draft chip ------------------------------------ */}
      {!pendingReview && hasUnsubmittedChanges && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent px-5 py-4 flex items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">You have {modifiedCount} unsubmitted change{modifiedCount === 1 ? "" : "s"}</p>
              <p className="text-xs text-muted-foreground">All edits accumulate into a single draft. Submitting creates one Review Case.</p>
            </div>
          </div>
          <Button variant="hero" size="sm" onClick={() => setConfirmSubmit(true)}>
            <Send className="h-4 w-4 mr-2" /> Submit For Review
          </Button>
        </div>
      )}

      {/* Live hero snapshot ---------------------------------------- */}
      <PropertyHero live={live} pendingMap={pendingMap} />

      {/* Section grid ---------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {SECTIONS.map((s, i) => {
          const prefix = sectionPrefixMap[s.key];
          const pCount = sectionPendingCount(draft, prefix);
          const rCount = sectionRejectedCount(draft, prefix);
          return (
            <div
              key={s.key}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <SectionShell
                meta={s}
                pendingCount={pCount}
                rejectedCount={rCount}
                editingLocked={editingLocked}
                onEdit={() => { setBuffer({}); setOpenSection(s.key); }}
              >
                <SectionPreview
                  sectionKey={s.key}
                  live={live}
                  admin={hotelAdmin}
                  documents={documents}
                  pendingMap={pendingMap}
                />
              </SectionShell>
            </div>
          );
        })}
      </div>

      {/* Drawer ---------------------------------------------------- */}
      <EditSectionDrawer
        section={openSection}
        onClose={() => setOpenSection(null)}
        live={live}
        admin={hotelAdmin}
        buffer={buffer}
        setBuffer={setBuffer}
        pendingMap={pendingMap}
        editingLocked={editingLocked}
        onSave={(fields) => {
          const changes = fields
            .filter((f) => !f.locked)
            .map((f) => {
              const pending = pendingMap.get(f.path);
              const baseline = f.currentValue; // live value stays the baseline for diff
              const raw = buffer[f.path];
              const proposed = raw !== undefined ? raw : (pending?.pendingValue ?? baseline);
              return { path: f.path, label: f.label, currentValue: baseline, pendingValue: proposed };
            })
            .filter((c) => c.pendingValue !== c.currentValue || pendingMap.has(c.path));
          writeDraft(changes);
          toast({ title: "Changes saved to draft", description: "Live listing untouched — submit when ready." });
          setOpenSection(null);
        }}
      />

      {/* Confirms -------------------------------------------------- */}
      <ConfirmDialog
        open={confirmSubmit}
        onOpenChange={setConfirmSubmit}
        title="Submit draft for review?"
        description={`This will create one Review Case containing ${modifiedCount} field${modifiedCount === 1 ? "" : "s"}. Editing will be locked for 24 hours while the System Admin reviews your changes.`}
        confirmLabel="Submit"
        onConfirm={submitForReview}
      />
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard this draft?"
        description="Are you sure you want to discard all pending changes? This cannot be undone."
        variant="destructive"
        confirmLabel="Discard"
        onConfirm={discardDraft}
      />
    </div>
  );
};

export default HotelAdminPropertyListing;

/* ================================================================== */
/* Pending review banner                                              */
/* ================================================================== */

const PendingReviewBanner = ({
  draft, cd, onOpen,
}: { draft: PendingDraft; cd: number; onOpen: () => void }) => {
  const hrs = Math.floor(cd / 3600000);
  const mins = Math.floor((cd % 3600000) / 60000);
  const locked = cd > 0;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-base">Pending Review</p>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-background/60 border border-border">
                Case #{draft.id.slice(-6)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Your latest property changes are currently under review.
              {locked
                ? <> You may continue editing after the <span className="font-medium text-foreground">24 hour cooldown</span>.</>
                : <> The cooldown has ended — new edits will update the same pending review case.</>}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3" /> {draft.fields.length} field{draft.fields.length === 1 ? "" : "s"}</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> {draft.fields.filter(f => f.review === "approved").length} approved</span>
              <span className="inline-flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> {draft.fields.filter(f => f.review === "rejected").length} rejected</span>
              {draft.submittedAt && <span>· Submitted {formatDateTime(draft.submittedAt)}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {locked && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cooldown</p>
              <p className="font-mono text-lg font-bold text-amber-600">{hrs}h {mins}m</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={onOpen}>
            <Eye className="h-4 w-4 mr-2" /> Open Review Case
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* Hero snapshot                                                       */
/* ================================================================== */

const PropertyHero = ({ live, pendingMap }: { live: any; pendingMap: Map<string, DraftField> }) => {
  const pendingName = pendingMap.get("general.name")?.pendingValue;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 animate-fade-in-up">
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shrink-0">
          <Hotel className="h-9 w-9 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold truncate">{live.general.name}</h2>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: live.general.starRating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          {pendingName && (
            <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/30 rounded-md px-2 py-0.5">
              Pending: <span className="font-medium">{pendingName}</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">{live.general.summary}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {live.location.area}, {live.location.city}</span>
            <span>{live.general.type}</span>
            <span>{live.general.totalRooms} rooms · {live.general.floors} floors</span>
            <span>Est. {live.general.establishedYear}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle2 className="h-3 w-3" /> LIVE
          </span>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* Section shell (title, status, edit btn, body)                       */
/* ================================================================== */

const SectionShell = ({
  meta, pendingCount, rejectedCount, editingLocked, onEdit, children,
}: {
  meta: SectionMeta;
  pendingCount: number;
  rejectedCount: number;
  editingLocked: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}) => {
  const status = rejectedCount > 0
    ? { label: `${rejectedCount} Rejected Change${rejectedCount === 1 ? "" : "s"}`, tone: "red" as const, Icon: AlertTriangle }
    : pendingCount > 0
      ? { label: `${pendingCount} Pending Change${pendingCount === 1 ? "" : "s"}`, tone: "amber" as const, Icon: Clock }
      : { label: "LIVE", tone: "green" as const, Icon: CheckCircle2 };

  const toneClass = {
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    red:   "bg-destructive/10 text-destructive border-destructive/20",
  }[status.tone];

  return (
    <Card className="group relative overflow-hidden hover-lift transition-all border-border/60 bg-card/60 backdrop-blur-sm h-full">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60", meta.accent)} />
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shrink-0", meta.accent)}>
              <meta.icon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{meta.title}</p>
                {meta.requiresApproval && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    <ShieldCheck className="h-2.5 w-2.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border", toneClass)}>
              <status.Icon className="h-3 w-3" /> {status.label}
            </span>
          </div>
        </div>

        <div className="flex-1">{children}</div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {editingLocked ? "Edits unlock after cooldown" : "Edits are saved as draft"}
          </p>
          <Button variant="outline" size="sm" onClick={onEdit} disabled={editingLocked}>
            {editingLocked ? <><Lock className="h-3.5 w-3.5 mr-1.5" /> Locked</> : <><Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* ================================================================== */
/* Section preview bodies (READ ONLY, beautiful)                       */
/* ================================================================== */

const Row = ({
  label, value, pending,
}: { label: string; value: React.ReactNode; pending?: string }) => (
  <div className="min-w-0">
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <div className="text-sm font-medium truncate mt-0.5">{value || <span className="text-muted-foreground/60">—</span>}</div>
    {pending !== undefined && pending !== String(value ?? "") && (
      <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">
        <ArrowRight className="h-3 w-3" /> {pending}
      </div>
    )}
  </div>
);

const SectionPreview = ({
  sectionKey, live, admin, documents, pendingMap,
}: {
  sectionKey: SectionKey;
  live: any;
  admin: any;
  documents: any[];
  pendingMap: Map<string, DraftField>;
}) => {
  const p = (path: string) => pendingMap.get(path)?.pendingValue;

  switch (sectionKey) {
    case "general":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Row label="Hotel Name" value={live.general.name} pending={p("general.name")} />
          <Row label="Hotel Type" value={live.general.type} pending={p("general.type")} />
          <Row label="Star Rating"
               value={<span className="inline-flex items-center gap-0.5">{Array.from({ length: live.general.starRating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</span>}
               pending={p("general.starRating")} />
          <Row label="Category" value={live.general.category} pending={p("general.category")} />
          <Row label="Floors" value={live.general.floors} pending={p("general.floors")} />
          <Row label="Total Rooms" value={live.general.totalRooms} pending={p("general.totalRooms")} />
          <Row label="Established" value={live.general.establishedYear} pending={p("general.establishedYear")} />
        </div>
      );

    case "location":
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-secondary/30 h-32 overflow-hidden relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative flex flex-col items-center gap-2 z-10">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{Number(live.location.latitude).toFixed(4)}, {Number(live.location.longitude).toFixed(4)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Row label="Country" value={live.location.country} />
            <Row label="City" value={live.location.city} pending={p("location.city")} />
            <Row label="Division" value={live.location.division} pending={p("location.division")} />
            <Row label="Area" value={live.location.area} pending={p("location.area")} />
            <div className="col-span-2">
              <Row label="Address" value={`${live.location.address}, ${live.location.postalCode}`} pending={p("location.address")} />
            </div>
          </div>
        </div>
      );

    case "contacts": {
      const socials = live.contacts.social ?? [];
      const fb = socials.find((s: any) => s.platform === "Facebook")?.url;
      const ig = socials.find((s: any) => s.platform === "Instagram")?.url;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <ContactRow icon={Mail}       label="Email"     value={live.business.email}          pending={p("business.email")} />
            <ContactRow icon={Phone}      label="Reception" value={live.contacts.receptionPhone} pending={p("contacts.receptionPhone")} />
            <ContactRow icon={Phone}      label="Reservations" value={live.contacts.reservationPhone} pending={p("contacts.reservationPhone")} />
            <ContactRow icon={Globe}      label="Website"   value={live.contacts.website}        pending={p("contacts.website")} />
            <ContactRow icon={Facebook}   label="Facebook"  value={fb}  pending={p("contacts.social.facebook")} />
            <ContactRow icon={Instagram}  label="Instagram" value={ig}  pending={p("contacts.social.instagram")} />
          </div>
        </div>
      );
    }

    case "description":
      return (
        <div className="space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Short</p>
            <p className="text-sm">{live.description.short}</p>
            {p("description.short") && <PendingBlock value={p("description.short")!} />}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Full</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{live.description.long}</p>
            {p("description.long") && <PendingBlock value={p("description.long")!} />}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {live.description.languages.map((l: string) => (
              <span key={l} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">{l}</span>
            ))}
          </div>
        </div>
      );

    case "amenities": {
      const items = live.amenities as string[];
      return (
        <div className="flex flex-wrap gap-1.5">
          {items.slice(0, 12).map((a) => (
            <span key={a} className="text-[11px] px-2.5 py-1 rounded-full bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 text-foreground border border-fuchsia-500/20">
              {a}
            </span>
          ))}
          {items.length > 12 && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
              +{items.length - 12} more
            </span>
          )}
        </div>
      );
    }

    case "gallery": {
      const gallery = (live.gallery?.length ? live.gallery : ["ph1","ph2","ph3","ph4","ph5"]) as string[];
      return (
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2 row-span-2 aspect-square rounded-xl bg-gradient-to-br from-orange-500/30 via-amber-500/20 to-rose-500/30 flex items-center justify-center relative overflow-hidden">
            <ImageIcon className="h-8 w-8 text-white/40" />
            <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-black/40 text-white">Cover</span>
          </div>
          {gallery.slice(0, 4).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-secondary to-secondary/50 border border-border/60 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      );
    }

    case "policies":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Row label="Check-in" value={live.policies.checkIn} pending={p("policies.checkIn")} />
          <Row label="Check-out" value={live.policies.checkOut} pending={p("policies.checkOut")} />
          <Row label="Children" value={live.policies.children} pending={p("policies.children")} />
          <Row label="Smoking" value={live.policies.smoking} pending={p("policies.smoking")} />
          <Row label="Pets" value={live.policies.pets} pending={p("policies.pets")} />
          <Row label="Extra Bed" value={live.policies.extraBed} pending={p("policies.extraBed")} />
        </div>
      );

    case "business":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Row label="Business Name" value={live.business.businessName} pending={p("business.businessName")} />
          <Row label="Trade License" value={live.business.tradeLicense} pending={p("business.tradeLicense")} />
          <Row label="TIN" value={live.business.tin} pending={p("business.tin")} />
          <Row label="VAT" value={live.business.vat} pending={p("business.vat")} />
          <div className="col-span-2">
            <Row label="Business Address" value={live.business.businessAddress} pending={p("business.businessAddress")} />
          </div>
        </div>
      );

    case "owner":
      return (
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shrink-0">
            <UserCircle2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1 min-w-0">
            <Row label="Full Name" value={live.owner.fullName} pending={p("owner.fullName")} />
            <Row label="Phone" value={live.owner.phone} pending={p("owner.phone")} />
            <Row label="Email" value={live.owner.email} pending={p("owner.email")} />
            <Row label="NID" value={live.owner.nid} pending={p("owner.nid")} />
          </div>
        </div>
      );

    case "admin":
      return (
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1 min-w-0">
            <Row label="Admin Name" value={admin?.name} pending={p("admin.name")} />
            <Row label="Email" value={admin?.email} />
            <Row label="Phone" value={admin?.phone} pending={p("admin.phone")} />
            <Row label="Last Login" value={admin?.lastLoginAt ? formatDate(admin.lastLoginAt) : "—"} />
          </div>
        </div>
      );

    case "documents":
      return (
        <div className="grid grid-cols-2 gap-2">
          {documents.slice(0, 4).map((d) => (
            <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-secondary/30 min-w-0">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                d.status === "verified" ? "bg-green-500/10 text-green-500" :
                d.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                "bg-destructive/10 text-destructive",
              )}>
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{d.label}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{d.status}{d.expiryDate ? ` · exp ${formatDate(d.expiryDate)}` : ""}</p>
              </div>
            </div>
          ))}
          {documents.length > 4 && (
            <div className="col-span-2 text-center text-[11px] text-muted-foreground pt-1">
              +{documents.length - 4} more documents
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

const ContactRow = ({
  icon: Icon, label, value, pending,
}: { icon: any; label: string; value?: string; pending?: string }) => (
  <div className="flex items-center gap-3 min-w-0">
    <div className="w-7 h-7 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm truncate">{value || <span className="text-muted-foreground/60">—</span>}</p>
    </div>
    {pending && pending !== value && (
      <div className="text-[10px] text-amber-600 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5 inline-flex items-center gap-1 shrink-0">
        <ArrowRight className="h-3 w-3" /> {pending}
      </div>
    )}
  </div>
);

const PendingBlock = ({ value }: { value: string }) => (
  <div className="mt-1.5 flex items-start gap-2 text-xs text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded-md p-2">
    <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5" />
    <p className="line-clamp-3">{value}</p>
  </div>
);

/* ================================================================== */
/* Edit drawer                                                         */
/* ================================================================== */

const EditSectionDrawer = ({
  section, onClose, live, admin, buffer, setBuffer, pendingMap, editingLocked, onSave,
}: {
  section: SectionKey | null;
  onClose: () => void;
  live: any;
  admin: any;
  buffer: Record<string, string>;
  setBuffer: (v: Record<string, string>) => void;
  pendingMap: Map<string, DraftField>;
  editingLocked: boolean;
  onSave: (fields: FieldDef[]) => void;
}) => {
  const meta = section ? SECTIONS.find((s) => s.key === section)! : null;
  const fields = useMemo(() => section ? fieldsFor(section, live, admin) : [], [section, live, admin]);

  if (!section || !meta) return null;

  const specialGallery = section === "gallery";
  const specialAmenities = section === "amenities";
  const specialDocuments = section === "documents";

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shrink-0", meta.accent)}>
              <meta.icon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <SheetTitle>Edit {meta.title}</SheetTitle>
              <SheetDescription className="mt-0.5">
                Changes are saved to your draft — not to the live listing.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Notices */}
        <div className="px-6 pt-4 space-y-3">
          {editingLocked && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 p-3 text-xs flex gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              Editing is temporarily locked while your current draft is under review.
            </div>
          )}
          {meta.requiresApproval && !editingLocked && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-700 p-3 text-xs flex gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {meta.approvalNote}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {specialGallery ? (
            <GalleryEditor />
          ) : specialAmenities ? (
            <AmenitiesEditor live={live} />
          ) : specialDocuments ? (
            <DocumentsEditor />
          ) : (
            fields.map((f) => (
              <FieldEditor
                key={f.path}
                field={f}
                pending={pendingMap.get(f.path)?.pendingValue}
                bufferValue={buffer[f.path]}
                onChange={(v) => setBuffer({ ...buffer, [f.path]: v })}
                disabled={editingLocked || f.locked}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between gap-3 bg-background/60 backdrop-blur">
          <p className="text-[11px] text-muted-foreground">
            {editingLocked ? "Locked" : "Live values remain active until approval"}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="hero" onClick={() => onSave(fields)} disabled={editingLocked || specialGallery || specialDocuments}>
              <Save className="h-4 w-4 mr-2" /> Save Draft
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

/* ---- Field editor: Current → New visual ---- */

const FieldEditor = ({
  field, pending, bufferValue, onChange, disabled,
}: {
  field: FieldDef;
  pending?: string;
  bufferValue?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  const displayed = bufferValue ?? pending ?? field.currentValue;
  const isDirty = displayed !== field.currentValue;
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{field.label}</Label>
        {isDirty && !field.locked && (
          <span className="text-[10px] uppercase tracking-wide text-amber-600 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">Changed</span>
        )}
        {field.locked && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5 inline-flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" /> Locked
          </span>
        )}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Current (live)</p>
        <div className="text-sm bg-muted/50 rounded-md px-3 py-2 border border-border/60 min-h-[36px]">
          {field.currentValue || <span className="text-muted-foreground/60">—</span>}
        </div>
      </div>

      {!field.locked && (
        <>
          <div className="flex items-center justify-center py-0.5">
            <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <ArrowRight className="h-3 w-3 rotate-90" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">New value</p>
            {field.multiline ? (
              <Textarea rows={4} value={displayed} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
            ) : (
              <Input value={displayed} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
            )}
            {field.helper && <p className="text-[10px] text-muted-foreground mt-1">{field.helper}</p>}
          </div>
        </>
      )}
      {field.locked && field.helper && (
        <p className="text-[10px] text-muted-foreground">{field.helper}</p>
      )}
    </div>
  );
};

const GalleryEditor = () => (
  <div className="space-y-4">
    <div className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 bg-secondary/20">
      <Camera className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">Cover photo</p>
      <Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5 mr-1.5" /> Replace</Button>
    </div>
    <p className="text-xs text-muted-foreground">
      Replacing photos creates pending gallery changes. Your live gallery remains active until approval.
    </p>
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-secondary/50 border border-border flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      ))}
      <button className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-emerald-500 transition">
        <Upload className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const AmenitiesEditor = ({ live }: { live: any }) => {
  const groups = ["Basics", "Room", "Facilities", "Food & Drink", "Services", "Entertainment"];
  const all = live.amenities as string[];
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g}>
          <p className="text-xs font-semibold mb-2">{g}</p>
          <div className="flex flex-wrap gap-1.5">
            {all.map((a) => (
              <span key={`${g}-${a}`} className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                {a}
              </span>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Amenities editor is a placeholder — full picker coming soon.</p>
    </div>
  );
};

const DocumentsEditor = () => (
  <div className="space-y-3">
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-700 p-3 text-xs flex gap-2">
      <ShieldCheck className="h-4 w-4 shrink-0" />
      Replacing any document creates a pending change. Live document remains active until approval.
    </div>
    <p className="text-xs text-muted-foreground">
      Manage individual documents from the Documents page.
    </p>
    <Button variant="outline" size="sm" onClick={() => window.location.assign("/hotel-admin/documents")}>
      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open Documents
    </Button>
  </div>
);
