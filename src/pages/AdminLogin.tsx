import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiPost } from "@/utils/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiPost("/auth/system-admin/login", { email, password });

      if (data.success) {
        // Store token and admin info
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.admin));
        localStorage.setItem("userRole", "SYSTEM_ADMIN");

        toast({
          title: "Welcome, Admin!",
          description: "You have been logged in successfully.",
        });

        navigate("/admin");
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid admin credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-destructive/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-destructive rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-gradient-to-r from-primary to-destructive p-2.5 rounded-xl">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <span className="text-2xl font-bold text-gradient">StayVista Admin</span>
        </Link>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
          <p className="text-muted-foreground text-center mb-8">Sign in to the admin dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" placeholder="admin@stayvista.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary" required />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="admin-password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative mt-1.5">
                <Input id="admin-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary/30 border-border/50 focus:border-primary pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full group" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in as Admin"}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
            <Link to="/hotel-admin-login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
              Sign in as Hotel System Admin →
            </Link>
            <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
              Sign in as User →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
