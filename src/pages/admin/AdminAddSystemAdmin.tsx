import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNextId, useAdminData } from "@/data/adminStore";
import { toast } from "@/hooks/use-toast";

const AdminAddSystemAdmin = () => {
  const navigate = useNavigate();
  const { data, saveData } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.nid) {
      toast({ title: "Missing fields", description: "Please complete the required system admin details.", variant: "destructive" });
      return;
    }

    saveData((current) => ({
      ...current,
      systemAdmins: [
        ...current.systemAdmins,
        {
          id: getNextId(current.systemAdmins),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          dob: formData.dob,
          gender: formData.gender as "male" | "female" | "other",
          address: formData.address,
          nid: formData.nid,
          phone: formData.phone,
        },
      ],
    }));

    toast({ title: "System admin created", description: `${formData.name} can now access the admin panel.` });
    navigate("/admin");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Add System Admin</h1>
          <p className="text-muted-foreground">Create another platform administrator with full admin access.</p>
        </div>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <CardHeader>
          <CardTitle>System Admin Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Password *</Label>
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
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>NID No. *</Label>
              <Input value={formData.nid} onChange={(e) => setFormData({ ...formData, nid: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/admin")}>Cancel</Button>
              <Button type="submit" variant="hero">
                <Save className="mr-2 h-4 w-4" /> Save System Admin
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
        <CardHeader>
          <CardTitle>Current Admin Count</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data.systemAdmins.length}</p>
          <p className="text-sm text-muted-foreground">Existing platform system admins</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAddSystemAdmin;
