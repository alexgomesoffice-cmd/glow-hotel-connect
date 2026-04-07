import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPut } from "@/utils/api";
import { fetchBedTypeOptions, type EnumOption } from "@/services/publicHotelApi";

interface RoomDetail {
  hotel_room_details_id: number;
  room_number: string;
  bed_type: string;
  max_occupancy: number;
  smoking_allowed: boolean;
  pet_allowed: boolean;
  status: "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";
  room_type: string;
  base_price: number;
  description: string;
  room_size?: string;
  image_url?: string;
  room_amenities?: Array<{
    amenity: {
      id: number;
      name: string;
    };
  }>;
}

interface RoomTypeWithDetails {
  hotel_room_id?: number;
  room_type: string;
  base_price: number;
  description?: string;
  room_size?: string;
  room_amenities?: Array<{
    amenity: {
      id: number;
      name: string;
    };
  }>;
  hotel_room_images?: Array<{
    image_url: string;
    is_cover: boolean;
  }>;
}

interface AmenityResponse {
  id: number;
  name: string;
  icon?: string;
  context?: string;
}

const HotelAdminEditRoom = () => {
  const navigate = useNavigate();
  const { roomDetailsId } = useParams<{ roomDetailsId: string }>();
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [hotelRoomId, setHotelRoomId] = useState<number | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<{ id: string; name: string }[]>([]);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<string[]>([]);
  const [bedTypeOptions, setBedTypeOptions] = useState<EnumOption[]>([]);

  const [roomData, setRoomData] = useState<RoomDetail | null>(null);
  const [formData, setFormData] = useState({
    room_number: "",
    bed_type: "",
    max_occupancy: "2",
    smoking_allowed: false,
    pet_allowed: false,
    status: "AVAILABLE" as const,
    room_type: "",
    base_price: "",
    description: "",
    room_size: ""
  });
  
  const [roomTypeFormData, setRoomTypeFormData] = useState({
    room_type: "",
    base_price: "",
    max_occupancy: "2",
    description: "",
    room_size: ""
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setIsLoading(true);

        // Get hotel ID first
        const hotelResponse = await apiGet("/hotels/admin/me/assigned-hotel");
        if (!hotelResponse.success || !hotelResponse.data?.hotel_id) {
          throw new Error("Could not determine assigned hotel");
        }
        setHotelId(hotelResponse.data.hotel_id);

        // Fetch all rooms and find the specific one
        const roomsResponse = await apiGet(
          `/hotels/${hotelResponse.data.hotel_id}/physical-rooms?skip=0&take=500`
        );

        if (!roomsResponse.success || !roomsResponse.data?.rooms) {
          throw new Error("Failed to fetch rooms");
        }

        const room = roomsResponse.data.rooms.find(
          (r: RoomDetail) => r.hotel_room_details_id === parseInt(roomDetailsId || "0")
        );

        if (!room) {
          throw new Error("Room not found");
        }

        // Extract unique room types from all rooms for the dropdown
        const types = Array.from(new Set(roomsResponse.data.rooms.map((r: RoomDetail) => r.room_type))) as string[];
        setAvailableRoomTypes(types.sort());

        // Set amenities from the physical room data
        if (room.room_amenities && room.room_amenities.length > 0) {
          const amenityIds = room.room_amenities.map((ra) => String(ra.amenity.id));
          console.log("Loaded amenity IDs from physical room:", amenityIds);
          setSelectedAmenities(amenityIds);
        } else {
          console.log("No amenities found for this physical room");
        }

        // Set images for this physical room
        // Priority: Physical room's own image > Room type images
        const roomImages: string[] = [];

        // Add physical room's specific image if it exists
        if (room.image_url) {
          roomImages.push(room.image_url);
          console.log("Physical room has its own image:", room.image_url);
        }

        // Fetch room type details to get shared images
        const roomTypesResponse = await apiGet(`/rooms?hotel_id=${hotelResponse.data.hotel_id}&skip=0&take=100`);
        if (roomTypesResponse.success && roomTypesResponse.data?.rooms) {
          // Debug: log all available room types and the current room_type
          console.log("Available room types from backend:", roomTypesResponse.data.rooms.map((r: RoomTypeWithDetails) => r.room_type));

          // Try to find the room type (case-insensitive, trimmed)
          const roomTypeData = roomTypesResponse.data.rooms.find(
            (r: RoomTypeWithDetails) => r.room_type.trim().toLowerCase() === room.room_type.trim().toLowerCase()
          ) as RoomTypeWithDetails | undefined;

          if (roomTypeData) {
            // Store the hotel_room_id for later use in updates
            if (roomTypeData.hotel_room_id) {
              setHotelRoomId(roomTypeData.hotel_room_id);
            }

            // Add room type images if physical room doesn't have its own image
            if (!room.image_url && roomTypeData.hotel_room_images && roomTypeData.hotel_room_images.length > 0) {
              const typeImageUrls = roomTypeData.hotel_room_images.map((img) => img.image_url);
              roomImages.push(...typeImageUrls);
              console.log("Using room type images:", typeImageUrls.length);
            } else if (room.image_url) {
              console.log("Physical room has its own image, skipping room type images");
            } else {
              console.log("No images found for this room type");
            }

            // Populate room type form data from room type data
            setRoomTypeFormData({
              room_type: roomTypeData.room_type,
              base_price: String(roomTypeData.base_price),
              max_occupancy: String(room.max_occupancy), // Keep from physical room
              description: roomTypeData.description || "",
              room_size: roomTypeData.room_size || ""
            });
          } else {
            // No matching room type found - this should not happen with correct data
            console.error("No matching roomTypeData found for room_type:", room.room_type, "Available types:", roomTypesResponse.data.rooms.map(r => r.room_type));
            throw new Error("Room type data not found in backend. Please ensure the room type exists.");
          }
        }

        // Set the images for display
        if (roomImages.length > 0) {
          setExistingPhotos(roomImages);
          setPreviewPhotos(roomImages);
          console.log("Total images for this room:", roomImages.length);
        } else {
          console.log("No images found for this physical room or its room type");
        }

        setRoomData(room);
        setFormData({
          room_number: room.room_number,
          bed_type: room.bed_type,
          max_occupancy: String(room.max_occupancy),
          smoking_allowed: room.smoking_allowed,
          pet_allowed: room.pet_allowed,
          status: room.status,
          room_type: room.room_type,
          base_price: String(room.base_price),
          description: room.description || "",
          room_size: room.room_size || ""
        });
      } catch (error) {
        console.error("Failed to fetch room details:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load room details",
          variant: "destructive"
        });
        navigate("/hotel-admin/rooms");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomDetailsId, navigate, toast]);

  // Fetch amenities
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/rooms/amenities/list");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          const roomAmenities = data.data.filter((amenity: any) => amenity.context === "ROOM");
          const mappedAmenities = (roomAmenities as AmenityResponse[]).map((amenity) => ({
            id: String(amenity.id),
            name: amenity.name
          }));
          console.log("Available room amenities loaded:", mappedAmenities);
          setAvailableAmenities(mappedAmenities);
        }
      } catch (error) {
        console.error("Failed to fetch amenities:", error);
      }
    };

    fetchAmenities();
  }, []);

  // Fetch enum-like bed type options
  useEffect(() => {
    const run = async () => {
      try {
        const opts = await fetchBedTypeOptions();
        setBedTypeOptions(opts);
      } catch (e) {
        console.error("Failed to fetch bed type options:", e);
      }
    };
    run();
  }, []);

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handlePhotoSelect(files);
  };

  const handlePhotoSelect = (files: File[]) => {
    const validPhotos = files.filter((f) => f.type.startsWith("image/"));
    setUploadedPhotos((prev) => [...prev, ...validPhotos]);

    // Create preview URLs
    validPhotos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewPhotos((prev) => [...prev, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handlePhotoSelect(files);
  };

  const removePhoto = (index: number) => {
    // If it's an existing photo, remove from existing photos
    if (index < existingPhotos.length) {
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
      setPreviewPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Otherwise, remove from uploaded photos
      const uploadIndex = index - existingPhotos.length;
      setUploadedPhotos((prev) => prev.filter((_, i) => i !== uploadIndex));
      setPreviewPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.room_number || !formData.bed_type) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!roomTypeFormData.room_type || !roomTypeFormData.base_price) {
      toast({
        title: "Missing fields",
        description: "Please fill in Room Type and Base Price",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      if (!roomData) {
        throw new Error("Room data not available");
      }

      if (!hotelRoomId) {
        throw new Error("Hotel room ID not available");
      }

      // Convert new uploaded photos to base64
      const newImageUrls = await Promise.all(
        uploadedPhotos.map(file =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
          })
        )
      );

      // Handle images: New uploads become specific to this physical room
      let physicalRoomImageUrl = roomData.image_url; // Keep existing physical room image

      if (newImageUrls.length > 0) {
        // If new images uploaded, use the first one as the physical room's specific image
        // This replaces any existing physical room image
        physicalRoomImageUrl = newImageUrls[0];
        console.log("Setting physical room specific image:", physicalRoomImageUrl);
      }

      // Update preview photos: show physical room image + any additional new images
      const updatedPreviewPhotos = [];
      if (physicalRoomImageUrl) {
        updatedPreviewPhotos.push(physicalRoomImageUrl);
      }
      // Add any additional new images beyond the first
      if (newImageUrls.length > 1) {
        updatedPreviewPhotos.push(...newImageUrls.slice(1));
      }

      // For display purposes, update the preview
      setPreviewPhotos(updatedPreviewPhotos);

      // API Call 1: Update room type (without images since they're now per physical room)
      const roomTypePayload = {
        room_type: roomTypeFormData.room_type,
        base_price: parseFloat(roomTypeFormData.base_price),
        description: roomTypeFormData.description,
        room_size: roomTypeFormData.room_size
        // No images - images are now per physical room
      };

      console.log("Submitting room update - room type without images, physical room with image");

      const roomTypeResponse = await apiPut(`/rooms/${hotelRoomId}`, roomTypePayload);

      if (!roomTypeResponse.success) {
        throw new Error(roomTypeResponse.message || "Failed to update room type");
      }

      // API Call 2: Update physical room details with amenities and specific image
      const physicalRoomPayload = {
        room_number: formData.room_number,
        bed_type: formData.bed_type,
        max_occupancy: parseInt(formData.max_occupancy),
        smoking_allowed: formData.smoking_allowed,
        pet_allowed: formData.pet_allowed,
        status: formData.status,
        image_url: physicalRoomImageUrl, // Physical room specific image
        amenities: selectedAmenities // ✅ Include amenities (now per physical room)
      };

      const physicalRoomResponse = await apiPut(
        `/rooms/${hotelRoomId}/physical-rooms/${roomData.hotel_room_details_id}`,
        physicalRoomPayload
      );

      if (!physicalRoomResponse.success) {
        throw new Error(physicalRoomResponse.message || "Failed to update physical room");
      }

      toast({
        title: "Success!",
        description: "Room updated successfully"
      });

      navigate("/hotel-admin/rooms");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update room",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/hotel-admin/rooms")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Room</h1>
          <p className="text-muted-foreground">Update room details and settings</p>
        </div>
      </div>

      {/* Existing Images Preview */}
      {existingPhotos.length > 0 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle>Current Room Images</CardTitle>
            <p className="text-sm text-muted-foreground">
              {roomData?.image_url ? "Specific images for this room" : "Shared images from room type"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Existing ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {roomData?.image_url && index === 0 ? "Room Specific" : "Shared"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Room Details</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                Room #{formData.room_number}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => handleFormChange("room_number", e.target.value)}
                  placeholder="e.g., 101, 102"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bed_type">Bed Type</Label>
                <Select value={formData.bed_type} onValueChange={(value) => handleFormChange("bed_type", value)}>
                  <SelectTrigger id="bed_type">
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bedTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max_occupancy">Max Occupancy</Label>
                <Input
                  id="max_occupancy"
                  type="number"
                  min="1"
                  value={formData.max_occupancy}
                  onChange={(e) => handleFormChange("max_occupancy", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Room Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="smoking"
                  checked={formData.smoking_allowed}
                  onCheckedChange={(checked) => handleFormChange("smoking_allowed", checked)}
                />
                <Label htmlFor="smoking" className="cursor-pointer font-normal">
                  Smoking allowed
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="pets"
                  checked={formData.pet_allowed}
                  onCheckedChange={(checked) => handleFormChange("pet_allowed", checked)}
                />
                <Label htmlFor="pets" className="cursor-pointer font-normal">
                  Pets allowed
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Type Information */}
        <Card>
          <CardHeader>
            <CardTitle>Room Type Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_type">Room Type</Label>
                <Select value={roomTypeFormData.room_type} onValueChange={(value) => setRoomTypeFormData({...roomTypeFormData, room_type: value})}>
                  <SelectTrigger id="room_type">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoomTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="base_price">Base Price (per night)</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  value={roomTypeFormData.base_price}
                  onChange={(e) => setRoomTypeFormData({...roomTypeFormData, base_price: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="room_max_occupancy">Max Occupancy (Room Type)</Label>
                <Input
                  id="room_max_occupancy"
                  type="number"
                  min="1"
                  value={roomTypeFormData.max_occupancy}
                  onChange={(e) => setRoomTypeFormData({...roomTypeFormData, max_occupancy: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="room_size">Size (m²)</Label>
                <Input
                  id="room_size"
                  type="text"
                  value={roomTypeFormData.room_size}
                  onChange={(e) => setRoomTypeFormData({...roomTypeFormData, room_size: e.target.value})}
                  placeholder="e.g., 40, 55"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={roomTypeFormData.description}
                onChange={(e) => setRoomTypeFormData({...roomTypeFormData, description: e.target.value})}
                placeholder="Describe this room type..."
                className="resize-none"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Amenities Section */}
        {availableAmenities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Room Amenities</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Photo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Room Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDrop={handlePhotoDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-primary/50" />
                <div>
                  <p className="font-medium text-foreground">Drop photos here or click to browse</p>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, and WebP</p>
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoInputChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {previewPhotos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">
                  Photos ({previewPhotos.length}) - {existingPhotos.length} existing, {uploadedPhotos.length} new
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {previewPhotos.map((photo, index) => {
                    const isExisting = index < existingPhotos.length;
                    const isRoomSpecific = roomData?.image_url && isExisting && index === 0;
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {isRoomSpecific && (
                          <span className="absolute top-1 left-1 bg-blue-500/90 text-white text-xs px-2 py-1 rounded">
                            Room Specific
                          </span>
                        )}
                        {isExisting && !isRoomSpecific && (
                          <span className="absolute top-1 left-1 bg-green-500/90 text-white text-xs px-2 py-1 rounded">
                            Shared
                          </span>
                        )}
                        {!isExisting && (
                          <span className="absolute top-1 left-1 bg-purple-500/90 text-white text-xs px-2 py-1 rounded">
                            New
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/hotel-admin/rooms")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="hero" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HotelAdminEditRoom;
