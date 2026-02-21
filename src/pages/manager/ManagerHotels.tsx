import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin, Star, BedDouble, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockHotels = [
  { id: 1, name: "Grand Palace Hotel", location: "Paris, France", rooms: 120, rating: 4.8, occupancy: 87, image: "🏨" },
  { id: 2, name: "Seaside Resort", location: "Dubai, UAE", rooms: 85, rating: 4.6, occupancy: 72, image: "🏖️" },
  { id: 3, name: "Mountain Lodge", location: "Tokyo, Japan", rooms: 45, rating: 4.9, occupancy: 91, image: "🏔️" },
];

const ManagerHotels = () => {
  const [hotels] = useState(mockHotels);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Hotels</h1>
          <p className="text-muted-foreground">Manage all your hotel properties</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/manager/add-hotel"><Plus className="h-4 w-4 mr-2" /> Add Hotel</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden hover-lift transition-all duration-300">
            <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
              {hotel.image}
            </div>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {hotel.location}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {hotel.rooms} rooms</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> {hotel.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-500">{hotel.occupancy}% occupied</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManagerHotels;
