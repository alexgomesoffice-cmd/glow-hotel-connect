# Multi-Room Bulk Creation & Management System

## Overview

Your schema **fully supports** multi-room bulk creation with the following architecture:

### Two-Table Design
- **`hotel_rooms`** → The room TYPE (e.g., "Deluxe Double") — ONE row
- **`hotel_room_details`** → The physical rooms (e.g., "101", "102", "103") — ONE row each

This separation allows:
- ✅ Multiple physical rooms with the same type
- ✅ Bulk creation in a single transaction
- ✅ Edit individual room numbers later
- ✅ Add more rooms to existing types
- ✅ Soft delete (preserve booking history)

---

## Database Schema

```prisma
model hotel_rooms {
  hotel_room_id      Int                @id @default(autoincrement())
  hotel_id           Int
  room_type          String             // e.g., "Deluxe Double"
  description        String?            @db.Text
  base_price         Decimal            // e.g., 150.50
  room_size          String?            // e.g., "40m²"
  approval_status    RoomApproval       // PENDING, APPROVED, REJECTED
  created_at         DateTime
  updated_at         DateTime
  // Relations
  hotel_room_details hotel_room_details[] // One-to-many
}

model hotel_room_details {
  hotel_room_details_id Int          @id @default(autoincrement())
  hotel_rooms_id        Int          // FK to hotel_rooms
  room_number           String       // e.g., "101", "102", "103"
  room_size             String?
  bed_type              String?      // e.g., "Queen", "Twin"
  max_occupancy         Int          @default(2)
  smoking_allowed       Boolean      @default(false)
  pet_allowed           Boolean      @default(false)
  image_url             String?
  created_at            DateTime
  updated_at            DateTime
  deleted_at            DateTime?    // For soft deletes
}
```

---

## API Endpoints

### 1️⃣ Create Room Type + Physical Rooms (Bulk)

**Endpoint:** `POST /api/rooms/bulk-create?hotel_id=42`

**Authentication:** Required (Hotel Admin)

**Request Body:**
```json
{
  "room_data": {
    "room_type": "Deluxe Double",
    "base_price": 150.50,
    "description": "Spacious room with queen bed",
    "room_size": "40m²"
  },
  "room_numbers": [
    {
      "room_number": "101",
      "bed_type": "Queen",
      "max_occupancy": 2,
      "smoking_allowed": false,
      "pet_allowed": false
    },
    {
      "room_number": "102",
      "bed_type": "Queen",
      "max_occupancy": 2,
      "smoking_allowed": false,
      "pet_allowed": false
    },
    {
      "room_number": "103",
      "bed_type": "Queen",
      "max_occupancy": 2,
      "smoking_allowed": false,
      "pet_allowed": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Room type created with 3 physical rooms",
  "data": {
    "room": {
      "hotel_room_id": 42,
      "hotel_id": 1,
      "room_type": "Deluxe Double",
      "base_price": "150.50",
      "room_size": "40m²",
      "approval_status": "PENDING",
      "created_at": "2026-03-20T10:00:00Z"
    },
    "physical_rooms": [
      {
        "hotel_room_details_id": 101,
        "room_number": "101",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "smoking_allowed": false,
        "pet_allowed": false,
        "created_at": "2026-03-20T10:00:00Z"
      },
      // ... more rooms
    ],
    "count": 3
  }
}
```

**What Happens (Behind the Scenes):**
```typescript
// Step 1: Create room type
const room = await prisma.hotel_rooms.create({
  data: {
    hotel_id: 42,
    room_type: "Deluxe Double",
    base_price: 150.50,
    description: "Spacious room with queen bed",
    room_size: "40m²",
    approval_status: "PENDING"
  }
});
// Result: hotel_room_id = 42

// Step 2: Create all physical rooms at once
await prisma.hotel_room_details.createMany({
  data: [
    {
      hotel_rooms_id: 42,
      room_number: "101",
      bed_type: "Queen",
      max_occupancy: 2
    },
    {
      hotel_rooms_id: 42,
      room_number: "102",
      bed_type: "Queen",
      max_occupancy: 2
    },
    {
      hotel_rooms_id: 42,
      room_number: "103",
      bed_type: "Queen",
      max_occupancy: 2
    }
  ]
});

// ✅ All happens in ONE transaction
// ✅ If anything fails, everything rolls back
```

---

### 2️⃣ Add More Rooms to Existing Type

**Endpoint:** `POST /api/rooms/:roomId/physical-rooms`

**Example:** `POST /api/rooms/42/physical-rooms`

**Authentication:** Required (Hotel Admin)

**Request Body:**
```json
{
  "room_numbers": [
    {
      "room_number": "104",
      "bed_type": "Queen",
      "max_occupancy": 2
    },
    {
      "room_number": "105",
      "bed_type": "Queen",
      "max_occupancy": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 physical rooms added successfully",
  "data": {
    "room_id": 42,
    "added_rooms": [
      {
        "hotel_room_details_id": 104,
        "room_number": "104",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "created_at": "2026-03-20T11:00:00Z"
      },
      {
        "hotel_room_details_id": 105,
        "room_number": "105",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "created_at": "2026-03-20T11:00:00Z"
      }
    ],
    "count": 2
  }
}
```

---

### 3️⃣ Get All Physical Rooms for a Type

**Endpoint:** `GET /api/rooms/:roomId/physical-rooms?skip=0&take=20`

**Example:** `GET /api/rooms/42/physical-rooms`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Physical rooms retrieved successfully",
  "data": {
    "room_id": 42,
    "total": 5,
    "rooms": [
      {
        "hotel_room_details_id": 101,
        "room_number": "101",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "smoking_allowed": false,
        "pet_allowed": false,
        "created_at": "2026-03-20T10:00:00Z"
      },
      // ... more rooms (sorted by room_number)
    ],
    "skip": 0,
    "take": 20
  }
}
```

---

### 4️⃣ Update a Physical Room

**Endpoint:** `PUT /api/rooms/:roomId/physical-rooms/:detailId`

**Example:** `PUT /api/rooms/42/physical-rooms/101`

**Authentication:** Required (Hotel Admin)

**Request Body:**
```json
{
  "room_number": "101A",
  "bed_type": "King",
  "max_occupancy": 3,
  "smoking_allowed": false,
  "pet_allowed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Physical room updated successfully",
  "data": {
    "hotel_room_details_id": 101,
    "room_number": "101A",
    "bed_type": "King",
    "max_occupancy": 3,
    "updated_at": "2026-03-20T12:00:00Z"
  }
}
```

**Validation:**
- ✅ Prevents duplicate room numbers in same type
- ✅ Only updates provided fields
- ✅ Throws error if room doesn't exist

---

### 5️⃣ Delete a Physical Room (Soft Delete)

**Endpoint:** `DELETE /api/rooms/:roomId/physical-rooms/:detailId`

**Example:** `DELETE /api/rooms/42/physical-rooms/101`

**Authentication:** Required (Hotel Admin)

**Response:**
```json
{
  "success": true,
  "message": "Physical room deleted successfully",
  "data": {
    "hotel_room_details_id": 101
  }
}
```

**What Happens:**
```typescript
// Sets deleted_at timestamp (soft delete)
await prisma.hotel_room_details.update({
  where: { hotel_room_details_id: 101 },
  data: { deleted_at: new Date() }
});

// ✅ Existing bookings are NOT broken
// ✅ Historical data is preserved
// ✅ New bookings cannot use this room
```

---

### 6️⃣ Get Room Inventory Count

**Endpoint:** `GET /api/rooms/:roomId/inventory`

**Example:** `GET /api/rooms/42/inventory`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Room inventory retrieved successfully",
  "data": {
    "room_id": 42,
    "total_rooms": 5,
    "active_rooms": 4,
    "deleted_rooms": 1
  }
}
```

**Use Case:**
- Display "4 available rooms" in dashboard
- Track soft-deleted rooms
- Always accurate (counted live, not cached)

---

## Implementation Details

### Transaction Safety

When creating bulk rooms, **everything happens in one transaction**:

```typescript
export async function createRoomWithPhysicalRooms(
  roomData: any,
  roomNumbers: any[],
  hotelId: number
) {
  // Execute in transaction - either all succeed or all rollback
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create the room type
    const room = await tx.hotel_rooms.create({...});

    // Step 2: Create all physical rooms at once
    await tx.hotel_room_details.createMany({...});

    // Fetch created rooms and return
    const physicalRooms = await tx.hotel_room_details.findMany({...});
    return { room, physical_rooms: physicalRooms, count: physicalRooms.length };
  });

  return result;
}
```

**Benefits:**
- ✅ No partial inserts
- ✅ Atomic operation
- ✅ If anything fails, entire batch rolls back
- ✅ Database stays consistent

### Duplicate Prevention

```typescript
// Prevents duplicate room numbers in same type
const duplicate = await prisma.hotel_room_details.findFirst({
  where: {
    hotel_rooms_id: roomId,
    room_number: "101",
    deleted_at: null  // Only checks active rooms
  }
});

if (duplicate) {
  throw new Error("DUPLICATE_ROOM_NUMBER");
}
```

### Bulk Insert Performance

```typescript
// Single query to insert multiple rooms
// ✅ Much faster than looping and creating one by one
await prisma.hotel_room_details.createMany({
  data: [
    { hotel_rooms_id: 42, room_number: "101" },
    { hotel_rooms_id: 42, room_number: "102" },
    { hotel_rooms_id: 42, room_number: "103" }
    // ... up to 100 at once
  ]
});
```

---

## Frontend Integration Example

### Scenario: Hotel Admin Creates Deluxe Rooms

```typescript
// Step 1: Admin selects room type
const roomType = "Deluxe Double";

// Step 2: Admin enters base price
const basePrice = 150.50;

// Step 3: Admin selects count (3 rooms)
const roomCount = 3;

// Step 4: Admin enters room numbers
const roomNumbers = [
  { room_number: "101", bed_type: "Queen", max_occupancy: 2 },
  { room_number: "102", bed_type: "Queen", max_occupancy: 2 },
  { room_number: "103", bed_type: "Queen", max_occupancy: 2 }
];

// Step 5: Submit to backend
const response = await fetch(
  `/api/rooms/bulk-create?hotel_id=${hotelId}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_data: {
        room_type: roomType,
        base_price: basePrice,
        description: "Spacious room with queen bed"
      },
      room_numbers: roomNumbers
    })
  }
);

const result = await response.json();

if (result.success) {
  console.log(`✅ Created ${result.data.count} rooms`);
  // Refresh room list
} else {
  console.error("❌ Error:", result.error.details);
}
```

---

## Validation Rules

### Room Type Validation
- `room_type`: Required, 2-150 chars
- `base_price`: Required, > 0, max 999,999.99
- `description`: Optional, max 5,000 chars
- `room_size`: Optional, max 50 chars

### Physical Room Validation
- `room_number`: Required, 1-50 chars
- `bed_type`: Optional, max 50 chars
- `max_occupancy`: Optional, 1-20
- `smoking_allowed`: Optional, boolean
- `pet_allowed`: Optional, boolean
- `image_url`: Optional, max 500 chars

### Bulk Validation
- Array of 1-100 rooms
- All room numbers must be unique
- No duplicates within the same batch
- Each room validated individually

---

## Error Handling

```json
// Hotel not found
{
  "success": false,
  "message": "Hotel not found",
  "error": { "code": "HOTEL_NOT_FOUND" }
}

// Validation error
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      "Room 1: room_number is required",
      "Room 2: max_occupancy must be between 1 and 20"
    ]
  }
}

// Duplicate room number
{
  "success": false,
  "message": "Duplicate room number",
  "error": {
    "code": "DUPLICATE_ROOM_NUMBER",
    "details": ["Room number 101 already exists"]
  }
}

// Room not found
{
  "success": false,
  "message": "Room not found",
  "error": { "code": "ROOM_NOT_FOUND" }
}
```

---

## Database Query Examples

### Get all rooms for a hotel
```typescript
const rooms = await prisma.hotel_rooms.findMany({
  where: { hotel_id: 42 },
  include: { hotel_room_details: { where: { deleted_at: null } } }
});
```

### Count active rooms by type
```typescript
const inventory = await prisma.hotel_room_details.count({
  where: {
    hotel_rooms_id: 42,
    deleted_at: null
  }
});
```

### Find duplicate room numbers
```typescript
const duplicates = await prisma.hotel_room_details.groupBy({
  by: ['hotel_rooms_id', 'room_number'],
  where: { deleted_at: null },
  having: { room_number: { _count: { gt: 1 } } }
});
```

---

## Migration (If Needed)

No migration needed! Your schema already supports this.

If you need to add `deleted_at` field to `hotel_room_details`:

```prisma
model hotel_room_details {
  // ... existing fields
  deleted_at DateTime?  // Add this line
}
```

Then run:
```bash
npx prisma migrate dev --name add_deleted_at_to_hotel_room_details
```

---

## Performance Notes

- ✅ **Bulk insert** (createMany) is 100x faster than loops
- ✅ **Transaction** ensures data consistency
- ✅ **Soft delete** preserves booking history
- ✅ **Indexes** on hotel_id, hotel_rooms_id optimize queries
- ✅ **Count** is always accurate (calculated live)

---

## Summary

Your schema **perfectly supports** the workflow:

```
Hotel Admin Flow:
┌─────────────────────────────────────────┐
│ Select Room Type (e.g., Deluxe Double) │
│ Enter Base Price ($150.50)              │
│ Select Room Count (3)                   │
│ Enter Room Numbers (101, 102, 103)      │
└──────────────┬──────────────────────────┘
               │
               ▼
        POST /bulk-create
               │
               ▼
    ┌─────────────────────────┐
    │ Create Room Type (1)    │
    │ Create 3 Physical Rooms │
    │ In Single Transaction   │
    └────────────┬────────────┘
                 │
                 ▼
            ✅ Success
```

No schema changes needed. You're ready to implement! 🚀

