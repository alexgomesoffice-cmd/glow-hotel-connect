import { apiGet } from "@/utils/api";
import { DUMMY_PUBLIC_HOTELS } from "@/data/dummyHotels";

export interface PublicHotel {
  hotel_id: number;
  name: string;
  city: string | null;
  address: string | null;
  hotel_type: string | null;
  hotel_images?: { image_url: string; is_cover?: boolean }[];
  hotel_details?: { description?: string | null; star_rating?: number | string | null };
  hotel_amenities?: { amenity: { name: string } }[];
  hotel_rooms?: {
    base_price: number | string;
    room_type?: string | null;
    hotel_room_details?: Array<{
      bed_type?: string | null;
      room_amenities?: { amenity: { name: string } }[];
    }>;
  }[];
  // ...add more fields as needed for the card
}

export interface EnumOption {
  value: string;
  label: string;
}

async function fetchEnumOptions(endpoint: string): Promise<EnumOption[]> {
  const response = await apiGet(endpoint);
  if (response.success === false) {
    throw new Error(response.message || "Failed to fetch enum options");
  }
  return response.data || [];
}

export function fetchHotelTypeOptions(): Promise<EnumOption[]> {
  return fetchEnumOptions(`/meta/hotel-types`);
}

export function fetchRoomTypeOptions(): Promise<EnumOption[]> {
  return fetchEnumOptions(`/meta/room-types`);
}

export function fetchBedTypeOptions(): Promise<EnumOption[]> {
  return fetchEnumOptions(`/meta/bed-types`);
}

export async function fetchPublicHotels(params?: {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  rooms?: number;
}): Promise<PublicHotel[]> {
  const queryParams = new URLSearchParams();
  if (params?.location) queryParams.append("location", params.location);
  if (params?.check_in) queryParams.append("check_in", params.check_in);
  if (params?.check_out) queryParams.append("check_out", params.check_out);
  if (params?.guests) queryParams.append("guests", String(params.guests));
  if (params?.rooms) queryParams.append("rooms", String(params.rooms));

  const endpoint = `/end-users/hotels${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await apiGet(endpoint);
    console.log("Fetch Public Hotels Response:", response);
    if (response.success === false) {
      throw new Error(response.message || "Failed to fetch hotels");
    }
    const hotels: PublicHotel[] = response.hotels || [];
    // If the backend returns no hotels, fall back to dummy data so the UI stays populated.
    if (!hotels.length) {
      return filterDummyHotels(params?.location);
    }
    return hotels;
  } catch (error) {
    // DUMMY DATA FALLBACK — backend unreachable (e.g. local API not running).
    console.warn("fetchPublicHotels: using dummy hotel data fallback.", error);
    return filterDummyHotels(params?.location);
  }
}

// Filters the dummy hotels by location (city/name) when provided.
function filterDummyHotels(location?: string): PublicHotel[] {
  if (!location) return DUMMY_PUBLIC_HOTELS;
  const q = location.trim().toLowerCase();
  const filtered = DUMMY_PUBLIC_HOTELS.filter(
    (h) =>
      h.city?.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q)
  );
  return filtered.length ? filtered : DUMMY_PUBLIC_HOTELS;
}

export interface SearchSuggestion {
  id: number;
  name: string;
  city?: string;
  type: 'hotel' | 'city';
}

export async function fetchSearchSuggestions(query: string): Promise<{
  hotels: SearchSuggestion[];
  cities: SearchSuggestion[];
}> {
  const response = await apiGet(`/meta/search-suggestions?q=${encodeURIComponent(query)}`);
  if (response.success === false) {
    throw new Error(response.message || "Failed to fetch search suggestions");
  }
  return response.data || { hotels: [], cities: [] };
}
