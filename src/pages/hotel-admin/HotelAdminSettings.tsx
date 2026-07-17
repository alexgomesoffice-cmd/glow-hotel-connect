import { useState } from "react";
import { Save, Building2, Shield, Bell, Settings2, Monitor, LogIn as LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SectionCard, StatusPill } from "@/components/hotel-admin/primitives";

const HotelAdminSettings = () => {
  const [account, setAccount] = useState({
    displayName: "The Grand Miami Hotel",
    timezone: "America/New_York",
    currency: "USD",
    contactEmail: "hello@grandmiami.example",
    supportEmail: "support@grandmiami.example",
  });
  const [notifs, setNotifs] = useState({ bookingEmails: true, reviewEmails: true, systemNotifs: true, sms: false, push: true });
  const [prefs, setPrefs] = useState({ language: "en", dateFormat: "MMM D, YYYY", timeFormat: "12h", currencyDisplay: "symbol" });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your hotel account and preferences</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Hotel Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6 space-y-6">
          <SectionCard title="Hotel Account" icon={Building2}>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-primary-foreground font-bold">GM</div>
              <div>
                <p className="font-semibold">Logo</p>
                <p className="text-xs text-muted-foreground">Upload a 512×512 PNG</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">Upload</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Display Name" value={account.displayName} onChange={(v) => setAccount({ ...account, displayName: v })} />
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select value={account.timezone} onValueChange={(v) => setAccount({ ...account, timezone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={account.currency} onValueChange={(v) => setAccount({ ...account, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="BDT">BDT — Bangladeshi Taka</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Contact Email" value={account.contactEmail} onChange={(v) => setAccount({ ...account, contactEmail: v })} />
              <Field label="Support Email" value={account.supportEmail} onChange={(v) => setAccount({ ...account, supportEmail: v })} />
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="hero" onClick={() => toast({ title: "Settings saved" })}><Save className="h-4 w-4 mr-2" /> Save</Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <SectionCard title="Password" icon={Shield}>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Change password</p><p className="text-xs text-muted-foreground">Last changed 3 months ago</p></div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </SectionCard>
          <SectionCard title="Two-Factor Authentication" icon={Shield}>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">2FA is off</p><p className="text-xs text-muted-foreground">Add an extra layer of security</p></div>
              <Button variant="hero" size="sm">Enable 2FA</Button>
            </div>
          </SectionCard>
          <SectionCard title="Active Sessions" icon={Monitor}>
            <ul className="space-y-2 text-sm">
              {[
                { device: "MacBook Pro · Chrome", location: "Miami, FL", current: true },
                { device: "iPhone 15 · Safari", location: "Miami, FL", current: false },
              ].map((s, i) => (
                <li key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div>
                    <div className="flex items-center gap-2"><p className="font-medium">{s.device}</p>{s.current && <StatusPill label="This device" tone="green" />}</div>
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  </div>
                  {!s.current && <Button variant="outline" size="sm">Revoke</Button>}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Login History" icon={LogInIcon}>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Today · Miami, FL · Chrome</li>
              <li>Yesterday · Miami, FL · Safari</li>
              <li>3 days ago · Miami, FL · Chrome</li>
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <SectionCard title="Notifications" icon={Bell}>
            {[
              ["bookingEmails", "Booking emails", "Get notified for new / cancelled bookings"],
              ["reviewEmails", "Review emails", "Get notified when guests leave a review"],
              ["systemNotifs", "System notifications", "Draft reviews, document expiry, etc."],
              ["sms", "SMS", "Critical alerts by SMS"],
              ["push", "Push notifications", "Browser push alerts"],
            ].map(([k, label, desc]) => (
              <div key={k as string} className="flex items-center justify-between py-2 border-b border-border/40 last:border-b-0">
                <div><p className="font-medium text-sm">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                <Switch checked={(notifs as any)[k as string]} onCheckedChange={(v) => setNotifs((p) => ({ ...p, [k as string]: v }))} />
              </div>
            ))}
          </SectionCard>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6 space-y-6">
          <SectionCard title="Preferences" icon={Settings2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={prefs.language} onValueChange={(v) => setPrefs({ ...prefs, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="bn">Bangla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date Format</Label>
                <Select value={prefs.dateFormat} onValueChange={(v) => setPrefs({ ...prefs, dateFormat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MMM D, YYYY">Jan 5, 2026</SelectItem>
                    <SelectItem value="DD/MM/YYYY">05/01/2026</SelectItem>
                    <SelectItem value="YYYY-MM-DD">2026-01-05</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Time Format</Label>
                <Select value={prefs.timeFormat} onValueChange={(v) => setPrefs({ ...prefs, timeFormat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Currency Display</Label>
                <Select value={prefs.currencyDisplay} onValueChange={(v) => setPrefs({ ...prefs, currencyDisplay: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="symbol">Symbol ($)</SelectItem>
                    <SelectItem value="code">Code (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5"><Label>{label}</Label><Input value={value} onChange={(e) => onChange(e.target.value)} /></div>
);

export default HotelAdminSettings;
