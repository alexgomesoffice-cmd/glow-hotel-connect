import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Hotel, Sun, Moon, User, CalendarDays, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const USER_KEY = "stayvista-user";

export const getLoggedInUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const setLoggedInUser = (user: { name: string; email: string } | null) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  window.dispatchEvent(new Event("stayvista-auth-change"));
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sync = () => setUser(getLoggedInUser());
    sync();
    window.addEventListener("stayvista-auth-change", sync);
    return () => window.removeEventListener("stayvista-auth-change", sync);
  }, []);

  const handleLogout = () => {
    setLoggedInUser(null);
    toast({ title: "Logged out", description: "You have been signed out successfully." });
    navigate("/");
  };

  const navLinks = [
    { name: "Stay", path: "/" },
    { name: "Car Rental", path: "/car-rental" },
    { name: "Attractions", path: "/attractions" },
  ];

  const initials = user ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/70 backdrop-blur-xl shadow-lg shadow-background/20 border-b border-border/30"
          : "bg-background/30 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-primary to-accent p-2.5 rounded-xl">
                <Hotel className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <span className="text-2xl font-bold text-gradient">StayVista</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "relative text-sm font-medium transition-colors duration-300 hover:text-primary",
                  location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full animate-scale-in" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth / Profile */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="relative p-2.5 rounded-xl glass transition-all duration-300 hover:scale-110 hover:bg-primary/10 group"
              aria-label="Toggle theme"
            >
              <Sun className={cn("h-5 w-5 transition-all duration-500 absolute", theme === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0")} />
              <Moon className={cn("h-5 w-5 transition-all duration-500", theme === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} />
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass hover:bg-primary/10 transition-all duration-300 group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">{initials}</span>
                    </div>
                    <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-bookings")} className="gap-2 cursor-pointer">
                    <CalendarDays className="h-4 w-4" /> My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/user-settings")} className="gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="default" className="animate-pulse-glow">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-background/80 backdrop-blur-xl overflow-hidden transition-all duration-300",
          isMobileMenuOpen ? "max-h-[500px] border-b border-border/30" : "max-h-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block py-2 text-sm font-medium transition-colors animate-fade-in-up",
                location.pathname === link.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl glass transition-all duration-300 w-fit"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"><User className="h-4 w-4" /> Profile</Link>
                <Link to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"><CalendarDays className="h-4 w-4" /> My Bookings</Link>
                <Link to="/user-settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"><Settings className="h-4 w-4" /> Settings</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 py-2 text-sm text-destructive"><LogOut className="h-4 w-4" /> Log out</button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Log in</Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="hero" size="sm" className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
