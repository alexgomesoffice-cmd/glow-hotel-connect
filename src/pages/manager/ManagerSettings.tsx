import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const ManagerSettings = () => {
  const handleSave = () => toast({ title: "Settings Saved", description: "Your preferences have been updated." });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name</Label><Input defaultValue="Maria Garcia" /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="maria@hotelmanager.com" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+1 234 567 890" /></div>
            <div className="space-y-2"><Label>Role</Label><Input defaultValue="Hotel Manager" disabled /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["New Reservations", "Guest Check-in/out", "Review Alerts", "Revenue Reports"].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <Label>{item}</Label>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button variant="hero" onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
    </div>
  );
};

export default ManagerSettings;
