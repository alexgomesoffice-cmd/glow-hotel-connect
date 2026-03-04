import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const mockClients: Record<string, any> = {
  "1": { id: 1, name: "Emma Wilson", email: "emma@email.com", phone: "+1 555 1234", dob: "1990-05-15", gender: "female", address: "123 Elm St, NY", country: "USA", nid: "NID-001234", passport: "P-US987654", emergencyContact: "+1 555 9999", blocked: false },
  "2": { id: 2, name: "Michael Chen", email: "michael@email.com", phone: "+1 555 5678", dob: "1988-11-20", gender: "male", address: "456 Oak Ave, SF", country: "USA", nid: "NID-005678", passport: "P-US123456", emergencyContact: "+1 555 8888", blocked: false },
  "3": { id: 3, name: "Sarah Johnson", email: "sarah@email.com", phone: "+1 555 9012", dob: "1995-02-10", gender: "female", address: "789 Pine Rd, LA", country: "USA", nid: "NID-009012", passport: "P-US654321", emergencyContact: "+1 555 7777", blocked: true },
  "4": { id: 4, name: "David Brown", email: "david@email.com", phone: "+1 555 3456", dob: "1992-08-25", gender: "male", address: "321 Maple Dr, TX", country: "USA", nid: "NID-003456", passport: "P-US111222", emergencyContact: "+1 555 6666", blocked: false },
  "5": { id: 5, name: "Lisa Anderson", email: "lisa@email.com", phone: "+1 555 7890", dob: "1985-12-01", gender: "female", address: "654 Birch Ln, WA", country: "USA", nid: "NID-007890", passport: "P-US333444", emergencyContact: "+1 555 5555", blocked: false },
};

const AdminUpdateClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);

  const clientData = mockClients[id || "1"] || mockClients["1"];

  const [formData, setFormData] = useState({
    name: clientData.name,
    email: clientData.email,
    phone: clientData.phone,
    dob: clientData.dob,
    gender: clientData.gender,
    address: clientData.address,
    country: clientData.country,
    nid: clientData.nid,
    passport: clientData.passport,
    emergencyContact: clientData.emergencyContact,
  });
  const [blocked, setBlocked] = useState(clientData.blocked);

  useEffect(() => { setIsLoaded(true); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Client Updated!", description: `${formData.name}'s info has been updated.` });
    navigate("/admin/clients");
  };

  const toggleBlock = () => {
    setBlocked(!blocked);
    toast({ title: blocked ? "User Unblocked" : "User Blocked", description: `${formData.name} has been ${blocked ? "unblocked" : "blocked"}.` });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Update Client Info</h1>
          <p className="text-muted-foreground">Edit consumer details for {clientData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input type="tel" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
          <CardHeader><CardTitle>Address & Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>NID No. (Unchangeable)</Label>
                <Input value={formData.nid} disabled className="opacity-60 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label>Passport (Unchangeable)</Label>
                <Input value={formData.passport} disabled className="opacity-60 cursor-not-allowed" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
          <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
              <div>
                <p className="font-medium">{blocked ? "User is Blocked" : "User is Active"}</p>
                <p className="text-sm text-muted-foreground">Toggle to {blocked ? "unblock" : "block"} this user</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!blocked} onCheckedChange={toggleBlock} />
                <span className={`text-sm font-medium ${blocked ? "text-destructive" : "text-green-500"}`}>
                  {blocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={() => navigate("/admin/clients")}>Cancel</Button>
          <Button variant="hero" type="submit"><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateClient;
