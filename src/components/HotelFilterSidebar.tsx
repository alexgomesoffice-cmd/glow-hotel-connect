import { useEffect, useMemo, useRef, useState } from "react";
import { Star, DollarSign, SlidersHorizontal, Plus, Minus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export type HotelSearchFilters = {
  priceRange: [number, number];
  selectedRatings: number[];
  selectedHotelTypes: string[];
  selectedHotelAmenities: string[];
  selectedRoomAmenities: string[];
  selectedRoomTypes: string[];
  selectedBedTypes: string[];
};

type HotelFilterSidebarProps = {
  priceMin?: number;
  priceMax?: number;
  ratingOptions?: number[];
  hotelTypeOptions?: string[];
  hotelAmenityOptions?: string[];
  roomAmenityOptions?: string[];
  roomTypeOptions?: string[];
  bedTypeOptions?: string[];
  initialSelectedRatings?: number[];
  initialSelectedHotelTypes?: string[];
  initialSelectedHotelAmenities?: string[];
  initialSelectedRoomAmenities?: string[];
  initialSelectedRoomTypes?: string[];
  initialSelectedBedTypes?: string[];
  onApply?: (filters: HotelSearchFilters) => void;
};

const HotelFilterSidebar = ({
  priceMin = 0,
  priceMax = 0,
  ratingOptions = [],
  hotelTypeOptions = [],
  hotelAmenityOptions = [],
  roomAmenityOptions = [],
  roomTypeOptions = [],
  bedTypeOptions = [],
  initialSelectedRatings = [],
  initialSelectedHotelTypes = [],
  initialSelectedHotelAmenities = [],
  initialSelectedRoomAmenities = [],
  initialSelectedRoomTypes = [],
  initialSelectedBedTypes = [],
  onApply = () => undefined,
}: HotelFilterSidebarProps) => {
  const safeMin = Number.isFinite(priceMin) ? priceMin : 0;
  const safeMax = Number.isFinite(priceMax) ? priceMax : safeMin;
  const effectiveMin = safeMin;
  const effectiveMax = safeMax > safeMin ? safeMax : safeMin + 10; // Ensure max > min to prevent Slider issues

  const initialSet = useRef(false);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    price: true,
    rating: true,
    hotelType: true,
    hotelAmenities: true,
    roomAmenities: true,
    roomTypes: true,
    bedTypes: true,
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>(initialSelectedRatings);
  const [selectedHotelAmenities, setSelectedHotelAmenities] = useState<string[]>(initialSelectedHotelAmenities);
  const [selectedRoomAmenities, setSelectedRoomAmenities] = useState<string[]>(initialSelectedRoomAmenities);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>(initialSelectedHotelTypes);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>(initialSelectedRoomTypes);
  const [selectedBedTypes, setSelectedBedTypes] = useState<string[]>(initialSelectedBedTypes);

  // When backend-derived options change, reset slider range and clear selections.
  useEffect(() => {
    setPriceRange([0, 1000]);
    setSelectedRatings([]);
    setSelectedHotelAmenities([]);
    setSelectedRoomAmenities([]);
  }, [safeMin, safeMax]);

  // Sync initial selections from URL / hero search once options are available.
  useEffect(() => {
    if (!initialSet.current) {
      if (initialSelectedHotelTypes.length) {
        setSelectedHotelTypes(initialSelectedHotelTypes);
      }
      if (initialSelectedRoomTypes.length) {
        setSelectedRoomTypes(initialSelectedRoomTypes);
      }
      if (initialSelectedBedTypes.length) {
        setSelectedBedTypes(initialSelectedBedTypes);
      }
      if (initialSelectedRatings.length) {
        setSelectedRatings(initialSelectedRatings);
      }
      if (initialSelectedHotelAmenities.length) {
        setSelectedHotelAmenities(initialSelectedHotelAmenities);
      }
      if (initialSelectedRoomAmenities.length) {
        setSelectedRoomAmenities(initialSelectedRoomAmenities);
      }
      initialSet.current = true;
    }
  }, [initialSelectedHotelTypes, initialSelectedRoomTypes, initialSelectedBedTypes, initialSelectedRatings, initialSelectedHotelAmenities, initialSelectedRoomAmenities]);

  const toggleRating = (r: number) =>
    setSelectedRatings((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  const toggleHotelAmenity = (a: string) =>
    setSelectedHotelAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const toggleRoomAmenity = (a: string) =>
    setSelectedRoomAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const applyFilters = () => {
    const actualMin = effectiveMin + (priceRange[0] / 1000) * (effectiveMax - effectiveMin);
    const actualMax = effectiveMin + (priceRange[1] / 1000) * (effectiveMax - effectiveMin);
    onApply({
      priceRange: [actualMin, actualMax],
      selectedRatings,
      selectedHotelTypes,
      selectedHotelAmenities,
      selectedRoomAmenities,
      selectedRoomTypes,
      selectedBedTypes,
    });
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSectionHeader = (key: string, title: string) => (
    <button
      type="button"
      onClick={() => toggleExpand(key)}
      className="w-full flex items-center justify-between mb-3"
    >
      <h3 className="font-semibold flex items-center gap-2 mb-0">
        {title === "Price Range" ? (
          <DollarSign className="h-4 w-4 text-primary" />
        ) : title === "Rating" ? (
          <Star className="h-4 w-4 text-primary" />
        ) : (
          <span className="h-4 w-4" />
        )}
        {title}
      </h3>

      <span className="text-muted-foreground">
        {expanded[key] ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </span>
    </button>
  );

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
          {renderSectionHeader("price", "Price Range")}
          {expanded.price && (
            <>
              <Slider
                min={0}
                max={1000}
                step={1}
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
                className="mb-3"
              />
              <div className="flex justify-between items-center gap-2">
                <div className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center text-sm font-medium transition-colors hover:border-primary/40">
                  ${Math.round(effectiveMin + (priceRange[0] / 1000) * (effectiveMax - effectiveMin))}
                </div>
                <span className="text-xs text-muted-foreground">to</span>
                <div className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center text-sm font-medium transition-colors hover:border-primary/40">
                  ${Math.round(effectiveMin + (priceRange[1] / 1000) * (effectiveMax - effectiveMin))}
                </div>
              </div>
            </>
          )}
        </div>

       {/* Rating 
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          {renderSectionHeader("rating", "Rating")}
          {expanded.rating && (
            <div className="space-y-2">
              {ratingOptions.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
                >
                  <Checkbox checked={selectedRatings.includes(r)} onCheckedChange={() => toggleRating(r)} />
                  <span className="flex items-center gap-1">
                    {Array.from({ length: r }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                    {r}+
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>*/}

        
        {/* Property Type / Hotel Type */}
        <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          {renderSectionHeader("hotelType", "Hotel Type")}
          {expanded.hotelType && (
            <div className="space-y-2">
              {hotelTypeOptions.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
                >
                  <Checkbox checked={selectedHotelTypes.includes(t)} onCheckedChange={(v) => {
                    const isChecked = !!v;
                    setSelectedHotelTypes((prev) =>
                      isChecked
                        ? [...new Set([...prev, t])]
                        : prev.filter((x) => x !== t)
                    );
                  }} />
                  {t}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Room Types */}
        <div className="animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          {renderSectionHeader("roomTypes", "Room Types")}
          {expanded.roomTypes && (
            <div className="space-y-2">
              {roomTypeOptions.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
                >
                  <Checkbox checked={selectedRoomTypes.includes(t)} onCheckedChange={(v) => {
                    const isChecked = !!v;
                    setSelectedRoomTypes((prev) =>
                      isChecked
                        ? [...new Set([...prev, t])]
                        : prev.filter((x) => x !== t)
                    );
                  }} />
                  {t}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Bed Types */}
        <div className="animate-fade-in-up" style={{ animationDelay: "420ms" }}>
          {renderSectionHeader("bedTypes", "Bed Types")}
          {expanded.bedTypes && (
            <div className="space-y-2">
              {bedTypeOptions.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
                >
                  <Checkbox checked={selectedBedTypes.includes(t)} onCheckedChange={(v) => {
                    const isChecked = !!v;
                    setSelectedBedTypes((prev) =>
                      isChecked
                        ? [...new Set([...prev, t])]
                        : prev.filter((x) => x !== t)
                    );
                  }} />
                  {t}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Room Amenities */}
        <div className="animate-fade-in-up" style={{ animationDelay: "330ms" }}>
          {renderSectionHeader("roomAmenities", "Room Amenities")}
          {expanded.roomAmenities && (
            <div className="space-y-2">
              {(roomAmenityOptions || []).map((a) => (
                <label
                  key={a}
                  className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
                >
                  <Checkbox checked={selectedRoomAmenities.includes(a)} onCheckedChange={() => toggleRoomAmenity(a)} />
                  {a}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Hotel Amenities */}
        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          {renderSectionHeader("hotelAmenities", "Hotel Amenities")}
          {expanded.hotelAmenities && (
            <div className="space-y-2">
              {(hotelAmenityOptions || []).map((a) => (
                <label
                  key={a}
                  className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-all duration-200 hover:translate-x-1"
                >
                  <Checkbox checked={selectedHotelAmenities.includes(a)} onCheckedChange={() => toggleHotelAmenity(a)} />
                  {a}
                </label>
              ))}
            </div>
          )}
        </div>

        

        <Button
          className="w-full transition-transform duration-200 hover:scale-[1.02]"
          variant="hero"
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </aside>
  );
};

export default HotelFilterSidebar;
