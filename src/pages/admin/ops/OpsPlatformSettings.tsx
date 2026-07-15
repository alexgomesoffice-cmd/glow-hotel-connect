import { OpsCard, OpsSectionHeader } from "@/components/admin/ops/primitives";

const sections = [
  { title: "Branding", desc: "Platform name, logos, colors.", fields: ["Platform Name", "Primary Color", "Logo URL"] },
  { title: "Commission", desc: "Default commission rate applied to new hotels.", fields: ["Default %", "Minimum %", "Featured Uplift"] },
  { title: "Email", desc: "Transactional email settings.", fields: ["From Address", "Reply-to", "SMTP Host"] },
  { title: "Feature Flags", desc: "Roll out features per environment.", fields: ["Auto-approve trusted hotels", "Enable Command Palette", "Show SLA counters"] },
];

const OpsPlatformSettings = () => (
  <div className="mx-auto max-w-[1000px] space-y-4 px-6 py-5">
    <OpsSectionHeader title="Platform Settings" description="Global configuration for StayVista Ops." />
    {sections.map((s) => (
      <OpsCard key={s.title}>
        <div className="border-b border-border/60 px-3 py-2">
          <div className="text-[13px] font-semibold">{s.title}</div>
          <div className="text-[11px] text-muted-foreground">{s.desc}</div>
        </div>
        <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-3">
          {s.fields.map((f) => (
            <label key={f} className="text-xs">
              <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{f}</span>
              <input className="h-8 w-full rounded-sm border border-border/60 bg-secondary/40 px-2 text-xs outline-none focus:border-primary/60" defaultValue="—" />
            </label>
          ))}
        </div>
      </OpsCard>
    ))}
  </div>
);

export default OpsPlatformSettings;
