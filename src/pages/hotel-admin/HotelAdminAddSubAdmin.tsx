import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const HotelAdminAddSubAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "", nid: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.nid) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const existing = JSON.parse(localStorage.getItem("hotelSubAdmins") || "[]");
    existing.push({ ...formData, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem("hotelSubAdmins", JSON.stringify(existing));
    toast({ title: "Sub Admin Added!", description: `${formData.name} has been registered as a sub admin.` });
    navigate("/hotel-admin");
  };

  const update = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button variant="outline" size="icon" className="shrink-0 hover:border-primary/50 transition-colors" onClick={() => navigate("/hotel-admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
            <UserPlus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Add Hotel Sub Admin</h1>
            <p className="text-muted-foreground">Register a new sub admin for your hotel</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
              Sub Admin Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="John Doe" value={formData.name} onChange={(e) => update("name", e.target.value)} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="john@hotel.com" value={formData.email} onChange={(e) => update("email", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Password *</Label><Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => update("password", e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="+1 234 567 890" value={formData.phone} onChange={(e) => update("phone", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>NID No. *</Label><Input placeholder="National ID Number" value={formData.nid} onChange={(e) => update("nid", e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="animate-fade-in-up border-primary/20 bg-primary/5" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">About Sub Admins</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sub admins can manage rooms, reservations, and guest check-ins but cannot modify hotel settings or add other admins.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Button variant="outline" type="button" onClick={() => navigate("/hotel-admin")}>Cancel</Button>
          <Button variant="hero" type="submit"><UserPlus className="h-4 w-4 mr-2" /> Register Sub Admin</Button>
        </div>
      </form>
    </div>
  );
};

export default HotelAdminAddSubAdmin;
