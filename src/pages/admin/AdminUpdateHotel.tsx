import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getHotelEmoji, useAdminData } from "@/data/adminStore";
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

const emptyForm = {
  name: "", location: "", address: "", zipCode: "", description: "", type: "hotel", stars: "",
  email: "", eContact1: "", eContact2: "", receptionNumber1: "", receptionNumber2: "",
  ownerName: "", managerName: "", managerPhone: "",
  adminEmail: "", adminPassword: "", adminName: "", adminPhone: "", adminNID: "",
};

const AdminUpdateHotel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, saveData } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const hotel = data.hotels.find((item) => item.id === Number(id));
  const [formData, setFormData] = useState(emptyForm);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!hotel) return;
    setFormData({
      name: hotel.name,
      location: hotel.location,
      address: hotel.address,
      zipCode: hotel.zipCode,
      description: hotel.description,
      type: hotel.type,
      stars: String(hotel.stars),
      email: hotel.email,
      eContact1: hotel.eContact1,
      eContact2: hotel.eContact2,
      receptionNumber1: hotel.receptionNumber1,
      receptionNumber2: hotel.receptionNumber2,
      ownerName: hotel.ownerName,
      managerName: hotel.managerName,
      managerPhone: hotel.managerPhone,
      adminEmail: hotel.adminEmail,
      adminPassword: hotel.adminPassword,
      adminName: hotel.adminName,
      adminPhone: hotel.adminPhone,
      adminNID: hotel.adminNID,
    });
    setSelectedAmenities(hotel.amenities);
  }, [hotel]);

  if (!hotel) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/admin/hotels")}>Go Back</Button>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">Hotel not found.</p>
            <p className="text-sm text-muted-foreground">This hotel may have been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((current) =>
      current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity],
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    saveData((current) => ({
      ...current,
      hotels: current.hotels.map((item) =>
        item.id === hotel.id
          ? {
              ...item,
              name: formData.name,
              location: formData.location,
              address: formData.address,
              zipCode: formData.zipCode,
              description: formData.description,
              type: formData.type,
              stars: Number(formData.stars || 0),
              email: formData.email,
              eContact1: formData.eContact1,
              eContact2: formData.eContact2,
              receptionNumber1: formData.receptionNumber1,
              receptionNumber2: formData.receptionNumber2,
              ownerName: formData.ownerName,
              managerName: formData.managerName,
              managerPhone: formData.managerPhone,
              adminEmail: formData.adminEmail,
              adminPassword: formData.adminPassword,
              adminName: formData.adminName,
              adminPhone: formData.adminPhone,
              adminNID: formData.adminNID,
              amenities: selectedAmenities,
              rating: Number(formData.stars || item.rating),
              image: getHotelEmoji(formData.type),
            }
          : item,
      ),
    }));

    toast({ title: "Hotel updated", description: `${formData.name} has been updated successfully.` });
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
          <p className="text-muted-foreground">Edit property details and hotel system admin information.</p>
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
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
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
                <Select value={formData.stars} onValueChange={(value) => setFormData({ ...formData, stars: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((star) => <SelectItem key={star} value={String(star)}>{star} Star{star > 1 && "s"}</SelectItem>)}
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
                <Input value={formData.managerPhone} onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={formData.adminPassword} onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formData.adminPhone} onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>NID No.</Label>
                <Input value={formData.adminNID} onChange={(e) => setFormData({ ...formData, adminNID: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "260ms" }}>
          <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Hotel Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E. Contact 1</Label>
                <Input value={formData.eContact1} onChange={(e) => setFormData({ ...formData, eContact1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E. Contact 2</Label>
                <Input value={formData.eContact2} onChange={(e) => setFormData({ ...formData, eContact2: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reception Number 1</Label>
                <Input value={formData.receptionNumber1} onChange={(e) => setFormData({ ...formData, receptionNumber1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Reception Number 2</Label>
                <Input value={formData.receptionNumber2} onChange={(e) => setFormData({ ...formData, receptionNumber2: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "340ms" }}>
          <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag & drop images here, or click to browse</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "420ms" }}>
          <CardHeader><CardTitle>Hotel Amenities</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {hotelAmenities.map((amenity) => (
                <label key={amenity} className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-primary">
                  <Checkbox checked={selectedAmenities.includes(amenity)} onCheckedChange={() => toggleAmenity(amenity)} />
                  {amenity}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/hotels")}>Cancel</Button>
          <Button type="submit" variant="hero"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateHotel;
