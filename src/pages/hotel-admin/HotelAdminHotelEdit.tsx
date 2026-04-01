import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Plus, Upload, Image as ImageIcon, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchAmenities, fetchHotelById, type AmenityOption, type HotelResponse } from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";
import { apiPut, apiGet } from "@/utils/api";

const HotelAdminHotelEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);

  const [description, setDescription] = useState("");
  const [receptionNo1, setReceptionNo1] = useState("");
  const [receptionNo2, setReceptionNo2] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityOptions, setAmenityOptions] = useState<AmenityOption[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  const [imageMetadata, setImageMetadata] = useState<Array<{ url: string; is_cover: boolean }>>([]);

  useEffect(() => {
    const loadHotel = async () => {
      try {
        // Get the hotel assigned to this authenticated hotel admin
        const hotelResponse = await apiGet("/hotels/admin/me/assigned-hotel");
        if (!hotelResponse.success || !hotelResponse.data?.hotel_id) {
          throw new Error("Could not fetch your assigned hotel");
        }

        const hotelId = hotelResponse.data.hotel_id;

        // Now fetch full hotel details
        const [foundHotel, amenitiesList] = await Promise.all([
          fetchHotelById(hotelId),
          fetchAmenities(),
        ]);

        setHotel(foundHotel);
        setAmenityOptions(amenitiesList || []);

        setDescription(foundHotel.hotel_details?.description || "");
        setReceptionNo1(foundHotel.hotel_details?.reception_no1 || "");
        setReceptionNo2(foundHotel.hotel_details?.reception_no2 || "");

        const hotelImgs = foundHotel.hotel_images || [];
        setImages(hotelImgs.map((img) => img.image_url));
        setImageMetadata(hotelImgs.map((img) => ({ url: img.image_url, is_cover: img.is_cover || false })));
        
        // Find the cover image index
        const coverIdx = hotelImgs.findIndex((img) => img.is_cover);
        setCoverImageIndex(coverIdx >= 0 ? coverIdx : 0);
        
        setAmenities(foundHotel.hotel_amenities?.map((item) => item.amenity.name || "") || []);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load hotel",
          variant: "destructive",
        });
        navigate("/hotel-admin");
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    loadHotel();
  }, [toast, navigate]);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (images.length >= 8) {
      toast({ title: "Image limit", description: "You can add up to 8 images", variant: "destructive" });
      return;
    }
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleImageFiles(files);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleImageFiles(files);
  };

  const handleImageFiles = (files: File[]) => {
    if (imageFiles.length + files.length > 8) {
      toast({ 
        title: "Too many images", 
        description: `You can only add ${8 - imageFiles.length} more images`, 
        variant: "destructive" 
      });
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageMetadata(prev => prev.filter((_, i) => i !== index));
    
    // If the removed image was the cover, set the first remaining image as cover
    if (coverImageIndex === index) {
      setCoverImageIndex(0);
    } else if (coverImageIndex > index) {
      // If removed image was before the cover, shift cover index down
      setCoverImageIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleAmenityToggle = (name: string) => {
    setAmenities((prev) => {
      if (prev.includes(name)) {
        return prev.filter((a) => a !== name);
      }
      return [...prev, name];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hotel?.hotel_id) {
      toast({ title: "Error", description: "Hotel ID missing", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert uploaded files to base64
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await Promise.all(
          imageFiles.map(file => 
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                resolve(result);
              };
              reader.onerror = () => reject(new Error("Failed to read file"));
              reader.readAsDataURL(file);
            })
          )
        );
      }

      // Combine existing and new images
      const allImages = [...images, ...uploadedImageUrls];
      
      // Create images with is_cover flag based on selected cover index
      const imagesWithCover = allImages.map((url, index) => ({
        image_url: url,
        is_cover: index === coverImageIndex
      }));

      console.log("Submitting hotel update with cover index:", coverImageIndex, "Total images:", allImages.length, "Images:", imagesWithCover.map(img => ({ image_url: img.image_url.substring(0, 50), is_cover: img.is_cover })));

      const response = await apiPut(`/hotels/${hotel.hotel_id}`, {
        details: {
          description: description || undefined,
          reception_no1: receptionNo1 || undefined,
          reception_no2: receptionNo2 || undefined,
        },
        amenities,
        images: imagesWithCover,
      });

      if (response.success === false) throw new Error(response.message || "Failed to update hotel");

      console.log("Hotel update response:", response.data);

      // Clear uploaded files after successful submission
      setImageFiles([]);
      
      toast({ title: "Hotel updated", description: "Updated successfully." });
      navigate("/hotel-admin");
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

  const handlePublish = async () => {
    if (!hotel?.hotel_id) {
      toast({ title: "Error", description: "Hotel ID missing", variant: "destructive" });
      return;
    }

    if (hotel.approval_status === "PUBLISHED") {
      toast({ title: "Already published", description: "This hotel is already published." });
      return;
    }

    setIsPublishing(true);
    try {
      const response = await apiPut(`/hotels/${hotel.hotel_id}/approval`, {
        approval_status: "PUBLISHED",
      });

      if (response.success === false) throw new Error(response.message || "Failed to publish hotel");

      // Update local hotel state
      setHotel(prev => prev ? { ...prev, approval_status: "PUBLISHED" } : null);

      toast({ title: "Hotel published", description: "Your hotel is now live and visible to customers." });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish hotel",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/hotel-admin")}>Go Back</Button>
        <Card><CardContent className="p-6"><p className="font-medium">Loading hotel details...</p></CardContent></Card>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/hotel-admin")}>Go Back</Button>
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
      <div className={`flex items-center justify-between ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/hotel-admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Manage Hotel Details</h1>
            <p className="text-muted-foreground">Only hotel images, amenities, real reception, and description can be changed.</p>
          </div>
        </div>
        <Button
          onClick={handlePublish}
          disabled={isPublishing || hotel?.approval_status === "PUBLISHED"}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          {isPublishing ? "Publishing..." : hotel?.approval_status === "PUBLISHED" ? "Published" : "Publish Hotel"}
        </Button>
      </div>

      <Card className={isLoaded ? "animate-fade-in-up" : "opacity-0"} style={{ animationDelay: "100ms" }}>
        <CardHeader><CardTitle>Hotel Images</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Images */}
          {images.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Current Images ({images.length}/8) - Click to set as cover</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {images.map((url, i) => (
                  <div 
                    key={`${url}-${i}`} 
                    className={`relative border-2 rounded-lg overflow-hidden group cursor-pointer transition-all ${
                      coverImageIndex === i 
                        ? 'border-green-500 ring-2 ring-green-500' 
                        : 'border-gray-200 hover:border-green-400'
                    }`}
                    onClick={() => setCoverImageIndex(i)}
                  >
                    <img src={url} alt={`hotel image ${i + 1}`} className="h-20 w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {coverImageIndex === i && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">✓ Cover</span>
                      )}
                      {coverImageIndex !== i && (
                        <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded">Click to set</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExistingImage(i);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-500/90 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images to Upload */}
          {imageFiles.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">New Images to Upload ({imageFiles.length}) - Click to set as cover</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {imageFiles.map((file, i) => {
                  const newImageIndex = images.length + i;
                  const isCover = coverImageIndex === newImageIndex;
                  return (
                    <div 
                      key={`${file.name}-${i}`} 
                      className={`relative border-2 rounded-lg overflow-hidden group bg-primary/5 cursor-pointer transition-all ${
                        isCover
                          ? 'border-green-500 ring-2 ring-green-500'
                          : 'border-primary/30 hover:border-green-400'
                      }`}
                      onClick={() => setCoverImageIndex(newImageIndex)}
                    >
                      <img src={URL.createObjectURL(file)} alt={file.name} className="h-20 w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        {isCover && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">✓ Cover</span>
                        )}
                        {!isCover && (
                          <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded">Click to set</span>
                        )}
                        <span className="text-white text-xs">New</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImageFile(i);
                        }}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-500/90 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Drop images here or click to browse</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 8MB. First image will be cover photo</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Total images: {images.length + imageFiles.length}/8
          </p>
        </CardContent>
      </Card>

      <Card className={isLoaded ? "animate-fade-in-up" : "opacity-0"} style={{ animationDelay: "120ms" }}>
        <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {amenityOptions.length > 0 ? (
              amenityOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    amenities.includes(option.name)
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-secondary/50"
                  }`}
                >
                  <Checkbox
                    checked={amenities.includes(option.name)}
                    onCheckedChange={() => handleAmenityToggle(option.name)}
                  />
                  <span className="text-sm font-medium truncate">{option.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Loading amenities...</p>
            )}
          </div>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {amenities.map((amenity) => (
                <span key={amenity} className="inline-flex items-center gap-1 rounded-full bg-secondary/40 px-2 py-1 text-xs">
                  {amenity}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Selected amenities are saved to your hotel record.</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className={isLoaded ? "animate-fade-in-up" : "opacity-0"} style={{ animationDelay: "140ms" }}>
          <CardHeader><CardTitle>Hotel Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reception Number 1</Label>
                <Input value={receptionNo1} onChange={(e) => setReceptionNo1(e.target.value)} placeholder="+880-XXXX-XXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Reception Number 2</Label>
                <Input value={receptionNo2} onChange={(e) => setReceptionNo2(e.target.value)} placeholder="Optional" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/hotel-admin")}>Cancel</Button>
          <Button type="submit" variant="hero" disabled={isSubmitting}>{isSubmitting ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}</Button>
        </div>
      </form>
    </div>
  );
};

export default HotelAdminHotelEdit;