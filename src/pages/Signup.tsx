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

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiPost("/auth/end-user/register", {
        name,
        email,
        password,
      });

      if (data.success) {
        toast({
          title: "Account created!",
          description: `Welcome to StayVista, ${data.data.user.name}. Redirecting to login...`,
        });

        setName("");
        setEmail("");
        setPassword("");
        setShowPassword(false);

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        toast({
          title: "Signup Failed",
          description: data.message || "Could not create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Signup failed. Please try again.";

      if (errorMessage.includes("EMAIL_ALREADY_EXISTS") || errorMessage.includes("email already") || errorMessage.includes("409")) {
        toast({
          title: "Error",
          description: "This email is already registered. Please use a different email or try logging in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
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
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-accent pl-2.5 pr-4 py-2 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 hover:shadow-primary/30 transition-all"
          >
            <Hotel className="h-5 w-5 text-primary-foreground" />
            <span className="text-lg font-bold text-primary-foreground">StayVista</span>
          </Link>
        </div>
      </div>

      {/* Right form side */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 relative lg:bg-card/80 lg:backdrop-blur-xl lg:rounded-l-3xl lg:border-l lg:border-border/30 lg:shadow-2xl">

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
            <h1 className="text-2xl font-bold text-center mb-2">Create account</h1>
            <p className="text-muted-foreground text-center mb-8">Start your journey with StayVista</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                  required
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
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
                <p className="text-xs text-muted-foreground mt-1.5">Must be at least 6 characters</p>
              </div>
              <Button type="submit" variant="hero" className="w-full group" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
