import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiPost, apiGet } from "@/utils/api";
import { fetchHotelTypeOptions, type EnumOption } from "@/services/publicHotelApi";

interface FormData {
  name: string;
  city: string;
  address: string;
  zipCode: string;
  hotel_type: string;
  star_rating: string;
  owner_name: string;
  email: string;
  emergency_contact1: string;
  emergency_contact2: string;
  reception_no1: string;
  reception_no2: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_phone: string;
  admin_nid: string;
}

interface City {
  id: number;
  name: string;
  image_url: string | null;
}

const AdminAddHotel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [hotelTypeOptions, setHotelTypeOptions] = useState<EnumOption[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<{ id: string; name: string }[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    city: "",
    address: "",
    zipCode: "",
    hotel_type: "hotel",
    star_rating: "3",
    owner_name: "",
    email: "",
    emergency_contact1: "",
    emergency_contact2: "",
    reception_no1: "",
    reception_no2: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    admin_phone: "",
    admin_nid: "",
  });

  useEffect(() => {
    setIsLoaded(true);
    fetchCities();
    fetchAmenities();
    const run = async () => {
      try {
        const opts = await fetchHotelTypeOptions();
        setHotelTypeOptions(opts);
      } catch (e) {
        console.error("Failed to fetch hotel type options:", e);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hotelTypeOptions.length) return;
    // If current value is missing from the backend options, default to the first option.
    if (!hotelTypeOptions.some((o) => o.value === formData.hotel_type)) {
      setFormData((prev) => ({ ...prev, hotel_type: hotelTypeOptions[0].value }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelTypeOptions]);

  const fetchCities = useCallback(async () => {
    try {
      setCitiesLoading(true);
      const response = await apiGet("/cities");
      if (response.success && response.data) {
        setCities(response.data);
        // Set default city to first city in list
        if (response.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            city: response.data[0].name,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive",
      });
    } finally {
      setCitiesLoading(false);
    }
  }, [toast]);

  const fetchAmenities = useCallback(async () => {
    try {
      const response = await apiGet("/hotels/amenities");
      if (response.success && response.data) {
        const mappedAmenities = response.data.map((amenity: any) => ({
          id: String(amenity.id),
          name: amenity.name,
        }));
        setAvailableAmenities(mappedAmenities);
        console.log("✅ Hotel amenities loaded from backend:", mappedAmenities.length, "items");
      }
    } catch (error) {
      console.error("Failed to fetch amenities:", error);
      toast({
        title: "Error",
        description: "Failed to load amenities",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = images.length + newFiles.length;

    if (totalImages > 8) {
      toast({
        title: "Image Limit",
        description: "Maximum 8 images allowed",
        variant: "destructive",
      });
      return;
    }

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateRequired = (): boolean => {
    const required = ["name", "city", "address", "zipCode", "hotel_type", "owner_name", "email", "admin_name", "admin_email", "admin_password"];
    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        toast({
          title: "Missing Required Field",
          description: `${field} is required`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequired()) return;

    setIsSubmitting(true);

    try {
      // Convert images to base64 URLs
      const imageUrls = imagePreviews;

      // Convert selected amenity IDs to names
      const selectedAmenityNames = selectedAmenities.map(id => {
        const amenity = availableAmenities.find(a => a.id === id);
        return amenity ? amenity.name : null;
      }).filter(Boolean);

      // Create hotel payload 
      const payload = {
        name: formData.name,
        city: formData.city,
        address: formData.address,
        zip_code: formData.zipCode,
        hotel_type: formData.hotel_type,
        email: formData.email,
        star_rating: formData.star_rating ? Number(formData.star_rating) : undefined,
        emergency_contact1: formData.emergency_contact1,
        emergency_contact2: formData.emergency_contact2,
        owner_name: formData.owner_name,
        details: {
          reception_no1: formData.reception_no1,
          reception_no2: formData.reception_no2,
          star_rating: formData.star_rating ? Number(formData.star_rating) : undefined,
        },
        amenities: selectedAmenityNames,
        images: imageUrls,
        admin: {
          name: formData.admin_name,
          email: formData.admin_email,
          password: formData.admin_password,
          phone: formData.admin_phone,
          nid_no: formData.admin_nid,
        },
      };

      const response = await apiPost("/hotels/create", payload);

      if (response.success) {
        toast({
          title: "Success",
          description: "Hotel created successfully with DRAFT status. Hotel manager can now add rooms and request approval.",
          variant: "default",
        });
        navigate("/admin/hotels");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create hotel",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Hotel creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Add New Hotel</h1>
          <p className="text-muted-foreground">Create a new hotel property and setup hotel admin account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Hotel Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hotel_type">Hotel Type *</Label>
                <Select value={formData.hotel_type} onValueChange={(value) => handleSelectChange("hotel_type", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hotelTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="owner_name">Owner Name *</Label>
                <Input
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  placeholder="Enter owner name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="star_rating">Star Rating</Label>
                <Select value={formData.star_rating} onValueChange={(value) => handleSelectChange("star_rating", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <SelectItem key={star} value={String(star)}>
                        {star} Star{star > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter hotel address"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => handleSelectChange("city", value)}
                  disabled={citiesLoading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select a city"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Enter zip code"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact1">Emergency Contact 1</Label>
                <Input
                  id="emergency_contact1"
                  name="emergency_contact1"
                  value={formData.emergency_contact1}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="emergency_contact2">Emergency Contact 2</Label>
                <Input
                  id="emergency_contact2"
                  name="emergency_contact2"
                  value={formData.emergency_contact2}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="reception_no1">Reception Number 1</Label>
                <Input
                  id="reception_no1"
                  name="reception_no1"
                  value={formData.reception_no1}
                  onChange={handleInputChange}
                  placeholder="Enter reception number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reception_no2">Reception Number 2</Label>
                <Input
                  id="reception_no2"
                  name="reception_no2"
                  value={formData.reception_no2}
                  onChange={handleInputChange}
                  placeholder="Enter reception number"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            {availableAmenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-2.5">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={selectedAmenities.includes(amenity.id)}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                    />
                    <Label
                      htmlFor={`amenity-${amenity.id}`}
                      className="cursor-pointer font-normal"
                    >
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading amenities...</p>
            )}
          </CardContent>
        </Card>

        {/* Hotel Admin Account */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Admin Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="admin_name">Admin Name *</Label>
                <Input
                  id="admin_name"
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleInputChange}
                  placeholder="Enter admin name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="admin_email">Admin Email *</Label>
                <Input
                  id="admin_email"
                  name="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={handleInputChange}
                  placeholder="Enter admin email"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="admin_password">Admin Password *</Label>
                <Input
                  id="admin_password"
                  name="admin_password"
                  type="password"
                  value={formData.admin_password}
                  onChange={handleInputChange}
                  placeholder="Enter admin password"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="admin_phone">Admin Phone</Label>
                <Input
                  id="admin_phone"
                  name="admin_phone"
                  value={formData.admin_phone}
                  onChange={handleInputChange}
                  placeholder="Enter admin phone"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="admin_nid">Admin NID</Label>
              <Input
                id="admin_nid"
                name="admin_nid"
                value={formData.admin_nid}
                onChange={handleInputChange}
                placeholder="Enter admin NID"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hotel Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Images (Max 8)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-border p-6">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Upload Images</span>
                <span className="text-xs text-muted-foreground">
                  {images.length}/8 images selected
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={images.length >= 8}
                />
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-destructive/90 p-1 text-white hover:bg-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="hero"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Creating..." : "Create Hotel"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddHotel;
