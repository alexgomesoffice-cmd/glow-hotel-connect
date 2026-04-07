import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Users,
  Maximize,
  Bed,
  Cigarette,
  PawPrint,
  Snowflake,
  Tv,
  Wine,
  ShowerHead,
  Eye,
  Wifi,
  UtensilsCrossed,
  Lock,
  Shirt,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomVariation {
  bed_type: string;
  max_occupancy: number;
  smoking_allowed: boolean;
  pet_allowed: boolean;
  status: string;
  available_count: number;
  room_details_ids: number[];
  images?: string[];
  amenities?: string[];
  price_modifier?: number;
  meal_plan?: string;
  refund_policy?: string;
}

interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  beds: string;
  size: number;
  amenities: string[];
  image?: string | null;
  variations?: RoomVariation[];
}

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  variation: RoomVariation;
}

const facilityIcons: Record<string, typeof Wifi> = {
  "Free Wi-Fi": Wifi,
  "Wi-Fi": Wifi,
  "Wifi": Wifi,
  "Air Conditioner": Snowflake,
  "AC": Snowflake,
  "TV": Tv,
  "Flat-screen TV": Tv,
  "Mini Bar": Wine,
  "Minibar": Wine,
  "Room Service": UtensilsCrossed,
  "Safe": Lock,
  "Bathrobe": Shirt,
  "Shower": ShowerHead,
  "City View": Eye,
};

const RoomDetailModal = ({ isOpen, onClose, room, variation }: RoomDetailModalProps) => {
  const images = variation.images && variation.images.length > 0
    ? variation.images
    : (room.image ? [room.image] : []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoSlide, setAutoSlide] = useState(true);

  const goToImage = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [isTransitioning]);

  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    goToImage((currentImageIndex + 1) % images.length);
  }, [currentImageIndex, images.length, goToImage]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    goToImage((currentImageIndex - 1 + images.length) % images.length);
  }, [currentImageIndex, images.length, goToImage]);

  // Auto-slide
  useEffect(() => {
    if (!autoSlide || images.length <= 1 || !isOpen) return;
    const interval = setInterval(nextImage, 4000);
    return () => clearInterval(interval);
  }, [autoSlide, images.length, isOpen, nextImage]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setAutoSlide(true);
    }
  }, [isOpen]);

  // All amenities — combine room and variation
  const allAmenities = [...new Set([...(room.amenities || []), ...(variation.amenities || [])])];

  // Categorize amenities
  const bathroomAmenities = allAmenities.filter(a =>
    /shower|toilet|bathrobe|towel|hairdryer|slipper|bidet|bathroom|toiletries/i.test(a)
  );
  const facilitiesAmenities = allAmenities.filter(a =>
    !bathroomAmenities.includes(a)
  );

  // Key highlights for badges
  const highlights = [
    room.size > 0 ? `${room.size} m²` : null,
    allAmenities.find(a => /city view|sea view|garden view|view/i.test(a)),
    allAmenities.find(a => /air conditioner|ac/i.test(a)) ? "Air conditioning" : null,
    allAmenities.find(a => /tv|flat-screen/i.test(a)) ? "Flat-screen TV" : null,
    allAmenities.find(a => /mini bar|minibar/i.test(a)) ? "Minibar" : null,
    allAmenities.find(a => /wi-fi|wifi/i.test(a)) ? "Free WiFi" : null,
  ].filter(Boolean) as string[];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/50 bg-background">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-all hover:scale-110"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pb-0">
          {/* Title */}
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold pr-8">
              {room.name} — {variation.bed_type} Bed
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Image Gallery */}
        <div className="px-6">
          <div
            className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden group bg-secondary/20"
            onMouseEnter={() => setAutoSlide(false)}
            onMouseLeave={() => setAutoSlide(true)}
          >
            {images.length > 0 ? (
              <>
                {/* Main image with crossfade */}
                <div className="relative w-full h-full">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${room.name} view ${idx + 1}`}
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                        idx === currentImageIndex
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-105"
                      )}
                    />
                  ))}
                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-md border border-border/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-md border border-border/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-background/60 backdrop-blur-md">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToImage(idx)}
                        className={cn(
                          "rounded-full transition-all duration-300",
                          idx === currentImageIndex
                            ? "w-6 h-2 bg-primary"
                            : "w-2 h-2 bg-foreground/30 hover:bg-foreground/50"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Image counter */}
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md text-xs font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => goToImage(idx)}
                  className={cn(
                    "relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 border-2",
                    idx === currentImageIndex
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Room Info Section */}
        <div className="p-6 space-y-6">
          {/* Room Size & Bed Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
              <Maximize className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Room Size</div>
                <div className="text-sm font-semibold">{room.size} m²</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
              <Bed className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Bed Type</div>
                <div className="text-sm font-semibold">{variation.bed_type}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Max Guests</div>
                <div className="text-sm font-semibold">{variation.max_occupancy}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
              <Cigarette className={cn("w-5 h-5", variation.smoking_allowed ? "text-accent" : "text-muted-foreground/40")} />
              <div>
                <div className="text-xs text-muted-foreground">Smoking</div>
                <div className="text-sm font-semibold">{variation.smoking_allowed ? "Allowed" : "No smoking"}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">{room.description}</p>
            </div>
          )}

          {/* Facilities */}
          {facilitiesAmenities.length > 0 && (
            <div>
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-primary" />
                Facilities:
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {facilitiesAmenities.map((amenity, i) => {
                  const Icon = facilityIcons[amenity] || Check;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Policies row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/30">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Smoking</div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <Cigarette className={cn("w-4 h-4", variation.smoking_allowed ? "text-accent" : "text-destructive")} />
                {variation.smoking_allowed ? "Smoking allowed" : "No smoking"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Pets</div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <PawPrint className={cn("w-4 h-4", variation.pet_allowed ? "text-accent" : "text-destructive")} />
                {variation.pet_allowed ? "Pets allowed" : "No pets"}
              </div>
            </div>
            {variation.refund_policy && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Cancellation</div>
                <div className={cn(
                  "text-sm font-medium",
                  variation.refund_policy === "Free cancellation" ? "text-accent" :
                  variation.refund_policy === "Non-refundable" ? "text-destructive" :
                  "text-foreground"
                )}>
                  {variation.refund_policy}
                </div>
              </div>
            )}
          </div>

          {/* Price & meal plan footer */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <div>
              {variation.meal_plan && (
                <div className={cn(
                  "text-sm font-medium mb-1",
                  variation.meal_plan.includes("breakfast") || variation.meal_plan.includes("inclusive")
                    ? "text-accent" : "text-muted-foreground"
                )}>
                  {variation.meal_plan === "Room only" ? "🛏️" : "🍳"} {variation.meal_plan}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {variation.available_count} room{variation.available_count !== 1 ? "s" : ""} left
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gradient">
                ${room.price + (variation.price_modifier || 0)}
              </div>
              <div className="text-xs text-muted-foreground">per night</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailModal;
