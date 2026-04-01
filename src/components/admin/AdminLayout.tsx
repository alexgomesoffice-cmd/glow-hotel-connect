import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Hotel, Users, Calendar, BarChart3, Settings, LogOut, Menu, X, Bell, Search,
  ChevronDown, ChevronRight, Plus, List, Trash2, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NotificationPanel from "@/components/NotificationPanel";
import { setLoggedInUser } from "@/utils/auth";

interface AdminLayoutProps { children?: React.ReactNode; }

interface SidebarDropdown {
  label: string;
  icon: React.ElementType;
  items: { label: string; path: string; icon: React.ElementType }[];
}

const sidebarDropdowns: SidebarDropdown[] = [
  {
    label: "Hotel Client Management",
    icon: Hotel,
    items: [
      { label: "Add New Hotel", path: "/admin/add-hotel", icon: Plus },
      { label: "Current Hotels", path: "/admin/hotels", icon: List },
      { label: "Erase Hotel", path: "/admin/erase-hotel", icon: Trash2 },
    ],
  },
  {
    label: "Consumer Client Management",
    icon: Users,
    items: [
      { label: "Client List", path: "/admin/clients", icon: UserCheck },
      { label: "Erase Client Info", path: "/admin/erase-client", icon: Trash2 },
    ],
  },
];

const sidebarStatic = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
];

const sidebarBottom = [
  { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    "Hotel Client Management": true,
    "Consumer Client Management": false,
  });
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    setLoggedInUser(null);
    
    toast({ title: "Logged out", description: "You have been signed out successfully." });
    navigate("/");
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;

  const renderNavLink = (item: { icon: React.ElementType; label: string; path: string }, nested = false) => {
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setIsMobileSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-xl transition-all duration-300",
          nested ? "px-3 py-2 text-sm" : "px-4 py-3",
          active
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
        {isSidebarOpen && <span className="font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-20 flex items-center justify-between px-4 border-b border-border">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-xl shrink-0">
              <Hotel className="h-5 w-5 text-primary-foreground" />
            </div>
            {isSidebarOpen && <span className="text-xl font-bold text-gradient animate-fade-in-left">StayVista</span>}
          </Link>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto pb-4">
          {sidebarStatic.map((item) => renderNavLink(item))}
          {sidebarDropdowns.map((dropdown) => {
            const isOpen = openDropdowns[dropdown.label];
            const hasActiveChild = dropdown.items.some((item) => isActive(item.path));
            return (
              <div key={dropdown.label} className="pt-2">
                <button
                  onClick={() => isSidebarOpen && toggleDropdown(dropdown.label)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-300 text-left",
                    hasActiveChild ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <dropdown.icon className={cn("h-5 w-5 shrink-0", hasActiveChild && "text-primary")} />
                  {isSidebarOpen && (
                    <>
                      <span className="font-medium text-sm flex-1">{dropdown.label}</span>
                      {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    </>
                  )}
                </button>
                {isSidebarOpen && isOpen && (
                  <div className="ml-4 pl-4 border-l border-border/50 space-y-1 mt-1 animate-fade-in">
                    {dropdown.items.map((item) => renderNavLink(item, true))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="border-t border-border/50 my-3" />
          {sidebarBottom.map((item) => renderNavLink(item))}
        </nav>

        <div className="p-4 border-t border-border bg-card shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div className={cn("transition-all duration-300", isSidebarOpen ? "lg:ml-64" : "lg:ml-20")}>
        <header className="h-20 border-b border-border glass-strong sticky top-0 z-30">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 hover:bg-secondary rounded-lg"><Menu className="h-5 w-5" /></button>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:flex p-2 hover:bg-secondary rounded-lg"><Menu className="h-5 w-5" /></button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="w-64 pl-10 h-10 bg-secondary/50" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2.5 hover:bg-secondary rounded-xl transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                </button>
                <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
              </div>
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">JD</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children || <Outlet />}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
