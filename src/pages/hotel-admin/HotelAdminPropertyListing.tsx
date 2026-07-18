import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hotel, MapPin, Phone, FileText, Image, Sparkles, Languages, MapPinned,
  Search, Edit3, Eye, Lock, ShieldCheck, ClipboardList, User as UserIcon, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionCard, StatusPill, DraftBanner, EditDrawer } from "@/components/hotel-admin/primitives";
import { toast } from "@/hooks/use-toast";
import {
  useHotelStore, cooldownRemainingMs, updateStore, DraftField, PendingDraft,
  isProtectedField, submitVerificationRequest,
} from "@/data/hotelAdminStore";

type SectionKey =
  | "general" | "business" | "owner" | "bank" | "location" | "contacts" | "description"
  | "amenities" | "gallery" | "policies" | "languages" | "attractions" | "seo";

type FieldDef = { path: string; label: string; currentValue: string; multiline?: boolean };

const SECTIONS: {
  key: SectionKey; title: string; icon: any; description: string; protected?: boolean;
  scope?: "business" | "owner" | "bank" | "location" | "general";
}[] = [
  { key: "general", title: "General Information", icon: Hotel, description: "Name, type, star rating, size, floors, category" },
  { key: "business", title: "Business Information", icon: ShieldCheck, description: "Business name, licenses, TIN, VAT", protected: true, scope: "business" },
  { key: "owner", title: "Owner Information", icon: UserIcon, description: "Owner identity and emergency contact", protected: true, scope: "owner" },
  { key: "bank", title: "Bank Information", icon: Landmark, description: "Payout account and routing", protected: true, scope: "bank" },
  { key: "location", title: "Location", icon: MapPin, description: "Address, city, coordinates" },
  { key: "contacts", title: "Contacts", icon: Phone, description: "Reservation, reception, emergency numbers, social" },
  { key: "description", title: "Description", icon: FileText, description: "Long and short property description" },
  { key: "amenities", title: "Amenities", icon: Sparkles, description: "Grouped, searchable amenity picker" },
  { key: "gallery", title: "Gallery", icon: Image, description: "Property photos and reorder" },
  { key: "policies", title: "Policies", icon: ClipboardList, description: "Check-in, cancellation, children, pets, smoking" },
  { key: "languages", title: "Languages", icon: Languages, description: "Spoken at reception" },
  { key: "attractions", title: "Nearby Attractions", icon: MapPinned, description: "Distance to landmarks" },
  { key: "seo", title: "SEO", icon: Search, description: "Meta title, description, keywords" },
];

const HotelAdminPropertyListing = () => {
  const navigate = useNavigate();
  const store = useHotelStore((s) => s);
  const { live, draft, verificationRequests } = store;
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [buffer, setBuffer] = useState<Record<string, string>>({});
  const [verify, setVerify] = useState<{ field: string; label: string; current: string; scope: SectionKey } | null>(null);
  const [verifyValue, setVerifyValue] = useState("");
  const [verifyReason, setVerifyReason] = useState("");

  const cd = cooldownRemainingMs(draft);
  const editingLocked = !!draft && draft.status === "submitted" && cd > 0;

  const pendingReqs = verificationRequests.filter((r) => r.status === "pending");

  const openEdit = (key: SectionKey) => {
    setBuffer({});
    setOpenSection(key);
  };

  const saveDraftFields = (fields: FieldDef[], values: Record<string, string>) => {
    const now = new Date().toISOString();
    const changes = fields
      .map((f) => ({
        path: f.path, label: f.label, currentValue: f.currentValue,
        pendingValue: values[f.path] ?? f.currentValue,
      }))
      .filter((f) => f.pendingValue !== f.currentValue && !isProtectedField(f.path));
    if (!changes.length) { toast({ title: "No changes to save" }); return; }
    updateStore((s) => {
      const existing = s.draft;
      const nextFields: DraftField[] = existing ? [...existing.fields] : [];
      changes.forEach((f) => {
        const idx = nextFields.findIndex((x) => x.path === f.path);
        const item: DraftField = { ...f, review: "pending" };
        if (idx >= 0) nextFields[idx] = item; else nextFields.push(item);
      });
      const nextDraft: PendingDraft = existing
        ? { ...existing, fields: nextFields, updatedAt: now, timeline: [...existing.timeline, { at: now, label: `${changes.length} field(s) updated`, by: "Maria Garcia" }] }
        : {
            id: `draft-${Date.now()}`, status: "draft", fields: nextFields,
            createdAt: now, updatedAt: now,
            timeline: [{ at: now, label: "Draft created", by: "Maria Garcia" }],
          };
      return { ...s, draft: nextDraft };
    });
    toast({ title: "Saved to Draft", description: "Changes are pending review — Live listing is untouched." });
    setOpenSection(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Property</h1>
          <p className="text-muted-foreground text-sm">Manage what guests see on your public listing. Every edit updates the same pending draft — protected fields go through Verification Requests instead.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/hotel-admin/documents")}>
            <ShieldCheck className="h-4 w-4 mr-2" /> Documents
          </Button>
          <Button variant="hero" size="sm" onClick={() => navigate("/hotel-admin/drafts")}>
            <ClipboardList className="h-4 w-4 mr-2" /> Draft Center
          </Button>
        </div>
      </div>

      <DraftBanner
        hasDraft={!!draft}
        cooldownRemainingMs={cd}
        modifiedCount={draft?.fields.length ?? 0}
        status={draft?.status ?? "none"}
        onOpen={() => navigate("/hotel-admin/drafts")}
      />

      {pendingReqs.length > 0 && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{pendingReqs.length} verification {pendingReqs.length === 1 ? "request" : "requests"} pending</p>
              <p className="text-xs text-muted-foreground">Protected-field changes awaiting system admin verification.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/hotel-admin/drafts")}>Review</Button>
        </div>
      )}

      <SectionCard title="Live Snapshot" description="What guests currently see" icon={Eye}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Snap label="Hotel Name" value={live.general.name} />
          <Snap label="Type" value={live.general.type} />
          <Snap label="Rating" value={`${live.general.starRating}★`} />
          <Snap label="Status" value={<StatusPill label={live.general.businessStatus} tone={live.general.businessStatus === "active" ? "green" : "amber"} />} />
          <Snap label="Location" value={`${live.location.city}, ${live.location.country}`} />
          <Snap label="Total Rooms" value={live.general.totalRooms} />
          <Snap label="Amenities" value={`${live.amenities.length}`} />
          <Snap label="Languages" value={live.languages.join(", ")} />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => {
          const pendingCount = draft?.fields.filter((f) => f.path.startsWith(s.key)).length || 0;
          return (
            <Card key={s.key} className="hover-lift">
              <CardContent className="p-5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shrink-0">
                    <s.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{s.title}</p>
                      {s.protected && <StatusPill label="Protected" tone="purple" icon={Lock} />}
                      {pendingCount > 0 && <StatusPill label={`${pendingCount} pending`} tone="amber" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(s.key)} disabled={editingLocked && !s.protected}>
                    {s.protected ? (<><Eye className="h-4 w-4 mr-1" /> View</>) : (<><Edit3 className="h-4 w-4 mr-1" /> Edit</>)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SectionEditor
        section={openSection}
        onClose={() => setOpenSection(null)}
        onSave={saveDraftFields}
        live={live}
        buffer={buffer}
        setBuffer={setBuffer}
        locked={editingLocked}
        onRequestVerify={(f) => { setVerify({ ...f, scope: openSection! }); setVerifyValue(""); setVerifyReason(""); setOpenSection(null); }}
      />

      <EditDrawer
        open={!!verify}
        onOpenChange={(v) => !v && setVerify(null)}
        title={verify ? `Request Update — ${verify.label}` : "Request Update"}
        description="Protected fields require system admin verification. Submit a request with the new value and reason."
        saveLabel="Submit Request"
        disabled={!verifyValue.trim() || !verifyReason.trim()}
        onSave={() => {
          if (!verify) return;
          submitVerificationRequest({
            scope: verify.scope === "business" || verify.scope === "owner" || verify.scope === "bank" || verify.scope === "location" || verify.scope === "general" ? verify.scope : "business",
            field: verify.field,
            label: verify.label,
            currentValue: verify.current,
            requestedValue: verifyValue,
            reason: verifyReason,
          });
          toast({ title: "Verification request submitted", description: "System admin will review and verify your change." });
          setVerify(null);
        }}
      >
        {verify && (
          <>
            <div>
              <Label className="text-xs">Current Value</Label>
              <div className="mt-1 text-sm bg-muted/50 rounded-md px-3 py-2 border border-border">{verify.current || "—"}</div>
            </div>
            <div>
              <Label className="text-xs">Requested Value</Label>
              <Input value={verifyValue} onChange={(e) => setVerifyValue(e.target.value)} placeholder="New value" />
            </div>
            <div>
              <Label className="text-xs">Reason</Label>
              <Textarea rows={4} value={verifyReason} onChange={(e) => setVerifyReason(e.target.value)} placeholder="Explain why this change is needed…" />
            </div>
          </>
        )}
      </EditDrawer>
    </div>
  );
};

const Snap = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="font-medium">{value}</div>
  </div>
);

const fieldsFor = (section: SectionKey, live: any): FieldDef[] => {
  switch (section) {
    case "general": return [
      { path: "general.name", label: "Hotel Name", currentValue: live.general.name },
      { path: "general.type", label: "Hotel Type", currentValue: live.general.type },
      { path: "general.category", label: "Property Category", currentValue: live.general.category },
      { path: "general.starRating", label: "Star Rating", currentValue: String(live.general.starRating) },
      { path: "general.propertySize", label: "Property Size (m²)", currentValue: String(live.general.propertySize) },
      { path: "general.floors", label: "Total Floors", currentValue: String(live.general.floors) },
      { path: "general.totalRooms", label: "Total Rooms", currentValue: String(live.general.totalRooms) },
      { path: "general.establishedYear", label: "Established Year", currentValue: String(live.general.establishedYear) },
      { path: "general.summary", label: "Short Description", currentValue: live.general.summary, multiline: true },
    ];
    case "business": return [
      { path: "business.businessName", label: "Business Name", currentValue: live.business.businessName },
      { path: "business.tradeLicense", label: "Trade License Number", currentValue: live.business.tradeLicense },
      { path: "business.businessRegistration", label: "Business Registration", currentValue: live.business.businessRegistration },
      { path: "business.tin", label: "TIN", currentValue: live.business.tin },
      { path: "business.vat", label: "VAT", currentValue: live.business.vat },
      { path: "business.email", label: "Official Email", currentValue: live.business.email },
      { path: "business.phone", label: "Official Phone", currentValue: live.business.phone },
      { path: "business.website", label: "Official Website", currentValue: live.business.website },
      { path: "business.businessAddress", label: "Business Address", currentValue: live.business.businessAddress, multiline: true },
    ];
    case "owner": return [
      { path: "owner.fullName", label: "Owner Full Name", currentValue: live.owner.fullName },
      { path: "owner.email", label: "Owner Email", currentValue: live.owner.email },
      { path: "owner.phone", label: "Owner Phone", currentValue: live.owner.phone },
      { path: "owner.nid", label: "National ID", currentValue: live.owner.nid },
      { path: "owner.passport", label: "Passport", currentValue: live.owner.passport },
      { path: "owner.address", label: "Owner Address", currentValue: live.owner.address, multiline: true },
      { path: "owner.emergencyContact", label: "Emergency Contact", currentValue: live.owner.emergencyContact },
    ];
    case "bank": return [
      { path: "bank.accountName", label: "Account Name", currentValue: live.bank.accountName },
      { path: "bank.bankName", label: "Bank Name", currentValue: live.bank.bankName },
      { path: "bank.branch", label: "Branch", currentValue: live.bank.branch },
      { path: "bank.routing", label: "Routing Number", currentValue: live.bank.routing },
      { path: "bank.accountNumber", label: "Account Number", currentValue: live.bank.accountNumber },
    ];
    case "location": return [
      { path: "location.address", label: "Address", currentValue: live.location.address },
      { path: "location.division", label: "Division / State", currentValue: live.location.division },
      { path: "location.city", label: "City", currentValue: live.location.city },
      { path: "location.area", label: "Area", currentValue: live.location.area },
      { path: "location.country", label: "Country", currentValue: live.location.country },
      { path: "location.postalCode", label: "Postal Code", currentValue: live.location.postalCode },
      { path: "location.latitude", label: "Latitude", currentValue: String(live.location.latitude) },
      { path: "location.longitude", label: "Longitude", currentValue: String(live.location.longitude) },
    ];
    case "contacts": return [
      { path: "contacts.reservationPhone", label: "Reservation Phone", currentValue: live.contacts.reservationPhone },
      { path: "contacts.receptionPhone", label: "Reception Phone", currentValue: live.contacts.receptionPhone },
      { path: "contacts.emergencyPhone", label: "Emergency / Support Phone", currentValue: live.contacts.emergencyPhone },
      { path: "contacts.email", label: "Email", currentValue: live.contacts.email },
      { path: "contacts.website", label: "Website", currentValue: live.contacts.website },
    ];
    case "description": return [
      { path: "description.short", label: "Short Description", currentValue: live.description.short, multiline: true },
      { path: "description.long", label: "Long Description", currentValue: live.description.long, multiline: true },
    ];
    case "policies": return Object.entries(live.policies).map(([k, v]) => ({
      path: `policies.${k}`, label: k.charAt(0).toUpperCase() + k.slice(1), currentValue: String(v), multiline: true,
    }));
    case "seo": return [
      { path: "seo.title", label: "Meta Title", currentValue: live.seo.title },
      { path: "seo.description", label: "Meta Description", currentValue: live.seo.description, multiline: true },
      { path: "seo.keywords", label: "Keywords", currentValue: live.seo.keywords },
    ];
    case "amenities": return [{ path: "amenities", label: "Amenities", currentValue: `${live.amenities.length} amenities` }];
    case "gallery": return [{ path: "gallery", label: "Gallery", currentValue: `${live.gallery.length} photos` }];
    case "languages": return [{ path: "languages", label: "Languages", currentValue: live.languages.join(", ") }];
    case "attractions": return [{ path: "attractions", label: "Nearby Attractions", currentValue: `${live.nearbyAttractions.length} places` }];
    default: return [];
  }
};

const SectionEditor = ({
  section, onClose, onSave, live, buffer, setBuffer, locked, onRequestVerify,
}: {
  section: SectionKey | null; onClose: () => void;
  onSave: (fields: FieldDef[], values: Record<string, string>) => void;
  live: any; buffer: Record<string, string>; setBuffer: (v: Record<string, string>) => void; locked: boolean;
  onRequestVerify: (f: { field: string; label: string; current: string }) => void;
}) => {
  const fields = useMemo(() => section ? fieldsFor(section, live) : [], [section, live]);
  if (!section) return null;
  const meta = SECTIONS.find((s) => s.key === section)!;

  return (
    <EditDrawer
      open
      onOpenChange={(v) => !v && onClose()}
      title={meta.title}
      description={meta.protected
        ? "Every field here is protected. Use Request Update to submit a verification request per field."
        : "Changes are saved to your pending draft — not the live listing."}
      onSave={() => onSave(fields, buffer)}
      disabled={locked || meta.protected}
      saveLabel={meta.protected ? "Protected" : locked ? "Editing locked" : "Save to Draft"}
    >
      {locked && !meta.protected && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-700 p-3 text-xs">
          Editing is temporarily locked while your current draft is under review.
        </div>
      )}
      {meta.protected && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 text-purple-600 p-3 text-xs">
          These fields cannot be edited directly. Click "Request Update" beside any field to create a verification request.
        </div>
      )}
      <div className="space-y-4">
        {fields.map((f) => {
          const protectedField = isProtectedField(f.path);
          return (
            <div key={f.path} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs">{f.label}</Label>
                {protectedField && (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-purple-600" onClick={() => onRequestVerify({ field: f.path, label: f.label, current: f.currentValue })}>
                    Request Update
                  </Button>
                )}
              </div>
              {protectedField ? (
                <div className="text-sm bg-muted/40 rounded-md px-3 py-2 border border-border/60 flex items-center gap-2">
                  <Lock className="h-3 w-3 text-purple-600 shrink-0" />
                  <span className="truncate">{f.currentValue || "—"}</span>
                </div>
              ) : f.multiline ? (
                <Textarea rows={4} value={buffer[f.path] ?? f.currentValue} onChange={(e) => setBuffer({ ...buffer, [f.path]: e.target.value })} />
              ) : (
                <Input value={buffer[f.path] ?? f.currentValue} onChange={(e) => setBuffer({ ...buffer, [f.path]: e.target.value })} />
              )}
            </div>
          );
        })}
      </div>
    </EditDrawer>
  );
};

export default HotelAdminPropertyListing;
