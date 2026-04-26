# Bulk Room Creation Implementation Guide

## Overview

Your schema now fully supports **multi-room bulk creation** for hotel admins. This implementation allows hotels to:

1. ✅ Create a room type and add multiple physical rooms **in one atomic transaction**
2. ✅ Add more physical rooms to existing room types anytime
3. ✅ Edit/update individual physical room details later
4. ✅ Delete physical rooms without breaking existing bookings
5. ✅ Track room inventory in real-time

---

## Database Schema (Already in your schema.prisma)

### Two-Level Structure

```prisma
model hotel_rooms {
  hotel_room_id       Int                  @id @default(autoincrement())
  hotel_id            Int
  room_type           String               // "Deluxe Double"
  base_price          Decimal              // Price per night
  description         String?
  room_size           String?
  approval_status     RoomApproval         // PENDING, APPROVED, REJECTED
  created_at          DateTime
  updated_at          DateTime
  hotel_room_details  hotel_room_details[] // Physical rooms (101, 102, 103, etc)
  // ... relationships
}

model hotel_room_details {
  hotel_room_details_id Int          @id @default(autoincrement())
  hotel_rooms_id        Int          // Links to room type
  room_number           String       // "101", "102", "103"
  bed_type              String?      // "Queen", "King"
  max_occupancy         Int          // 2, 3, 4 guests
  smoking_allowed       Boolean
  pet_allowed           Boolean
  image_url             String?
  created_at            DateTime
  updated_at            DateTime
  deleted_at            DateTime?    // Soft delete for booking history
  hotel_room            hotel_rooms
  // ... relationships
}
```

---

## API Endpoints

### 1. **CREATE ROOM TYPE + PHYSICAL ROOMS** (Atomic Transaction)

**POST** `/api/rooms/bulk-create?hotel_id=42`

Creates a room type and N physical rooms in ONE transaction. Everything succeeds or everything rolls back.

#### Request Body
```json
{
  "room_data": {
    "room_type": "Deluxe Double",
    "base_price": 150.50,
    "description": "Spacious room with queen bed and city view",
    "room_size": "40m²"
  },
  "room_numbers": [
    {
      "room_number": "101",
      "bed_type": "Queen",
      "max_occupancy": 2,
      "smoking_allowed": false,
      "pet_allowed": true,
      "image_url": "https://..."
    },
    {
      "room_number": "102",
      "bed_type": "Queen",
      "max_occupancy": 2,
      "smoking_allowed": false,
      "pet_allowed": true,
      "image_url": "https://..."
    },
    {
      "room_number": "103",
      "bed_type": "Queen",
      "max_occupancy": 2,
      "smoking_allowed": false,
      "pet_allowed": true,
      "image_url": "https://..."
    }
  ]
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Room type created with 3 physical rooms",
  "data": {
    "room": {
      "hotel_room_id": 42,
      "hotel_id": 5,
      "room_type": "Deluxe Double",
      "base_price": "150.50",
      "room_size": "40m²",
      "approval_status": "PENDING",
      "created_at": "2026-03-20T10:30:00Z"
    },
    "physical_rooms": [
      {
        "hotel_room_details_id": 101,
        "room_number": "101",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "smoking_allowed": false,
        "pet_allowed": true,
        "created_at": "2026-03-20T10:30:00Z"
      },
      {
        "hotel_room_details_id": 102,
        "room_number": "102",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "smoking_allowed": false,
        "pet_allowed": true,
        "created_at": "2026-03-20T10:30:00Z"
      },
      {
        "hotel_room_details_id": 103,
        "room_number": "103",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "smoking_allowed": false,
        "pet_allowed": true,
        "created_at": "2026-03-20T10:30:00Z"
      }
    ],
    "count": 3
  }
}
```

---

### 2. **ADD MORE PHYSICAL ROOMS** to Existing Type

**POST** `/api/rooms/42/physical-rooms`

Add more rooms to an existing room type anytime. Validates no duplicate room numbers.

#### Request Body
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

#### Success Response (201)
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
        "smoking_allowed": false,
        "pet_allowed": false,
        "created_at": "2026-03-20T10:35:00Z"
      },
      {
        "hotel_room_details_id": 105,
        "room_number": "105",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "smoking_allowed": false,
        "pet_allowed": false,
        "created_at": "2026-03-20T10:35:00Z"
      }
    ],
    "count": 2
  }
}
```

---

### 3. **LIST PHYSICAL ROOMS** for a Room Type

**GET** `/api/rooms/42/physical-rooms?skip=0&take=20`

List all physical room instances for a room type with pagination.

#### Success Response (200)
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
        "pet_allowed": true,
        "created_at": "2026-03-20T10:30:00Z"
      },
      {
        "hotel_room_details_id": 102,
        "room_number": "102",
        "bed_type": "Queen",
        "max_occupancy": 2,
        "smoking_allowed": false,
        "pet_allowed": true,
        "created_at": "2026-03-20T10:30:00Z"
      }
      // ... more rooms
    ],
    "skip": 0,
    "take": 20
  }
}
```

---

### 4. **UPDATE PHYSICAL ROOM** Details

**PUT** `/api/rooms/42/physical-rooms/101`

Update any detail of a physical room. Validates room_number uniqueness within the same room type.

#### Request Body
```json
{
  "room_number": "101A",
  "bed_type": "King",
  "max_occupancy": 3,
  "smoking_allowed": false,
  "pet_allowed": true
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Physical room updated successfully",
  "data": {
    "hotel_room_details_id": 101,
    "room_number": "101A",
    "bed_type": "King",
    "max_occupancy": 3,
    "updated_at": "2026-03-20T10:40:00Z"
  }
}
```

---

### 5. **DELETE PHYSICAL ROOM** (Soft Delete)

**DELETE** `/api/rooms/42/physical-rooms/101`

Soft deletes a physical room by setting `deleted_at` timestamp. Preserves booking history.

#### Success Response (200)
```json
{
  "success": true,
  "message": "Physical room deleted successfully",
  "data": {
    "hotel_room_details_id": 101
  }
}
```

---

### 6. **GET ROOM INVENTORY** Count

**GET** `/api/rooms/42/inventory`

Get total, active, and deleted room counts for a room type.

#### Success Response (200)
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

---

## Usage Flow (Frontend → Backend)

### Step 1: Hotel Admin Opens Room Creation Form

```typescript
// Frontend shows:
// Room Type:   [Deluxe Double ▼]
// Base Price:  [150.50]
// Room Count:  [3]
//
// Room 1: [101] [Queen ▼] [Max 2 ▼]
// Room 2: [102] [Queen ▼] [Max 2 ▼]
// Room 3: [103] [Queen ▼] [Max 2 ▼]
//
// [+ Add Room] [Create Room Type]
```

### Step 2: Admin Clicks "Create Room Type"

```typescript
// Frontend sends POST /api/rooms/bulk-create?hotel_id=5
const response = await fetch(
  '/api/rooms/bulk-create?hotel_id=5',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_data: {
        room_type: 'Deluxe Double',
        base_price: 150.50,
        description: '...',
        room_size: '40m²'
      },
      room_numbers: [
        { room_number: '101', bed_type: 'Queen', max_occupancy: 2 },
        { room_number: '102', bed_type: 'Queen', max_occupancy: 2 },
        { room_number: '103', bed_type: 'Queen', max_occupancy: 2 }
      ]
    })
  }
);
```

### Step 3: Backend Processing

**In one atomic transaction:**

1. ✅ Creates `hotel_rooms` record (room type)
2. ✅ Creates 3 `hotel_room_details` records (physical rooms 101, 102, 103)
3. ✅ If ANY step fails → ROLLBACK everything

```typescript
// Backend: rooms.service.ts
const result = await prisma.$transaction(async (tx) => {
  // Step 1: Create room type
  const room = await tx.hotel_rooms.create({
    data: {
      hotel_id: 5,
      room_type: 'Deluxe Double',
      base_price: 150.50,
      approval_status: 'PENDING'
    }
  });

  // Step 2: Create all physical rooms in ONE query
  await tx.hotel_room_details.createMany({
    data: [
      { hotel_rooms_id: room.hotel_room_id, room_number: '101', ... },
      { hotel_rooms_id: room.hotel_room_id, room_number: '102', ... },
      { hotel_rooms_id: room.hotel_room_id, room_number: '103', ... }
    ]
  });

  // Step 3: Fetch created rooms for response
  const physicalRooms = await tx.hotel_room_details.findMany({
    where: { hotel_rooms_id: room.hotel_room_id }
  });

  return { room, physical_rooms: physicalRooms, count: 3 };
});
```

### Step 4: Response Sent to Frontend

```json
{
  "success": true,
  "message": "Room type created with 3 physical rooms",
  "data": {
    "room": { hotel_room_id: 42, ... },
    "physical_rooms": [
      { hotel_room_details_id: 101, room_number: "101", ... },
      { hotel_room_details_id: 102, room_number: "102", ... },
      { hotel_room_details_id: 103, room_number: "103", ... }
    ],
    "count": 3
  }
}
```

### Step 5: Admin Can Edit Later

**Option A: Add more rooms**
```typescript
// POST /api/rooms/42/physical-rooms
{
  room_numbers: [
    { room_number: '201', bed_type: 'Queen' },
    { room_number: '202', bed_type: 'Queen' }
  ]
}
```

**Option B: Edit a room number**
```typescript
// PUT /api/rooms/42/physical-rooms/101
{
  room_number: '101A'  // Rename from 101 to 101A
}
```

**Option C: Delete a room**
```typescript
// DELETE /api/rooms/42/physical-rooms/101
// Soft delete - preserves booking history
```

---

## Error Handling

### Validation Errors (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      "room_type is required",
      "base_price must be greater than 0",
      "Room 1: room_number cannot be empty"
    ]
  }
}
```

### Duplicate Room Number (409)

```json
{
  "success": false,
  "message": "Duplicate room number",
  "error": {
    "code": "DUPLICATE_ROOM_NUMBER",
    "details": ["Room number 101 already exists"]
  }
}
```

### Hotel Not Found (404)

```json
{
  "success": false,
  "message": "Hotel not found",
  "error": { "code": "HOTEL_NOT_FOUND" }
}
```

---

## Validation Rules

### Room Type Validation
- ✅ `room_type`: Required, 2+ chars, max 150
- ✅ `base_price`: Required, > 0, max 999999.99
- ✅ `description`: Optional, max 5000 chars
- ✅ `room_size`: Optional, max 50 chars

### Physical Room Validation
- ✅ `room_number`: Required, 1+ chars, max 50, must be unique per room type
- ✅ `bed_type`: Optional, max 50 chars
- ✅ `max_occupancy`: Optional, 1-20
- ✅ `smoking_allowed`: Optional, boolean
- ✅ `pet_allowed`: Optional, boolean
- ✅ `image_url`: Optional, max 500 chars

### Bulk Room Validation
- ✅ Minimum 1 room, maximum 100 rooms per request
- ✅ All room numbers must be unique within array
- ✅ Each room must pass individual validation

---

## Key Features

### ✅ Atomic Transactions
Everything succeeds or everything fails. No partial data.

### ✅ Duplicate Prevention
Room numbers are validated to be unique within a room type.

### ✅ Soft Deletes
Deleted rooms preserve booking history via `deleted_at` timestamp.

### ✅ Real-Time Inventory
Room count is always calculated live from database:
```typescript
const activeRooms = await prisma.hotel_room_details.count({
  where: {
    hotel_rooms_id: roomId,
    deleted_at: null
  }
});
```

### ✅ Efficient Bulk Operations
Uses `createMany()` for single database roundtrip instead of looping.

### ✅ Pagination Support
All list endpoints support skip/take pagination (max 100 per page).

---

## Service Functions

All service functions in `rooms.service.ts`:

```typescript
// Single room creation (old way - still works)
createRoom(roomData, hotelId)

// NEW: Bulk creation with transaction
createRoomWithPhysicalRooms(roomData, roomNumbers, hotelId)

// NEW: Add more rooms later
addPhysicalRooms(roomId, roomNumbers)

// List rooms for a room type
getPhysicalRooms(roomId, skip, take)

// Update a physical room
updatePhysicalRoom(detailId, updates)

// Soft delete a physical room
deletePhysicalRoom(detailId)

// Get inventory counts
getRoomInventory(roomId)
```

---

## Controller Functions

All controller functions in `rooms.controller.ts`:

```typescript
// NEW
createRoomWithPhysicalRoomsController    // POST /bulk-create
addPhysicalRoomsController               // POST /:roomId/physical-rooms
getPhysicalRoomsController               // GET /:roomId/physical-rooms
updatePhysicalRoomController             // PUT /:roomId/physical-rooms/:detailId
deletePhysicalRoomController             // DELETE /:roomId/physical-rooms/:detailId
getRoomInventoryController               // GET /:roomId/inventory
```

---

## Routes

All routes defined in `rooms.routes.ts`:

```typescript
POST   /rooms/bulk-create                         // Create room + N physical rooms
POST   /rooms/:roomId/physical-rooms              // Add more rooms
GET    /rooms/:roomId/physical-rooms              // List physical rooms
PUT    /rooms/:roomId/physical-rooms/:detailId    // Update physical room
DELETE /rooms/:roomId/physical-rooms/:detailId    // Delete physical room
GET    /rooms/:roomId/inventory                   // Get inventory count
```

---

## FAQ

### Q: Can I add rooms after creating a room type?
**A:** Yes! Use `POST /rooms/:roomId/physical-rooms` to add more rooms anytime.

### Q: What if adding rooms fails?
**A:** Each addition is a separate transaction. The room type is not affected.

### Q: Can I delete a room if it has bookings?
**A:** Yes! It's a soft delete. The room record stays, `deleted_at` is set. Bookings are preserved.

### Q: How do I know how many rooms I have?
**A:** Use `GET /rooms/:roomId/inventory` to get active, deleted, and total counts.

### Q: Is there a limit on how many rooms I can create at once?
**A:** Yes, max 100 per request. But you can call it multiple times.

### Q: What happens if the transaction fails?
**A:** Everything rolls back. No partial data is created. The room type and all physical rooms are not created.

---

## Testing Examples

### Create Deluxe Double with 3 rooms
```bash
curl -X POST 'http://localhost:3000/api/rooms/bulk-create?hotel_id=5' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "room_data": {
      "room_type": "Deluxe Double",
      "base_price": 150.50,
      "description": "Spacious room with queen bed",
      "room_size": "40m²"
    },
    "room_numbers": [
      { "room_number": "101", "bed_type": "Queen", "max_occupancy": 2 },
      { "room_number": "102", "bed_type": "Queen", "max_occupancy": 2 },
      { "room_number": "103", "bed_type": "Queen", "max_occupancy": 2 }
    ]
  }'
```

### Add 2 more rooms to room type 42
```bash
curl -X POST 'http://localhost:3000/api/rooms/42/physical-rooms' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "room_numbers": [
      { "room_number": "104", "bed_type": "Queen", "max_occupancy": 2 },
      { "room_number": "105", "bed_type": "Queen", "max_occupancy": 2 }
    ]
  }'
```

### Get all rooms for room type 42
```bash
curl 'http://localhost:3000/api/rooms/42/physical-rooms?skip=0&take=20'
```

### Update room 101 to be room 101A with King bed
```bash
curl -X PUT 'http://localhost:3000/api/rooms/42/physical-rooms/101' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "room_number": "101A",
    "bed_type": "King",
    "max_occupancy": 3
  }'
```

### Get inventory for room type 42
```bash
curl 'http://localhost:3000/api/rooms/42/inventory'
```

---

## Summary

✅ **Your schema supports everything you need**
✅ **Multi-room bulk creation in atomic transactions**
✅ **Edit/update rooms anytime**
✅ **Delete rooms without breaking bookings**
✅ **Real-time inventory tracking**

**Implementation is complete and ready to use!**
