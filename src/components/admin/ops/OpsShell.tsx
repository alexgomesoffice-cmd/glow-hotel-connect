// Enterprise CMS shell: collapsible sidebar + sticky top bar + content region.
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Building2,
  CalendarDays,
  Users,
  MapPin,
  Tags,
  Sparkles,
  BedDouble,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Command as CommandIcon,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { setLoggedInUser } from "@/utils/auth";
import { CASES } from "@/data/adminCases";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "./primitives";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  badge?: number;
}

const primaryNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Work Queue", to: "/admin/work-queue", icon: Inbox },
  { label: "Hotels", to: "/admin/hotels", icon: Building2 },
  { label: "Bookings", to: "/admin/bookings", icon: CalendarDays },
  { label: "Users", to: "/admin/clients", icon: Users },
  { label: "Activity Log", to: "/admin/activity", icon: Activity },
];

const catalogNav: NavItem[] = [
  { label: "Cities", to: "/admin/catalog/cities", icon: MapPin },
  { label: "Hotel Types", to: "/admin/catalog/hotel-types", icon: Tags },
  { label: "Amenities", to: "/admin/catalog/amenities", icon: Sparkles },
  { label: "Bed Types", to: "/admin/catalog/bed-types", icon: BedDouble },
];

const platformNav: NavItem[] = [
  { label: "System Admins", to: "/admin/system-admins", icon: ShieldCheck },
  { label: "Platform Settings", to: "/admin/platform-settings", icon: Settings },
];

const routeCrumbs: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/work-queue": "Work Queue",
  "/admin/hotels": "Hotels",
  "/admin/hotels/new": "Hotels · Create",
  "/admin/bookings": "Bookings",
  "/admin/clients": "Users",
  "/admin/activity": "Activity Log",
  "/admin/catalog/cities": "Catalog · Cities",
  "/admin/catalog/hotel-types": "Catalog · Hotel Types",
  "/admin/catalog/amenities": "Catalog · Amenities",
  "/admin/catalog/bed-types": "Catalog · Bed Types",
  "/admin/system-admins": "System Admins",
  "/admin/platform-settings": "Platform Settings",
};

const OpsShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const pendingCount = CASES.filter((c) => c.status === "pending").length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (to: string) => {
    if (to === "/admin") return location.pathname === "/admin";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    setLoggedInUser(null);
    toast({ title: "Signed out" });
    navigate("/");
  };

  const crumb =
    routeCrumbs[location.pathname] ??
    (location.pathname.startsWith("/admin/cases/") ? `Work Queue · ${location.pathname.split("/").pop()}` : null) ??
    (location.pathname.startsWith("/admin/hotels/") ? "Hotels · Workspace" : null) ??
    (location.pathname.startsWith("/admin/bookings/") ? "Bookings · Detail" : null) ??
    "Admin";

  const renderNav = (items: NavItem[]) =>
    items.map((item) => {
      const active = isActive(item.to);
      const badge = item.label === "Work Queue" ? pendingCount : item.badge;
      return (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "group flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-[13px] transition-colors",
            active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            collapsed && "justify-center",
          )}
          title={collapsed ? item.label : undefined}
        >
          <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-primary">{badge}</span>
              )}
            </>
          )}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border/60 bg-card/40 transition-[width] duration-200",
          collapsed ? "w-14" : "w-60",
        )}
      >
        <div className="flex h-12 items-center gap-2 border-b border-border/60 px-3">
          <div className="grid h-6 w-6 place-items-center rounded-sm bg-primary text-[11px] font-bold text-primary-foreground">SV</div>
          {!collapsed && (
            <div className="flex flex-1 items-baseline gap-1.5 truncate">
              <span className="text-[13px] font-semibold">StayVista</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ops</span>
            </div>
          )}
          <button onClick={() => setCollapsed((c) => !c)} className="rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
            {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          <div className="space-y-0.5">{renderNav(primaryNav)}</div>
          <div className="space-y-0.5">
            {!collapsed && <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Catalog</div>}
            {renderNav(catalogNav)}
          </div>
          <div className="space-y-0.5">
            {!collapsed && <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Platform</div>}
            {renderNav(platformNav)}
          </div>
        </nav>

        <div className="border-t border-border/60 p-2">
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground",
              collapsed && "justify-center",
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <span>Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground">{crumb}</span>
          </div>

          <div className="mx-auto w-full max-w-md">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex w-full items-center gap-2 rounded-sm border border-border/60 bg-secondary/40 px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:border-border hover:bg-secondary/70"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1">Search cases, hotels, users…</span>
              <Kbd>⌘K</Kbd>
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-border/60 bg-secondary/40 px-2 py-1.5 text-xs hover:bg-secondary">
              <Plus className="h-3.5 w-3.5" />
              New
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Quick Create</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("/admin/hotels/new")}>
                <Building2 className="mr-2 h-3.5 w-3.5" /> Add Hotel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/system-admins?new=1")}>System Admin</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/catalog/cities?new=1")}>City</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/catalog/amenities?new=1")}>Amenity</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/work-queue")}>Open Work Queue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="relative rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-sm border border-border/60 bg-secondary/40 py-1 pl-1 pr-2 text-xs hover:bg-secondary">
              <div className="grid h-6 w-6 place-items-center rounded-sm bg-primary/15 text-[10px] font-bold text-primary">JD</div>
              <span className="hidden sm:inline">John Doe</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm">John Doe</div>
                <div className="text-[10px] text-muted-foreground">System Administrator</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/platform-settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Search cases, hotels, users, actions…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {[...primaryNav, ...catalogNav, ...platformNav].map((n) => (
              <CommandItem
                key={n.to}
                onSelect={() => {
                  setCmdOpen(false);
                  navigate(n.to);
                }}
              >
                <n.icon className="mr-2 h-3.5 w-3.5" />
                {n.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent Cases">
            {CASES.slice(0, 5).map((c) => (
              <CommandItem
                key={c.id}
                onSelect={() => {
                  setCmdOpen(false);
                  navigate(`/admin/cases/${c.id}`);
                }}
              >
                <CommandIcon className="mr-2 h-3.5 w-3.5" />
                <span className="font-mono text-xs">{c.number}</span>
                <span className="ml-2 truncate text-muted-foreground">{c.hotelName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default OpsShell;
