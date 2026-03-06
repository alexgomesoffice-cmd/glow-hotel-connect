import { useState } from "react";
import { Save, User, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "hotelAdminProfile";

const getProfile = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {
    name: "Maria Garcia", email: "maria@hotelmanager.com", phone: "+1 234 567 890",
    dob: "1990-05-15", nid: "NID-9876543210", address: "123 Hotel Street, Miami, FL",
    role: "Hotel System Admin",
  };
};

const HotelAdminSettings = () => {
  const [profile, setProfile] = useState(getProfile);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "New Reservations": true, "Guest Check-in/out": true, "Review Alerts": true, "Revenue Reports": true,
  });

  const update = (field: string, value: string) => setProfile((p: any) => ({ ...p, [field]: value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {/* Avatar row */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary-foreground">{profile.name.split(" ").map((n: string) => n[0]).join("")}</span>
            </div>
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={profile.name} onChange={(e) => update("name", e.target.value)} /></div>
            <div className="space-y-2"><Label>Email <span className="text-xs text-muted-foreground">(read only)</span></Label><Input value={profile.email} disabled className="opacity-60" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => update("phone", e.target.value)} /></div>
            <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={profile.dob} onChange={(e) => update("dob", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>NID No. <span className="text-xs text-muted-foreground">(read only)</span></Label><Input value={profile.nid} disabled className="opacity-60" /></div>
            <div className="space-y-2"><Label>Role <span className="text-xs text-muted-foreground">(read only)</span></Label><Input value={profile.role} disabled className="opacity-60" /></div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Input value={profile.address} onChange={(e) => update("address", e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Bell className="h-4 w-4 text-primary-foreground" />
            </div>
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-1">
          {Object.keys(notifications).map((item) => (
            <div key={item} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/30 transition-colors">
              <Label className="cursor-pointer">{item}</Label>
              <Switch checked={notifications[item]} onCheckedChange={(v) => setNotifications((p) => ({ ...p, [item]: v }))} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Change your account password</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
        </CardContent>
      </Card>

      <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <Button variant="hero" onClick={handleSave} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default HotelAdminSettings;
