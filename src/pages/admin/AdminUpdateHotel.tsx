import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const bangladeshCities = [
  "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet",
  "Rangpur", "Barisal", "Comilla", "Gazipur", "Narayanganj",
  "Mymensingh", "Jessore", "Bogra", "Dinajpur", "Cox's Bazar",
  "Brahmanbaria", "Savar", "Tongi", "Narsingdi", "Tangail",
];

const hotelAmenities = [
  "Swimming Pool", "Gym / Fitness Center", "Free Wi-Fi", "Parking",
  "Restaurant", "Bar / Lounge", "Spa & Wellness", "Conference Room",
  "24/7 Front Desk", "Room Service", "Laundry Service", "Airport Shuttle",
  "Garden / Terrace", "Elevator", "CCTV Security", "Power Backup",
  "Wheelchair Accessible", "Pet Friendly", "Kids Play Area", "Business Center",
];

const AdminUpdateHotel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: "Grand Palace Hotel", location: "Dhaka", address: "123 Main Street, Gulshan", zipCode: "1212",
    description: "A luxurious hotel in the heart of Dhaka.", type: "hotel", stars: "5",
    email: "info@grandpalace.com", eContact1: "+880 1711 123456", eContact2: "+880 1811 654321",
    receptionNumber1: "+880 2 9876543", receptionNumber2: "+880 2 1234567",
    ownerName: "Mr. Rahman", managerName: "Mr. Karim", managerPhone: "+880 1911 111222",
    adminEmail: "admin@grandpalace.com", adminName: "Maria Garcia", adminPhone: "+880 1611 333444", adminNID: "1234567890",
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["Swimming Pool", "Free Wi-Fi", "Restaurant", "Parking", "Room Service"]);

  useEffect(() => { setIsLoaded(true); }, []);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Hotel Updated!", description: `${formData.name} has been updated successfully.` });
    navigate("/admin/hotels");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/hotels")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Update Hotel Info</h1>
          <p className="text-muted-foreground">Edit property details and hotel system admin info</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hotel Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location (City) *</Label>
                <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {bangladeshCities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Zip Code</Label>
                <Input value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hotel Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="boutique">Boutique</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Star Rating</Label>
                <Select value={formData.stars} onValueChange={(v) => setFormData({ ...formData, stars: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((s) => <SelectItem key={s} value={String(s)}>{s} Star{s > 1 && "s"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Owner's Name</Label>
                <Input value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hotel Manager Name</Label>
                <Input value={formData.managerName} onChange={(e) => setFormData({ ...formData, managerName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Manager's Phone</Label>
                <Input type="tel" value={formData.managerPhone} onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
          <CardHeader><CardTitle>Hotel System Admin Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Admin Name</Label>
                <Input value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input type="email" value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" value={formData.adminPhone} onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>NID No.</Label>
                <Input value={formData.adminNID} onChange={(e) => setFormData({ ...formData, adminNID: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
          <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hotel Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E. Contact 1</Label>
                <Input type="tel" value={formData.eContact1} onChange={(e) => setFormData({ ...formData, eContact1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E. Contact 2</Label>
                <Input type="tel" value={formData.eContact2} onChange={(e) => setFormData({ ...formData, eContact2: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reception Number 1</Label>
                <Input type="tel" value={formData.receptionNumber1} onChange={(e) => setFormData({ ...formData, receptionNumber1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Reception Number 2</Label>
                <Input type="tel" value={formData.receptionNumber2} onChange={(e) => setFormData({ ...formData, receptionNumber2: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "400ms" }}>
          <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Drag & drop images here, or click to browse</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "500ms" }}>
          <CardHeader><CardTitle>Hotel Amenities</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {hotelAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <Checkbox
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={() => navigate("/admin/hotels")}>Cancel</Button>
          <Button variant="hero" type="submit"><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateHotel;
