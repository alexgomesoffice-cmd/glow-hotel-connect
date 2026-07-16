// Dummy platform-wide bookings dataset (client-only fallback).
export type BookingStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled" | "pending";
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";

export interface AdminBooking {
  id: string;             // BK-xxxxx
  guestName: string;
  guestEmail: string;
  hotelId: number;
  hotelName: string;
  hotelCity: string;
  roomName: string;
  checkIn: string;   // ISO date
  checkOut: string;  // ISO date
  guests: number;
  payment: PaymentStatus;
  status: BookingStatus;
  amount: number;    // BDT
  createdAt: string; // ISO
  specialRequests?: string;
}

const D = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

export const BOOKINGS: AdminBooking[] = [
  { id: "BK-100294", guestName: "Ayesha Karim", guestEmail: "ayesha@example.com", hotelId: 1, hotelName: "Sea Pearl Beach Resort", hotelCity: "Cox's Bazar", roomName: "Deluxe Sea View", checkIn: D(0), checkOut: D(3), guests: 2, payment: "paid", status: "checked_in", amount: 36000, createdAt: D(-2), specialRequests: "Late check-in around 11pm" },
  { id: "BK-100293", guestName: "Rashed Khan", guestEmail: "rashed@example.com", hotelId: 2, hotelName: "Pan Pacific Sonargaon", hotelCity: "Dhaka", roomName: "Executive Suite", checkIn: D(0), checkOut: D(1), guests: 1, payment: "paid", status: "confirmed", amount: 15200, createdAt: D(-1) },
  { id: "BK-100292", guestName: "Nadia Islam", guestEmail: "nadia@example.com", hotelId: 4, hotelName: "Radisson Blu Chattogram", hotelCity: "Chattogram", roomName: "Deluxe King", checkIn: D(1), checkOut: D(4), guests: 2, payment: "pending", status: "pending", amount: 24000, createdAt: D(0) },
  { id: "BK-100291", guestName: "Tanvir Ahmed", guestEmail: "tanvir@example.com", hotelId: 7, hotelName: "Long Beach Suites", hotelCity: "Cox's Bazar", roomName: "Twin Room", checkIn: D(0), checkOut: D(2), guests: 3, payment: "paid", status: "checked_in", amount: 18000, createdAt: D(-3) },
  { id: "BK-100290", guestName: "Farhana Chowdhury", guestEmail: "farhana@example.com", hotelId: 2, hotelName: "Pan Pacific Sonargaon", hotelCity: "Dhaka", roomName: "Deluxe Twin", checkIn: D(-2), checkOut: D(0), guests: 2, payment: "paid", status: "checked_out", amount: 28000, createdAt: D(-5) },
  { id: "BK-100289", guestName: "Imran Hossain", guestEmail: "imran@example.com", hotelId: 3, hotelName: "Sajek Cloud Resort", hotelCity: "Sajek Valley", roomName: "Cottage", checkIn: D(0), checkOut: D(5), guests: 4, payment: "paid", status: "confirmed", amount: 42000, createdAt: D(-1) },
  { id: "BK-100288", guestName: "Sadia Rahman", guestEmail: "sadia@example.com", hotelId: 8, hotelName: "Amari Dhaka", hotelCity: "Dhaka", roomName: "Superior", checkIn: D(0), checkOut: D(1), guests: 1, payment: "refunded", status: "cancelled", amount: 12000, createdAt: D(-4) },
  { id: "BK-100287", guestName: "Kamal Uddin", guestEmail: "kamal@example.com", hotelId: 6, hotelName: "Hotel Agrabad", hotelCity: "Chattogram", roomName: "Standard Double", checkIn: D(3), checkOut: D(5), guests: 2, payment: "pending", status: "pending", amount: 9800, createdAt: D(-1) },
  { id: "BK-100286", guestName: "Mishuk Rahman", guestEmail: "mishuk@example.com", hotelId: 1, hotelName: "Sea Pearl Beach Resort", hotelCity: "Cox's Bazar", roomName: "Premier Suite", checkIn: D(0), checkOut: D(4), guests: 2, payment: "paid", status: "confirmed", amount: 72000, createdAt: D(-6) },
  { id: "BK-100285", guestName: "Zara Chowdhury", guestEmail: "zara@example.com", hotelId: 4, hotelName: "Radisson Blu Chattogram", hotelCity: "Chattogram", roomName: "Business Suite", checkIn: D(-1), checkOut: D(0), guests: 1, payment: "paid", status: "checked_out", amount: 16400, createdAt: D(-3) },
];

export const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

export const bookingStats = () => {
  const today = BOOKINGS.filter((b) => isToday(b.createdAt));
  return {
    todayBookings: today.length,
    todayRevenue: today.reduce((a, b) => a + (b.payment === "paid" ? b.amount : 0), 0),
    checkInsToday: BOOKINGS.filter((b) => isToday(b.checkIn)).length,
    checkOutsToday: BOOKINGS.filter((b) => isToday(b.checkOut)).length,
    pendingPayments: BOOKINGS.filter((b) => b.payment === "pending").length,
    cancelledToday: BOOKINGS.filter((b) => b.status === "cancelled" && isToday(b.createdAt)).length,
  };
};

export const findBooking = (id: string) => BOOKINGS.find((b) => b.id === id) ?? null;
export const bookingsForHotel = (hotelId: number) => BOOKINGS.filter((b) => b.hotelId === hotelId);
