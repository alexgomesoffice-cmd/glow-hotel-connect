import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Calendar, DollarSign, FileText, Globe, Hotel, Plus, Search, Shield, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchHotels, fetchBookings, HotelResponse, BookingResponse } from "@/services/adminApi";

const quickActions = [
  { icon: Plus, label: "Add Property", color: "from-primary to-accent", link: "/admin/add-hotel" },
  { icon: FileText, label: "Reports", color: "from-primary to-accent", link: "/admin/analytics" },
  { icon: Shield, label: "Settings", color: "from-primary to-accent", link: "/admin/settings" },
  { icon: Globe, label: "Clients", color: "from-primary to-accent", link: "/admin/clients" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AdminDashboardHome = () => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [hotelsData, bookingsData] = await Promise.all([
          fetchHotels({ limit: 100 }),
          fetchBookings({ limit: 100 }),
        ]);

        setHotels(hotelsData);
        setBookings(bookingsData);
        setIsLoaded(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Dashboard data loading error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  const hotelMap = useMemo(() => {
    if (!Array.isArray(hotels)) return new Map();
    return new Map(hotels.map((hotel) => [hotel.hotel_id, hotel.name]));
  }, [hotels]);
  
  const recentBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    return bookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [bookings]);

  const totalRevenue = Array.isArray(bookings)
    ? bookings
        .filter((booking) => booking.payment_status === "paid")
        .reduce((sum, booking) => sum + booking.total_amount, 0)
    : 0;

  const pendingBookings = Array.isArray(bookings)
    ? bookings.filter((booking) => booking.booking_status === "pending").length
    : 0;

  const topHotels = useMemo(() => {
    if (!Array.isArray(hotels) || !Array.isArray(bookings)) return [];
    return hotels
      .map((hotel) => {
        const hotelBookings = bookings.filter((booking) => booking.room_id); // Simplified - all bookings are counted
        const hotelRevenue = hotelBookings
          .filter((booking) => booking.payment_status === "paid")
          .reduce((sum, booking) => sum + booking.total_amount, 0);

        return {
          id: hotel.hotel_id,
          name: hotel.name,
          bookings: hotelBookings.length,
          revenue: hotelRevenue,
          occupancy: 0, // Will be calculated from actual bookings
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 4);
  }, [bookings, hotels]);

  const stats = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), change: "+12.5%", trend: "up" as const, icon: DollarSign, color: "from-primary to-accent" },
    { title: "Total Bookings", value: String(Array.isArray(bookings) ? bookings.length : 0), change: "+8.2%", trend: "up" as const, icon: Calendar, color: "from-primary to-accent" },
    { title: "Active Properties", value: String(Array.isArray(hotels) ? hotels.length : 0), change: `+${Array.isArray(hotels) ? hotels.length : 0}`, trend: "up" as const, icon: Hotel, color: "from-primary to-accent" },
    { title: "Pending Bookings", value: String(pendingBookings), change: "+2.1%", trend: "up" as const, icon: Users, color: "from-primary to-accent" },
  ];

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete platform overview and management.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Quick search..." className="w-48 bg-secondary/50 pl-10" />
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin/add-system-admin">
              <Shield className="mr-2 h-4 w-4" /> Add System Admin
            </Link>
          </Button>
          <Button variant="hero">
            <Activity className="mr-2 h-4 w-4" /> Live Monitor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map((action, index) => (
          <Link
            to={action.link}
            key={action.label}
            className={`glass flex flex-col items-center gap-2 rounded-xl p-4 transition-all hover-lift ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: `${(index + 1) * 80}ms` }}
          >
            <div className={`rounded-xl bg-gradient-to-br ${action.color} p-3`}>
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} className={`relative overflow-hidden hover-lift ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(index + 1) * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1">
                    {stat.trend === "up" ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>{stat.change}</span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={`shrink-0 rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
                  <stat.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className={`lg:col-span-2 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "500ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/all-bookings">View all <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading bookings...</p>
            ) : recentBookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Guest</th>
                      <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check-in</th>
                      <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check-out</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.booking_id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium">Guest #{booking.end_user_id}</td>
                        <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">{formatDate(booking.check_in_date)}</td>
                        <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">{formatDate(booking.check_out_date)}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(booking.total_amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${booking.booking_status === "cancelled" ? "bg-destructive/10 text-destructive" : booking.booking_status === "confirmed" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"}`}>
                            {booking.booking_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle>Top Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topHotels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No properties yet</p>
            ) : (
              topHotels.map((hotel, index) => (
                <div key={hotel.id} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-secondary/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{hotel.name}</p>
                    <p className="text-sm text-muted-foreground">{hotel.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatCurrency(hotel.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{hotel.occupancy}% occ.</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "700ms" }}>
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="glass rounded-xl p-6 text-center">
              <p className="mb-1 text-3xl font-bold text-primary">{Array.isArray(hotels) ? hotels.length : 0}</p>
              <p className="text-sm text-muted-foreground">Total Properties</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="mb-1 text-3xl font-bold text-primary">{pendingBookings}</p>
              <p className="text-sm text-muted-foreground">Pending Bookings</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="mb-1 text-3xl font-bold text-primary">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardHome;
