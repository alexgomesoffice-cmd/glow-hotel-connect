// Dummy Cases dataset powering the Work Queue + Case Review Workspace.
// All data is client-side only — no backend involved.

export type CasePriority = "P1" | "P2" | "P3";
export type CaseStatus = "open" | "in_review" | "waiting_info" | "approved" | "rejected";
export type CaseType =
  | "registration"
  | "property"
  | "legal"
  | "identity"
  | "bank"
  | "publication";

export type CaseVersionBadge =
  | "Published"
  | "Draft"
  | "Pending Review"
  | "Rejected"
  | "Archived";

export interface DiffField {
  label: string;
  current: string | number | null;
  requested: string | number | null;
  kind?: "text" | "longtext" | "number" | "url";
}

export interface AmenityDiff {
  added: string[];
  removed: string[];
}

export interface GalleryDiff {
  added: string[];
  removed: string[];
  reordered: { before: string[]; after: string[] } | null;
}

export interface RoomPriceDiff {
  roomId: string;
  name: string;
  currentPrice: number;
  requestedPrice: number;
  currentInventory: number;
  requestedInventory: number;
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
  kind: "submitted" | "assigned" | "comment" | "status" | "approved" | "rejected" | "info_requested";
  message: string;
}

export interface CaseInternalNote {
  id: string;
  at: string;
  author: string;
  body: string;
}

export interface CaseRecord {
  id: string;              // e.g. CASE-2041
  number: string;          // human display
  type: CaseType;
  hotelId: number;
  hotelName: string;
  hotelCity: string;
  ownerName: string;
  submittedBy: string;
  submittedByEmail: string;
  createdAt: string;       // ISO
  priority: CasePriority;
  status: CaseStatus;
  assignee: string | null;
  slaHours: number;        // hours until SLA breach from createdAt
  summary: string;
  fields: DiffField[];
  amenities?: AmenityDiff;
  gallery?: GalleryDiff;
  rooms?: RoomPriceDiff[];
  descriptionDiff?: { current: string; requested: string };
  documents: CaseDocument[];
  timeline: CaseTimelineEvent[];
  notes: CaseInternalNote[];
  version: CaseVersionBadge;
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

const IMG = (seed: string, w = 640, h = 400) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

// -------------------------------------------------------------
// Seed cases
// -------------------------------------------------------------
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
    priority: "P1",
    status: "open",
    assignee: null,
    slaHours: 8,
    summary:
      "Hotel Admin submitted a publication request after completing property, legal and bank verification.",
    fields: [
      { label: "Publication Status", current: "Draft", requested: "Published" },
      { label: "Featured Placement", current: "No", requested: "Yes (Homepage carousel)" },
      { label: "Commission Rate", current: "12%", requested: "10%" },
    ],
    documents: [
      { id: "d1", name: "trade_license_2026.pdf", type: "pdf", size: "1.2 MB", uploadedAt: hoursAgo(3), thumb: IMG("1568605114967-8130f3a36994", 200, 200) },
      { id: "d2", name: "fire_safety_cert.pdf", type: "pdf", size: "820 KB", uploadedAt: hoursAgo(3), thumb: IMG("1487958449943-2429e8be8625", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(2), actor: "Maria Garcia", kind: "submitted", message: "Publication request submitted" },
      { id: "t2", at: hoursAgo(1.5), actor: "System", kind: "status", message: "Case entered Work Queue at P1" },
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
    createdAt: hoursAgo(6),
    priority: "P2",
    status: "in_review",
    assignee: "Priya Ahmed",
    slaHours: 24,
    summary: "Property draft update covering description, amenities, gallery reorder and 2 room prices.",
    fields: [
      { label: "Star Rating", current: 4, requested: 5, kind: "number" },
      { label: "Check-in Time", current: "14:00", requested: "15:00" },
    ],
    descriptionDiff: {
      current:
        "Pan Pacific Sonargaon is a business hotel in the heart of Dhaka featuring conference rooms, a pool and a fitness center.",
      requested:
        "Pan Pacific Sonargaon is Dhaka's landmark 5-star business hotel featuring executive conference rooms, a rooftop pool, a full-service spa and a 24-hour fitness center.",
    },
    amenities: {
      added: ["Rooftop Pool", "Spa & Wellness", "Executive Lounge"],
      removed: ["Kids Play Area"],
    },
    gallery: {
      added: [IMG("1566073771259-6a8506099945"), IMG("1445019980597-93fa8acb246c")],
      removed: [IMG("1520250497591-112f2f40a3f4")],
      reordered: {
        before: ["hero-old.jpg", "lobby.jpg", "pool.jpg", "room.jpg"],
        after: ["pool.jpg", "hero-old.jpg", "room.jpg", "lobby.jpg"],
      },
    },
    rooms: [
      { roomId: "r-201", name: "Executive Suite", currentPrice: 220, requestedPrice: 260, currentInventory: 8, requestedInventory: 8 },
      { roomId: "r-202", name: "Deluxe Twin", currentPrice: 140, requestedPrice: 155, currentInventory: 24, requestedInventory: 20 },
    ],
    documents: [],
    timeline: [
      { id: "t1", at: hoursAgo(6), actor: "John Smith", kind: "submitted", message: "Property draft submitted" },
      { id: "t2", at: hoursAgo(5), actor: "System", kind: "assigned", message: "Auto-assigned to Priya Ahmed" },
      { id: "t3", at: hoursAgo(3), actor: "Priya Ahmed", kind: "comment", message: "Reviewing gallery changes." },
    ],
    notes: [
      { id: "n1", at: hoursAgo(3), author: "Priya Ahmed", body: "Gallery reorder looks reasonable — pool image performs better as hero." },
    ],
    version: "Draft",
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
    priority: "P1",
    status: "waiting_info",
    assignee: "John Doe",
    slaHours: 24,
    summary: "Trade license renewal — the uploaded PDF is expired. Awaiting the 2026 replacement.",
    fields: [
      { label: "Trade License #", current: "TL-8842-2024", requested: "TL-8842-2026" },
      { label: "License Expiry", current: "2025-12-31", requested: "2026-12-31" },
    ],
    documents: [
      { id: "d1", name: "old_license.pdf", type: "pdf", size: "980 KB", uploadedAt: hoursAgo(29), thumb: IMG("1554224155-8d04cb21cd6c", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(28), actor: "Sarah Lee", kind: "submitted", message: "License update submitted" },
      { id: "t2", at: hoursAgo(25), actor: "John Doe", kind: "info_requested", message: "Requested 2026 trade license copy" },
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
    priority: "P3",
    status: "in_review",
    assignee: "Priya Ahmed",
    slaHours: 72,
    summary: "Hotel Admin identity update — NID change following legal name update.",
    fields: [
      { label: "Legal Name", current: "Afsana N.", requested: "Afsana Noor Chowdhury" },
      { label: "NID Number", current: "4234567890", requested: "4234567891" },
    ],
    documents: [
      { id: "d1", name: "nid_front.jpg", type: "image", size: "540 KB", uploadedAt: hoursAgo(50), thumb: IMG("1554224155-8d04cb21cd6c", 200, 200) },
      { id: "d2", name: "nid_back.jpg", type: "image", size: "512 KB", uploadedAt: hoursAgo(50), thumb: IMG("1587614382346-4ec70e388b28", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(50), actor: "Afsana Noor", kind: "submitted", message: "Identity update submitted" },
    ],
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
    priority: "P2",
    status: "open",
    assignee: null,
    slaHours: 48,
    summary: "Payout account change — new bank account and routing details.",
    fields: [
      { label: "Bank Name", current: "Dutch-Bangla Bank", requested: "BRAC Bank" },
      { label: "Account #", current: "**** 3421", requested: "**** 9087" },
      { label: "Routing #", current: "090270425", requested: "060151234" },
    ],
    documents: [
      { id: "d1", name: "bank_letter.pdf", type: "pdf", size: "1.1 MB", uploadedAt: hoursAgo(72), thumb: IMG("1554224155-8d04cb21cd6c", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(72), actor: "John Smith", kind: "submitted", message: "Bank change submitted" },
    ],
    notes: [],
    version: "Pending Review",
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
    priority: "P2",
    status: "in_review",
    assignee: "John Doe",
    slaHours: 72,
    summary: "New hotel registration — 24 rooms, tea-estate boutique property in Sylhet.",
    fields: [
      { label: "Hotel Name", current: null, requested: "Green Hills Lodge" },
      { label: "City", current: null, requested: "Sylhet" },
      { label: "Room Count", current: null, requested: 24, kind: "number" },
      { label: "Type", current: null, requested: "Boutique" },
    ],
    documents: [
      { id: "d1", name: "trade_license.pdf", type: "pdf", size: "1.4 MB", uploadedAt: hoursAgo(96), thumb: IMG("1568605114967-8130f3a36994", 200, 200) },
      { id: "d2", name: "property_deed.pdf", type: "pdf", size: "2.1 MB", uploadedAt: hoursAgo(96), thumb: IMG("1487958449943-2429e8be8625", 200, 200) },
      { id: "d3", name: "owner_nid.jpg", type: "image", size: "480 KB", uploadedAt: hoursAgo(96), thumb: IMG("1554224155-8d04cb21cd6c", 200, 200) },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(96), actor: "Rafiq Islam", kind: "submitted", message: "Registration submitted" },
      { id: "t2", at: hoursAgo(90), actor: "System", kind: "assigned", message: "Assigned to John Doe" },
    ],
    notes: [],
    version: "Draft",
  },
];

// -------------------------------------------------------------
// Hotels (CRM view) — dummy operational data
// -------------------------------------------------------------
export interface HotelRow {
  id: number;
  name: string;
  city: string;
  verification: "verified" | "unverified" | "partial";
  pendingCases: number;
  health: number; // 0-100
  revenue30d: number;
  subscription: "trial" | "growth" | "scale" | "enterprise";
  status: CaseVersionBadge;
  ownerName: string;
  ownerEmail: string;
  adminName: string;
  adminEmail: string;
  logo: string;
}

export const HOTELS: HotelRow[] = [
  { id: 1, name: "Sea Pearl Beach Resort", city: "Cox's Bazar", verification: "verified", pendingCases: 1, health: 92, revenue30d: 184200, subscription: "scale", status: "Pending Review", ownerName: "Abdul Rahman", ownerEmail: "abdul@seapearl.bd", adminName: "Maria Garcia", adminEmail: "maria.garcia@stayvista.com", logo: "SP" },
  { id: 2, name: "Pan Pacific Sonargaon", city: "Dhaka", verification: "verified", pendingCases: 2, health: 88, revenue30d: 412800, subscription: "enterprise", status: "Draft", ownerName: "Nusrat Jahan", ownerEmail: "nusrat@panpacific.bd", adminName: "John Smith", adminEmail: "john.smith@stayvista.com", logo: "PP" },
  { id: 3, name: "Sajek Cloud Resort", city: "Sajek Valley", verification: "partial", pendingCases: 1, health: 71, revenue30d: 68400, subscription: "growth", status: "Pending Review", ownerName: "Tariq Ahmed", ownerEmail: "tariq@sajek.bd", adminName: "Sarah Lee", adminEmail: "sarah.lee@stayvista.com", logo: "SC" },
  { id: 4, name: "Radisson Blu Chattogram", city: "Chattogram", verification: "verified", pendingCases: 1, health: 85, revenue30d: 244000, subscription: "scale", status: "Published", ownerName: "Shamim Khan", ownerEmail: "shamim@radissonctg.bd", adminName: "Afsana Noor", adminEmail: "afsana.noor@stayvista.com", logo: "RB" },
  { id: 5, name: "Green Hills Lodge", city: "Sylhet", verification: "unverified", pendingCases: 1, health: 42, revenue30d: 0, subscription: "trial", status: "Draft", ownerName: "Rafiq Islam", ownerEmail: "rafiq@greenhills.bd", adminName: "—", adminEmail: "—", logo: "GH" },
  { id: 6, name: "Hotel Agrabad", city: "Chattogram", verification: "verified", pendingCases: 0, health: 78, revenue30d: 96200, subscription: "growth", status: "Published", ownerName: "Kabir Uddin", ownerEmail: "kabir@agrabad.bd", adminName: "Mahmud Alam", adminEmail: "mahmud@agrabad.bd", logo: "HA" },
  { id: 7, name: "Long Beach Suites", city: "Cox's Bazar", verification: "verified", pendingCases: 0, health: 82, revenue30d: 128700, subscription: "growth", status: "Published", ownerName: "Rehana Begum", ownerEmail: "rehana@longbeach.bd", adminName: "Shafiq Rahman", adminEmail: "shafiq@longbeach.bd", logo: "LB" },
  { id: 8, name: "Amari Dhaka", city: "Dhaka", verification: "verified", pendingCases: 0, health: 90, revenue30d: 356900, subscription: "enterprise", status: "Published", ownerName: "Anwar Hossain", ownerEmail: "anwar@amaridhk.bd", adminName: "Tania Islam", adminEmail: "tania@amaridhk.bd", logo: "AM" },
];

export const CASE_TYPE_LABEL: Record<CaseType, string> = {
  registration: "Registration",
  property: "Property",
  legal: "Legal",
  identity: "Identity",
  bank: "Bank",
  publication: "Publication",
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  open: "Open",
  in_review: "In Review",
  waiting_info: "Waiting Info",
  approved: "Approved",
  rejected: "Rejected",
};

export const findCase = (id: string) => CASES.find((c) => c.id === id) ?? null;
export const findHotel = (id: number) => HOTELS.find((h) => h.id === id) ?? null;
export const casesForHotel = (id: number) => CASES.filter((c) => c.hotelId === id);

export const formatWaiting = (createdAt: string, slaHours: number) => {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 3600_000;
  const remaining = slaHours - elapsed;
  const abs = Math.abs(remaining);
  const label = abs >= 24 ? `${Math.floor(abs / 24)}d ${Math.floor(abs % 24)}h` : `${Math.floor(abs)}h`;
  return { elapsed, remaining, breached: remaining < 0, label };
};

export const formatRelative = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
