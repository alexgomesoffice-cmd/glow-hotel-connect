import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, Heart, MapPin, LayoutGrid, List, ArrowUpDown, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchPublicHotels, PublicHotel } from "@/services/publicHotelApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import HotelFilterSidebar from "@/components/HotelFilterSidebar";
import type { HotelSearchFilters } from "@/components/HotelFilterSidebar";
import { fetchBedTypeOptions, fetchHotelTypeOptions, fetchRoomTypeOptions } from "@/services/publicHotelApi";

const SearchHotels = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoaded, setIsLoaded] = useState(true);
  const [likedHotels, setLikedHotels] = useState<number[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [hotels, setHotels] = useState<PublicHotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<PublicHotel[]>([]);
  const [activeFilters, setActiveFilters] = useState<HotelSearchFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hotelTypeEnumValues, setHotelTypeEnumValues] = useState<string[]>([]);
  const [roomTypeEnumValues, setRoomTypeEnumValues] = useState<string[]>([]);
  const [bedTypeEnumValues, setBedTypeEnumValues] = useState<string[]>([]);

  useEffect(() => {
    // Fetch enum-like filter options from backend.
    const run = async () => {
      try {
        const [hotelTypes, roomTypes, bedTypes] = await Promise.all([
          fetchHotelTypeOptions(),
          fetchRoomTypeOptions(),
          fetchBedTypeOptions(),
        ]);
        setHotelTypeEnumValues(hotelTypes.map((o) => o.value));
        setRoomTypeEnumValues(roomTypes.map((o) => o.value));
        setBedTypeEnumValues(bedTypes.map((o) => o.value));
      } catch (e) {
        console.error("Failed to fetch enum filter options:", e);
      }
    };
    run();
  }, []);

  const locationQuery = searchParams.get("location") || "";
  const checkInQuery = searchParams.get("check_in") || searchParams.get("checkIn") || undefined;
  const checkOutQuery = searchParams.get("check_out") || searchParams.get("checkOut") || undefined;
  const guestsQuery = (() => {
    const raw = searchParams.get("guests");
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  })();
  const roomsQuery = (() => {
    const raw = searchParams.get("rooms");
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  })();

  const hotelTypesQueryStr = searchParams.get("hotel_types") || "";
  const roomTypesQueryStr = searchParams.get("room_types") || "";
  const bedTypesQueryStr = searchParams.get("bed_types") || "";

  const hotelTypesFromUrl = useMemo(() => hotelTypesQueryStr
    ? hotelTypesQueryStr.split(",").map((x) => x.trim()).filter(Boolean)
    : [], [hotelTypesQueryStr]);
  const roomTypesFromUrl = useMemo(() => roomTypesQueryStr
    ? roomTypesQueryStr.split(",").map((x) => x.trim()).filter(Boolean)
    : [], [roomTypesQueryStr]);
  const bedTypesFromUrl = useMemo(() => bedTypesQueryStr
    ? bedTypesQueryStr.split(",").map((x) => x.trim()).filter(Boolean)
    : [], [bedTypesQueryStr]);

  const applyUrlTypeFilters = (list: PublicHotel[]): PublicHotel[] => {
    if (!hotelTypesFromUrl.length && !roomTypesFromUrl.length && !bedTypesFromUrl.length) return list;

    return list.filter((hotel) => {
      const hotelTypeMatch =
        !hotelTypesFromUrl.length ||
        (hotel.hotel_type ? hotelTypesFromUrl.includes(hotel.hotel_type) : false);

      const roomTypeMatch =
        !roomTypesFromUrl.length ||
        (hotel.hotel_rooms || []).some((r) => (r.room_type ? roomTypesFromUrl.includes(r.room_type) : false));

      const hotelBedTypes = (hotel.hotel_rooms || [])
        .flatMap((r) => r.hotel_room_details || [])
        .map((d) => d?.bed_type)
        .filter((x): x is string => typeof x === "string" && x.length > 0);

      const bedTypeMatch =
        !bedTypesFromUrl.length || bedTypesFromUrl.some((bt) => hotelBedTypes.includes(bt));

      return hotelTypeMatch && roomTypeMatch && bedTypeMatch;
    });
  };

  useEffect(() => {
    setIsLoaded(true);
    setLoading(true);
    setError(null);
    setActiveFilters(null);
    fetchPublicHotels({
      location: locationQuery || undefined,
      check_in: checkInQuery,
      check_out: checkOutQuery,
      guests: guestsQuery,
      rooms: roomsQuery,
    })
      .then((data) => {
        setHotels(data);
        setFilteredHotels(applyUrlTypeFilters(data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load hotels");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationQuery, checkInQuery, checkOutQuery, guestsQuery, roomsQuery, hotelTypesQueryStr, roomTypesQueryStr, bedTypesQueryStr]);

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedHotels((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const parsedStarRating = (hotel: PublicHotel): number => {
    const raw = hotel.hotel_details?.star_rating;
    const n = typeof raw === "string" ? parseFloat(raw) : (raw ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  const hotelRoomPrices = (hotel: PublicHotel): number[] => {
    const rooms = hotel.hotel_rooms || [];
    return rooms
      .map((r) => (typeof r.base_price === "string" ? parseFloat(r.base_price) : r.base_price))
      .filter((n) => Number.isFinite(n));
  };

  const extractHotelAmenityNames = (hotel: PublicHotel): string[] => {
    const names = new Set<string>();
    for (const hotelAmenity of hotel.hotel_amenities || []) {
      if (hotelAmenity?.amenity?.name) {
        names.add(hotelAmenity.amenity.name);
      }
    }
    return Array.from(names);
  };

  const extractRoomAmenityNames = (hotel: PublicHotel): string[] => {
    const names = new Set<string>();
    for (const room of hotel.hotel_rooms || []) {
      for (const detail of room.hotel_room_details || []) {
        for (const roomAmenity of detail.room_amenities || []) {
          if (roomAmenity?.amenity?.name) {
            names.add(roomAmenity.amenity.name);
          }
        }
      }
    }
    return Array.from(names);
  }; 

  const extractAmenityNames = (hotel: PublicHotel): string[] => {
    return Array.from(new Set([...extractHotelAmenityNames(hotel), ...extractRoomAmenityNames(hotel)]));
  };

  const filterOptions = useMemo(() => {
    const allHotelTypes = new Set<string>();
    const allHotelAmenities = new Set<string>();
    const allRoomAmenities = new Set<string>();
    const allRoomTypes = new Set<string>();
    const allBedTypes = new Set<string>();
    const ratingThresholds = new Set<number>();

    let minRoomPrice = Number.POSITIVE_INFINITY;
    let maxHotelRoomPrice = 0;

    for (const hotel of hotels) {
      if (hotel.hotel_type) allHotelTypes.add(hotel.hotel_type);

      for (const hotelAmenityName of extractHotelAmenityNames(hotel)) {
        allHotelAmenities.add(hotelAmenityName);
      }
      for (const roomAmenityName of extractRoomAmenityNames(hotel)) {
        allRoomAmenities.add(roomAmenityName);
      }

      const prices = hotelRoomPrices(hotel);
      for (const p of prices) minRoomPrice = Math.min(minRoomPrice, p);

      const hotelMax = prices.length ? Math.max(...prices) : 0;
      maxHotelRoomPrice = Math.max(maxHotelRoomPrice, hotelMax);

      for (const r of hotel.hotel_rooms || []) {
        if (r?.room_type) allRoomTypes.add(r.room_type);
        for (const detail of r.hotel_room_details || []) {
          if (detail?.bed_type) allBedTypes.add(detail.bed_type);
        }
      }

      const rating = parsedStarRating(hotel);
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) ratingThresholds.add(i);
      }
    }

    const priceMin = Number.isFinite(minRoomPrice) ? minRoomPrice : 0;
    const priceMax = maxHotelRoomPrice || 0;

    return {
      priceMin,
      priceMax,
      ratingOptions: [5, 4, 3, 2, 1].filter((i) => ratingThresholds.has(i)),
      hotelTypeOptions: hotelTypeEnumValues.length
        ? [...hotelTypeEnumValues].sort((a, b) => a.localeCompare(b))
        : Array.from(allHotelTypes).sort((a, b) => a.localeCompare(b)),
      hotelAmenityOptions: Array.from(allHotelAmenities).sort((a, b) => a.localeCompare(b)),
      roomAmenityOptions: Array.from(allRoomAmenities).sort((a, b) => a.localeCompare(b)),
      roomTypeOptions: roomTypeEnumValues.length
        ? [...roomTypeEnumValues].sort((a, b) => a.localeCompare(b))
        : Array.from(allRoomTypes).sort((a, b) => a.localeCompare(b)),
      bedTypeOptions: bedTypeEnumValues.length
        ? [...bedTypeEnumValues].sort((a, b) => a.localeCompare(b))
        : Array.from(allBedTypes).sort((a, b) => a.localeCompare(b)),
    };
  }, [hotels, hotelTypeEnumValues, roomTypeEnumValues, bedTypeEnumValues]);

  const applyHotelFilters = (list: PublicHotel[], filters: HotelSearchFilters | null) => {
    if (!filters) return list;

    const [minPrice, maxPrice] = filters.priceRange;
    const selectedRatings = filters.selectedRatings;
    const selectedHotelAmenities = filters.selectedHotelAmenities;
    const selectedRoomAmenities = filters.selectedRoomAmenities;
    const selectedHotelTypes = filters.selectedHotelTypes;
    const selectedRoomTypes = filters.selectedRoomTypes;
    const selectedBedTypes = filters.selectedBedTypes;

    const minSelectedRating = selectedRatings.length ? Math.min(...selectedRatings) : null;

    return list.filter((hotel) => {
      const hotelAmenities = extractHotelAmenityNames(hotel);
      const roomAmenities = extractRoomAmenityNames(hotel);
      const prices = hotelRoomPrices(hotel);

      const hotelTypesMatch =
        !selectedHotelTypes.length || (hotel.hotel_type ? selectedHotelTypes.includes(hotel.hotel_type) : false);

      const ratingMatch = minSelectedRating === null || parsedStarRating(hotel) >= minSelectedRating;

      const hotelAmenitiesMatch =
        !selectedHotelAmenities.length || selectedHotelAmenities.every((a) => hotelAmenities.includes(a));
      const roomAmenitiesMatch =
        !selectedRoomAmenities.length || selectedRoomAmenities.every((a) => roomAmenities.includes(a));

      const roomTypesMatch =
        !selectedRoomTypes.length ||
        (hotel.hotel_rooms || []).some((r) => (r.room_type ? selectedRoomTypes.includes(r.room_type) : false));

      const hotelBedTypes = (hotel.hotel_rooms || [])
        .flatMap((r) => r.hotel_room_details || [])
        .map((d) => d?.bed_type)
        .filter((x): x is string => typeof x === "string" && x.length > 0);

      const bedTypesMatch =
        !selectedBedTypes.length || selectedBedTypes.some((bt) => hotelBedTypes.includes(bt));

      const priceMatch = prices.length ? prices.some((p) => p >= minPrice && p <= maxPrice) : false;

      // If price filter is "unset" (min==max), treat it as not applied
      const priceFilterActive = Number.isFinite(minPrice) && Number.isFinite(maxPrice) && minPrice !== maxPrice;
      const finalPriceMatch = !priceFilterActive ? true : priceMatch;

      return hotelTypesMatch && ratingMatch && hotelAmenitiesMatch && roomAmenitiesMatch && roomTypesMatch && bedTypesMatch && finalPriceMatch;
    });
  };

  const onApplyFilters = (filters: HotelSearchFilters) => {
    setActiveFilters(filters);
    setFilteredHotels(applyHotelFilters(hotels, filters));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero search section */}
      <section className="relative bg-secondary/20 pt-28 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background/50" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-3xl sm:text-4xl font-bold text-center mb-2 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
            Search <span className="text-gradient">Hotels</span>
          </h1>
          <p className={`text-muted-foreground text-center mb-8 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "50ms" }}>
            Find your perfect stay
          </p>
          <SearchBar showFilters={false} />
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`${isLoaded ? "animate-fade-in-left" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
            <HotelFilterSidebar
              priceMin={filterOptions.priceMin}
              priceMax={filterOptions.priceMax}
              ratingOptions={filterOptions.ratingOptions}
              hotelTypeOptions={filterOptions.hotelTypeOptions}
              hotelAmenityOptions={filterOptions.hotelAmenityOptions}
              roomAmenityOptions={filterOptions.roomAmenityOptions}
              roomTypeOptions={filterOptions.roomTypeOptions}
              bedTypeOptions={filterOptions.bedTypeOptions}
              initialSelectedHotelTypes={hotelTypesFromUrl}
              initialSelectedRoomTypes={roomTypesFromUrl}
              initialSelectedBedTypes={bedTypesFromUrl}
              onApply={onApplyFilters}
            />
          </div>

          <div className="flex-1">
            {/* Toolbar */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "250ms" }}>
              <span className="text-sm text-muted-foreground">
                {loading ? "Loading hotels..." : `${filteredHotels.length} hotel${filteredHotels.length !== 1 ? "s" : ""} found`}
                {locationQuery && !loading && <> for "<span className="text-foreground font-medium">{locationQuery}</span>"</>}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="gap-2">
                  <MapPinned className="h-4 w-4" /> <span className="hidden sm:inline">See Location</span>
                </Button>
                <Button variant={view === "grid" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setView("grid")}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={view === "list" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setView("list")}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" /> <span className="hidden sm:inline">Sort by</span>
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-center py-16">
                <p className="text-xl font-semibold mb-2 text-destructive">{error}</p>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
            {!error && (
              <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredHotels.map((hotel, index) => {
                  // Get cover image or fallback
                  const coverImg = hotel.hotel_images?.find(img => img.is_cover)?.image_url || hotel.hotel_images?.[0]?.image_url || "https://via.placeholder.com/400x300?text=No+Image";
                  const preservedSearch = searchParams.toString();
                  return (
                    <div
                      key={hotel.hotel_id}
                      onClick={() => navigate(`/hotel/${hotel.hotel_id}${preservedSearch ? `?${preservedSearch}` : ""}`)}
                      className={`group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:-translate-y-2 ${isLoaded ? "animate-fade-in-up" : "opacity-0"} ${view === "list" ? "flex flex-col sm:flex-row" : ""}`}
                      style={{ animationDelay: `${(index + 3) * 80}ms` }}
                    >
                      <div className={`relative overflow-hidden ${view === "list" ? "w-full sm:w-72 shrink-0 aspect-[16/10] sm:aspect-auto sm:h-auto" : "aspect-[4/3]"}`}>
                        <img src={coverImg} alt={hotel.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                        <button onClick={(e) => toggleLike(e, hotel.hotel_id)} className="absolute top-4 right-4 p-2.5 rounded-full glass transition-all duration-300 hover:scale-125 z-10">
                          <Heart className={`h-5 w-5 transition-all ${likedHotels.includes(hotel.hotel_id) ? "fill-destructive text-destructive" : "text-foreground hover:text-destructive"}`} />
                        </button>
                        {hotel.hotel_details?.star_rating && (
                          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm z-10">
                            <Star className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
                            <span className="text-sm font-semibold text-primary-foreground">{hotel.hotel_details.star_rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mr-2">{hotel.name}</h3>
                          {hotel.hotel_rooms && hotel.hotel_rooms.length > 0 && (
                            <span className="text-base font-bold text-primary">$
                              {Math.min(
                                ...hotel.hotel_rooms.map((room) =>
                                  typeof room.base_price === "string" ? parseFloat(room.base_price) : room.base_price
                                )
                              )}
                              <span className="text-sm text-muted-foreground ml-1">/ night</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{hotel.city || hotel.address || "Unknown"}</span>
                        </div>
                        {hotel.hotel_details?.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{hotel.hotel_details.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {hotel.hotel_type && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{hotel.hotel_type}</span>
                          )}
                        </div>
                        {/* No rooms available message */}
                        {(!hotel.hotel_rooms || hotel.hotel_rooms.length === 0) && (
                          <div className="mb-2">
                            <span className="text-sm text-muted-foreground">No room found for this hotel</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No hotels found handled by error or empty hotels array above */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchHotels;
