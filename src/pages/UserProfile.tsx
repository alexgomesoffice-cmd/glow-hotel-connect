import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Calendar, MapPin, Edit, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLoggedInUser, setLoggedInUser } from "@/components/Navbar";

const PROFILE_KEY = "stayvista-user-profile";

const UserProfile = () => {
  const navigate = useNavigate();
  const user = getLoggedInUser();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      setProfile(JSON.parse(saved));
    } else {
      setProfile({ name: user.name, email: user.email, phone: "", dob: "", address: "" });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setLoggedInUser({ name: profile.name, email: profile.email });
    setEditing(false);
    toast({ title: "Profile updated", description: "Your profile has been saved." });
  };

  if (!user) return null;

  const initials = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 max-w-2xl">
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">{initials}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
          <Button variant={editing ? "default" : "outline"} onClick={() => editing ? handleSave() : setEditing(true)} className="gap-2">
            {editing ? <><Save className="h-4 w-4" /> Save</> : <><Edit className="h-4 w-4" /> Edit</>}
          </Button>
        </div>

        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} disabled={!editing} className="mt-1.5" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile.email} disabled className="mt-1.5 opacity-60" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!editing} className="mt-1.5" placeholder="+1 555 0000" />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} disabled={!editing} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} disabled={!editing} className="mt-1.5" placeholder="123 Main St, City" />
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
