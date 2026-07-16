// Dummy Drafts/Cases dataset powering the Work Queue + Case Review Workspace.
// All data is client-side only — no backend, no assignment, no priority, no SLA.
// One pending draft per hotel; every System Admin sees every request (FIFO).

export type CaseStatus = "pending" | "approved" | "rejected";

export type CaseType =
  | "registration"
  | "property"
  | "legal"
  | "identity"
  | "bank"
  | "publication"
  | "protected_field";

export type CaseVersionBadge =
  | "Published"
  | "Draft"
  | "Pending Review"
  | "Rejected"
  | "Archived";

// Field-level state used during review (client-only).
export type FieldReviewState = "pending" | "rejected" | "approved";

export interface DiffField {
  key: string;                 // stable id for reject-state map
  label: string;
  current: string | number | null;
  requested: string | number | null;
  kind?: "text" | "longtext" | "number" | "url";
  protected?: boolean;
  state?: FieldReviewState;    // seeded pending; UI can flip to rejected
}

export interface AmenityDiff {
  added: { key: string; name: string; state?: FieldReviewState }[];
  removed: { key: string; name: string; state?: FieldReviewState }[];
}

export interface GalleryDiff {
  added: { key: string; src: string; state?: FieldReviewState }[];
  removed: { key: string; src: string; state?: FieldReviewState }[];
}

export interface RoomPriceDiff {
  roomId: string;
  name: string;
  currentPrice: number;
  requestedPrice: number;
  currentInventory: number;
  requestedInventory: number;
  state?: FieldReviewState;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: "pdf" | "image";
  size: string;
  uploadedAt: string;
  thumb: string;
}

export interface CaseTimelineEvent {
  id: string;
  at: string;
  actor: string;
  kind: "submitted" | "comment" | "status" | "approved" | "rejected" | "info_requested" | "updated";
  message: string;
}

export interface CaseInternalNote {
  id: string;
  at: string;
  author: string;
  body: string;
}

export interface CaseRecord {
  id: string;
  number: string;
  type: CaseType;
  hotelId: number;
  hotelName: string;
  hotelCity: string;
  ownerName: string;
  submittedBy: string;
  submittedByEmail: string;
  createdAt: string;       // draft first submitted
  lastUpdatedAt: string;   // latest edit inside the draft
  status: CaseStatus;
  summary: string;
  fields: DiffField[];
  amenities?: AmenityDiff;
  gallery?: GalleryDiff;
  rooms?: RoomPriceDiff[];
  descriptionDiff?: { current: string; requested: string; state?: FieldReviewState };
  documents: CaseDocument[];
  timeline: CaseTimelineEvent[];
  notes: CaseInternalNote[];
  version: CaseVersionBadge;
}

// -------------------------------------------------------------
// Protected & standard field catalog
// -------------------------------------------------------------
export const PROTECTED_FIELDS = [
  "Hotel Name",
  "Business Name",
  "Owner Name",
  "Owner NID",
  "Passport",
  "Trade License",
  "Business Registration Number",
  "TIN",
  "VAT",
  "Bank Account",
  "Bank Routing",
  "Ownership",
  "Country",
  "Hotel Type",
] as const;

export const STANDARD_FIELDS = [
  "Description",
  "Amenities",
  "Gallery",
  "Policies",
  "Check-in",
  "Check-out",
  "Cancellation Policy",
  "Room Price",
  "Room Inventory",
  "Phone",
  "Email",
  "Website",
] as const;

// -------------------------------------------------------------
// Seed data
// -------------------------------------------------------------
const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const IMG = (seed: string, w = 640, h = 400) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

export const CASES: CaseRecord[] = [
  {
    id: "CASE-2041",
    number: "CASE-2041",
    type: "publication",
    hotelId: 1,
    hotelName: "Sea Pearl Beach Resort",
    hotelCity: "Cox's Bazar",
    ownerName: "Abdul Rahman",
    submittedBy: "Maria Garcia",
    submittedByEmail: "maria.garcia@stayvista.com",
    createdAt: hoursAgo(2),
    lastUpdatedAt: hoursAgo(2),
    status: "pending",
    summary: "Hotel Admin submitted a publication request after completing verification.",
    fields: [
      { key: "pub_status", label: "Publication Status", current: "Draft", requested: "Published", state: "pending" },
      { key: "featured", label: "Featured Placement", current: "No", requested: "Yes (Homepage carousel)", state: "pending" },
    ],
    documents: [
      { id: "d1", name: "trade_license_2026.pdf", type: "pdf", size: "1.2 MB", uploadedAt: hoursAgo(3), thumb: IMG("1568605114967-8130f3a36994", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(2), actor: "Maria Garcia", kind: "submitted", message: "Publication request submitted" },
    ],
    notes: [],
    version: "Pending Review",
  },
  {
    id: "CASE-2040",
    number: "CASE-2040",
    type: "property",
    hotelId: 2,
    hotelName: "Pan Pacific Sonargaon",
    hotelCity: "Dhaka",
    ownerName: "Nusrat Jahan",
    submittedBy: "John Smith",
    submittedByEmail: "john.smith@stayvista.com",
    createdAt: hoursAgo(30),
    lastUpdatedAt: hoursAgo(4),
    status: "pending",
    summary: "Property draft: description, amenities, gallery and 2 room prices — updated twice since first submit.",
    fields: [
      { key: "star", label: "Star Rating", current: 4, requested: 5, kind: "number", state: "pending" },
      { key: "checkin", label: "Check-in Time", current: "14:00", requested: "15:00", state: "pending" },
      { key: "phone", label: "Reception Phone", current: "+880-2-9668855", requested: "+880-2-9668800", state: "pending" },
    ],
    descriptionDiff: {
      current: "Pan Pacific Sonargaon is a business hotel in the heart of Dhaka featuring conference rooms, a pool and a fitness center.",
      requested: "Pan Pacific Sonargaon is Dhaka's landmark 5-star business hotel featuring executive conference rooms, a rooftop infinity pool, a full-service spa and a 24-hour fitness center.",
      state: "pending",
    },
    amenities: {
      added: [
        { key: "a1", name: "Rooftop Pool", state: "pending" },
        { key: "a2", name: "Spa & Wellness", state: "pending" },
        { key: "a3", name: "Executive Lounge", state: "pending" },
      ],
      removed: [{ key: "r1", name: "Kids Play Area", state: "pending" }],
    },
    gallery: {
      added: [
        { key: "g1", src: IMG("1566073771259-6a8506099945"), state: "pending" },
        { key: "g2", src: IMG("1445019980597-93fa8acb246c"), state: "pending" },
      ],
      removed: [{ key: "g3", src: IMG("1520250497591-112f2f40a3f4"), state: "pending" }],
    },
    rooms: [
      { roomId: "r-201", name: "Executive Suite", currentPrice: 220, requestedPrice: 260, currentInventory: 8, requestedInventory: 8, state: "pending" },
      { roomId: "r-202", name: "Deluxe Twin", currentPrice: 140, requestedPrice: 155, currentInventory: 24, requestedInventory: 20, state: "pending" },
    ],
    documents: [],
    timeline: [
      { id: "t1", at: hoursAgo(30), actor: "John Smith", kind: "submitted", message: "Property draft submitted" },
      { id: "t2", at: hoursAgo(8), actor: "John Smith", kind: "updated", message: "Draft updated — description revised" },
      { id: "t3", at: hoursAgo(4), actor: "John Smith", kind: "updated", message: "Draft updated — amenities added" },
    ],
    notes: [
      { id: "n1", at: hoursAgo(3), author: "Priya Ahmed", body: "Gallery reorder looks reasonable — pool image performs better as hero." },
    ],
    version: "Pending Review",
  },
  {
    id: "CASE-2039",
    number: "CASE-2039",
    type: "legal",
    hotelId: 3,
    hotelName: "Sajek Cloud Resort",
    hotelCity: "Sajek Valley",
    ownerName: "Tariq Ahmed",
    submittedBy: "Sarah Lee",
    submittedByEmail: "sarah.lee@stayvista.com",
    createdAt: hoursAgo(28),
    lastUpdatedAt: hoursAgo(28),
    status: "pending",
    summary: "Trade license renewal — the uploaded PDF is expired. Awaiting the 2026 replacement.",
    fields: [
      { key: "tl", label: "Trade License #", current: "TL-8842-2024", requested: "TL-8842-2026", protected: true, state: "pending" },
      { key: "exp", label: "License Expiry", current: "2025-12-31", requested: "2026-12-31", state: "pending" },
    ],
    documents: [
      { id: "d1", name: "old_license.pdf", type: "pdf", size: "980 KB", uploadedAt: hoursAgo(29), thumb: IMG("1554224155-8d04cb21cd6c", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(28), actor: "Sarah Lee", kind: "submitted", message: "License update submitted" },
    ],
    notes: [],
    version: "Pending Review",
  },
  {
    id: "CASE-2038",
    number: "CASE-2038",
    type: "identity",
    hotelId: 4,
    hotelName: "Radisson Blu Chattogram",
    hotelCity: "Chattogram",
    ownerName: "Shamim Khan",
    submittedBy: "Afsana Noor",
    submittedByEmail: "afsana.noor@stayvista.com",
    createdAt: hoursAgo(50),
    lastUpdatedAt: hoursAgo(50),
    status: "pending",
    summary: "Hotel Admin identity update — NID change following legal name update.",
    fields: [
      { key: "legal", label: "Legal Name", current: "Afsana N.", requested: "Afsana Noor Chowdhury", state: "pending" },
      { key: "nid", label: "NID Number", current: "4234567890", requested: "4234567891", protected: true, state: "pending" },
    ],
    documents: [
      { id: "d1", name: "nid_front.jpg", type: "image", size: "540 KB", uploadedAt: hoursAgo(50), thumb: IMG("1554224155-8d04cb21cd6c", 200, 200) },
      { id: "d2", name: "nid_back.jpg", type: "image", size: "512 KB", uploadedAt: hoursAgo(50), thumb: IMG("1587614382346-4ec70e388b28", 200, 200) },
    ],
    timeline: [{ id: "t1", at: hoursAgo(50), actor: "Afsana Noor", kind: "submitted", message: "Identity update submitted" }],
    notes: [],
    version: "Pending Review",
  },
  {
    id: "CASE-2037",
    number: "CASE-2037",
    type: "bank",
    hotelId: 2,
    hotelName: "Pan Pacific Sonargaon",
    hotelCity: "Dhaka",
    ownerName: "Nusrat Jahan",
    submittedBy: "John Smith",
    submittedByEmail: "john.smith@stayvista.com",
    createdAt: hoursAgo(72),
    lastUpdatedAt: hoursAgo(72),
    status: "approved",
    summary: "Payout account change — new bank account and routing details.",
    fields: [
      { key: "bn", label: "Bank Name", current: "Dutch-Bangla Bank", requested: "BRAC Bank", protected: true, state: "approved" },
      { key: "acc", label: "Account #", current: "**** 3421", requested: "**** 9087", protected: true, state: "approved" },
    ],
    documents: [
      { id: "d1", name: "bank_letter.pdf", type: "pdf", size: "1.1 MB", uploadedAt: hoursAgo(72), thumb: IMG("1554224155-8d04cb21cd6c", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(72), actor: "John Smith", kind: "submitted", message: "Bank change submitted" },
      { id: "t2", at: hoursAgo(60), actor: "John Doe", kind: "approved", message: "All changes approved" },
    ],
    notes: [],
    version: "Published",
  },
  {
    id: "CASE-2036",
    number: "CASE-2036",
    type: "registration",
    hotelId: 5,
    hotelName: "Green Hills Lodge",
    hotelCity: "Sylhet",
    ownerName: "Rafiq Islam",
    submittedBy: "Rafiq Islam",
    submittedByEmail: "rafiq@greenhills.bd",
    createdAt: hoursAgo(96),
    lastUpdatedAt: hoursAgo(48),
    status: "pending",
    summary: "New hotel registration — 24 rooms, tea-estate boutique property in Sylhet.",
    fields: [
      { key: "hn", label: "Hotel Name", current: null, requested: "Green Hills Lodge", state: "pending" },
      { key: "city", label: "City", current: null, requested: "Sylhet", state: "pending" },
      { key: "rc", label: "Room Count", current: null, requested: 24, kind: "number", state: "pending" },
      { key: "type", label: "Hotel Type", current: null, requested: "Boutique", state: "pending" },
    ],
    documents: [
      { id: "d1", name: "trade_license.pdf", type: "pdf", size: "1.4 MB", uploadedAt: hoursAgo(96), thumb: IMG("1568605114967-8130f3a36994", 200, 200) },
      { id: "d2", name: "property_deed.pdf", type: "pdf", size: "2.1 MB", uploadedAt: hoursAgo(96), thumb: IMG("1487958449943-2429e8be8625", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(96), actor: "Rafiq Islam", kind: "submitted", message: "Registration submitted" },
    ],
    notes: [],
    version: "Draft",
  },
  {
    id: "CASE-2035",
    number: "CASE-2035",
    type: "property",
    hotelId: 7,
    hotelName: "Long Beach Suites",
    hotelCity: "Cox's Bazar",
    ownerName: "Rehana Begum",
    submittedBy: "Shafiq Rahman",
    submittedByEmail: "shafiq@longbeach.bd",
    createdAt: hoursAgo(120),
    lastUpdatedAt: hoursAgo(120),
    status: "rejected",
    summary: "Description update rejected — misleading claim about beachfront access.",
    fields: [
      { key: "cx", label: "Check-out Time", current: "11:00", requested: "12:00", state: "approved" },
    ],
    descriptionDiff: {
      current: "Comfortable suites 3 minutes from Long Beach.",
      requested: "Ocean-facing beachfront suites directly on Long Beach.",
      state: "rejected",
    },
    documents: [],
    timeline: [
      { id: "t1", at: hoursAgo(120), actor: "Shafiq Rahman", kind: "submitted", message: "Property draft submitted" },
      { id: "t2", at: hoursAgo(100), actor: "John Doe", kind: "rejected", message: "Rejected description — misleading" },
    ],
    notes: [],
    version: "Rejected",
  },
];

// -------------------------------------------------------------
// Hotels CRM view
// -------------------------------------------------------------
export interface HotelRow {
  id: number;
  name: string;
  city: string;
  verification: "verified" | "unverified" | "partial";
  hasPendingDraft: boolean;
  health: number;
  bookings30d: number;
  revenue30d: number;
  status: CaseVersionBadge;
  ownerName: string;
  ownerEmail: string;
  adminName: string;
  adminEmail: string;
  logo: string;
  hasGallery: boolean;
  hasDescription: boolean;
  expiredDocs: number;
  disabledRooms: number;
}

const baseHotel = (r: Omit<HotelRow, "health">): HotelRow => {
  let health = 100;
  if (!r.hasGallery) health -= 15;
  if (!r.hasDescription) health -= 15;
  if (r.hasPendingDraft) health -= 10;
  health -= Math.min(30, r.expiredDocs * 15);
  health -= Math.min(20, r.disabledRooms * 5);
  return { ...r, health: Math.max(0, health) };
};

export const HOTELS: HotelRow[] = [
  baseHotel({ id: 1, name: "Sea Pearl Beach Resort", city: "Cox's Bazar", verification: "verified", hasPendingDraft: true, bookings30d: 412, revenue30d: 184200, status: "Pending Review", ownerName: "Abdul Rahman", ownerEmail: "abdul@seapearl.bd", adminName: "Maria Garcia", adminEmail: "maria.garcia@stayvista.com", logo: "SP", hasGallery: true, hasDescription: true, expiredDocs: 0, disabledRooms: 0 }),
  baseHotel({ id: 2, name: "Pan Pacific Sonargaon", city: "Dhaka", verification: "verified", hasPendingDraft: true, bookings30d: 862, revenue30d: 412800, status: "Draft", ownerName: "Nusrat Jahan", ownerEmail: "nusrat@panpacific.bd", adminName: "John Smith", adminEmail: "john.smith@stayvista.com", logo: "PP", hasGallery: true, hasDescription: true, expiredDocs: 0, disabledRooms: 1 }),
  baseHotel({ id: 3, name: "Sajek Cloud Resort", city: "Sajek Valley", verification: "partial", hasPendingDraft: true, bookings30d: 148, revenue30d: 68400, status: "Pending Review", ownerName: "Tariq Ahmed", ownerEmail: "tariq@sajek.bd", adminName: "Sarah Lee", adminEmail: "sarah.lee@stayvista.com", logo: "SC", hasGallery: true, hasDescription: false, expiredDocs: 1, disabledRooms: 0 }),
  baseHotel({ id: 4, name: "Radisson Blu Chattogram", city: "Chattogram", verification: "verified", hasPendingDraft: true, bookings30d: 528, revenue30d: 244000, status: "Published", ownerName: "Shamim Khan", ownerEmail: "shamim@radissonctg.bd", adminName: "Afsana Noor", adminEmail: "afsana.noor@stayvista.com", logo: "RB", hasGallery: true, hasDescription: true, expiredDocs: 0, disabledRooms: 0 }),
  baseHotel({ id: 5, name: "Green Hills Lodge", city: "Sylhet", verification: "unverified", hasPendingDraft: true, bookings30d: 0, revenue30d: 0, status: "Draft", ownerName: "Rafiq Islam", ownerEmail: "rafiq@greenhills.bd", adminName: "—", adminEmail: "—", logo: "GH", hasGallery: false, hasDescription: false, expiredDocs: 0, disabledRooms: 0 }),
  baseHotel({ id: 6, name: "Hotel Agrabad", city: "Chattogram", verification: "verified", hasPendingDraft: false, bookings30d: 216, revenue30d: 96200, status: "Published", ownerName: "Kabir Uddin", ownerEmail: "kabir@agrabad.bd", adminName: "Mahmud Alam", adminEmail: "mahmud@agrabad.bd", logo: "HA", hasGallery: true, hasDescription: true, expiredDocs: 0, disabledRooms: 0 }),
  baseHotel({ id: 7, name: "Long Beach Suites", city: "Cox's Bazar", verification: "verified", hasPendingDraft: false, bookings30d: 284, revenue30d: 128700, status: "Published", ownerName: "Rehana Begum", ownerEmail: "rehana@longbeach.bd", adminName: "Shafiq Rahman", adminEmail: "shafiq@longbeach.bd", logo: "LB", hasGallery: true, hasDescription: true, expiredDocs: 0, disabledRooms: 0 }),
  baseHotel({ id: 8, name: "Amari Dhaka", city: "Dhaka", verification: "verified", hasPendingDraft: false, bookings30d: 704, revenue30d: 356900, status: "Published", ownerName: "Anwar Hossain", ownerEmail: "anwar@amaridhk.bd", adminName: "Tania Islam", adminEmail: "tania@amaridhk.bd", logo: "AM", hasGallery: true, hasDescription: true, expiredDocs: 0, disabledRooms: 0 }),
];

export const CASE_TYPE_LABEL: Record<CaseType, string> = {
  registration: "Registration",
  property: "Property",
  legal: "Legal",
  identity: "Identity",
  bank: "Bank",
  publication: "Publication",
  protected_field: "Protected Field",
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const findCase = (id: string) => CASES.find((c) => c.id === id) ?? null;
export const findHotel = (id: number) => HOTELS.find((h) => h.id === id) ?? null;
export const casesForHotel = (id: number) => CASES.filter((c) => c.hotelId === id);
export const pendingDraftForHotel = (id: number) =>
  CASES.find((c) => c.hotelId === id && c.status === "pending") ?? null;

export const formatWaiting = (createdAt: string) => {
  const elapsedH = (Date.now() - new Date(createdAt).getTime()) / 3600_000;
  const abs = Math.abs(elapsedH);
  const label = abs >= 24 ? `${Math.floor(abs / 24)}d ${Math.floor(abs % 24)}h` : `${Math.floor(abs)}h`;
  return { elapsed: elapsedH, label };
};

export const formatRelative = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Count modified fields (for banners like "8 modified fields")
export const countModifiedFields = (c: CaseRecord) => {
  let n = c.fields.length;
  if (c.descriptionDiff) n += 1;
  if (c.amenities) n += c.amenities.added.length + c.amenities.removed.length;
  if (c.gallery) n += c.gallery.added.length + c.gallery.removed.length;
  if (c.rooms) n += c.rooms.length;
  return n;
};
