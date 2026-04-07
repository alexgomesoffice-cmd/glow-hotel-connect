import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, BedDouble, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiPost, apiGet } from "@/utils/api";
import { fetchBedTypeOptions, fetchRoomTypeOptions, type EnumOption } from "@/services/publicHotelApi";

interface PhysicalRoom {
  room_number: string;
  bed_type: string;
  smoking_allowed: boolean;
  pet_allowed: boolean;
  status: "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE"; // Room availability status
  useCustomPhotos: boolean;
  customPhotos: File[];
}

interface RoomTypeData {
  room_type: string;
  base_price: string;
  max_occupancy: string;
  description: string;
  room_size: string;
}

interface AmenityResponse {
  id: number;
  name: string;
  icon?: string;
  context?: string;
}

const HotelAdminAddRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<{ id: string; name: string }[]>([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState<EnumOption[]>([]);
  const [bedTypeOptions, setBedTypeOptions] = useState<EnumOption[]>([]);

  const [roomTypeData, setRoomTypeData] = useState<RoomTypeData>({
    room_type: "",
    base_price: "",
    max_occupancy: "2",
    description: "",
    room_size: ""
  });

  const [bulkConfig, setBulkConfig] = useState({
    roomCount: 3,
    startingRoomNumber: "101"
  });

  const [physicalRooms, setPhysicalRooms] = useState<PhysicalRoom[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [defaultPhotos, setDefaultPhotos] = useState<File[]>([]);
  const [overridePhotosEnabled, setOverridePhotosEnabled] = useState(false);

  // Fetch authenticated user's assigned hotel on mount
  useEffect(() => {
    const fetchAssignedHotel = async () => {
      try {
        const response = await apiGet("/hotels/admin/me/assigned-hotel");
        if (response.success && response.data?.hotel_id) {
          setHotelId(String(response.data.hotel_id));
          console.log("✅ Hotel loaded:", response.data.hotel_id);
        } else {
          throw new Error("Could not fetch assigned hotel");
        }
      } catch (error) {
        console.error("Failed to fetch assigned hotel:", error);
        toast({
          title: "Error",
          description: "Could not load your assigned hotel. Please try again.",
          variant: "destructive"
        });
        navigate("/hotel-admin");
      }
    };
    fetchAssignedHotel();
  }, [navigate, toast]);

  // Fetch amenities on mount
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/rooms/amenities/list");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          const roomAmenities = data.data.filter((amenity: any) => amenity.context === "ROOM");
          // Map backend response to component format
          const mappedAmenities = (roomAmenities as AmenityResponse[]).map((amenity) => ({
            id: String(amenity.id),
            name: amenity.name
          }));
          setAvailableAmenities(mappedAmenities);
          console.log("✅ Room amenities loaded from backend:", mappedAmenities.length, "items");
        } else {
          throw new Error("No amenities data");
        }
      } catch (error) {
        console.error("Failed to fetch amenities:", error);
        // Fallback to default amenities
        console.warn("⚠️ Using fallback amenities");
        setAvailableAmenities([
          { id: "1", name: "WiFi" },
          { id: "2", name: "TV" },
          { id: "3", name: "Mini Bar" },
          { id: "4", name: "Air Conditioning" },
          { id: "5", name: "Safe" },
          { id: "6", name: "Balcony" },
          { id: "7", name: "Ocean View" },
          { id: "8", name: "Room Service" }
        ]);
      }
    };
    fetchAmenities();
  }, []);

  // Fetch enum-like options for room/bed types
  useEffect(() => {
    const run = async () => {
      try {
        const [roomTypes, bedTypes] = await Promise.all([fetchRoomTypeOptions(), fetchBedTypeOptions()]);
        setRoomTypeOptions(roomTypes);
        setBedTypeOptions(bedTypes);
      } catch (e) {
        console.error("Failed to fetch room/bed type options:", e);
      }
    };
    run();
  }, []);

  // Generate physical rooms when count or starting number changes
  useEffect(() => {
    const count = parseInt(String(bulkConfig.roomCount)) || 1;
    const startNum = parseInt(bulkConfig.startingRoomNumber) || 101;
    const generated: PhysicalRoom[] = [];

    for (let i = 0; i < count; i++) {
      generated.push({
        room_number: String(startNum + i),
        bed_type: "",
        smoking_allowed: false,
        pet_allowed: false,
        status: "AVAILABLE", // Default to AVAILABLE when created
        useCustomPhotos: false,
        customPhotos: []
      });
    }

    setPhysicalRooms(generated);
  }, [bulkConfig.roomCount, bulkConfig.startingRoomNumber]);

  const updatePhysicalRoom = (index: number, field: keyof PhysicalRoom, value: string | boolean | File[]) => {
    const updated = [...physicalRooms];
    updated[index] = { ...updated[index], [field]: value };
    setPhysicalRooms(updated);
  };

  const addMoreRooms = (count: number) => {
    const lastRoomNum = parseInt(physicalRooms[physicalRooms.length - 1]?.room_number || "101");
    const newRooms: PhysicalRoom[] = [];

    for (let i = 1; i <= count; i++) {
      newRooms.push({
        room_number: String(lastRoomNum + i),
        bed_type: "",
        smoking_allowed: false,
        pet_allowed: false,
        status: "AVAILABLE", // Default to AVAILABLE
        useCustomPhotos: false,
        customPhotos: []
      });
    }

    setPhysicalRooms([...physicalRooms, ...newRooms]);
  };

  const removeLastRoom = () => {
    if (physicalRooms.length > 1) {
      setPhysicalRooms(physicalRooms.slice(0, -1));
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id !== amenityId) : [...prev, amenityId]
    );
  };

  const handleDefaultPhotoDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setDefaultPhotos((prev) => [...prev, ...files]);
  };

  const handleDefaultPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDefaultPhotos((prev) => [...prev, ...files]);
  };

  const removeDefaultPhoto = (index: number) => {
    setDefaultPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoomCustomPhotoDrop = (roomIndex: number, e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    updatePhysicalRoom(roomIndex, "customPhotos", [
      ...physicalRooms[roomIndex].customPhotos,
      ...files
    ]);
  };

  const handleRoomCustomPhotoSelect = (roomIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updatePhysicalRoom(roomIndex, "customPhotos", [
      ...physicalRooms[roomIndex].customPhotos,
      ...files
    ]);
  };

  const removeRoomCustomPhoto = (roomIndex: number, photoIndex: number) => {
    const updated = physicalRooms[roomIndex].customPhotos.filter((_, i) => i !== photoIndex);
    updatePhysicalRoom(roomIndex, "customPhotos", updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!roomTypeData.room_type || !roomTypeData.base_price) {
      toast({
        title: "Missing fields",
        description: "Please fill in Room Type and Base Price",
        variant: "destructive"
      });
      return;
    }

    if (physicalRooms.length === 0) {
      toast({
        title: "No rooms",
        description: "Please add at least one room",
        variant: "destructive"
      });
      return;
    }

    if (physicalRooms.some((r) => !r.bed_type)) {
      toast({
        title: "Incomplete data",
        description: "Please select bed type for all rooms",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!hotelId) {
        throw new Error("Hotel ID not available. Please refresh and try again.");
      }

      // Convert default photos to base64
      const defaultPhotoUrls = await Promise.all(
        defaultPhotos.map(file =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
          })
        )
      );

      const roomNumbersData = physicalRooms.map((room) => ({
        room_number: room.room_number,
        bed_type: room.bed_type,
        smoking_allowed: room.smoking_allowed,
        pet_allowed: room.pet_allowed,
        status: room.status // Include status from user selection
      }));

      const payload = {
        room_data: {
          room_type: roomTypeData.room_type,
          base_price: parseFloat(roomTypeData.base_price),
          max_occupancy: parseInt(roomTypeData.max_occupancy),
          description: roomTypeData.description,
          room_size: roomTypeData.room_size,
          amenities: selectedAmenities // Include selected amenities
        },
        room_numbers: roomNumbersData,
        images: defaultPhotoUrls // Include converted room type images
      };

      const response = await apiPost(`/rooms/bulk-create?hotel_id=${hotelId}`, payload);

      if (!response.success) {
        throw new Error(response.message || "Failed to create rooms");
      }

      toast({
        title: "Success!",
        description: `Created ${physicalRooms.length} rooms successfully`
      });

      navigate("/hotel-admin/rooms");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create rooms",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
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
            <h1 className="text-2xl sm:text-3xl font-bold">Add Rooms in Bulk</h1>
            <p className="text-muted-foreground">Create multiple rooms at once with customizable details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CARD 1: Room Type Details */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-primary to-accent" />
              Room Type Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Type *</Label>
                <Select value={roomTypeData.room_type} onValueChange={(v) => setRoomTypeData({ ...roomTypeData, room_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Base Price per Night *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={roomTypeData.base_price}
                  onChange={(e) => setRoomTypeData({ ...roomTypeData, base_price: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Occupancy</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={roomTypeData.max_occupancy}
                  onChange={(e) => setRoomTypeData({ ...roomTypeData, max_occupancy: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Size (m²)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={roomTypeData.room_size}
                  onChange={(e) => setRoomTypeData({ ...roomTypeData, room_size: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this room type..."
                value={roomTypeData.description}
                onChange={(e) => setRoomTypeData({ ...roomTypeData, description: e.target.value })}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: Bulk Room Configuration */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
              Room Numbers & Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Room Count and Starting Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div className="space-y-2">
                <Label>Number of Rooms *</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={bulkConfig.roomCount}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, roomCount: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Start from Room Number *</Label>
                <Input
                  type="text"
                  placeholder="e.g., 101"
                  value={bulkConfig.startingRoomNumber}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, startingRoomNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Room List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {physicalRooms.map((room, index) => (
                <div key={index} className={`p-4 rounded-lg border transition-all duration-200 ${room.useCustomPhotos ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Room Number */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Room #{index + 1}</Label>
                      <Input
                        type="text"
                        placeholder="101"
                        value={room.room_number}
                        onChange={(e) => updatePhysicalRoom(index, "room_number", e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    {/* Bed Type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Bed Type *</Label>
                      <Select value={room.bed_type} onValueChange={(v) => updatePhysicalRoom(index, "bed_type", v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
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

                    {/* Room Status */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Status *</Label>
                      <Select value={room.status} onValueChange={(v) => updatePhysicalRoom(index, "status", v as "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE")}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              Available
                            </div>
                          </SelectItem>
                          <SelectItem value="UNAVAILABLE">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              Unavailable
                            </div>
                          </SelectItem>
                          <SelectItem value="MAINTENANCE">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" />
                              Maintenance
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Smoking */}
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer group py-2">
                        <Checkbox
                          checked={room.smoking_allowed}
                          onCheckedChange={(v) => updatePhysicalRoom(index, "smoking_allowed", !!v)}
                        />
                        <span className="text-xs font-medium group-hover:text-foreground transition-colors whitespace-nowrap">Smoking</span>
                      </label>
                    </div>

                    {/* Pets */}
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer group py-2">
                        <Checkbox
                          checked={room.pet_allowed}
                          onCheckedChange={(v) => updatePhysicalRoom(index, "pet_allowed", !!v)}
                        />
                        <span className="text-xs font-medium group-hover:text-foreground transition-colors whitespace-nowrap">Pets</span>
                      </label>
                    </div>
                  </div>

                  {/* Custom Photos Toggle */}
                  {overridePhotosEnabled && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <button
                        type="button"
                        onClick={() => updatePhysicalRoom(index, "useCustomPhotos", !room.useCustomPhotos)}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <ImageIcon className="h-3 w-3" />
                        {room.useCustomPhotos ? "Using Custom Photos" : "Use Custom Photos for this room"}
                      </button>

                      {/* Custom Photo Upload */}
                      {room.useCustomPhotos && (
                        <div className="mt-2 p-3 bg-secondary/40 rounded-lg border border-border/30">
                          <label className="flex flex-col gap-2 cursor-pointer group">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleRoomCustomPhotoSelect(index, e)}
                              className="hidden"
                            />
                            <div className="text-center p-2 rounded border-2 border-dashed border-border/50 hover:border-primary/40 transition-colors group-hover:bg-primary/5">
                              <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                Click to upload photos for Room {room.room_number}
                              </p>
                            </div>
                          </label>

                          {/* Photo Previews */}
                          {room.customPhotos.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {room.customPhotos.map((photo, photoIdx) => (
                                <div key={photoIdx} className="relative group">
                                  <div className="w-12 h-12 rounded bg-secondary/50 flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                                    <ImageIcon className="h-4 w-4" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeRoomCustomPhoto(index, photoIdx)}
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add/Remove Room Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addMoreRooms(1)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add More Rooms
              </Button>
              {physicalRooms.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeLastRoom}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Last
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CARD 3: Amenities */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
              Amenities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {availableAmenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableAmenities.map((amenity) => (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedAmenities.includes(amenity.id)
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedAmenities.includes(amenity.id)}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                    />
                    <span className="text-sm font-medium">{amenity.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No amenities available</p>
            )}
          </CardContent>
        </Card>

        {/* CARD 4: Default Photos */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
              Default Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <span className="font-semibold">Default Photos:</span> Upload photos that will be applied to all rooms unless overridden individually.
              </p>
            </div>

            {/* Default Photo Upload */}
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDefaultPhotoDrop}
              className="flex flex-col gap-2 cursor-pointer group"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleDefaultPhotoSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors group-hover:bg-primary/5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag & drop room images here, or <span className="text-primary font-medium">click to browse</span>
                </p>
              </div>
            </label>

            {/* Default Photo Previews */}
            {defaultPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{defaultPhotos.length} photos selected</p>
                <div className="flex flex-wrap gap-2">
                  {defaultPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="w-16 h-16 rounded bg-secondary flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDefaultPhoto(index)}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Override Option */}
            <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer group">
              <Checkbox checked={overridePhotosEnabled} onCheckedChange={(v) => setOverridePhotosEnabled(!!v)} />
              <div className="flex-1">
                <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                  Allow custom photos for specific rooms
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Override default photos with custom images for individual rooms
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate("/hotel-admin/rooms")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? "Creating..." : `Create ${physicalRooms.length} Room${physicalRooms.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HotelAdminAddRoom;
