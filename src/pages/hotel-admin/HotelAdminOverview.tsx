import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble, DollarSign, TrendingUp, TrendingDown, Star, Users, Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const hotels = [
  { id: "1", name: "Grand Palace Hotel" },
  { id: "2", name: "Seaside Resort" },
  { id: "3", name: "Mountain Lodge" },
];

const stats = [
  { title: "Occupancy Rate", value: "87%", change: "+3.2%", trend: "up", icon: BedDouble, color: "from-primary to-accent" },
  { title: "Today's Revenue", value: "$4,280", change: "+18%", trend: "up", icon: DollarSign, color: "from-green-500 to-emerald-500" },
  { title: "Active Guests", value: "42", change: "-2", trend: "down", icon: Users, color: "from-orange-500 to-amber-500" },
  { title: "Avg. Rating", value: "4.8", change: "+0.1", trend: "up", icon: Star, color: "from-purple-500 to-pink-500" },
];

const todayReservations = [
  { guest: "Alice Martin", room: "Suite 301", checkIn: "14:00", status: "arriving" },
  { guest: "Robert Kim", room: "Deluxe 205", checkIn: "15:00", status: "arriving" },
  { guest: "Sophie Chen", room: "Standard 112", checkIn: "—", status: "departing" },
  { guest: "James Wilson", room: "Suite 402", checkIn: "16:00", status: "arriving" },
];

const HotelAdminOverview = () => {
  const [selectedHotel, setSelectedHotel] = useState(hotels[0].id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Good morning, Maria 👋</h1>
          <p className="text-muted-foreground">Here's your hotel overview for today.</p>
          {/* Hotel Selector */}
          <div className="mt-3 w-64">
            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
              <SelectTrigger>
                <SelectValue placeholder="Select hotel" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="hero" asChild>
            <Link to="/hotel-admin/add-room"><Plus className="h-4 w-4 mr-2" /> Add Room</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="relative overflow-hidden hover-lift animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-destructive"}`}>{stat.change}</span>
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

      {/* Today's Reservations */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <CardHeader>
          <CardTitle>Today's Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Guest</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayReservations.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{r.guest}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{r.room}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{r.checkIn}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.status === "arriving" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelAdminOverview;
