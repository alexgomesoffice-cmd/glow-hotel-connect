# Admin API Service - Quick Reference

## Import
```typescript
import { fetchHotels, fetchBookings, fetchEndUsers } from '@/services/adminApi';
```

## Functions

### fetchHotels()
Fetch hotels from the database with optional filtering.

```typescript
// Get all hotels
const hotels = await fetchHotels({ limit: 100 });

// Get hotels in a specific city
const dhakHotels = await fetchHotels({ city: 'Dhaka', limit: 50 });

// Get only published hotels
const published = await fetchHotels({ approval_status: 'PUBLISHED' });

// With pagination
const page2 = await fetchHotels({ page: 2, limit: 20 });
```

**Returns:** `HotelResponse[]`
```typescript
{
  hotel_id: number;
  name: string;
  email: string | null;
  address: string | null;
  city: string | null;
  hotel_type: string | null;
  owner_name: string | null;
  description: string | null;
  star_rating: number | null;
  approval_status: string;
  created_at: string;
  updated_at: string;
}
```

---

### fetchBookings()
Fetch bookings with optional filtering.

```typescript
// Get all bookings
const bookings = await fetchBookings({ limit: 100 });

// Get confirmed bookings
const confirmed = await fetchBookings({ booking_status: 'confirmed' });

// Get paid bookings only
const paid = await fetchBookings({ payment_status: 'paid' });

// Combine filters
const pendingUnpaid = await fetchBookings({
  booking_status: 'pending',
  payment_status: 'unpaid',
  limit: 50
});
```

**Returns:** `BookingResponse[]`
```typescript
{
  booking_id: number;
  room_id: number;
  end_user_id: number;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  booking_status: string; // "confirmed" | "pending" | "cancelled"
  payment_status: string; // "paid" | "unpaid" | "refunded"
  created_at: string;
  updated_at: string;
}
```

---

### fetchEndUsers()
Fetch end users (guests) from the database.

```typescript
// Get all users
const users = await fetchEndUsers({ limit: 100 });

// With pagination
const page2 = await fetchEndUsers({ page: 2, limit: 20 });
```

**Returns:** `EndUserResponse[]`
```typescript
{
  end_user_id: number;
  email: string;
  name: string | null;
  is_blocked: boolean;
  deleted_at: string | null;
  created_at: string;
}
```

---

### fetchHotelById()
Get details for a single hotel.

```typescript
const hotel = await fetchHotelById(1);
console.log(hotel.name, hotel.star_rating);
```

**Returns:** `HotelResponse`

---

### fetchBookingById()
Get details for a single booking.

```typescript
const booking = await fetchBookingById(42);
console.log(booking.total_amount, booking.booking_status);
```

**Returns:** `BookingResponse`

---

### getDashboardStats()
Get aggregated statistics for the dashboard.

```typescript
const stats = await getDashboardStats();
console.log(stats.totalRevenue); // Total paid booking amount
console.log(stats.totalBookings); // All bookings count
console.log(stats.pendingBookings); // Pending bookings only
console.log(stats.totalProperties); // Hotel count
console.log(stats.publishedProperties); // Published hotels only
```

**Returns:**
```typescript
{
  totalRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  totalProperties: number;
  publishedProperties: number;
  hotels: HotelResponse[];
  bookings: BookingResponse[];
}
```

---

## Error Handling

All functions throw errors on failure. Wrap in try-catch:

```typescript
try {
  const hotels = await fetchHotels();
} catch (error) {
  console.error("Failed to fetch hotels:", error.message);
  // Show error toast to user
}
```

Or use `.catch()`:

```typescript
fetchHotels()
  .then(hotels => console.log(hotels))
  .catch(error => console.error(error));
```

---

## Usage in React Components

```typescript
import { useState, useEffect } from 'react';
import { fetchHotels, fetchBookings } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';

export function MyComponent() {
  const { toast } = useToast();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchHotels({ limit: 50 });
        setHotels(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  if (loading) return <p>Loading...</p>;
  return <div>{hotels.map(h => <p key={h.hotel_id}>{h.name}</p>)}</div>;
}
```

---

## Debugging

The service logs all responses to console. Check browser DevTools Console to see:

```
Fetch Hotels Response: {...}
Fetch Bookings Response: {...}
Fetch End Users Response: {...}
```

This helps debug response format issues.

---

## Status Values

**Booking Status:**
- `"pending"` - Not yet confirmed
- `"confirmed"` - Booking is confirmed
- `"cancelled"` - Booking was cancelled

**Payment Status:**
- `"paid"` - Payment received
- `"unpaid"` - Payment pending
- `"refunded"` - Payment refunded

**Hotel Approval Status:**
- `"DRAFT"` - Not yet published
- `"PUBLISHED"` - Live on platform
- `"ARCHIVED"` - Removed from active listing

---

## Common Patterns

### Get Revenue This Month
```typescript
const bookings = await fetchBookings({ payment_status: 'paid' });
const totalRevenue = bookings.reduce((sum, b) => sum + b.total_amount, 0);
```

### Count Bookings Per Hotel
```typescript
const bookings = await fetchBookings({ limit: 1000 });
const perHotel = {};
bookings.forEach(b => {
  perHotel[b.room_id] = (perHotel[b.room_id] || 0) + 1;
});
```

### Find Hotels Without Bookings
```typescript
const hotels = await fetchHotels({ limit: 100 });
const bookings = await fetchBookings({ limit: 1000 });
const bookedHotelIds = new Set(bookings.map(b => b.room_id));
const inactive = hotels.filter(h => !bookedHotelIds.has(h.hotel_id));
```

### Check for Blocked Users
```typescript
const users = await fetchEndUsers({ limit: 100 });
const blocked = users.filter(u => u.is_blocked);
console.log(`${blocked.length} users are blocked`);
```

---

## API Endpoints (Backend Reference)

- `GET /api/hotels` - List hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking details
- `GET /api/end-users` - List end users (if endpoint exists)

For actual endpoint availability, check `backend/src/routes.ts`
