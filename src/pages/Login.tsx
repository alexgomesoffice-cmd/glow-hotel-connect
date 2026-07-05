import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hotel, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { setLoggedInUser } from "@/utils/auth";
import { apiPost } from "@/utils/api";
import authImage from "@/assets/auth-side-image.jpg";

const Login = () => {
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
      const data = await apiPost("/auth/end-user/login", { email, password });

      if (data.success) {
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("userRole", "END_USER");

        setLoggedInUser(data.data.user);

        toast({
          title: "Welcome back!",
          description: `Signed in as ${data.data.user.name}`,
        });

        navigate("/");
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
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
    <div className="min-h-screen w-full flex bg-background">
      {/* Left visual side — hidden on small screens, 50% on desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={authImage}
          alt="Luxury hotel resort at sunset"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/30 to-transparent" />

        <div className="absolute top-8 left-8 z-10 animate-fade-in-down">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-primary to-accent p-2.5 rounded-xl">
                <Hotel className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <span className="text-2xl font-bold text-primary-foreground">StayVista</span>
          </Link>
        </div>

        <div className="absolute bottom-8 left-8 right-8 z-10 animate-fade-in-up delay-200">
          <div className="glass rounded-2xl p-6 max-w-md">
            <p className="text-foreground font-medium text-lg leading-relaxed">
              "StayVista made our vacation truly special. The easiest way to discover and book the finest stays in Bangladesh."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                SR
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sadia Rahman</p>
                <p className="text-xs text-muted-foreground">Frequent traveler</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form side */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

        {/* Mobile image banner */}
        <div className="lg:hidden w-full max-w-md h-44 mb-6 relative rounded-2xl overflow-hidden animate-fade-in-down">
          <img
            src={authImage}
            alt="Luxury hotel resort at sunset"
            className="w-full h-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
                <Hotel className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">StayVista</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>

          <div className="glass rounded-2xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-center mb-8">Sign in to unlock your next getaway</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary/30 border-border/50 focus:border-primary pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full group" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
            </p>

            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              <Link to="/admin-login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">Sign in as Admin →</Link>
              <Link to="/hotel-admin-login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">Sign in as Hotel System Admin →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
