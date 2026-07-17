import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hotel, MapPin, Phone, FileText, Image, Sparkles, Languages, MapPinned,
  Search, Info, Edit3, Eye, Lock, ArrowRight, ShieldCheck, ClipboardList,
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
} from "@/data/hotelAdminStore";
import { cn } from "@/lib/utils";

type SectionKey =
  | "general" | "business" | "location" | "contacts" | "description"
  | "amenities" | "gallery" | "policies" | "languages" | "attractions" | "seo";

const SECTIONS: { key: SectionKey; title: string; icon: any; description: string; protected?: boolean }[] = [
  { key: "general", title: "General Information", icon: Hotel, description: "Name, type, star rating, size, floors" },
  { key: "business", title: "Business Information", icon: ShieldCheck, description: "Owner, licenses, TIN, VAT — protected", protected: true },
  { key: "location", title: "Location", icon: MapPin, description: "Address, city, coordinates" },
  { key: "contacts", title: "Contacts", icon: Phone, description: "Reservation, reception, emergency numbers" },
  { key: "description", title: "Description", icon: FileText, description: "Long and short property description" },
  { key: "amenities", title: "Amenities", icon: Sparkles, description: "Grouped, searchable amenity picker" },
  { key: "gallery", title: "Gallery", icon: Image, description: "Property photos and reorder" },
  { key: "policies", title: "Policies", icon: ClipboardList, description: "Check-in, cancellation, children, pets" },
  { key: "languages", title: "Languages", icon: Languages, description: "Spoken at reception" },
  { key: "attractions", title: "Nearby Attractions", icon: MapPinned, description: "Distance to landmarks" },
  { key: "seo", title: "SEO", icon: Search, description: "Meta title, description, keywords" },
];

const HotelAdminPropertyListing = () => {
  const navigate = useNavigate();
  const store = useHotelStore((s) => s);
  const { live, draft } = store;
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [buffer, setBuffer] = useState<Record<string, string>>({});

  const cd = cooldownRemainingMs(draft);
  const editingLocked = !!draft && draft.status === "submitted" && cd > 0;

  const openEdit = (key: SectionKey) => {
    // seed buffer with current values
    setBuffer({});
    setOpenSection(key);
  };

  const saveDraftFields = (fields: { path: string; label: string; currentValue: string; pendingValue: string }[]) => {
    const now = new Date().toISOString();
    updateStore((s) => {
      const existing = s.draft;
      const nextFields: DraftField[] = existing ? [...existing.fields] : [];
      fields.forEach((f) => {
        if (f.currentValue === f.pendingValue) return;
        const idx = nextFields.findIndex((x) => x.path === f.path);
        const item: DraftField = { ...f, review: "pending" };
        if (idx >= 0) nextFields[idx] = item; else nextFields.push(item);
      });
      const nextDraft: PendingDraft = existing
        ? { ...existing, fields: nextFields, updatedAt: now, timeline: [...existing.timeline, { at: now, label: `${fields.length} field(s) updated`, by: "Maria Garcia" }] }
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
          <h1 className="text-2xl sm:text-3xl font-bold">Property Listing</h1>
          <p className="text-muted-foreground text-sm">Manage what guests see on your public listing. Every edit creates or updates the same pending draft.</p>
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

      {/* Live snapshot */}
      <SectionCard title="Live Snapshot" description="What guests currently see" icon={Eye}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Snap label="Hotel Name" value={live.general.name} />
          <Snap label="Type" value={live.general.type} />
          <Snap label="Rating" value={`${live.general.starRating}★`} />
          <Snap label="Status" value={<StatusPill label={live.general.businessStatus} tone={live.general.businessStatus === "active" ? "green" : "amber"} />} />
          <Snap label="Location" value={`${live.location.city}, ${live.location.country}`} />
          <Snap label="Amenities" value={`${live.amenities.length}`} />
          <Snap label="Languages" value={live.languages.join(", ")} />
          <Snap label="Gallery" value={`${live.gallery.length} photos`} />
        </div>
      </SectionCard>

      {/* Sections grid */}
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
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s.key)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!s.protected && (
                    <Button variant="outline" size="sm" onClick={() => openEdit(s.key)} disabled={editingLocked}>
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                  {s.protected && (
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Update request sent", description: "System admin will review your business info change." })}>
                      Request Update
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Drawers */}
      <SectionEditor section={openSection} onClose={() => setOpenSection(null)} onSave={saveDraftFields} live={live} buffer={buffer} setBuffer={setBuffer} locked={editingLocked} />
    </div>
  );
};

const Snap = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="font-medium">{value}</div>
  </div>
);

const SectionEditor = ({
  section, onClose, onSave, live, buffer, setBuffer, locked,
}: {
  section: SectionKey | null; onClose: () => void;
  onSave: (fields: { path: string; label: string; currentValue: string; pendingValue: string }[]) => void;
  live: any; buffer: Record<string, string>; setBuffer: (v: Record<string, string>) => void; locked: boolean;
}) => {
  if (!section) return null;
  const val = (path: string, initial: string) => buffer[path] ?? initial;
  const set = (path: string, v: string) => setBuffer({ ...buffer, [path]: v });

  const fieldsFor = (): { path: string; label: string; currentValue: string }[] => {
    switch (section) {
      case "general": return [
        { path: "general.name", label: "Hotel Name", currentValue: live.general.name },
        { path: "general.type", label: "Hotel Type", currentValue: live.general.type },
        { path: "general.starRating", label: "Star Rating", currentValue: String(live.general.starRating) },
        { path: "general.propertySize", label: "Property Size (m²)", currentValue: String(live.general.propertySize) },
        { path: "general.establishedYear", label: "Established Year", currentValue: String(live.general.establishedYear) },
        { path: "general.floors", label: "Number of Floors", currentValue: String(live.general.floors) },
        { path: "general.summary", label: "Summary", currentValue: live.general.summary },
      ];
      case "location": return [
        { path: "location.address", label: "Address", currentValue: live.location.address },
        { path: "location.city", label: "City", currentValue: live.location.city },
        { path: "location.country", label: "Country", currentValue: live.location.country },
        { path: "location.postalCode", label: "Postal Code", currentValue: live.location.postalCode },
        { path: "location.latitude", label: "Latitude", currentValue: String(live.location.latitude) },
        { path: "location.longitude", label: "Longitude", currentValue: String(live.location.longitude) },
      ];
      case "contacts": return [
        { path: "contacts.reservationPhone", label: "Reservation Phone", currentValue: live.contacts.reservationPhone },
        { path: "contacts.receptionPhone", label: "Reception Phone", currentValue: live.contacts.receptionPhone },
        { path: "contacts.emergencyPhone", label: "Emergency Phone", currentValue: live.contacts.emergencyPhone },
        { path: "contacts.email", label: "Email", currentValue: live.contacts.email },
        { path: "contacts.website", label: "Website", currentValue: live.contacts.website },
      ];
      case "description": return [
        { path: "description.long", label: "Long Description", currentValue: live.description.long },
        { path: "description.short", label: "Short Description", currentValue: live.description.short },
      ];
      case "policies": return Object.entries(live.policies).map(([k, v]) => ({
        path: `policies.${k}`, label: k.charAt(0).toUpperCase() + k.slice(1), currentValue: String(v),
      }));
      case "seo": return [
        { path: "seo.title", label: "Meta Title", currentValue: live.seo.title },
        { path: "seo.description", label: "Meta Description", currentValue: live.seo.description },
        { path: "seo.keywords", label: "Keywords", currentValue: live.seo.keywords },
      ];
      case "amenities": return [{ path: "amenities", label: "Amenities", currentValue: `${live.amenities.length} amenities` }];
      case "gallery": return [{ path: "gallery", label: "Gallery", currentValue: `${live.gallery.length} photos` }];
      case "languages": return [{ path: "languages", label: "Languages", currentValue: live.languages.join(", ") }];
      case "attractions": return [{ path: "attractions", label: "Nearby Attractions", currentValue: `${live.nearbyAttractions.length} places` }];
      case "business": return Object.entries(live.business).map(([k, v]) => ({ path: `business.${k}`, label: k, currentValue: String(v) }));
      default: return [];
    }
  };

  const fields = fieldsFor();
  const isProtected = section === "business";

  const submit = () => {
    const changes = fields.map((f) => ({
      path: f.path, label: f.label, currentValue: f.currentValue,
      pendingValue: buffer[f.path] ?? f.currentValue,
    })).filter((f) => f.pendingValue !== f.currentValue);
    if (changes.length === 0) { toast({ title: "No changes to save" }); return; }
    onSave(changes);
  };

  return (
    <EditDrawer
      open
      onOpenChange={(v) => !v && onClose()}
      title={SECTIONS.find((s) => s.key === section)!.title}
      description={isProtected
        ? "Business info is protected. Submit an update request instead of editing."
        : "Changes are saved to your pending draft — not the live listing."}
      onSave={submit}
      disabled={isProtected || locked}
      saveLabel={locked ? "Editing locked" : "Save to Draft"}
    >
      {locked && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-700 p-3 text-xs">
          Editing is temporarily locked while your current draft is under review.
        </div>
      )}
      {isProtected && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 text-purple-600 p-3 text-xs">
          These fields cannot be edited directly. Use "Request Update" for business info changes.
        </div>
      )}
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.path} className="space-y-1.5">
            <Label className="text-xs">{f.label}</Label>
            {f.label.includes("Description") || f.label === "Summary" ? (
              <Textarea rows={4} value={val(f.path, f.currentValue)} onChange={(e) => set(f.path, e.target.value)} disabled={isProtected} />
            ) : (
              <Input value={val(f.path, f.currentValue)} onChange={(e) => set(f.path, e.target.value)} disabled={isProtected} />
            )}
          </div>
        ))}
      </div>
    </EditDrawer>
  );
};

export default HotelAdminPropertyListing;
