import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, BedDouble } from "lucide-react";
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
  const [formData, setFormData] = useState({ roomNumber: "", type: "", bedType: "", price: "", capacity: "", size: "", description: "" });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);

  const toggleAmenity = (a: string) => setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.roomNumber || !formData.type || !formData.price) {
      toast({ title: "Missing fields", description: "Please fill in the required fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Room Added!", description: `Room ${formData.roomNumber} has been added successfully.` });
    navigate("/hotel-admin/rooms");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button variant="outline" size="icon" className="shrink-0 hover:border-primary/50 transition-colors" onClick={() => navigate("/hotel-admin/rooms")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
            <BedDouble className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Add New Room</h1>
            <p className="text-muted-foreground">Add a room to your hotel</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-primary to-accent" />
              Room Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Number *</Label>
                <Input placeholder="e.g. 301" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bed Type</Label>
                <Select value={formData.bedType} onValueChange={(v) => setFormData({ ...formData, bedType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select bed type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="queen">Queen</SelectItem>
                    <SelectItem value="king">King</SelectItem>
                    <SelectItem value="twin">Twin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price per Night *</Label>
                <Input type="number" placeholder="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Occupancy</Label>
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
            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox checked={smokingAllowed} onCheckedChange={(v) => setSmokingAllowed(!!v)} />
                <span className="text-sm font-medium group-hover:text-foreground transition-colors">Smoking Allowed?</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox checked={petsAllowed} onCheckedChange={(v) => setPetsAllowed(!!v)} />
                <span className="text-sm font-medium group-hover:text-foreground transition-colors">Pets Allowed?</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
              Amenities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {amenitiesList.map((a) => (
                <label key={a} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${amenities.includes(a) ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-secondary/50"}`}>
                  <Checkbox checked={amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />
                  <span className="text-sm font-medium">{a}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground">Drag & drop room images here, or <span className="text-primary font-medium">click to browse</span></p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <Button variant="outline" type="button" onClick={() => navigate("/hotel-admin/rooms")}>Cancel</Button>
          <Button variant="hero" type="submit">Add Room</Button>
        </div>
      </form>
    </div>
  );
};

export default HotelAdminAddRoom;
