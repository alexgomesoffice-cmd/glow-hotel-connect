import { useMemo, useState } from "react";
import {
  Search,
  X,
  Wifi,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Coffee,
  Wine,
  ConciergeBell,
  Clock,
  Car,
  Plane,
  Shirt,
  Tv,
  Wind,
  Snowflake,
  Refrigerator,
  Vault,
  Bath,
  Bed,
  Users,
  PawPrint,
  Baby,
  Accessibility,
  Zap,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface AmenitySectionProps {
  amenities: string[];
  className?: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  accentColor: string;
}

const categories: Category[] = [
  {
    id: "wellness",
    label: "Wellness & Recreation",
    icon: Dumbbell,
    keywords: ["pool", "swim", "spa", "sauna", "steam", "gym", "fitness", "yoga", "massage", "jacuzzi", "hot tub", "sports", "tennis", "golf"],
    accentColor: "text-emerald-400",
  },
  {
    id: "dining",
    label: "Dining & Drinks",
    icon: UtensilsCrossed,
    keywords: ["restaurant", "dining", "bar", "lounge", "cafe", "breakfast", "lunch", "dinner", "kitchen", "room service", "minibar", "mini bar", "snack", "beverage", "coffee"],
    accentColor: "text-amber-400",
  },
  {
    id: "services",
    label: "Services",
    icon: Concierge,
    keywords: ["concierge", "24/7", "front desk", "reception", "housekeeping", "laundry", "dry cleaning", "shuttle", "airport", "valet", "parking", "room service", "bell", "porter", "tour", "ticketing", "luggage"],
    accentColor: "text-violet-400",
  },
  {
    id: "room",
    label: "Room Features",
    icon: Bed,
    keywords: ["air condition", "ac", "non-ac", "tv", "television", "safe", "minibar", "mini bar", "refrigerator", "fridge", "balcony", "view", "bathrobe", "slipper", "toiletrie", "hair dryer", "iron", "desk", "workspace", "wardrobe", "closet", "soundproof", "blackout", "curtain"],
    accentColor: "text-sky-400",
  },
  {
    id: "connectivity",
    label: "Connectivity",
    icon: Wifi,
    keywords: ["wifi", "internet", "business center", "meeting", "conference", "printer", "workspace"],
    accentColor: "text-blue-400",
  },
  {
    id: "family",
    label: "Family & Accessibility",
    icon: Users,
    keywords: ["family", "kids", "children", "baby", "crib", "pet", "wheelchair", "accessible", "elevator", "lift"],
    accentColor: "text-rose-400",
  },
  {
    id: "safety",
    label: "Safety & Comfort",
    icon: ShieldIcon,
    keywords: ["security", "safe", "smoke", "fire", "alarm", "sprinkler", "first aid", "doctor", "cctv"],
    accentColor: "text-orange-400",
  },
  {
    id: "other",
    label: "Other",
    icon: Sparkles,
    keywords: [],
    accentColor: "text-primary",
  },
];

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const iconMappings: Record<string, React.ComponentType<{ className?: string }>> = {
  "Free WiFi": Wifi,
  "Free Wi-Fi": Wifi,
  "WiFi": Wifi,
  "Wi-Fi": Wifi,
  "Swimming Pool": Waves,
  "Pool": Waves,
  "Gym": Dumbbell,
  "Gym / Fitness Center": Dumbbell,
  "Fitness Center": Dumbbell,
  "Restaurant": UtensilsCrossed,
  "Fine Dining": UtensilsCrossed,
  "Bar / Lounge": Wine,
  "Bar": Wine,
  "Lounge": Wine,
  "Coffee Shop": Coffee,
  "Cafe": Coffee,
  "Breakfast": Coffee,
  "Room Service": Concierge,
  "24/7 Front Desk": Clock,
  "Front Desk": Clock,
  "Reception": Clock,
  "Concierge": Concierge,
  "Parking": Car,
  "Free Parking": Car,
  "Valet Parking": Car,
  "Airport Shuttle": Plane,
  "Shuttle": Plane,
  "Laundry Service": Shirt,
  "Dry Cleaning": Shirt,
  "Housekeeping": Sparkles,
  "Air Conditioning": Snowflake,
  "Air Conditioner": Snowflake,
  "AC": Snowflake,
  "Non-Air Conditioner": Wind,
  "Non-Air Conditioning": Wind,
  "Non-AC": Wind,
  "TV": Tv,
  "Television": Tv,
  "Mini Bar": Refrigerator,
  "Minibar": Refrigerator,
  "Refrigerator": Refrigerator,
  "Fridge": Refrigerator,
  "Safe": Safe,
  "Private Bathroom": Bath,
  "Bathrobe": Bath,
  "Work Desk": Zap,
  "Pet Friendly": PawPrint,
  "Pet Allowed": PawPrint,
  "Pets Allowed": PawPrint,
  "Family Rooms": Baby,
  "Kids Club": Baby,
  "Wheelchair Accessible": Accessibility,
  "Accessible": Accessibility,
  "Elevator": Accessibility,
  "Lift": Accessibility,
};

function getIcon(name: string) {
  return iconMappings[name] || Check;
}

function categorizeAmenities(amenities: string[]) {
  const grouped: Record<string, string[]> = {};

  amenities.forEach((amenity) => {
    const lower = amenity.toLowerCase();
    let matched = false;

    for (const category of categories) {
      if (category.id === "other") continue;
      if (category.keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
        grouped[category.id] = grouped[category.id] || [];
        grouped[category.id].push(amenity);
        matched = true;
        break;
      }
    }

    if (!matched) {
      grouped["other"] = grouped["other"] || [];
      grouped["other"].push(amenity);
    }
  });

  return categories
    .filter((category) => grouped[category.id] && grouped[category.id].length > 0)
    .map((category) => ({
      ...category,
      items: grouped[category.id],
    }));
}

export function AmenitySection({ amenities, className }: AmenitySectionProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const normalized = useMemo(() => Array.from(new Set(amenities)), [amenities]);
  const grouped = useMemo(() => categorizeAmenities(normalized), [normalized]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    return grouped
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  }, [grouped, search]);

  const totalVisible = filteredGroups.reduce((acc, group) => acc + group.items.length, 0);
  const hasResults = totalVisible > 0;

  // Featured amenities: first 6 from original list (preferably popular ones)
  const featuredAmenities = normalized.slice(0, 6);
  const extraCount = Math.max(0, normalized.length - 6);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className={cn("glass border-border/50 animate-fade-in-up overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <LayoutGrid className="w-5 h-5 text-primary" />
              What this place offers
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {normalized.length} {normalized.length === 1 ? "amenity" : "amenities"} available
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search amenities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 bg-secondary/40 border-border/50 focus:bg-background/60 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Featured quick chips */}
        {!search && featuredAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {featuredAmenities.map((amenity) => {
              const Icon = getIcon(amenity);
              return (
                <div
                  key={amenity}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors cursor-default"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {amenity}
                </div>
              );
            })}
            {extraCount > 0 && (
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/50 text-sm text-muted-foreground hover:bg-secondary/70 transition-colors"
              >
                {showAll ? "Show less" : `+${extraCount} more`}
              </button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {!hasResults ? (
          <div className="text-center py-10 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No amenities match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredGroups.map((group, groupIndex) => {
              const CategoryIcon = group.icon;
              const isExpanded = expandedCategories[group.id] ?? true;
              const displayCount = showAll ? group.items.length : Math.min(group.items.length, isExpanded ? 6 : 0);
              const hiddenCount = group.items.length - displayCount;
              const hasMore = group.items.length > 6;

              return (
                <div
                  key={group.id}
                  className="rounded-xl border border-border/40 bg-secondary/20 hover:bg-secondary/30 transition-colors duration-300 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${groupIndex * 60}ms` }}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(group.id)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between p-4 text-left group">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-background/60 border border-border/50">
                            <CategoryIcon className={cn("h-4.5 w-4.5", group.accentColor)} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{group.label}</h3>
                            <p className="text-xs text-muted-foreground">{group.items.length} items</p>
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-300",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.items.slice(0, displayCount).map((amenity, index) => {
                            const Icon = getIcon(amenity);
                            return (
                              <div
                                key={amenity}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background/40 hover:bg-background/60 transition-colors duration-200 group/item animate-fade-in"
                                style={{ animationDelay: `${index * 30}ms` }}
                              >
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary/60 group-hover/item:bg-primary/10 transition-colors">
                                  <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover/item:text-primary transition-colors" />
                                </div>
                                <span className="text-sm font-medium leading-snug">{amenity}</span>
                              </div>
                            );
                          })}
                        </div>

                        {hasMore && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAll((prev) => !prev)}
                            className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground"
                          >
                            {showAll ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                                +{hiddenCount} more in {group.label}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AmenitySection;
