import { useState } from "react";
import { Star, DollarSign } from "lucide-react";
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
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-6">
        {/* Price */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Price Range</h3>
          <Slider min={0} max={2000} step={10} value={priceRange} onValueChange={setPriceRange} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Rating</h3>
          <div className="space-y-2">
            {ratings.map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-colors">
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
        <div>
          <h3 className="font-semibold mb-3">Property Type</h3>
          <div className="space-y-2">
            {propertyTypes.map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-colors">
                <Checkbox checked={selectedTypes.includes(t)} onCheckedChange={() => toggleType(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="font-semibold mb-3">Amenities</h3>
          <div className="space-y-2">
            {amenities.map((a) => (
              <label key={a} className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-colors">
                <Checkbox checked={selectedAmenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />
                {a}
              </label>
            ))}
          </div>
        </div>

        <Button className="w-full" variant="hero">Apply Filters</Button>
      </div>
    </aside>
  );
};

export default HotelFilterSidebar;
