import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Users, Hotel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchBookings, fetchHotels, getDashboardStats } from "@/services/adminApi";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const AdminAnalytics = () => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const stats = await getDashboardStats();
        setTotalRevenue(stats.totalRevenue);
        setTotalProperties(stats.totalProperties);
        setTotalBookings(stats.totalBookings);
        setTotalGuests(stats.hotels.length); // Use hotel count as proxy for unique guests
        setIsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load analytics";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [toast]);

  const metrics = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), change: "+12.5%", icon: DollarSign, color: "from-green-500 to-emerald-500" },
    { title: "Total Bookings", value: String(totalBookings), change: "+18%", icon: Users, color: "from-primary to-accent" },
    { title: "Active Properties", value: String(totalProperties), change: "+5%", icon: Hotel, color: "from-purple-500 to-pink-500" },
    { title: "Total Guests", value: String(totalGuests), change: "+3%", icon: TrendingUp, color: "from-orange-500 to-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform performance and growth metrics</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <Card key={m.title} className={`relative overflow-hidden hover-lift ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 1) * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{m.title}</p>
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-sm text-green-500 mt-1">{m.change} vs last month</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${m.color}`}>
                  <m.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${m.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "500ms" }}>
        <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Loading analytics data...</p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Revenue data visualization will appear here with real-time updates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
