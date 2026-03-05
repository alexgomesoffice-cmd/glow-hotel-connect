import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminData } from "@/data/adminStore";
import { toast } from "@/hooks/use-toast";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  dob: "",
  gender: "male",
  address: "",
  country: "",
  nid: "",
  passport: "",
  emergencyContact: "",
};

const AdminUpdateClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, saveData } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const client = useMemo(() => data.clients.find((item) => item.id === Number(id)), [data.clients, id]);
  const [formData, setFormData] = useState(emptyForm);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!client) return;
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      dob: client.dob,
      gender: client.gender,
      address: client.address,
      country: client.country,
      nid: client.nid,
      passport: client.passport,
      emergencyContact: client.emergencyContact,
    });
    setBlocked(client.blocked);
  }, [client]);

  if (!client) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/admin/clients")}>Go Back</Button>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">Client not found.</p>
            <p className="text-sm text-muted-foreground">This client may have already been erased.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    saveData((current) => ({
      ...current,
      clients: current.clients.map((item) =>
        item.id === client.id
          ? {
              ...item,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              dob: formData.dob,
              gender: formData.gender as "male" | "female" | "other",
              address: formData.address,
              country: formData.country,
              emergencyContact: formData.emergencyContact,
              blocked,
            }
          : item,
      ),
      bookings: current.bookings.map((booking) =>
        booking.clientId === client.id ? { ...booking, guestName: formData.name } : booking,
      ),
    }));

    toast({ title: "Client updated", description: `${formData.name}'s information has been saved.` });
    navigate("/admin/clients");
  };

  const toggleBlock = (checked: boolean) => {
    const nextBlocked = !checked;
    setBlocked(nextBlocked);
    saveData((current) => ({
      ...current,
      clients: current.clients.map((item) => (item.id === client.id ? { ...item, blocked: nextBlocked } : item)),
    }));
    toast({ title: nextBlocked ? "User blocked" : "User unblocked", description: `${formData.name} is now ${nextBlocked ? "blocked" : "active"}.` });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Update Client Info</h1>
          <p className="text-muted-foreground">Edit consumer details for {client.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
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
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
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
                <Label>Emergency Contact</Label>
                <Input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
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
                <Input value={formData.nid} disabled className="cursor-not-allowed opacity-60" />
              </div>
              <div className="space-y-2">
                <Label>Passport (Unchangeable)</Label>
                <Input value={formData.passport} disabled className="cursor-not-allowed opacity-60" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "260ms" }}>
          <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
              <div>
                <p className="font-medium">{blocked ? "User is blocked" : "User is active"}</p>
                <p className="text-sm text-muted-foreground">Toggle access for this consumer account.</p>
              </div>
              <Switch checked={!blocked} onCheckedChange={toggleBlock} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/clients")}>Cancel</Button>
          <Button type="submit" variant="hero">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateClient;
