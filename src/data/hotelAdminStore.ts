/**
 * Hotel Admin dummy data store (client-side).
 * All hotel admin pages read/write here; nothing hits a real backend.
 * Persists to localStorage so edits survive refresh.
 */

const LS_KEY = "hotelAdminStore.v1";

// -------------------- Types --------------------
export type ReservationStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled" | "pending_payment";
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";
export type BookingSource = "Direct" | "Booking.com" | "Expedia" | "Airbnb" | "Agoda";
export type RoomStatus = "available" | "occupied" | "maintenance" | "out_of_order";
export type CleaningStatus = "clean" | "dirty" | "in_progress" | "inspected";
export type DraftStatus = "draft" | "submitted" | "approved" | "rejected";
export type FieldReview = "pending" | "approved" | "rejected";
export type DocStatus = "verified" | "pending" | "rejected" | "expired";

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  nid: string;
  dob: string;
  address: string;
  vip: boolean;
  notes: string;
  preferences: string[];
  createdAt: string;
}

export interface Reservation {
  id: string;
  code: string;
  guestId: string;
  roomIds: string[];
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  source: BookingSource;
  status: ReservationStatus;
  payment: PaymentStatus;
  roomCharge: number;
  extras: { label: string; amount: number }[];
  discounts: { label: string; amount: number }[];
  taxes: { label: string; amount: number }[];
  specialRequests: string;
  createdAt: string;
  timeline: { at: string; label: string }[];
  paymentTimeline: { at: string; label: string; amount: number; method: string }[];
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  weekendPrice: number;
  maxOccupancy: number;
  bedType: string;
  size: number;
  amenities: string[];
  images: string[];
  archived: boolean;
}

export interface Room {
  id: string;
  number: string;
  typeId: string;
  floor: number;
  status: RoomStatus;
  cleaning: CleaningStatus;
  currentGuestId?: string;
  nextReservationId?: string;
  maintenanceNote?: string;
  smokingAllowed: boolean;
  petsAllowed: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "OWNER" | "HOTEL_ADMIN" | "SUB_ADMIN";
  title: string;
  permissions: string[];
  status: "active" | "inactive";
  createdAt: string;
  lastLoginAt: string;
  recentActivity: { at: string; action: string }[];
}

export interface Review {
  id: string;
  guestId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: string;
  repliedAt?: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  method: "Card" | "Cash" | "Bank Transfer" | "Wallet";
  amount: number;
  type: "charge" | "refund";
  createdAt: string;
}

export interface Notification {
  id: string;
  kind: "booking" | "review" | "draft" | "system";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Amenity {
  id: string;
  label: string;
  group: string;
}

export interface PropertyListing {
  general: {
    name: string;
    type: string;
    starRating: number;
    propertySize: number;
    establishedYear: number;
    floors: number;
    totalRooms: number;
    category: string;
    summary: string;
    businessStatus: "active" | "paused";
  };
  business: {
    ownerName: string;
    businessName: string;
    tradeLicense: string;
    businessRegistration: string;
    tin: string;
    vat: string;
    email: string;
    phone: string;
    website: string;
    businessAddress: string;
  };
  owner: {
    fullName: string;
    email: string;
    phone: string;
    nid: string;
    passport: string;
    address: string;
    emergencyContact: string;
  };
  bank: {
    accountName: string;
    bankName: string;
    branch: string;
    routing: string;
    accountNumber: string;
  };
  location: {
    address: string;
    division: string;
    area: string;
    city: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  contacts: {
    reservationPhone: string;
    receptionPhone: string;
    emergencyPhone: string;
    email: string;
    website: string;
    social: { platform: string; url: string }[];
  };
  description: {
    long: string;
    short: string;
    languages: string[];
  };
  amenities: string[]; // amenity ids
  gallery: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    children: string;
    pets: string;
    smoking: string;
    cancellation: string;
    payment: string;
    extraBed: string;
  };
  languages: string[];
  nearbyAttractions: { name: string; distance: string }[];
  seo: { title: string; description: string; keywords: string };
}

// Fields that can NEVER be edited via a Draft — they require a Verification Request.
export const PROTECTED_PATHS: readonly string[] = [
  "general.type",
  "business.businessName",
  "business.tradeLicense",
  "business.businessRegistration",
  "business.tin",
  "business.vat",
  "owner.fullName",
  "owner.nid",
  "owner.passport",
  "bank.accountName",
  "bank.bankName",
  "bank.branch",
  "bank.routing",
  "bank.accountNumber",
  "location.country",
];

export const isProtectedField = (path: string) =>
  PROTECTED_PATHS.some((p) => path === p || path.startsWith(p + "."));

export interface VerificationRequest {
  id: string;
  scope: "business" | "owner" | "bank" | "document" | "location" | "general";
  field: string;
  label: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}


export interface DraftField {
  path: string;
  label: string;
  currentValue: string;
  pendingValue: string;
  review: FieldReview;
  feedback?: string;
}

export interface PendingDraft {
  id: string;
  status: DraftStatus;
  fields: DraftField[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  cooldownUntil?: string; // ISO; edits locked until this
  timeline: { at: string; label: string; by?: string }[];
}

export interface HotelDocument {
  id: string;
  kind: string;
  label: string;
  status: DocStatus;
  expiryDate?: string;
  lastVerifiedAt?: string;
  fileUrl?: string;
}

export interface UpdateRequest {
  id: string;
  scope: "business" | "document";
  field: string;
  currentValue: string;
  requestedValue: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  note?: string;
}

export interface HotelAdminStore {
  live: PropertyListing;
  draft: PendingDraft | null;
  documents: HotelDocument[];
  updateRequests: UpdateRequest[];
  verificationRequests: VerificationRequest[];
  guests: Guest[];
  reservations: Reservation[];
  roomTypes: RoomType[];
  rooms: Room[];
  staff: StaffMember[];
  reviews: Review[];
  transactions: Transaction[];
  notifications: Notification[];
  amenities: Amenity[];
  activity: { id: string; at: string; actor: string; action: string; target: string }[];
}


// -------------------- Seed --------------------
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => iso(new Date(Date.now() - n * 86400000));
const daysAhead = (n: number) => iso(new Date(Date.now() + n * 86400000));
const hoursAhead = (n: number) => iso(new Date(Date.now() + n * 3600000));

const AMENITIES: Amenity[] = [
  { id: "wifi", label: "Free Wi-Fi", group: "Basics" },
  { id: "ac", label: "Air Conditioning", group: "Basics" },
  { id: "tv", label: "Flat-screen TV", group: "Entertainment" },
  { id: "minibar", label: "Minibar", group: "Room" },
  { id: "safe", label: "In-room Safe", group: "Room" },
  { id: "pool", label: "Swimming Pool", group: "Facilities" },
  { id: "gym", label: "Fitness Center", group: "Facilities" },
  { id: "spa", label: "Spa & Wellness", group: "Facilities" },
  { id: "restaurant", label: "Restaurant", group: "Food & Drink" },
  { id: "bar", label: "Bar / Lounge", group: "Food & Drink" },
  { id: "parking", label: "Free Parking", group: "Services" },
  { id: "airport", label: "Airport Shuttle", group: "Services" },
  { id: "laundry", label: "Laundry", group: "Services" },
  { id: "concierge", label: "24/7 Concierge", group: "Services" },
];

const seed = (): HotelAdminStore => {
  const guests: Guest[] = [
    { id: "g1", name: "Alice Martin", email: "alice@example.com", phone: "+1 555 0110", nationality: "USA", nid: "NID-A1123", dob: "1988-03-14", address: "220 Ocean Ave, Miami, FL", vip: true, notes: "Prefers high-floor rooms.", preferences: ["High floor", "Non-smoking", "Late check-out"], createdAt: daysAgo(320) },
    { id: "g2", name: "Robert Kim", email: "robert.kim@example.com", phone: "+82 10 5522 1140", nationality: "South Korea", nid: "NID-B4482", dob: "1992-07-02", address: "12 Hannam-dong, Seoul", vip: false, notes: "", preferences: ["Quiet room"], createdAt: daysAgo(180) },
    { id: "g3", name: "Sophie Chen", email: "sophie.c@example.com", phone: "+44 20 7946 0821", nationality: "United Kingdom", nid: "NID-C7791", dob: "1985-11-23", address: "45 Baker St, London", vip: true, notes: "Allergic to feather pillows.", preferences: ["Hypoallergenic bedding"], createdAt: daysAgo(410) },
    { id: "g4", name: "James Wilson", email: "j.wilson@example.com", phone: "+61 2 5550 8877", nationality: "Australia", nid: "NID-D2210", dob: "1979-05-30", address: "88 George St, Sydney", vip: false, notes: "", preferences: [], createdAt: daysAgo(90) },
    { id: "g5", name: "Fatima Rahman", email: "fatima.r@example.com", phone: "+880 1712 445588", nationality: "Bangladesh", nid: "NID-E9987", dob: "1995-01-19", address: "House 12, Gulshan 2, Dhaka", vip: false, notes: "", preferences: ["Ground floor"], createdAt: daysAgo(60) },
  ];

  const roomTypes: RoomType[] = [
    { id: "rt1", name: "Standard Queen", description: "Comfortable queen room with city view.", basePrice: 120, weekendPrice: 145, maxOccupancy: 2, bedType: "Queen", size: 28, amenities: ["wifi", "ac", "tv", "safe"], images: [], archived: false },
    { id: "rt2", name: "Deluxe King", description: "Spacious king room with premium amenities.", basePrice: 180, weekendPrice: 220, maxOccupancy: 2, bedType: "King", size: 36, amenities: ["wifi", "ac", "tv", "minibar", "safe"], images: [], archived: false },
    { id: "rt3", name: "Executive Suite", description: "Two-room suite with lounge and city view.", basePrice: 320, weekendPrice: 380, maxOccupancy: 4, bedType: "King + Sofa Bed", size: 62, amenities: ["wifi", "ac", "tv", "minibar", "safe", "spa"], images: [], archived: false },
  ];

  const rooms: Room[] = [
    { id: "r101", number: "101", typeId: "rt1", floor: 1, status: "occupied", cleaning: "clean", currentGuestId: "g1", smokingAllowed: false, petsAllowed: false },
    { id: "r102", number: "102", typeId: "rt1", floor: 1, status: "available", cleaning: "inspected", smokingAllowed: false, petsAllowed: false },
    { id: "r103", number: "103", typeId: "rt1", floor: 1, status: "maintenance", cleaning: "in_progress", maintenanceNote: "AC unit replacement", smokingAllowed: false, petsAllowed: false },
    { id: "r201", number: "201", typeId: "rt2", floor: 2, status: "occupied", cleaning: "dirty", currentGuestId: "g3", smokingAllowed: false, petsAllowed: true },
    { id: "r202", number: "202", typeId: "rt2", floor: 2, status: "available", cleaning: "clean", smokingAllowed: false, petsAllowed: false },
    { id: "r203", number: "203", typeId: "rt2", floor: 2, status: "available", cleaning: "clean", smokingAllowed: true, petsAllowed: false },
    { id: "r301", number: "301", typeId: "rt3", floor: 3, status: "occupied", cleaning: "clean", currentGuestId: "g4", smokingAllowed: false, petsAllowed: false },
    { id: "r302", number: "302", typeId: "rt3", floor: 3, status: "available", cleaning: "clean", smokingAllowed: false, petsAllowed: false },
  ];

  const mkRes = (
    id: string, code: string, guestId: string, roomIds: string[], roomTypeId: string,
    checkIn: string, checkOut: string, status: ReservationStatus, payment: PaymentStatus,
    source: BookingSource, amount: number,
  ): Reservation => ({
    id, code, guestId, roomIds, roomTypeId, checkIn, checkOut,
    guests: 2, adults: 2, children: 0, source, status, payment,
    roomCharge: amount,
    extras: [{ label: "Breakfast", amount: 30 }],
    discounts: [],
    taxes: [{ label: "VAT 10%", amount: Math.round(amount * 0.1) }],
    specialRequests: "",
    createdAt: daysAgo(Math.floor(Math.random() * 30) + 1),
    timeline: [{ at: daysAgo(5), label: "Booking created" }, { at: daysAgo(1), label: "Payment confirmed" }],
    paymentTimeline: [{ at: daysAgo(5), label: "Card charge", amount, method: "Visa •• 4242" }],
  });

  const reservations: Reservation[] = [
    mkRes("b1", "BKG-10241", "g1", ["r101"], "rt1", daysAhead(0), daysAhead(3), "checked_in", "paid", "Direct", 360),
    mkRes("b2", "BKG-10242", "g2", ["r202"], "rt2", daysAhead(0), daysAhead(2), "confirmed", "paid", "Booking.com", 360),
    mkRes("b3", "BKG-10243", "g3", ["r201"], "rt2", daysAgo(2), daysAhead(0), "checked_in", "paid", "Expedia", 540),
    mkRes("b4", "BKG-10244", "g4", ["r301"], "rt3", daysAhead(0), daysAhead(4), "checked_in", "paid", "Direct", 1280),
    mkRes("b5", "BKG-10245", "g5", ["r302"], "rt3", daysAhead(1), daysAhead(3), "confirmed", "pending", "Airbnb", 640),
    mkRes("b6", "BKG-10246", "g2", ["r102"], "rt1", daysAgo(10), daysAgo(7), "checked_out", "paid", "Direct", 360),
    mkRes("b7", "BKG-10247", "g5", ["r203"], "rt2", daysAgo(14), daysAgo(12), "cancelled", "refunded", "Booking.com", 360),
  ];

  const staff: StaffMember[] = [
    { id: "s1", name: "Elena Martinez", email: "owner@grandhotel.com", phone: "+1 305 555 1200", role: "OWNER", title: "Property Owner", permissions: ["ALL"], status: "active", createdAt: daysAgo(900), lastLoginAt: daysAgo(2), recentActivity: [{ at: daysAgo(2), action: "Reviewed monthly revenue" }] },
    { id: "s2", name: "Maria Garcia", email: "maria@hotelmanager.com", phone: "+1 305 555 1300", role: "HOTEL_ADMIN", title: "General Manager", permissions: ["ALL"], status: "active", createdAt: daysAgo(600), lastLoginAt: daysAgo(0), recentActivity: [{ at: hoursAhead(-2), action: "Confirmed booking BKG-10245" }] },
    { id: "s3", name: "David Chen", email: "david@grandhotel.com", phone: "+1 305 555 1400", role: "SUB_ADMIN", title: "Front Desk Lead", permissions: ["reservations.read", "reservations.write", "guests.read", "rooms.read"], status: "active", createdAt: daysAgo(200), lastLoginAt: daysAgo(1), recentActivity: [{ at: daysAgo(1), action: "Checked in guest Alice Martin" }] },
    { id: "s4", name: "Priya Sharma", email: "priya@grandhotel.com", phone: "+1 305 555 1500", role: "SUB_ADMIN", title: "Housekeeping Manager", permissions: ["rooms.read", "rooms.write"], status: "active", createdAt: daysAgo(150), lastLoginAt: daysAgo(3), recentActivity: [{ at: daysAgo(3), action: "Updated cleaning status for 12 rooms" }] },
  ];

  const reviews: Review[] = [
    { id: "rv1", guestId: "g1", bookingId: "b6", rating: 5, comment: "Immaculate rooms and incredibly kind staff. Will absolutely stay again.", createdAt: daysAgo(4) },
    { id: "rv2", guestId: "g3", bookingId: "b3", rating: 4, comment: "Great location, breakfast could improve.", createdAt: daysAgo(1), reply: "Thanks Sophie — we're refreshing the breakfast menu next month!", repliedAt: daysAgo(0) },
    { id: "rv3", guestId: "g4", bookingId: "b4", rating: 5, comment: "Suite was stunning, view of the harbor was unreal.", createdAt: daysAgo(2) },
    { id: "rv4", guestId: "g5", bookingId: "b7", rating: 3, comment: "Room was fine but check-in took a while.", createdAt: daysAgo(11) },
  ];

  const transactions: Transaction[] = reservations.flatMap((r) => r.paymentTimeline.map((p, i) => ({
    id: `tx-${r.id}-${i}`, bookingId: r.id, method: "Card" as const, amount: p.amount, type: "charge" as const, createdAt: p.at,
  })));

  const notifications: Notification[] = [
    { id: "n1", kind: "booking", title: "New booking", message: "Fatima Rahman booked Executive Suite for 2 nights", createdAt: hoursAhead(-1), read: false },
    { id: "n2", kind: "review", title: "New 4★ review", message: "Sophie Chen left a review — awaiting reply", createdAt: hoursAhead(-4), read: false },
    { id: "n3", kind: "draft", title: "Draft feedback", message: "System admin approved 3 of 5 fields in your listing draft", createdAt: hoursAhead(-8), read: true },
    { id: "n4", kind: "system", title: "Document expiring", message: "Fire Safety certificate expires in 21 days", createdAt: hoursAhead(-24), read: true },
  ];

  const live: PropertyListing = {
    general: { name: "The Grand Miami Hotel", type: "Luxury Resort", starRating: 5, propertySize: 8200, establishedYear: 1998, floors: 12, totalRooms: 214, category: "Beachfront Resort", summary: "Beachfront luxury resort in the heart of Miami.", businessStatus: "active" },
    business: { ownerName: "Elena Martinez", businessName: "Grand Miami Hospitality LLC", tradeLicense: "TL-2024-77123", businessRegistration: "REG-991823", tin: "TIN-449281", vat: "VAT-118293", email: "owner@grandhotel.com", phone: "+1 305 555 1200", website: "https://grandmiami.example", businessAddress: "1200 Ocean Drive, Miami, FL 33139" },
    owner: { fullName: "Elena Martinez", email: "owner@grandhotel.com", phone: "+1 305 555 1200", nid: "NID-OWN-8821", passport: "P-778821", address: "88 Star Island, Miami, FL", emergencyContact: "+1 305 555 9911 (Carlos Martinez)" },
    bank: { accountName: "Grand Miami Hospitality LLC", bankName: "First Atlantic Bank", branch: "South Beach Branch", routing: "067014822", accountNumber: "•••• •••• 4488" },
    location: { address: "1200 Ocean Drive", division: "Florida", area: "South Beach", city: "Miami", country: "USA", postalCode: "33139", latitude: 25.7825, longitude: -80.1300 },
    contacts: { reservationPhone: "+1 305 555 0100", receptionPhone: "+1 305 555 0101", emergencyPhone: "+1 305 555 0911", email: "hello@grandmiami.example", website: "https://grandmiami.example", social: [{ platform: "Instagram", url: "@grandmiami" }, { platform: "Facebook", url: "grandmiami" }] },

    description: { long: "The Grand Miami Hotel is a beachfront destination combining timeless art-deco style with modern comfort. Our 214 rooms and suites overlook the Atlantic, and our spa, rooftop pool, and three restaurants set the standard for the South Beach experience.", short: "Timeless beachfront luxury in South Beach.", languages: ["English", "Spanish"] },
    amenities: ["wifi", "ac", "tv", "safe", "minibar", "pool", "gym", "spa", "restaurant", "bar", "parking", "airport", "laundry", "concierge"],
    gallery: [],
    policies: { checkIn: "3:00 PM", checkOut: "11:00 AM", children: "All ages welcome. Under 6 stay free.", pets: "Small pets allowed on request ($50/night).", smoking: "Non-smoking property; designated outdoor areas.", cancellation: "Free cancellation up to 48 hours before arrival.", payment: "Credit card required at booking. Full charge at check-in.", extraBed: "Extra bed available for $40/night." },
    languages: ["English", "Spanish", "French"],
    nearbyAttractions: [{ name: "South Beach", distance: "50 m" }, { name: "Art Deco District", distance: "500 m" }, { name: "Miami Beach Convention Center", distance: "1.2 km" }],
    seo: { title: "The Grand Miami Hotel — Luxury Beachfront Resort", description: "5-star beachfront resort on South Beach. Spa, rooftop pool, and Atlantic views.", keywords: "miami hotel, south beach, luxury resort" },
  };

  const draft: PendingDraft = {
    id: "draft-1",
    status: "submitted",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
    submittedAt: daysAgo(1),
    cooldownUntil: hoursAhead(18),
    fields: [
      { path: "description.long", label: "Long Description", currentValue: live.description.long, pendingValue: live.description.long + " New: rooftop cocktail lounge open nightly.", review: "pending" },
      { path: "policies.checkIn", label: "Check-in Time", currentValue: "3:00 PM", pendingValue: "2:00 PM", review: "approved" },
      { path: "amenities", label: "Amenities", currentValue: "14 amenities", pendingValue: "15 amenities (+ Rooftop Lounge)", review: "pending" },
      { path: "contacts.reservationPhone", label: "Reservation Phone", currentValue: "+1 305 555 0100", pendingValue: "+1 305 555 0199", review: "rejected", feedback: "Number doesn't match verified business phone." },
    ],
    timeline: [
      { at: daysAgo(4), label: "Draft created", by: "Maria Garcia" },
      { at: daysAgo(2), label: "3 fields updated", by: "Maria Garcia" },
      { at: daysAgo(1), label: "Submitted for review", by: "Maria Garcia" },
      { at: hoursAhead(-6), label: "Partial review completed", by: "System Admin" },
    ],
  };

  const documents: HotelDocument[] = [
    { id: "d1", kind: "trade_license", label: "Trade License", status: "verified", expiryDate: daysAhead(280), lastVerifiedAt: daysAgo(85) },
    { id: "d2", kind: "business_registration", label: "Business Registration", status: "verified", lastVerifiedAt: daysAgo(85) },
    { id: "d3", kind: "tin", label: "TIN Certificate", status: "verified", lastVerifiedAt: daysAgo(85) },
    { id: "d4", kind: "vat", label: "VAT Registration", status: "verified", lastVerifiedAt: daysAgo(85) },
    { id: "d5", kind: "owner_nid", label: "Owner NID", status: "verified", lastVerifiedAt: daysAgo(85) },
    { id: "d6", kind: "passport", label: "Owner Passport", status: "pending", lastVerifiedAt: daysAgo(85) },
    { id: "d7", kind: "bank", label: "Bank Verification", status: "verified", lastVerifiedAt: daysAgo(30) },
    { id: "d8", kind: "fire_safety", label: "Fire Safety Certificate", status: "verified", expiryDate: daysAhead(21), lastVerifiedAt: daysAgo(340) },
    { id: "d9", kind: "food_license", label: "Food License", status: "verified", expiryDate: daysAhead(120), lastVerifiedAt: daysAgo(240) },
    { id: "d10", kind: "classification", label: "Hotel Classification", status: "verified", lastVerifiedAt: daysAgo(400) },
  ];

  return {
    live,
    draft,
    documents,
    updateRequests: [],
    verificationRequests: [
      { id: "vr1", scope: "owner", field: "owner.phone", label: "Owner Phone", currentValue: "+1 305 555 1200", requestedValue: "+1 305 555 1250", reason: "Owner switched to a new business line.", status: "pending", submittedAt: daysAgo(2) },
    ],
    guests,
    reservations,
    roomTypes,
    rooms,
    staff,
    reviews,
    transactions,
    notifications,
    amenities: AMENITIES,
    activity: [
      { id: "a1", at: daysAgo(0), actor: "Maria Garcia", action: "Confirmed booking", target: "BKG-10245" },
      { id: "a2", at: daysAgo(1), actor: "David Chen", action: "Checked in guest", target: "Alice Martin" },
      { id: "a3", at: daysAgo(1), actor: "Maria Garcia", action: "Submitted listing draft", target: "Draft #1" },
      { id: "a4", at: daysAgo(2), actor: "Priya Sharma", action: "Marked room as maintenance", target: "Room 103" },
    ],
  };
};

// -------------------- Persistence --------------------
let cache: HotelAdminStore | null = null;

export const getStore = (): HotelAdminStore => {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      cache = JSON.parse(raw) as HotelAdminStore;
      return cache;
    }
  } catch { /* ignore */ }
  cache = seed();
  localStorage.setItem(LS_KEY, JSON.stringify(cache));
  return cache;
};

export const saveStore = (next: HotelAdminStore) => {
  cache = next;
  localStorage.setItem(LS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("hotel-admin-store-changed"));
};

export const updateStore = (patch: (s: HotelAdminStore) => HotelAdminStore) => {
  saveStore(patch(getStore()));
};

export const resetStore = () => {
  cache = seed();
  saveStore(cache);
};

// -------------------- Selectors / helpers --------------------
export const findGuest = (id: string) => getStore().guests.find((g) => g.id === id);
export const findReservation = (id: string) => getStore().reservations.find((r) => r.id === id);
export const findRoomType = (id: string) => getStore().roomTypes.find((r) => r.id === id);
export const findRoom = (id: string) => getStore().rooms.find((r) => r.id === id);
export const findStaff = (id: string) => getStore().staff.find((s) => s.id === id);

export const isToday = (isoStr: string) => {
  const d = new Date(isoStr); const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

export const cooldownRemainingMs = (draft: PendingDraft | null) => {
  if (!draft?.cooldownUntil) return 0;
  return Math.max(0, new Date(draft.cooldownUntil).getTime() - Date.now());
};

export const formatMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export const formatDate = (isoStr: string) =>
  new Date(isoStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export const formatDateTime = (isoStr: string) =>
  new Date(isoStr).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

// React hook for subscribing to store changes
import { useEffect, useState } from "react";
export const useHotelStore = <T>(selector: (s: HotelAdminStore) => T): T => {
  const [value, setValue] = useState(() => selector(getStore()));
  useEffect(() => {
    const handler = () => setValue(selector(getStore()));
    window.addEventListener("hotel-admin-store-changed", handler);
    return () => window.removeEventListener("hotel-admin-store-changed", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
};
