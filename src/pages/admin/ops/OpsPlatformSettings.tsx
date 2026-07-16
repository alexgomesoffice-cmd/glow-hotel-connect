// Platform Settings — trimmed to only supported sections.
import { useState } from "react";
import { OpsCard, OpsSectionHeader } from "@/components/admin/ops/primitives";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Field {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "select" | "toggle";
  options?: string[];
  defaultValue?: string | number | boolean;
  disabled?: boolean;
  hint?: string;
}

const SECTIONS: { title: string; desc: string; fields: Field[] }[] = [
  {
    title: "General",
    desc: "Platform-wide identity and locale.",
    fields: [
      { key: "name", label: "Platform Name", defaultValue: "StayVista" },
      { key: "supportEmail", label: "Support Email", type: "email", defaultValue: "support@stayvista.com" },
      { key: "supportPhone", label: "Support Phone", defaultValue: "+880-9611-000000" },
      { key: "currency", label: "Default Currency", type: "select", options: ["BDT", "USD", "EUR"], defaultValue: "BDT" },
      { key: "timezone", label: "Timezone", type: "select", options: ["Asia/Dhaka", "UTC"], defaultValue: "Asia/Dhaka" },
    ],
  },
  {
    title: "Hotel Registration",
    desc: "Rules for how hotels join and edit their listings.",
    fields: [
      { key: "allowReg", label: "Allow Hotel Registration", type: "toggle", defaultValue: true },
      { key: "requireApproval", label: "Require Manual Approval", type: "toggle", defaultValue: true },
      { key: "maxDrafts", label: "Maximum Pending Drafts", type: "number", defaultValue: 1, disabled: true, hint: "Fixed at 1 by platform design." },
      { key: "cooldown", label: "Draft Cooldown (hours)", type: "number", defaultValue: 24 },
    ],
  },
  {
    title: "Authentication",
    desc: "Session and password enforcement.",
    fields: [
      { key: "sessionTimeout", label: "Session Timeout (minutes)", type: "number", defaultValue: 60 },
      { key: "pwPolicy", label: "Password Policy", type: "select", options: ["Standard (8+ chars)", "Strong (12+ chars, mixed)", "Enterprise (14+, symbols)"], defaultValue: "Strong (12+ chars, mixed)" },
      { key: "maxLogin", label: "Maximum Login Attempts", type: "number", defaultValue: 5 },
    ],
  },
  {
    title: "Booking Rules",
    desc: "Reservation lifecycle defaults.",
    fields: [
      { key: "holdMin", label: "Reservation Hold Duration (minutes)", type: "number", defaultValue: 30 },
      { key: "maxActive", label: "Maximum Active Reservations / user", type: "number", defaultValue: 10 },
      { key: "autoCancel", label: "Auto Cancel Timeout (hours)", type: "number", defaultValue: 24 },
    ],
  },
  {
    title: "Email",
    desc: "Transactional email sender identity.",
    fields: [
      { key: "senderName", label: "Sender Name", defaultValue: "StayVista" },
      { key: "senderEmail", label: "Sender Email", type: "email", defaultValue: "no-reply@stayvista.com" },
    ],
  },
];

const OpsPlatformSettings = () => {
  const { toast } = useToast();
  const [dirty, setDirty] = useState(false);

  return (
    <div className="mx-auto max-w-[1000px] space-y-4 px-6 py-5">
      <OpsSectionHeader
        title="Platform Settings"
        description="Global configuration for StayVista Ops."
        right={
          <Button size="sm" disabled={!dirty} onClick={() => { toast({ title: "Settings saved" }); setDirty(false); }}>
            Save changes
          </Button>
        }
      />
      {SECTIONS.map((s) => (
        <OpsCard key={s.title}>
          <div className="border-b border-border/60 px-3 py-2">
            <div className="text-[13px] font-semibold">{s.title}</div>
            <div className="text-[11px] text-muted-foreground">{s.desc}</div>
          </div>
          <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
            {s.fields.map((f) => (
              <label key={f.key} className="text-xs">
                <span className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span>{f.label}</span>
                  {f.hint && <span className="ml-2 normal-case text-muted-foreground/60">{f.hint}</span>}
                </span>
                {f.type === "toggle" ? (
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked={Boolean(f.defaultValue)} onChange={() => setDirty(true)} className="h-4 w-4 accent-primary" />
                    <span className="ml-2 text-xs text-muted-foreground">Enabled</span>
                  </div>
                ) : f.type === "select" ? (
                  <select
                    defaultValue={String(f.defaultValue)}
                    onChange={() => setDirty(true)}
                    className="h-8 w-full rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60"
                  >
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
                    defaultValue={String(f.defaultValue ?? "")}
                    disabled={f.disabled}
                    onChange={() => setDirty(true)}
                    className="h-8 w-full rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60 disabled:opacity-50"
                  />
                )}
              </label>
            ))}
          </div>
        </OpsCard>
      ))}
    </div>
  );
};

export default OpsPlatformSettings;
