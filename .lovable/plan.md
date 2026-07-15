# System Admin CMS — Enterprise Redesign

Rebuild `/admin/*` from a CRUD dashboard into a **trust & operations platform**. System Admins review, approve, and monitor — they never edit hotels. The heart is a **Work Queue** of Cases (like Gmail/Linear) and a **Case Review Workspace** with GitHub-PR-style diffs.

All existing frontend logic stays behind `localStorage` / dummy data — no backend contract changes. Hotel Admin dashboard is untouched.

---

## Design language

- Dense tables, thin dividers, `text-sm`/`text-xs`, generous horizontal padding, tight vertical rhythm.
- Neutral zinc/slate palette; single accent for primary actions; semantic colors only for status (amber/red/emerald/blue).
- No gradients, no shadow-lg cards, no oversized rounded corners (`rounded-md` max on interactive, `rounded-none` on table shells).
- Monospaced (`font-mono`) for IDs, case numbers, timestamps, diffs.
- Sticky headers everywhere; drawers (shadcn `Sheet`) for edits instead of new routes.
- Keyboard: `⌘K` command palette, `j/k` row nav in tables, `e` to open case, `a` approve, `r` reject.

---

## New shell (replaces `AdminLayout.tsx`)

```text
┌─ Sidebar (240px, collapsible→56px) ─┬─ TopBar (48px, sticky) ────────────┐
│ StayVista · Ops                      │ Breadcrumbs   ⌘K search  + New  🔔 │
│                                      ├────────────────────────────────────┤
│ Dashboard                            │                                    │
│ Work Queue           ● 12            │        Content region              │
│ Hotels                               │        (max-w-none, px-6)          │
│ Bookings                             │                                    │
│ Users                                │                                    │
│ ─── CATALOG ───                      │                                    │
│ Cities · Hotel Types ·               │                                    │
│ Amenities · Bed Types                │                                    │
│ ─── PLATFORM ───                     │                                    │
│ System Admins                        │                                    │
│ Platform Settings                    │                                    │
└──────────────────────────────────────┴────────────────────────────────────┘
```

Sidebar items: Dashboard, **Work Queue** (with pending count badge), Hotels, Bookings, Users, group `CATALOG` (Cities, Hotel Types, Amenities, Bed Types), group `PLATFORM` (System Admins, Platform Settings). Everything else removed from nav.

TopBar: breadcrumbs (left), `⌘K` command palette input (center, shadcn `Command`), Quick Create menu, notifications popover, admin avatar menu.

---

## Pages

### 1. Dashboard — work-first, not analytics
Grid of operational tiles, no vanity charts:
- **Today's Tasks** — assigned to me, count + list of top 5 cases.
- **Pending Reviews** by bucket: Hotels Waiting Approval, Pending Documents, Expired Licenses (numbers + "Open queue →").
- **Revenue Today / Bookings Today** — single-line KPIs, sparkline only.
- **Latest Activities** — 10-row activity feed.
- **Recent Hotels** — last 5 onboarded.
- **Quick Actions** — Create System Admin, Add City, Broadcast Notice.

### 2. Work Queue — the heart
Gmail-style inbox of **Cases**. Tabs across top: `All · Registrations · Property · Legal · Identity · Bank · Publication · Urgent`. Secondary filter bar: Status, Priority, Assignee, Search.

Table columns (no cards, full-width, zebra off, hoverable rows):
`Priority · Case # · Type · Hotel · Submitted By · Created · Waiting · Assignee · Status · ⋯`

- Priority = colored dot + label (P1/P2/P3).
- Waiting = live-computed duration, red past SLA.
- Row click → Case Review Workspace (drawer on md, full route `/admin/cases/:id` on desktop).
- Bulk select → assign / change priority.

### 3. Case Review Workspace `/admin/cases/:id`
Two-column, sticky action panel on the right (360px):

**Header strip**: Case # · Type badge · Hotel · Owner · Submitted By · Priority · Waiting · Status · Reviewer.

**Left (scrolls)**:
- **Case Summary** — one paragraph auto-generated from case type.
- **Requested Changes** — the PR-diff view (see below).
- **Supporting Documents** — thumbnail list, click opens lightbox.
- **Timeline** — GitHub-style events (submitted, assigned, comment, approved).
- **Internal Notes / Comments** — threaded, admin-only.

**Right sticky panel**: primary `Approve` / `Reject` / `Request More Info`, plus Assign, Priority, Status, Reviewer selects, and a compact case history.

**Requested Changes diff component** (new, reusable):
- Only fields that changed. Each field row: label, `Current` (muted, strike on removal) → `Requested` (highlighted).
- Description: character-level diff (green add / red remove backgrounds).
- Amenities: two chip lists — `+ Added` (emerald), `− Removed` (red).
- Gallery: three sections — Added (thumbs w/ green ring), Removed (thumbs w/ red ring + strike), Reordered (before/after order strip).
- Rooms/pricing: table of only modified rooms, `old → new` per cell.
- Feels like a GitHub PR file view.

### 4. Hotels — CRM, not approval
Sticky filter bar + dense table:
`Hotel (logo+name+city) · Verification · Pending Cases · Health · Revenue (30d) · Subscription · Status · ⋯`
Row click → Hotel Workspace.

### 5. Hotel Workspace `/admin/hotels/:id`
Header: hotel name, city, status badges (**Published / Draft / Pending Review**), quick actions overflow.
Tabs: `Overview · Property · Rooms · Bookings · Staff · Commercial · Activity`.

- **Overview**: compact KPI grid — Hotel Status, Verification, Pending Cases (→ Work Queue filtered), Owner, Hotel Admin, Subscription, Revenue, Health. Then Latest Activity + Latest Documents + Quick Actions (Suspend, Publish, Feature, Reset Password, Deactivate) — all gated by ConfirmDialog.
- **Property**: accordion (General, Location, Contacts, Policies, Amenities, Gallery). Read-only; "Edit" opens a shadcn `Sheet` drawer.
- **Rooms**: inner tabs Room Types / Rooms / Pricing / Availability — dense tables.
- **Bookings**: reuse existing hotel bookings table, restyled dense.
- **Staff**: Owner card, Hotel Admin card, Sub Admins table. Row actions: Block, Deactivate, Reset Password, Force Logout, View Login History.
- **Commercial**: Subscription, Advertisement, Featured toggle, Invoices, Payments, Commission — sectioned lists.
- **Activity**: GitHub-style vertical timeline of every event.

### 6. Bookings (top-level) — dense global table, filters by hotel/status/date; row → existing `AdminBookingDetail`.
### 7. Users — existing client list restyled dense; row → `AdminClientProfile`.
### 8. Catalog pages (Cities, Hotel Types, Amenities, Bed Types) — identical pattern: sticky header with search + `+ New`, dense table, edit in drawer.
### 9. System Admins — existing list, restyled.
### 10. Platform Settings — sectioned form (Branding, Commission, Email, Feature Flags).

---

## Versioning UX

Every hotel carries a status badge set: `Published`, `Draft`, `Pending Review`, `Rejected`, `Archived`. When a Draft Case exists, Property tab shows a banner "Draft under review — editing locked" and the Edit button is disabled. Cases page shows which version they reference.

---

## Technical details

**New / restructured files**
- `src/components/admin/shell/AdminShell.tsx` — replaces `AdminLayout.tsx` (kept as thin re-export for compat).
- `src/components/admin/shell/Sidebar.tsx`, `TopBar.tsx`, `CommandPalette.tsx`, `Breadcrumbs.tsx`.
- `src/components/admin/common/DataTable.tsx` — dense sortable table wrapper (shadcn Table + TanStack-lite via existing patterns), `StatusBadge.tsx`, `PriorityDot.tsx`, `WaitingTime.tsx`, `KbdHint.tsx`, `EmptyState.tsx`, `SectionHeader.tsx`, `SideDrawer.tsx` (Sheet preset).
- `src/components/admin/cases/CaseHeader.tsx`, `CaseActionPanel.tsx`, `CaseTimeline.tsx`, `RequestedChangesDiff.tsx` (with sub-parts `TextDiff`, `AmenitiesDiff`, `GalleryDiff`, `RoomsDiff`), `DocumentsList.tsx`, `InternalNotes.tsx`.
- `src/components/admin/hotel-workspace/HotelWorkspaceLayout.tsx` + one file per tab (`OverviewTab.tsx`, `PropertyTab.tsx`, `RoomsTab.tsx`, `BookingsTab.tsx`, `StaffTab.tsx`, `CommercialTab.tsx`, `ActivityTab.tsx`).
- `src/pages/admin/WorkQueue.tsx`, `CaseReview.tsx`, `HotelWorkspace.tsx`, `Catalog/{Cities,HotelTypes,Amenities,BedTypes}.tsx`, `PlatformSettings.tsx`.
- `src/data/adminCases.ts` — dummy Cases + diff payloads seeded from existing dummy hotels; `src/data/adminActivity.ts`.

**Reused as-is** (restyled where needed, no logic changes): `AdminBookingDetail`, `AdminClientProfile`, `AdminClientList`, `AdminAllBookings`, `AdminAddSystemAdmin`, `ConfirmDialog`, `NotificationPanel`, `adminApi.ts`.

**Routing** (`src/App.tsx`): new routes `/admin/work-queue`, `/admin/cases/:id`, `/admin/hotels/:id` (Workspace, replaces detail scatter), `/admin/catalog/{cities|hotel-types|amenities|bed-types}`, `/admin/platform-settings`. Legacy routes redirect to new ones so nothing breaks.

**Design tokens** (`src/index.css`): add `--surface`, `--surface-2`, `--border-strong`, `--diff-add`, `--diff-remove`, `--priority-p1/p2/p3` HSL vars; keep existing brand tokens. No gradient utilities added.

**Deletions from sidebar only** (files kept, just unlinked from nav): AddHotel, EraseHotel, EraseClient, Analytics, standalone Settings — their functionality is folded into Hotel Workspace and Platform Settings.

**Out of scope**: backend/Prisma changes, Hotel Admin panel, public site, real WebSocket updates (dummy polling only).

## Rollout order
1. Shell + sidebar + top bar + command palette skeleton.
2. Dashboard + reusable `DataTable`/badges.
3. Work Queue + dummy cases dataset.
4. Case Review Workspace + `RequestedChangesDiff`.
5. Hotels list + Hotel Workspace tabs.
6. Catalog pages + Platform Settings.
7. Redirects + polish pass (keyboard, dark mode, empty states).
