import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const amenitiesList = ["WiFi", "TV", "Mini Bar", "Air Conditioning", "Safe", "Balcony", "Ocean View", "Room Service"];

const HotelAdminAddRoom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", type: "", price: "", capacity: "", beds: "", size: "", description: "" });
  const [amenities, setAmenities] = useState<string[]>([]);

  const toggleAmenity = (a: string) => setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.price) {
      toast({ title: "Missing fields", description: "Please fill in the required fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Room Added!", description: `${formData.name} has been added successfully.` });
    navigate("/hotel-admin/rooms");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/hotel-admin/rooms")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Add New Room</h1>
          <p className="text-muted-foreground">Add a room to your hotel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Room Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Name / Number *</Label>
                <Input placeholder="e.g. Suite 301" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Room Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price per Night *</Label>
                <Input type="number" placeholder="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Max Guests</Label>
                <Input type="number" placeholder="2" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Size (m²)</Label>
                <Input type="number" placeholder="30" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe this room..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {amenitiesList.map((a) => (
                <label key={a} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />
                  <span className="text-sm">{a}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Drag & drop room images here, or click to browse</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={() => navigate("/hotel-admin/rooms")}>Cancel</Button>
          <Button variant="hero" type="submit">Add Room</Button>
        </div>
      </form>
    </div>
  );
};

export default HotelAdminAddRoom;
