import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdminData } from "@/data/adminStore";
import { toast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { data, saveData } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    hotelRegistrations: true,
    bookingAlerts: true,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "male",
    address: "",
    nid: "",
    phone: "",
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setFormData(data.adminProfile);
  }, [data.adminProfile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    saveData((current) => ({
      ...current,
      adminProfile: {
        ...current.adminProfile,
        name: formData.name,
        password: formData.password,
        dob: formData.dob,
        gender: formData.gender as "male" | "female" | "other",
        address: formData.address,
        phone: formData.phone,
      },
    }));

    toast({ title: "Settings saved", description: "Admin profile details have been updated." });
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>NID No. (Unchangeable)</Label>
              <Input value={formData.nid} disabled className="cursor-not-allowed opacity-60" />
            </div>
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
        <Button variant="hero" type="submit">Save Settings</Button>
      </div>
    </form>
  );
};

export default AdminSettings;
