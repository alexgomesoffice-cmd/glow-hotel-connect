# System Admin CMS — Workflow Redesign

Keep the current visual language (Ops shell, tokens, spacing, primitives). All changes are workflow, data-model, and page-content.

---

## 1. Data model changes (`src/data/adminCases.ts` + new `adminDrafts.ts`)

Replace the current "many independent cases" model with a **one-draft-per-hotel** model.

- Remove: `priority`, `assignee`, `slaHours` (keep `createdAt` for waiting only), reviewer.
- `Case` becomes a **Draft** with:
  - `id`, `number`, `hotelId`, `hotelName`, `hotelCity`
  - `submittedBy`, `submittedByEmail`
  - `createdAt`, `lastUpdatedAt`
  - `status`: `pending | approved | rejected`
  - `changeType`: `property_update | registration | legal | identity | bank | publication | protected_field`
  - `fields[]` — each with `state: pending | rejected | approved`, `label`, `current`, `requested`
  - `descriptionDiff`, `amenities`, `gallery`, `rooms` — each item independently rejectable
  - `timeline[]`, `notes[]`, `documents[]`
- Add `PROTECTED_FIELDS` constant (Hotel Name, Business Name, Owner Name/NID/Passport, Trade License, BRN, TIN, VAT, Bank Account/Routing, Ownership, Country, Hotel Type).
- Add `STANDARD_FIELDS` list for reference.
- Seed 8–12 drafts across pending/approved/rejected.

Also add `src/data/adminActivityLog.ts` (activity entries) and `src/data/adminBookings.ts` (platform-wide bookings) with dummy data.

---

## 2. Work Queue (`OpsWorkQueue.tsx`)

Rebuild the tabs and columns.

- **Tabs (status only):** Pending · Approved · Rejected · All.
- **Filter bar:** Search, Change Type (dropdown), Hotel, City, Date range, Waiting time, Sort.
- **Remove:** priority dot, assignee column/filter, urgent tab, "More" button.
- **Table columns:** Case ID · Hotel · Change Type · Submitted By · Submitted · Waiting · Status · Actions (view).
- Sort default: FIFO (oldest pending first).

---

## 3. Case Review (`OpsCaseReview.tsx`)

Keep layout, remove sidebars we don't support.

- **Remove from right rail:** Assignment card, Priority selector, Reviewer, Status selector.
- **Keep:** Case Summary, Requested Changes diffs, Documents, Timeline, Internal Notes, Case History.
- **Header strip:** remove PriorityDot; keep waiting + status + version.

**Field-level review (biggest change):**

- Each pending field row shows **only a single "Reject this field" (X) button** — no per-field approve.
- Rejected fields become greyed out with a "Rejected — will not be published" badge; can be un-rejected before submit.
- Same pattern for description, amenity add/remove items, gallery adds/removes, and room/price rows — each item independently rejectable.
- Field state tracked locally: `pending | rejected` while reviewing.

**Bottom sticky action bar (replaces sidebar actions):**

- `Approve Remaining Changes` — publishes all still-pending fields, keeps rejected ones on Live.
- `Reject Entire Request` — rejects the whole draft.
- Confirm via existing `ConfirmDialog`.

Update `RequestedChangesDiff.tsx` primitives to accept an `onReject(fieldKey)` and render the rejected/greyed state.

---

## 4. Draft + 24h cooldown model (client-side simulation)

In `adminDrafts.ts`:

- Helper `getPendingDraftForHotel(hotelId)` — returns the single pending draft or null.
- Helper `mergeIntoDraft(hotelId, patch)` — replaces per-field latest values (description overwrites description; amenities merge; gallery merges; rooms upsert). Never creates a second draft.
- Track `lastSubmittedAt` per hotel; `canSubmitPropertyUpdate(hotelId)` returns false within 24h.
- Protected-field edits create a separate `protected_field` change type entry.

This is dummy/local logic — no backend. Just the shape so UI reflects the workflow.

---

## 5. Hotel Workspace (`OpsHotelWorkspace.tsx`)

Fill out with real dummy data from `dummyHotels.ts`.

**Overview tab cards:** Hotel Status, Verification Status, Pending Draft (link to case), Owner, Hotel Admin, Today's Bookings, Revenue Today, Health Score, Latest Activity, Documents Expiring, Quick Actions.

**Property tab sections** (General, Business, Location, Contacts, Amenities, Policies, Gallery) — each rendered from live hotel data with an **Edit** button opening a shadcn `Sheet` (Drawer) that saves directly (no approval).

**Draft banner** at top of Property tab when a pending draft exists: "Pending Draft · Modified Fields: N · Submitted {rel} · Last Updated {rel}. Hotel editing locked until review completes." with "Review Draft" link.

**Bookings tab:** hotel-scoped bookings table (Booking ID · Guest · Rooms · Check In · Check Out · Payment · Status · Amount), rows link to Booking Details.

Keep Staff / Commercial / Activity tabs but populated with real data slices.

---

## 6. Bookings page (`AdminBookings.tsx` / new `OpsBookings.tsx`)

Completely redesign.

- **Top cards:** Today's Bookings · Today's Revenue · Check-ins Today · Check-outs Today · Pending Payments · Cancelled Today.
- **Recent Bookings table:** Booking ID · Guest · Hotel · Room · Check In · Check Out · Guests · Payment · Booking Status · Amount · Created.
- **Filters:** Hotel, Booking Status, Payment Status, Date, City, Search.
- Row click → Booking Details page (reuse existing `AdminBookingDetail` shape, populate sections: Summary, Guest Info, Booked Rooms, Payment Timeline, Booking Timeline, Special Requests, Invoices, Refunds, Cancellation Logs, System Logs).

Clicking a hotel from the previous hotel-list flow opens Hotel Workspace → Bookings tab (already covered).

---

## 7. Hotels CRM (`OpsHotels.tsx`)

Rework columns: Hotel · City · Owner · Hotel Admin · Pending Draft (badge if exists) · Health Score · Bookings · Revenue · Status.

Health score util (0–100) subtracting for: missing gallery, missing description, pending draft, expired documents, disabled rooms.

---

## 8. Platform Settings (`OpsPlatformSettings.tsx`)

Trim to supported sections only:

- **General:** Platform Name, Support Email, Support Phone, Default Currency, Timezone.
- **Hotel Registration:** Allow Hotel Registration, Require Manual Approval, Maximum Pending Drafts (1, disabled), Draft Cooldown (24h).
- **Authentication:** Session Timeout, Password Policy, Max Login Attempts.
- **Booking Rules:** Reservation Hold Duration, Max Active Reservations, Auto Cancel Timeout.
- **Email:** Sender Name, Sender Email.

Remove: Commission, Advertisements, Feature Flags, Branding editor, anything else.

---

## 9. New Activity Log page

- Route: `/admin/activity` (add to sidebar in `OpsShell.tsx`).
- File: `src/pages/admin/ops/OpsActivityLog.tsx`.
- Read-only dense table: Timestamp · System Admin · Action · Target · Description.
- Filters: Admin, Action type, Date, Search.

---

## 10. Routing & shell

- `src/App.tsx`: add `/admin/activity`, `/admin/bookings/:id` (booking details), ensure hotel row → workspace, workspace booking row → details.
- `OpsShell.tsx` sidebar: add "Activity Log" entry; nothing else changes.

---

## Technical notes

- No backend; everything is dummy data plus local helpers.
- Reuse `ConfirmDialog` for approve-remaining / reject-entire / edit-save-live actions.
- Reuse existing `OpsCard`, `OpsTable`, `StatusBadge`, `WaitingCell`, `Kbd`, `DiffSection`, `FieldDiffRow` — extend them, don't restyle.
- Keep aesthetics (tokens, radii, density) identical.

## Files touched

Created:

- `src/data/adminDrafts.ts`, `src/data/adminActivityLog.ts`, `src/data/adminBookings.ts`
- `src/pages/admin/ops/OpsActivityLog.tsx`
- `src/pages/admin/ops/OpsBookings.tsx` (or repurpose existing)

Modified:

- `src/data/adminCases.ts` (strip priority/assignee/SLA; add field states)
- `src/components/admin/ops/RequestedChangesDiff.tsx` (reject-only per-field UI)
- `src/components/admin/ops/OpsShell.tsx` (sidebar entry)
- `src/pages/admin/ops/OpsWorkQueue.tsx` (tabs, filters, columns)
- `src/pages/admin/ops/OpsCaseReview.tsx` (remove assignment/priority, bottom action bar)
- `src/pages/admin/ops/OpsHotelWorkspace.tsx` (populate tabs, drawers, draft banner)
- `src/pages/admin/ops/OpsHotels.tsx` (CRM columns, health score)
- `src/pages/admin/ops/OpsPlatformSettings.tsx` (trim)

`src/App.tsx` (routes)

In navbar also add "add hotel" in that +new dorpdown,  and clicking on it will go to hotel creation page that will contain form:  
  
**Basic information:**  
Hotel name, hotel type, city, full address, zip code, official gmail, Reciption no 1, Reciption no 2, website  
  
**owner's information:**  
full name, date of birth, nid no, passport, email, phone, address, photo upload,  
(another uploadable button for owner's information document)  
  
**Hotel admin account:**  
hotel admin name, email, phone, emergency phone,password, confirm password, date of birth, Nid no, passport, address, photo upload button  
 (another uploadable button for hotel admin information document)  
  
**Hotel (business information):**  
trade license no, issue date, expiry date, issue by, tin number, vat reg, tax certificate upload, and another uploadable button for document upload.  
  
**emergency contact:**  
name, relation, phone 1, phone 2, email.