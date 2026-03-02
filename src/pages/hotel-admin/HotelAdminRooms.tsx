import { Link } from "react-router-dom";
import { Plus, BedDouble, Users, DollarSign, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockRooms = [
  { id: 1, name: "Suite 301", type: "Suite", price: 350, capacity: 4, status: "occupied", guest: "Alice Martin" },
  { id: 2, name: "Deluxe 205", type: "Deluxe", price: 220, capacity: 2, status: "occupied", guest: "Robert Kim" },
  { id: 3, name: "Standard 112", type: "Standard", price: 120, capacity: 2, status: "available", guest: null },
  { id: 4, name: "Suite 402", type: "Suite", price: 400, capacity: 4, status: "maintenance", guest: null },
  { id: 5, name: "Deluxe 310", type: "Deluxe", price: 250, capacity: 3, status: "available", guest: null },
  { id: 6, name: "Standard 115", type: "Standard", price: 110, capacity: 2, status: "occupied", guest: "Sophie Chen" },
];

const statusColors: Record<string, string> = {
  occupied: "bg-green-500/10 text-green-500",
  available: "bg-blue-500/10 text-blue-500",
  maintenance: "bg-amber-500/10 text-amber-500",
};

const HotelAdminRooms = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Rooms</h1>
        <p className="text-muted-foreground">Manage rooms for your selected hotel</p>
      </div>
      <Button variant="hero" asChild>
        <Link to="/hotel-admin/add-room"><Plus className="h-4 w-4 mr-2" /> Add Room</Link>
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockRooms.map((room) => (
        <Card key={room.id} className="hover-lift transition-all duration-300">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <p className="text-sm text-muted-foreground">{room.type}</p>
              </div>
              <Badge className={statusColors[room.status]}>{room.status}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />${room.price}/night</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{room.capacity} guests</span>
            </div>
            {room.guest && <p className="text-sm"><span className="text-muted-foreground">Guest:</span> {room.guest}</p>}
            <Button variant="outline" size="sm" className="w-full"><Edit className="h-4 w-4 mr-2" /> Edit Room</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default HotelAdminRooms;
