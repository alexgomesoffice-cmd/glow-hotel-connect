import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, DollarSign, Users, Edit, Search, LayoutGrid, List, BedDouble, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiDelete } from "@/utils/api";

interface Room {
  hotel_room_details_id: number;
  room_number: string;
  bed_type: string | null;
  max_occupancy: number;
  smoking_allowed: boolean;
  pet_allowed: boolean;
  status: "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";
  room_type: string;
  base_price: string | number;
  created_at: string;
}

const statusConfig: Record<string, { bg: string; dot: string }> = {
  AVAILABLE: { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", dot: "bg-blue-500" },
  UNAVAILABLE: { bg: "bg-red-500/10 text-red-500 border-red-500/20", dot: "bg-red-500" },
  MAINTENANCE: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
};

const typeGradients: Record<string, string> = {
  standard: "from-green-500 to-emerald-500",
  delux: "from-primary to-accent",
  Suite: "from-purple-500 to-pink-500",
  Deluxe: "from-primary to-accent",
  Standard: "from-green-500 to-emerald-500",
  Penthouse: "from-amber-500 to-orange-500",
  suite: "from-purple-500 to-pink-500",
  penthouse: "from-amber-500 to-orange-500",
};

const HotelAdminRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [availableRoomTypes, setAvailableRoomTypes] = useState<string[]>([]);
  const { toast } = useToast();
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        
        // First, get the hotel ID for the current admin
        const hotelResponse = await apiGet("/hotels/admin/me/assigned-hotel");
        if (!hotelResponse.success || !hotelResponse.data?.hotel_id) {
          toast({
            title: "Error",
            description: "Could not determine assigned hotel",
            variant: "destructive",
          });
          return;
        }
        
        const currentHotelId = hotelResponse.data.hotel_id;
        setHotelId(currentHotelId);
        
        // Now fetch all physical rooms for this hotel
        const roomsResponse = await apiGet(`/hotels/${currentHotelId}/physical-rooms?skip=0&take=500`);
        if (roomsResponse.success && roomsResponse.data?.rooms && Array.isArray(roomsResponse.data.rooms)) {
          setRooms(roomsResponse.data.rooms);
          
          // Extract unique room types from the fetched rooms
          const types = Array.from(new Set(roomsResponse.data.rooms.map((r: Room) => r.room_type))) as string[];
          setAvailableRoomTypes(types.sort());
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load rooms",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [toast]);

  const handleDeleteRoom = async (roomDetailId: number, roomNumber: string) => {
    if (!confirm(`Are you sure you want to delete room ${roomNumber}?`)) {
      return;
    }

    try {
      setDeletingId(roomDetailId);
      // Find the room_type_id by finding the room in state
      const room = rooms.find(r => r.hotel_room_details_id === roomDetailId);
      if (!room) {
        toast({
          title: "Error",
          description: "Room not found",
          variant: "destructive",
        });
        return;
      }

      // You would need to fetch room_id first - for now using a placeholder
      // In real scenario, you'd have room_type_id from the backend
      await apiDelete(`/rooms/1/physical-rooms/${roomDetailId}`);
      
      setRooms(rooms.filter(r => r.hotel_room_details_id !== roomDetailId));
      toast({
        title: "Success",
        description: `Room ${roomNumber} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = rooms.filter((room) => {
    const matchesSearch = 
      String(room.room_number).toLowerCase().includes(search.toLowerCase()) || 
      String(room.room_type).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter.toUpperCase();
    const matchesType = typeFilter === "all" || room.room_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRooms = rooms.length;
  const unavailableRooms = rooms.filter(r => r.status === "UNAVAILABLE").length;
  const occupiedRooms = rooms.filter(r => r.status === "UNAVAILABLE").length; // Unavailable rooms are considered occupied
  const availableRooms = rooms.filter(r => r.status === "AVAILABLE").length;

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
              <Input placeholder="Search by room number or type..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {availableRoomTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
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

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, index) => (
            <Card key={room.hotel_room_details_id} className="relative overflow-hidden hover-lift animate-fade-in-up group" style={{ animationDelay: `${(index + 3) * 80}ms` }}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${typeGradients[room.room_type] || "from-primary to-accent"}`}>
                      <BedDouble className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Room {room.room_number}</h3>
                      <p className="text-sm text-muted-foreground">{room.room_type}</p>
                    </div>
                  </div>
                  <Badge className={`border ${statusConfig[room.status]?.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[room.status]?.dot}`} />
                    {room.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-green-500" /><span className="font-medium text-foreground">${room.base_price}</span>/night</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />{room.max_occupancy} guests</span>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:border-primary/50 transition-colors"
                    onClick={() => navigate(`/hotel-admin/edit-room/${room.hotel_room_details_id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit Room
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-red-500 text-white hover:bg-red-600 border-red-500 hover:border-red-600"
                    onClick={() => handleDeleteRoom(room.hotel_room_details_id, room.room_number)}
                    disabled={deletingId === room.hotel_room_details_id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> 
                    {deletingId === room.hotel_room_details_id ? "Deleting..." : "Delete Room"}
                  </Button>
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${typeGradients[room.room_type] || "from-primary to-accent"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
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
                    {["Room", "Type", "Price", "Capacity", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((room) => (
                    <tr key={room.hotel_room_details_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${typeGradients[room.room_type] || "from-primary to-accent"}`}>
                            <BedDouble className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                          <span className="font-medium">Room {room.room_number}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-muted-foreground">{room.room_type}</td>
                      <td className="py-3.5 px-4 text-sm font-medium">${room.base_price}/night</td>
                      <td className="py-3.5 px-4 text-sm font-medium">{room.max_occupancy} guests</td>
                      <td className="py-3.5 px-4">
                        <Badge className={`border ${statusConfig[room.status]?.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[room.status]?.dot}`} />
                          {room.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/hotel-admin/edit-room/${room.hotel_room_details_id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-500 text-white hover:bg-red-600 border-red-500 hover:border-red-600"
                            onClick={() => handleDeleteRoom(room.hotel_room_details_id, room.room_number)}
                            disabled={deletingId === room.hotel_room_details_id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && !isLoading && (
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
