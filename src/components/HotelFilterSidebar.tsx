import { useState } from "react";
import { Star, DollarSign, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const HotelFilterSidebar = () => {
  const [priceRange, setPriceRange] = useState([50, 1000]);
  const [selectedRating, setSelectedRating] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const ratings = [5, 4, 3, 2, 1];
  const amenities = ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant", "Parking", "Beach", "Room Service", "Bar", "Pet Friendly"];
  const propertyTypes = ["Hotel", "Resort", "Villa", "Apartment", "Hostel", "Boutique"];

  const toggleRating = (r: number) =>
    setSelectedRating((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const toggleType = (t: string) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6 animate-fade-in-left" style={{ animationDelay: "100ms" }}>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Filters</h2>
        </div>

        {/* Price */}
        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Price Range
          </h3>
          <Slider min={0} max={2000} step={10} value={priceRange} onValueChange={setPriceRange} className="mb-3" />
          <div className="flex justify-between items-center gap-2">
            <div className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center text-sm font-medium transition-colors hover:border-primary/40">
              ${priceRange[0]}
            </div>
            <span className="text-xs text-muted-foreground">to</span>
            <div className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center text-sm font-medium transition-colors hover:border-primary/40">
              ${priceRange[1]}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" /> Rating
          </h3>
          <div className="space-y-2">
            {ratings.map((r) => (
              <label
                key={r}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
              >
                <Checkbox checked={selectedRating.includes(r)} onCheckedChange={() => toggleRating(r)} />
                <span className="flex items-center gap-1">
                  {Array.from({ length: r }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                  {r}+
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <h3 className="font-semibold mb-3">Property Type</h3>
          <div className="space-y-2">
            {propertyTypes.map((t) => (
              <label
                key={t}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
              >
                <Checkbox checked={selectedTypes.includes(t)} onCheckedChange={() => toggleType(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <h3 className="font-semibold mb-3">Amenities</h3>
          <div className="space-y-2">
            {amenities.map((a) => (
              <label
                key={a}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
              >
                <Checkbox checked={selectedAmenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />
                {a}
              </label>
            ))}
          </div>
        </div>

        <Button className="w-full transition-transform duration-200 hover:scale-[1.02]" variant="hero">
          Apply Filters
        </Button>
      </div>
    </aside>
  );
};

export default HotelFilterSidebar;
