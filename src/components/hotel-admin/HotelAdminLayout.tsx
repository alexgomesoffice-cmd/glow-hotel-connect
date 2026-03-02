import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Hotel, LayoutDashboard, BedDouble, Calendar, DollarSign,
  MessageSquare, Settings, LogOut, Menu, X, Bell,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/hotel-admin" },
  { icon: BedDouble, label: "Rooms", path: "/hotel-admin/rooms" },
  { icon: Calendar, label: "Reservations", path: "/hotel-admin/reservations" },
  { icon: DollarSign, label: "Revenue", path: "/hotel-admin/revenue" },
  { icon: MessageSquare, label: "Reviews", path: "/hotel-admin/reviews" },
  { icon: Settings, label: "Settings", path: "/hotel-admin/settings" },
];

const HotelAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-20 flex items-center justify-between px-4 border-b border-border">
          <Link to="/hotel-admin" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shrink-0">
              <Hotel className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && <span className="text-xl font-bold text-gradient animate-fade-in-left">Hotel Admin</span>}
          </Link>
          <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "lg:ml-64" : "lg:ml-20")}>
        <header className="h-20 border-b border-border glass-strong sticky top-0 z-30">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
                <Menu className="h-5 w-5" />
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2 hover:bg-secondary rounded-lg">
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold hidden sm:block">Hotel System Admin Panel</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 hover:bg-secondary rounded-xl transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">MG</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">Maria Garcia</p>
                  <p className="text-xs text-muted-foreground">Hotel System Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
