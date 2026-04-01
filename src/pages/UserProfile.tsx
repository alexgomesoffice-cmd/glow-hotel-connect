import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Calendar, MapPin, Save, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLoggedInUser } from "@/utils/auth";
import { apiGet, apiPatch } from "@/utils/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const user = useMemo(() => getLoggedInUser(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    country: "",
    nidNo: "",
    passport: "",
    phone: "",
  });

  // Fetch profile data on mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await apiGet("/profiles/end-user");
        if (data.success && data.data) {
          const profileData = data.data;
          setProfile({
            name: user.name,
            email: user.email,
            fullName: user.name,
            dateOfBirth: profileData.dob ? profileData.dob.split("T")[0] : "",
            gender: profileData.gender || "",
            address: profileData.address || "",
            country: profileData.country || "Bangladesh",
            nidNo: profileData.nid_no || "",
            passport: profileData.passport || "",
            phone: profileData.phone || "",
          });
        } else {
          // Profile doesn't exist yet, use default values
          setProfile({
            name: user.name,
            email: user.email,
            fullName: user.name,
            dateOfBirth: "",
            gender: "",
            address: "",
            country: "Bangladesh",
            nidNo: "",
            passport: "",
            phone: "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Initialize with user data if fetch fails
        setProfile({
          name: user.name,
          email: user.email,
          fullName: user.name,
          dateOfBirth: "",
          gender: "",
          address: "",
          country: "Bangladesh",
          nidNo: "",
          passport: "",
          phone: "",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, user]);

  const handleSave = async () => {
    if (!profile.fullName.trim()) {
      toast({ title: "Error", description: "Full name is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const updates = {
        dob: profile.dateOfBirth || null,
        gender: profile.gender || null,
        address: profile.address || null,
        country: profile.country || "Bangladesh",
        nid_no: profile.nidNo || null,
        passport: profile.passport || null,
        phone: profile.phone || null,
      };

      const data = await apiPatch("/profiles/end-user", updates);
      if (data.success) {
        toast({
          title: "Success",
          description: "Your profile has been updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 max-w-3xl">
        {/* Header with Avatar */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">{initials}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        {/* Personal Information Card */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 pb-6">
            {/* Full Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({ ...profile, fullName: e.target.value, name: e.target.value })
                  }
                  className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-1.5 bg-secondary/50 border-border/30 opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone and Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+880 1234 567890"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Gender and Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </Label>
                <select
                  id="gender"
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 bg-secondary/30 border border-border/50 rounded-md focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="country" className="text-sm font-medium">
                  Country
                </Label>
                <Input
                  id="country"
                  placeholder="Bangladesh"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Input
                id="address"
                placeholder="123 Main Street, Dhaka"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
              />
            </div>

            {/* NID and Passport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nidNo" className="text-sm font-medium">
                  NID No.
                </Label>
                <Input
                  id="nidNo"
                  placeholder="123456789"
                  value={profile.nidNo}
                  onChange={(e) => setProfile({ ...profile, nidNo: e.target.value })}
                  className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="passport" className="text-sm font-medium">
                  Passport No.
                </Label>
                <Input
                  id="passport"
                  placeholder="AB1234567"
                  value={profile.passport}
                  onChange={(e) => setProfile({ ...profile, passport: e.target.value })}
                  className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button at Bottom */}
        <div className="mt-8 flex justify-end gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
