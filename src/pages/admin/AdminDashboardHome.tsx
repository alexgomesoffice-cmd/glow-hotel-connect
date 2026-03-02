import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Users, Hotel, Calendar,
  DollarSign, ArrowUpRight, MoreHorizontal, Plus, Search,
  FileText, Shield, Globe, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const stats = [
  { title: "Total Revenue", value: "$284,532", change: "+12.5%", trend: "up", icon: DollarSign, color: "from-green-500 to-emerald-500" },
  { title: "Total Bookings", value: "1,847", change: "+8.2%", trend: "up", icon: Calendar, color: "from-primary to-accent" },
  { title: "Active Guests", value: "432", change: "-2.4%", trend: "down", icon: Users, color: "from-orange-500 to-amber-500" },
  { title: "Properties", value: "28", change: "+4", trend: "up", icon: Hotel, color: "from-purple-500 to-pink-500" },
];

const recentBookings = [
  { id: 1, guest: "Emma Wilson", hotel: "Grand Palace Hotel", checkIn: "Feb 15, 2024", amount: "$840", status: "confirmed" },
  { id: 2, guest: "Michael Chen", hotel: "Ocean View Resort", checkIn: "Feb 16, 2024", amount: "$780", status: "pending" },
  { id: 3, guest: "Sarah Johnson", hotel: "Nordic Forest Lodge", checkIn: "Feb 17, 2024", amount: "$330", status: "confirmed" },
  { id: 4, guest: "David Brown", hotel: "Tropical Paradise Villa", checkIn: "Feb 18, 2024", amount: "$2,240", status: "confirmed" },
  { id: 5, guest: "Lisa Anderson", hotel: "Grand Palace Hotel", checkIn: "Feb 19, 2024", amount: "$560", status: "cancelled" },
];

const topHotels = [
  { name: "Grand Palace Hotel", bookings: 234, revenue: "$68,450", occupancy: 92 },
  { name: "Ocean View Resort", bookings: 198, revenue: "$52,320", occupancy: 88 },
  { name: "Nordic Forest Lodge", bookings: 156, revenue: "$41,860", occupancy: 85 },
  { name: "Tropical Paradise Villa", bookings: 142, revenue: "$56,200", occupancy: 78 },
];

const quickActions = [
  { icon: Plus, label: "Add Property", color: "from-primary to-accent", link: "/admin/add-hotel" },
  { icon: FileText, label: "Reports", color: "from-green-500 to-emerald-500", link: "/admin/analytics" },
  { icon: Shield, label: "Settings", color: "from-orange-500 to-amber-500", link: "/admin/settings" },
  { icon: Globe, label: "Clients", color: "from-purple-500 to-pink-500", link: "/admin/clients" },
];

const AdminDashboardHome = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  return (
    <div className="space-y-8">
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete platform overview and management.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Quick search..." className="pl-10 w-48 bg-secondary/50" />
          </div>
          <Button variant="hero">
            <Activity className="h-4 w-4 mr-2" /> Live Monitor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <Link
            to={action.link}
            key={action.label}
            className={`glass rounded-xl p-4 flex flex-col items-center gap-2 hover-lift transition-all ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color}`}>
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} className={`relative overflow-hidden hover-lift ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(index + 1) * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-destructive"}`}>{stat.change}</span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shrink-0`}>
                  <stat.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`lg:col-span-2 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "500ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/admin/bookings">View all <ArrowUpRight className="h-4 w-4 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Guest</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hotel</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Check-in</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{b.guest}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{b.hotel}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{b.checkIn}</td>
                      <td className="py-3 px-4 font-medium">{b.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          b.status === "confirmed" ? "bg-green-500/10 text-green-500"
                            : b.status === "pending" ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive"
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "600ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Properties</CardTitle>
            <button className="p-2 hover:bg-secondary rounded-lg"><MoreHorizontal className="h-4 w-4" /></button>
          </CardHeader>
          <CardContent className="space-y-4">
            {topHotels.map((hotel, index) => (
              <div key={hotel.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{hotel.name}</p>
                  <p className="text-sm text-muted-foreground">{hotel.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gradient">{hotel.revenue}</p>
                  <p className="text-xs text-muted-foreground">{hotel.occupancy}% occ.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "700ms" }}>
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl glass">
              <p className="text-3xl font-bold text-gradient mb-1">156</p>
              <p className="text-sm text-muted-foreground">Hotel System Admins</p>
            </div>
            <div className="text-center p-6 rounded-xl glass">
              <p className="text-3xl font-bold text-gradient mb-1">12</p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </div>
            <div className="text-center p-6 rounded-xl glass">
              <p className="text-3xl font-bold text-gradient mb-1">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardHome;
