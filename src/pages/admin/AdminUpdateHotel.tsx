import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchHotelById, type HotelResponse } from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";
import { apiPut } from "@/utils/api";

const bangladeshCities = [
  "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet",
  "Rangpur", "Barisal", "Comilla", "Gazipur", "Narayanganj",
];

const AdminUpdateHotel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "Dhaka",
    hotel_type: "",
    description: "",
    star_rating: "3",
    owner_name: "",
    reception_no1: "",
    reception_no2: "",
    emergency_contact1: "",
    emergency_contact2: "",
    zip_code: "",
    email: "",
  });

  useEffect(() => {
    const loadHotel = async () => {
      try {
        if (!id) {
          throw new Error("Hotel id is missing");
        }
        const hotelId = Number(id);
        const foundHotel = await fetchHotelById(hotelId);
        setHotel(foundHotel);

        setFormData({
          name: foundHotel.name || "",
          address: foundHotel.address || "",
          city: foundHotel.city || "Dhaka",
          hotel_type: foundHotel.hotel_type || "",
          description: foundHotel.hotel_details?.description || "",
          star_rating: String(foundHotel.hotel_details?.star_rating ?? 3),
          owner_name: foundHotel.owner_name || "",
          reception_no1: foundHotel.hotel_details?.reception_no1 || "",
          reception_no2: foundHotel.hotel_details?.reception_no2 || "",
          emergency_contact1: foundHotel.emergency_contact1 || "",
          emergency_contact2: foundHotel.emergency_contact2 || "",
          zip_code: foundHotel.zip_code || "",
          email: foundHotel.email || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load hotel",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    loadHotel();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.city) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiPut(`/hotels/${id}`, {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        hotel_type: formData.hotel_type,
        owner_name: formData.owner_name,
        email: formData.email || undefined,
        emergency_contact1: formData.emergency_contact1 || undefined,
        emergency_contact2: formData.emergency_contact2 || undefined,
        zip_code: formData.zip_code || undefined,
        details: {
          description: formData.description || undefined,
          reception_no1: formData.reception_no1 || undefined,
          reception_no2: formData.reception_no2 || undefined,
          star_rating: formData.star_rating ? Number(formData.star_rating) : undefined,
        },
      });

      if (response.success === false) {
        throw new Error(response.message || "Failed to update hotel");
      }

      toast({
        title: "Hotel Updated Successfully",
        description: `${formData.name} has been updated.`,
      });

      navigate("/admin/hotels");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update hotel",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/admin/hotels")}>Go Back</Button>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">Loading hotel details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/hotels")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Update Hotel Info</h1>
          <p className="text-muted-foreground">Edit property details for {hotel.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hotel Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Hotel name"
                />
              </div>
              <div className="space-y-2">
                <Label>Location (City) *</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bangladeshCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Hotel description..."
                className="min-h-24"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hotel Type</Label>
                <Input
                  value={formData.hotel_type}
                  onChange={(e) => setFormData({ ...formData, hotel_type: e.target.value })}
                  placeholder="e.g., Resort, Boutique"
                />
              </div>
              <div className="space-y-2">
                <Label>Star Rating</Label>
                <Select value={formData.star_rating} onValueChange={(value) => setFormData({ ...formData, star_rating: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Owner Name</Label>
                <Input
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="Hotel owner name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Hotel email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reception Number 1</Label>
                <Input
                  value={formData.reception_no1}
                  onChange={(e) => setFormData({ ...formData, reception_no1: e.target.value })}
                  placeholder="+880-XXX-XXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Reception Number 2</Label>
                <Input
                  value={formData.reception_no2}
                  onChange={(e) => setFormData({ ...formData, reception_no2: e.target.value })}
                  placeholder="Optional second reception" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emergency Contact 1</Label>
                <Input
                  value={formData.emergency_contact1}
                  onChange={(e) => setFormData({ ...formData, emergency_contact1: e.target.value })}
                  placeholder="Emergency phone number" 
                />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact 2</Label>
                <Input
                  value={formData.emergency_contact2}
                  onChange={(e) => setFormData({ ...formData, emergency_contact2: e.target.value })}
                  placeholder="Optional emergency contact"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Zip Code</Label>
              <Input
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                placeholder="Zip code"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/hotels")}>
            Cancel
          </Button>
          <Button type="submit" variant="hero" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateHotel;
