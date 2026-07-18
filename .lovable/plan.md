
# Hotel Admin Panel — Enterprise Redesign (Refinement Pass)

Most of the architecture from the previous pass is in place (grouped sidebar, `hotelAdminStore`, primitives, all pages exist). This pass tightens the product experience to match the full spec: strict Live / Draft / Protected separation, richer Property sections, real Draft workflow, deeper Team & Documents, and completed Reservations / Rooms / Revenue / Reviews flows. Visual theme (dark, spacing, typography, green→emerald accent) is preserved.

## Data model updates (`src/data/hotelAdminStore.ts`)

Extend `liveProperty` to cover every spec section:

- General: name, type, starRating, category, size, floors, totalRooms, established, shortDescription
- Business (protected): businessName, tradeLicense, businessReg, tin, vat, officialEmail, officialPhone, officialWebsite, businessAddress
- Owner (protected): fullName, email, phone, nid, passport, address, emergencyContact
- Location: country (protected), division, city, area, address, postal, lat, lng
- Contacts: reservationPhone, receptionPhone, supportPhone, email, website, facebook, instagram
- Description: short, long, languages[]
- Amenities: grouped `{ group: string; items: string[] }[]`
- Gallery: `{ id, url, isCover, status: live|pending_add|pending_remove }[]`
- Policies: checkIn, checkOut, children, pet, smoking, cancellation, payment, extraBed
- Nearby attractions, SEO (title, description, keywords)
- Bank (protected): accountName, bankName, branch, routing, accountNumber

Add `verificationRequests[]` (separate from Draft) for protected-field changes with `status: pending|approved|rejected`, targetField, currentValue, requestedValue, reason, submittedAt, reviewedAt.

Add helpers: `isProtectedField(path)`, `openDraftField(path, label, current, pending)`, `submitVerificationRequest(...)`, `cooldownRemainingMs(draft)` (exists), `PROTECTED_PATHS` constant.

Keep single-draft rule: editing an already-modified field updates the existing entry, never duplicates.

## Layout & sidebar

Sidebar order per spec:
```
OPERATIONS: Overview, Reservations, Guests, Rooms
PROPERTY:   Property, Draft Center, Documents
BUSINESS:   Team, Revenue, Reviews
            Settings
```
Rename "Property Listing" → "Property". Draft badge stays (`Draft` / `Locked` / `Review` / `Action`).

## Page-level changes

**Overview** — Ensure 6 KPI cards, Today's Timeline / Upcoming Arrivals / Departures / Pending Cleanings, then Recent Bookings + Latest Reviews + Recent Notifications, right rail Quick Actions (Add Room, Create Room Type, Invite Sub Admin, Open Draft Center). No hotel dropdown.

**Property** — Replace single-page form with section cards for every spec section (General, Business, Owner, Location, Contacts, Description, Amenities, Gallery, Policies, Languages, Nearby Attractions, SEO, Bank). Each card shows Live values, plus a "Pending" diff strip when that section has draft fields, and an Edit button opening `EditDrawerShell`. Drawers write to Draft via `openDraftField`. For Protected sections (Business, Owner, Bank, Hotel Type, Country) fields render read-only with a "Request Update" button that opens a Verification Request drawer instead.

**Draft Center** — Add per-field admin feedback display, richer timeline (Created / Updated / Submitted / Reviewed / Approved / Rejected), Cooldown Remaining timer prominent, Verification Requests panel below (separate list). Submit disabled while cooldown active; toast explains why.

**Documents** — Card grid covering all 10 doc types with status pill, expiry, last verified, and actions (Preview, Download, Request Update). Request Update opens dialog that creates a verification request.

**Team** — Cards for Owner (uneditable), Primary Hotel Admin (uneditable in destructive ways), Sub Admins (create/edit/deactivate/reset/delete). Sub Admin drawer with permission checkboxes (Reservation, Room, Guest, Review, Revenue, Property, Documents, Settings). All destructive actions via `ConfirmDialog`.

**Rooms** — Ensure 4 tabs (Room Types / Rooms / Availability calendar / Pricing bulk editor). Room Types support Create/Edit/Duplicate/Archive. Availability = month calendar grid with booking + maintenance blocks. Pricing = base rate + weekend multiplier + seasonal ranges.

**Reservations & Booking Detail** — Chip filters (Today / Upcoming / Checked In / Checked Out / Cancelled / Pending Payment), search + date/room-type/payment filters. Row → detail. Detail includes Summary, Guest Info (link to guest profile), Room Details, Payment History, Invoices, Timeline, Special Requests, Cancellation. Sticky action bar with Check In / Check Out (immediate, no dialog), Cancel Booking (ConfirmDialog), Refund, Print Invoice.

**Guests** — CRM table + profile with Booking History, Payment History, Reviews, Preferences, Notes.

**Revenue** — KPI cards (Today, Weekly, Monthly, Occupancy, ADR, RevPAR) + recharts (revenue trend, occupancy trend, booking source pie) + recent transactions.

**Reviews** — Average / Total / Pending Replies / Latest KPIs, filter chips, reply dialog.

**Settings** — 4 tabs: Account (logo, display name, support email/phone), Security (password, 2FA toggle, sessions/devices), Notifications (booking/review/system toggles), Preferences (language, timezone, date format, currency).

## Cleanup

- Delete `HotelAdminHotelEdit.tsx` (superseded by `HotelAdminPropertyListing.tsx` renamed to Property).
- Keep `AddRoom`/`EditRoom`/`AddSubAdmin` as focused sub-routes.
- Route `/hotel-admin/listing` becomes `/hotel-admin/property` (with backwards-compat redirect).

## Technical notes

- All persistence via `hotelAdminStore` + localStorage; no backend calls.
- All destructive/critical actions use shared `ConfirmDialog`.
- Reuse tokens: `bg-card`, `border-border`, `text-gradient`, `glass-strong`, `hover-lift`, `animate-fade-in-up`, green→emerald gradient.
- Reuse primitives; add `ProtectedField`, `LiveVsDraftRow`, `VerificationRequestDrawer` in `primitives.tsx`.

## Out of scope

- Backend wiring (client-side dummy only).
- Theme/visual overhaul — only workflow and IA.
- System Admin panel changes.
