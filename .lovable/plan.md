
# Hotel Admin Panel — Product Redesign

Redesign the Hotel Admin as a professional PMS + CMS. Keep the existing theme (colors, typography, spacing, glass/hover-lift, green accent gradient). Restructure sidebar, page architecture and workflows so a hotel admin feels like they are running a business — not editing a website.

## Sidebar (new IA)

```
OPERATIONS
  Overview
  Reservations
  Guests
  Rooms

LISTING
  Property Listing
  Draft Center
  Documents

BUSINESS
  Team
  Revenue
  Reviews

Settings
```

Grouped `SidebarGroup`s with labels, active-route highlighting, existing green gradient logo. Collapsible to icon rail. Header keeps notifications + admin profile.

## Data model (client-side, dummy)

Add `src/data/hotelAdminStore.ts` with typed dummy data + localStorage helpers:

- `liveProperty` — the published listing
- `pendingDraft | null` — single draft with `status: draft | submitted | approved | rejected`, `modifiedFields[]`, `submittedAt`, `cooldownUntil`, per-field review state
- `documents[]` — status + expiry + last verified
- `reservations[]`, `guests[]`, `roomTypes[]`, `rooms[]` (with cleaning + maintenance status), `staff[]`, `reviews[]`, `transactions[]`, `notifications[]`, `activity[]`

All pages read/write here. Business Information + Documents are marked "protected" and use `updateRequests[]` instead of direct edits.

## Pages

**Overview** — 6 KPI cards (Check-ins, Check-outs, Occupied, Available, Revenue Today, Draft Status). Today's Timeline (arrivals/departures/cleaning). Upcoming Arrivals + Departures. Latest Reservations / Reviews / Draft Activity / Notifications. Right rail Quick Actions.

**Reservations** — Table (Booking ID, Guest, Rooms, Check In/Out, Guests, Source, Payment, Status, Amount, Created). Chip filters (Today / Upcoming / Checked In / Checked Out / Cancelled / Pending Payment) + date/room-type/payment filters + search. Row click → Booking Details.

**Booking Details** — Sections: Summary, Guest Info, Booked Rooms, Charges (rooms/extras/discounts/tax), Payment Timeline, Booking Timeline, Special Requests, Cancellation, Invoices, System Logs. Sticky action bar: Check In, Check Out, Cancel (ConfirmDialog), Refund, Print Invoice.

**Guests** — CRM table (Guest, Phone, Email, Nationality, Bookings, Nights, Spent, Last Stay, Avg Rating). Row → Guest Profile (personal, booking history, current booking, reviews, invoices, payments, preferences, VIP, notes).

**Rooms** — Tabs: Room Types (cards w/ price/occupancy/counts/amenities + Edit/Duplicate/Archive), Rooms (table w/ number, type, status, cleaning, current guest, next booking, maintenance), Availability (month calendar grid with booking + maintenance blocks), Pricing (bulk editor, weekend/seasonal/discounts).

**Property Listing** (replaces "Manage Hotel") — Top header: Published vs Pending Draft state, modified-fields count, submitted date, last-updated, cooldown timer. Section cards: General, Business, Location, Contacts, Description, Amenities, Gallery, Policies, Languages, Nearby Attractions, SEO. Each has View + Edit drawer that writes to Draft (never Live). Business section shows fields read-only with "Request Business Update" button. If draft exists and cooldown active, edits are locked with clear messaging.

**Draft Center** — Status cards (Status, Modified Fields, Submitted, Last Updated, Cooldown Remaining, Review Status). Modified Fields table (Field / Current / Pending / Status / Feedback). Timeline (Created → Updated → Submitted → Reviewed → Approved/Rejected). Submit / Discard actions.

**Documents** — Card grid per document (Trade License, Business Registration, TIN, VAT, Owner NID, Passport, Bank Verification, Fire Safety, Food License, Hotel Classification). Status badge, expiry, last verified, View / Download / Request Update. No direct edits.

**Team** — Cards for Owner / Hotel Admin / Sub Admins. Click → Staff Details (profile, role, permissions drawer, sessions, recent activity, Reset Password / Deactivate / Remove with ConfirmDialog).

**Revenue** — KPI cards (Today / Week / Month / Occupancy / ADR / RevPAR). Charts (recharts): daily revenue, monthly revenue, occupancy trend, booking-source pie. Recent transactions table.

**Reviews** — KPI cards (Avg Rating, Total, Unanswered, Latest). Table (Guest, Booking, Rating, Comment, Date, Reply Status, Reply action). Rating + status filters.

**Settings** — Tabs: Hotel Account (logo, display name, timezone, currency, contact/support email), Security (password, 2FA, sessions, login history), Notifications (booking/review/system/SMS/push toggles), Preferences (language, date format, time format, currency display).

## Routing

Replace hotel-admin routes in `src/App.tsx`:

```
/hotel-admin
  index          → Overview
  reservations   → Reservations
  reservations/:id
  guests
  guests/:id
  rooms          (Types|Rooms|Availability|Pricing tabs)
  rooms/add
  rooms/edit/:id
  listing        → Property Listing
  drafts         → Draft Center
  documents
  team
  team/:id
  team/invite
  revenue
  reviews
  settings
```

Keep legacy `add-sub-admin` and `add-room` redirects.

## Visual rules

- Reuse existing tokens: `bg-card`, `border-border`, `text-gradient`, `glass-strong`, `hover-lift`, `animate-fade-in-up`, green→emerald gradient for hotel-admin accents.
- New primitives in `src/components/hotel-admin/primitives.tsx`: `KPI`, `SectionCard`, `StatusPill`, `Timeline`, `EmptyState`, `EditDrawerShell`, `DraftBanner`.
- Use existing shadcn `Sidebar`, `Table`, `Tabs`, `Sheet` (drawer), `Dialog`, `AlertDialog` (ConfirmDialog), `Badge`.

## Technical notes

- Client-side only; no backend edits. All CRUD hits the new store + localStorage.
- Update `HotelAdminLayout` to a proper shadcn `Sidebar` shell with grouped nav.
- Delete/replace `HotelAdminHotelEdit` with new Property Listing + Draft Center.
- Extend `ConfirmDialog` usage for all destructive actions (Cancel Booking, Remove Staff, Discard Draft, Archive Room Type, Delete Gallery Image).
- Charts via existing `recharts` dep.

## Out of scope

- Backend/API wiring (dummy data only).
- Visual theme changes.
- System admin panel changes.
