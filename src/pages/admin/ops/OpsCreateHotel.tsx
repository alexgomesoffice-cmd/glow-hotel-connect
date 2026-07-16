// Create Hotel — comprehensive multi-section registration form.
// Sections: Basic · Owner · Hotel Admin · Business · Emergency Contact.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Building2, User, ShieldCheck, FileText, Phone } from "lucide-react";
import { OpsCard, OpsSectionHeader } from "@/components/admin/ops/primitives";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Field {
  key: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "password" | "select" | "file";
  options?: string[];
  colSpan?: 1 | 2;
  required?: boolean;
  placeholder?: string;
}

interface Section {
  key: string;
  title: string;
  icon: React.ElementType;
  description: string;
  fields: Field[];
  uploads?: { key: string; label: string }[];
}

const SECTIONS: Section[] = [
  {
    key: "basic",
    title: "Basic Information",
    icon: Building2,
    description: "Core property identity and public contact information.",
    fields: [
      { key: "hotel_name", label: "Hotel Name", required: true },
      { key: "hotel_type", label: "Hotel Type", type: "select", options: ["Hotel", "Resort", "Boutique", "Hostel", "Villa"], required: true },
      { key: "city", label: "City", required: true },
      { key: "address", label: "Full Address", colSpan: 2, required: true },
      { key: "zip", label: "Zip Code" },
      { key: "official_email", label: "Official Email", type: "email", required: true },
      { key: "reception_1", label: "Reception No. 1", type: "tel", required: true },
      { key: "reception_2", label: "Reception No. 2", type: "tel" },
      { key: "website", label: "Website" },
    ],
  },
  {
    key: "owner",
    title: "Owner's Information",
    icon: User,
    description: "Legal owner of the property.",
    fields: [
      { key: "owner_name", label: "Full Name", required: true },
      { key: "owner_dob", label: "Date of Birth", type: "date", required: true },
      { key: "owner_nid", label: "NID Number", required: true },
      { key: "owner_passport", label: "Passport" },
      { key: "owner_email", label: "Email", type: "email", required: true },
      { key: "owner_phone", label: "Phone", type: "tel", required: true },
      { key: "owner_address", label: "Address", colSpan: 2 },
    ],
    uploads: [
      { key: "owner_photo", label: "Owner Photo" },
      { key: "owner_docs", label: "Owner Information Document" },
    ],
  },
  {
    key: "admin",
    title: "Hotel Admin Account",
    icon: ShieldCheck,
    description: "Primary admin who will manage the hotel dashboard.",
    fields: [
      { key: "admin_name", label: "Hotel Admin Name", required: true },
      { key: "admin_email", label: "Email", type: "email", required: true },
      { key: "admin_phone", label: "Phone", type: "tel", required: true },
      { key: "admin_emergency_phone", label: "Emergency Phone", type: "tel" },
      { key: "admin_password", label: "Password", type: "password", required: true },
      { key: "admin_password_confirm", label: "Confirm Password", type: "password", required: true },
      { key: "admin_dob", label: "Date of Birth", type: "date" },
      { key: "admin_nid", label: "NID Number", required: true },
      { key: "admin_passport", label: "Passport" },
      { key: "admin_address", label: "Address", colSpan: 2 },
    ],
    uploads: [
      { key: "admin_photo", label: "Admin Photo" },
      { key: "admin_docs", label: "Admin Information Document" },
    ],
  },
  {
    key: "business",
    title: "Hotel (Business Information)",
    icon: FileText,
    description: "Trade, tax and VAT registration details.",
    fields: [
      { key: "trade_license_no", label: "Trade License No.", required: true },
      { key: "trade_issue_date", label: "Issue Date", type: "date" },
      { key: "trade_expiry_date", label: "Expiry Date", type: "date" },
      { key: "trade_issued_by", label: "Issued By" },
      { key: "tin", label: "TIN Number", required: true },
      { key: "vat_reg", label: "VAT Registration" },
    ],
    uploads: [
      { key: "tax_cert", label: "Tax Certificate Upload" },
      { key: "business_docs", label: "Business Documents" },
    ],
  },
  {
    key: "emergency",
    title: "Emergency Contact",
    icon: Phone,
    description: "Point of contact for critical incidents.",
    fields: [
      { key: "em_name", label: "Name", required: true },
      { key: "em_relation", label: "Relation" },
      { key: "em_phone_1", label: "Phone 1", type: "tel", required: true },
      { key: "em_phone_2", label: "Phone 2", type: "tel" },
      { key: "em_email", label: "Email", type: "email" },
    ],
  },
];

const OpsCreateHotel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<Record<string, string>>({});

  const setValue = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));
  const setUpload = (k: string, name: string) => setUploads((p) => ({ ...p, [k]: name }));

  const handleSubmit = () => {
    // client-only stub — persist to localStorage-style store elsewhere.
    toast({ title: "Hotel created", description: `${values["hotel_name"] || "New hotel"} has been added to the platform.` });
    navigate("/admin/hotels");
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 px-6 py-5 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/admin/hotels" className="rounded-sm border border-border/60 bg-secondary/40 p-1 hover:bg-secondary">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <OpsSectionHeader title="Add Hotel" description="Register a new property with owner, admin, business and emergency information." className="flex-1 border-0 pb-0" />
      </div>

      {SECTIONS.map((s) => (
        <OpsCard key={s.key}>
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
            <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <div className="text-[13px] font-semibold">{s.title}</div>
              <div className="text-[11px] text-muted-foreground">{s.description}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
            {s.fields.map((f) => (
              <label key={f.key} className={f.colSpan === 2 ? "md:col-span-2 text-xs" : "text-xs"}>
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">
                  {f.label}{f.required && <span className="ml-1 text-red-400">*</span>}
                </span>
                {f.type === "select" ? (
                  <select
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    className="h-9 w-full rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60"
                  >
                    <option value="">Select…</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type ?? "text"}
                    value={values[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    className="h-9 w-full rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60"
                  />
                )}
              </label>
            ))}
          </div>
          {s.uploads && (
            <div className="grid grid-cols-1 gap-3 border-t border-border/40 bg-secondary/20 p-4 md:grid-cols-2">
              {s.uploads.map((u) => (
                <label key={u.key} className="flex cursor-pointer items-center gap-3 rounded-sm border border-dashed border-border/60 bg-card px-3 py-2.5 text-xs hover:border-primary/60">
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1">
                    <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">{u.label}</span>
                    <span className="text-[13px]">{uploads[u.key] ?? "Choose file…"}</span>
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setUpload(u.key, e.target.files?.[0]?.name ?? "")}
                  />
                </label>
              ))}
            </div>
          )}
        </OpsCard>
      ))}

      <div className="fixed inset-x-0 bottom-0 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-6 py-3">
          <div className="text-xs text-muted-foreground">All required fields marked with <span className="text-red-400">*</span>.</div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate("/admin/hotels")}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Hotel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpsCreateHotel;
