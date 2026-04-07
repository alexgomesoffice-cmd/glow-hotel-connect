import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: number;
  name: string;
  country: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

interface RoomCategory {
  name: string;
  thumbnail: string;
}

interface PhotosReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  images: string[];
  reviews?: Review[];
  roomCategories?: RoomCategory[];
  rating?: number;
  reviewCount?: number;
}

// ============================================================
// DUMMY REVIEWS — shown when no real reviews are available
// ============================================================
const DUMMY_REVIEWS: Review[] = [
  { id: 1, name: "Miraj", country: "Bangladesh", rating: 4.5, comment: "I really liked the ambience and the warm behaviour of all the staff. The rooms were spotless and the breakfast spread was amazing!", date: "2024-12-15" },
  { id: 2, name: "Rubel", country: "Bangladesh", rating: 5, comment: "I was highly impressed with its clean and comfortable rooms and additional facilities. I highly recommend it ❤️❤️❤️", date: "2024-11-28" },
  { id: 3, name: "Sarah", country: "United States", rating: 4, comment: "The staffs were very helpful, polite. The hotel is in excellent location. No noise from the street had nice sleep.", date: "2024-11-10" },
  { id: 4, name: "Ahmed", country: "UAE", rating: 4.8, comment: "One of the best hotel experiences I've had. The suite was spectacular with an incredible city view. Will definitely come back!", date: "2024-10-22" },
  { id: 5, name: "Emily", country: "United Kingdom", rating: 3.5, comment: "Good hotel overall. The pool area was lovely but the gym could use some upgrades. Staff was friendly and accommodating.", date: "2024-10-05" },
  { id: 6, name: "Takeshi", country: "Japan", rating: 4.7, comment: "Perfect for a family vacation. Kids loved the play area and the restaurant had excellent food options for everyone.", date: "2024-09-18" },
];

const PhotosReviewsModal = ({
  isOpen,
  onClose,
  hotelName,
  images,
  reviews,
  roomCategories,
  rating = 4.8,
  reviewCount = 234,
}: PhotosReviewsModalProps) => {
  const allReviews = reviews && reviews.length > 0 ? reviews : DUMMY_REVIEWS;
  const [selectedCategory, setSelectedCategory] = useState<string>("Overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Build category list
  const categories: RoomCategory[] = [
    { name: "Overview", thumbnail: images[0] || "" },
    ...(roomCategories || []),
  ];

  const goToImage = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 350);
  }, [isTransitioning]);

  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    goToImage((currentImageIndex + 1) % images.length);
  }, [currentImageIndex, images.length, goToImage]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    goToImage((currentImageIndex - 1 + images.length) % images.length);
  }, [currentImageIndex, images.length, goToImage]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, prevImage, nextImage, onClose]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setSelectedCategory("Overview");
    }
  }, [isOpen]);

  const getRatingLabel = (r: number) => {
    if (r >= 4.5) return "Excellent";
    if (r >= 4) return "Very Good";
    if (r >= 3.5) return "Good";
    if (r >= 3) return "Average";
    return "Fair";
  };

  const getInitials = (name: string) => name.charAt(0).toUpperCase();
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-primary", "bg-accent", "bg-destructive",
      "from-primary to-accent", "from-accent to-primary",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[92vh] h-[92vh] p-0 gap-0 border-border/30 bg-background overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">{hotelName}</h2>
            <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-sm font-semibold">
              Reserve now
            </Button>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="text-sm font-medium">Close</span>
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-border/20 bg-card/30">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat, idx) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setCurrentImageIndex(0);
                }}
                className={cn(
                  "flex flex-col items-center gap-1.5 flex-shrink-0 transition-all duration-300",
                  selectedCategory === cat.name ? "opacity-100" : "opacity-50 hover:opacity-80"
                )}
              >
                <div className={cn(
                  "w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300",
                  selectedCategory === cat.name
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-transparent"
                )}>
                  {cat.thumbnail ? (
                    <img src={cat.thumbnail} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium max-w-[80px] truncate transition-colors",
                  selectedCategory === cat.name ? "text-primary" : "text-muted-foreground"
                )}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content — Images Left, Reviews Right */}
        <div className="flex flex-1 overflow-hidden" style={{ height: "calc(92vh - 140px)" }}>
          {/* Left: Image Gallery */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {/* Featured large image with navigation */}
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-4 group bg-secondary/20">
              {images.length > 0 ? (
                <>
                  <div className="relative w-full h-full">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${hotelName} photo ${idx + 1}`}
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                          idx === currentImageIndex
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-105"
                        )}
                      />
                    ))}
                  </div>

                  {/* Nav arrows */}
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

            {/* Image grid below */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => goToImage(idx)}
                  className={cn(
                    "relative aspect-[4/3] rounded-xl overflow-hidden group/thumb transition-all duration-300 border-2",
                    idx === currentImageIndex
                      ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                      : "border-transparent hover:border-border/50"
                  )}
                >
                  <img
                    src={img}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                  />
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    idx === currentImageIndex
                      ? "bg-primary/10"
                      : "bg-background/0 group-hover/thumb:bg-background/20"
                  )} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Reviews Panel */}
          <div className="w-[380px] border-l border-border/30 bg-card/30 flex flex-col overflow-hidden flex-shrink-0 hidden lg:flex">
            {/* Rating header */}
            <div className="p-5 border-b border-border/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {rating.toFixed(1)}
                </div>
                <div>
                  <div className="font-bold text-lg">{getRatingLabel(rating)}</div>
                  <div className="text-sm text-muted-foreground">{reviewCount.toLocaleString()} reviews</div>
                </div>
              </div>

              {/* Rating bars */}
              <div className="space-y-2">
                {[
                  { label: "Cleanliness", value: 0.92 },
                  { label: "Service", value: 0.88 },
                  { label: "Location", value: 0.95 },
                  { label: "Value", value: 0.82 },
                ].map((bar) => (
                  <div key={bar.label} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">{bar.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                        style={{ width: `${bar.value * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-8 text-right">{(bar.value * 10).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {allReviews.map((review, idx) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl bg-secondary/20 border border-border/10 hover:border-border/30 transition-all duration-300 animate-fade-in group/review"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 italic">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground bg-gradient-to-br",
                        getAvatarColor(review.name)
                      )}>
                        {getInitials(review.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{review.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          🏳️ {review.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                      <span className="text-xs font-bold">{review.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Review footer */}
            <div className="p-4 border-t border-border/20">
              <Button variant="outline" className="w-full gap-2 rounded-xl border-border/30 hover:bg-secondary/30">
                <MessageSquare className="w-4 h-4" />
                Read all {reviewCount} reviews
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotosReviewsModal;
