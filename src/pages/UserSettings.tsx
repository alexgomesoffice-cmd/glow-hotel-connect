import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Bell, Shield, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLoggedInUser } from "@/components/Navbar";
import ConfirmDialog from "@/components/ConfirmDialog";

const UserSettings = () => {
  const navigate = useNavigate();
  const user = getLoggedInUser();
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, []);
  if (!user) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Password updated", description: "Your password has been changed." });
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 max-w-2xl space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Notifications */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent"><Bell className="h-4 w-4 text-primary-foreground" /></div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center justify-between">
              <div><Label>Booking notifications</Label><p className="text-xs text-muted-foreground">Get notified about booking updates</p></div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Marketing emails</Label><p className="text-xs text-muted-foreground">Receive deals and promotions</p></div>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500"><Shield className="h-4 w-4 text-primary-foreground" /></div>
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div><Label>Current Password</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1.5" /></div>
              <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1.5" /></div>
              <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Update Password</Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently remove your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete your account?"
        description="Are you sure you want to permanently delete your account? This action cannot be undone."
        confirmLabel="Yes, Delete Account"
        onConfirm={() => {
          localStorage.removeItem("stayvista-user");
          localStorage.removeItem("stayvista-user-profile");
          window.dispatchEvent(new Event("stayvista-auth-change"));
          toast({ title: "Account deleted" });
          navigate("/");
        }}
        variant="destructive"
      />
    </div>
  );
};

export default UserSettings;
