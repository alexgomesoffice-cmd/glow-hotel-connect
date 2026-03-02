import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, AlertTriangle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const mockHotels = [
  { id: 1, name: "Grand Palace Hotel", location: "Paris, France", hotelSystemAdmin: "Maria Garcia", rooms: 120 },
  { id: 2, name: "Seaside Resort", location: "Dubai, UAE", hotelSystemAdmin: "John Smith", rooms: 85 },
  { id: 3, name: "Mountain Lodge", location: "Tokyo, Japan", hotelSystemAdmin: "Sarah Lee", rooms: 45 },
];

const AdminEraseHotel = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hotels, setHotels] = useState(mockHotels);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => { setIsLoaded(true); }, []);

  const filtered = hotels.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: number) => {
    const hotel = hotels.find((h) => h.id === id);
    setHotels(hotels.filter((h) => h.id !== id));
    setConfirmId(null);
    toast({ title: "Hotel Erased", description: `${hotel?.name} has been permanently removed.` });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/hotels")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Erase Hotel</h1>
          <p className="text-muted-foreground">Permanently remove a property from the platform</p>
        </div>
      </div>

      <div className={`relative ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search hotels..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-4">
        {filtered.map((hotel, i) => (
          <Card key={hotel.id} className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 2) * 100}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground">{hotel.location} · {hotel.rooms} rooms · Hotel System Admin: {hotel.hotelSystemAdmin}</p>
                </div>
                {confirmId === hotel.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Confirm?</span>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(hotel.id)}>Yes, Erase</Button>
                    <Button variant="outline" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirmId(hotel.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Erase
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No hotels found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminEraseHotel;
