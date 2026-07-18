import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  Hotel, LayoutDashboard, BedDouble, Calendar, DollarSign,
  MessageSquare, Settings, LogOut, Menu, X, Bell, Users, ClipboardList,
  FileText, ShieldCheck, UserCog, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { setLoggedInUser } from "@/utils/auth";
import { apiGet } from "@/utils/api";
import NotificationPanel from "@/components/NotificationPanel";
import { useHotelStore, cooldownRemainingMs } from "@/data/hotelAdminStore";

type Item = { icon: any; label: string; path: string; end?: boolean; badge?: string };
type Group = { label: string; items: Item[] };

const HotelAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [adminName, setAdminName] = useState("Maria Garcia");
  const [adminInitials, setAdminInitials] = useState("MG");
  const [adminRole, setAdminRole] = useState("General Manager");
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const draft = useHotelStore((s) => s.draft);
  const unreadNotifs = useHotelStore((s) => s.notifications.filter((n) => !n.read).length);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await apiGet("/hotels/admin/me");
        if (response?.success && response.data?.name) {
          const name = response.data.name;
          setAdminName(name);
          setAdminInitials(name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase());
          setAdminRole(response.data.role === "HOTEL_ADMIN" ? "General Manager" : "Staff Member");
        }
      } catch { /* keep defaults */ }
    };
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("hotelId");
    setLoggedInUser(null);
    toast({ title: "Logged out", description: "You have been signed out successfully." });
    navigate("/");
  };

  const draftBadge = draft
    ? (draft.status === "submitted"
        ? (cooldownRemainingMs(draft) > 0 ? "Locked" : "Review")
        : draft.status === "rejected" ? "Action" : "Draft")
    : undefined;

  const groups: Group[] = [
    {
      label: "Operations",
      items: [
        { icon: LayoutDashboard, label: "Overview", path: "/hotel-admin", end: true },
        { icon: Calendar, label: "Reservations", path: "/hotel-admin/reservations" },
        { icon: Users, label: "Guests", path: "/hotel-admin/guests" },
        { icon: BedDouble, label: "Rooms", path: "/hotel-admin/rooms" },
      ],
    },
    {
      label: "Property",
      items: [
        { icon: Hotel, label: "Property", path: "/hotel-admin/listing" },
        { icon: ClipboardList, label: "Draft Center", path: "/hotel-admin/drafts", badge: draftBadge },
        { icon: ShieldCheck, label: "Documents", path: "/hotel-admin/documents" },
      ],
    },
    {
      label: "Business",
      items: [
        { icon: UserCog, label: "Team", path: "/hotel-admin/team" },
        { icon: DollarSign, label: "Revenue", path: "/hotel-admin/revenue" },
        { icon: MessageSquare, label: "Reviews", path: "/hotel-admin/reviews" },
      ],
    },
    {
      label: "",
      items: [
        { icon: Settings, label: "Settings", path: "/hotel-admin/settings" },
      ],
    },
  ];

  const isActive = (item: Item) =>
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="min-h-screen bg-background">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}>
        <div className="h-20 flex items-center justify-between px-4 border-b border-border shrink-0">
          <Link to="/hotel-admin" className="flex items-center gap-3 min-w-0">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shrink-0">
              <Hotel className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 animate-fade-in-left">
                <p className="text-sm font-bold text-gradient truncate">Hotel Admin</p>
                <p className="text-[10px] text-muted-foreground truncate">Property Management</p>
              </div>
            )}
          </Link>
          <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto space-y-4">
          {groups.map((group) => (
            <div key={group.label || "misc"}>
              {sidebarOpen && group.label && (
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                        active
                          ? "bg-gradient-to-r from-green-500/15 to-emerald-500/10 text-foreground border border-green-500/20"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", active && "text-green-600")} />
                      {sidebarOpen && (
                        <>
                          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/20">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "lg:ml-64" : "lg:ml-20")}>
        <header className="h-16 border-b border-border glass-strong sticky top-0 z-30">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
                <Menu className="h-5 w-5" />
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2 hover:bg-secondary rounded-lg">
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">The Grand Miami Hotel</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </button>
                <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
              </div>
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-foreground">{adminInitials}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-tight">{adminName}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{adminRole}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HotelAdminLayout;
