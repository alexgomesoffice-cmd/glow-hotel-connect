import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    hotelRegistrations: true,
    bookingAlerts: true,
  });
  const [formData, setFormData] = useState({
    name: "System Administrator",
    email: "admin@grandstayconnect.com",
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Note: Backend endpoint for updating admin profile would be needed
    toast({
      title: "Info",
      description: "Settings update requires backend API endpoint (PUT /api/admin/profile)",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Platform configuration and profile preferences</p>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email (Unchangeable)</Label>
              <Input value={formData.email} disabled className="cursor-not-allowed opacity-60" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Full profile editing requires backend API support. Only basic fields are available.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email notifications</Label>
            <Switch checked={notifications.email} onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>New hotel registrations</Label>
            <Switch checked={notifications.hotelRegistrations} onCheckedChange={(checked) => setNotifications({ ...notifications, hotelRegistrations: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Booking alerts</Label>
            <Switch checked={notifications.bookingAlerts} onCheckedChange={(checked) => setNotifications({ ...notifications, bookingAlerts: checked })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="hero" type="submit" disabled>Save Settings (Disabled)</Button>
      </div>
    </form>
  );
};

export default AdminSettings;
