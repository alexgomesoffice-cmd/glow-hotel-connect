import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin, Star, BedDouble, Edit, Trash2, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockHotels = [
  { id: 1, name: "Grand Palace Hotel", location: "Paris, France", rooms: 120, rating: 4.8, occupancy: 87, hotelSystemAdmin: "Maria Garcia", image: "🏨" },
  { id: 2, name: "Seaside Resort", location: "Dubai, UAE", rooms: 85, rating: 4.6, occupancy: 72, hotelSystemAdmin: "John Smith", image: "🏖️" },
  { id: 3, name: "Mountain Lodge", location: "Tokyo, Japan", rooms: 45, rating: 4.9, occupancy: 91, hotelSystemAdmin: "Sarah Lee", image: "🏔️" },
  { id: 4, name: "Urban Suites", location: "London, UK", rooms: 60, rating: 4.5, occupancy: 68, hotelSystemAdmin: "Maria Garcia", image: "🏢" },
];

const AdminCurrentHotels = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Current Hotels</h1>
          <p className="text-muted-foreground">All registered properties on the platform</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/admin/add-hotel"><Plus className="h-4 w-4 mr-2" /> Add New Hotel</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockHotels.map((hotel, i) => (
          <Card key={hotel.id} className={`overflow-hidden hover-lift transition-all duration-300 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 1) * 100}ms` }}>
            <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
              {hotel.image}
            </div>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {hotel.location}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <UserCheck className="h-4 w-4" /> Hotel System Admin: {hotel.hotelSystemAdmin}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {hotel.rooms} rooms</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> {hotel.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-500">{hotel.occupancy}% occupied</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link to="/admin/update-hotel"><Edit className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" size="icon" asChild className="text-destructive hover:bg-destructive/10">
                    <Link to="/admin/erase-hotel"><Trash2 className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCurrentHotels;
