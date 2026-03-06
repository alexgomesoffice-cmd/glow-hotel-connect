import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, DollarSign, Users, Edit, Search, LayoutGrid, List, BedDouble, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockRooms = [
  { id: 1, name: "Suite 301", type: "Suite", price: 350, capacity: 4, status: "occupied", guest: "Alice Martin" },
  { id: 2, name: "Deluxe 205", type: "Deluxe", price: 220, capacity: 2, status: "occupied", guest: "Robert Kim" },
  { id: 3, name: "Standard 112", type: "Standard", price: 120, capacity: 2, status: "available", guest: null },
  { id: 4, name: "Suite 402", type: "Suite", price: 400, capacity: 4, status: "maintenance", guest: null },
  { id: 5, name: "Deluxe 310", type: "Deluxe", price: 250, capacity: 3, status: "available", guest: null },
  { id: 6, name: "Standard 115", type: "Standard", price: 110, capacity: 2, status: "occupied", guest: "Sophie Chen" },
];

const statusConfig: Record<string, { bg: string; dot: string }> = {
  occupied: { bg: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500" },
  available: { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", dot: "bg-blue-500" },
  maintenance: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
};

const typeGradients: Record<string, string> = {
  Suite: "from-purple-500 to-pink-500",
  Deluxe: "from-primary to-accent",
  Standard: "from-green-500 to-emerald-500",
  Penthouse: "from-amber-500 to-orange-500",
};

const HotelAdminRooms = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = mockRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(search.toLowerCase()) || (room.guest?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRooms = mockRooms.length;
  const occupiedRooms = mockRooms.filter(r => r.status === "occupied").length;
  const availableRooms = mockRooms.filter(r => r.status === "available").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Rooms</h1>
          <p className="text-muted-foreground">Manage rooms for your hotel</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/hotel-admin/add-room"><Plus className="h-4 w-4 mr-2" /> Add Room</Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {[
          { label: "Total Rooms", value: totalRooms, gradient: "from-primary to-accent", icon: BedDouble },
          { label: "Occupied", value: occupiedRooms, gradient: "from-green-500 to-emerald-500", icon: Users },
          { label: "Available", value: availableRooms, gradient: "from-blue-500 to-cyan-500", icon: Sparkles },
        ].map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden hover-lift">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shrink-0`}>
                  <stat.icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by room number or guest..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border border-border rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-3 transition-all duration-300 ${viewMode === "grid" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-3 transition-all duration-300 ${viewMode === "list" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, index) => (
            <Card key={room.id} className="relative overflow-hidden hover-lift animate-fade-in-up group" style={{ animationDelay: `${(index + 3) * 80}ms` }}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${typeGradients[room.type] || "from-primary to-accent"}`}>
                      <BedDouble className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">{room.type}</p>
                    </div>
                  </div>
                  <Badge className={`border ${statusConfig[room.status]?.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[room.status]?.dot}`} />
                    {room.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-green-500" /><span className="font-medium text-foreground">${room.price}</span>/night</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />{room.capacity} guests</span>
                </div>
                {room.guest && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">{room.guest.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <span className="text-sm font-medium">{room.guest}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full group-hover:border-primary/50 transition-colors">
                  <Edit className="h-4 w-4 mr-2" /> Edit Room
                </Button>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${typeGradients[room.type] || "from-primary to-accent"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {["Room", "Type", "Price", "Capacity", "Guest", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((room) => (
                    <tr key={room.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${typeGradients[room.type] || "from-primary to-accent"}`}>
                            <BedDouble className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                          <span className="font-medium">{room.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-muted-foreground">{room.type}</td>
                      <td className="py-3.5 px-4 text-sm font-medium">${room.price}/night</td>
                      <td className="py-3.5 px-4 text-sm">{room.capacity}</td>
                      <td className="py-3.5 px-4 text-sm">{room.guest || <span className="text-muted-foreground/50">—</span>}</td>
                      <td className="py-3.5 px-4">
                        <Badge className={`border ${statusConfig[room.status]?.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[room.status]?.dot}`} />
                          {room.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4"><Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            <BedDouble className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No rooms match your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default HotelAdminRooms;
