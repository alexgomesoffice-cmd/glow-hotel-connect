import { useEffect, useState } from "react";

export type Gender = "male" | "female" | "other";
export type BookingStatus = "confirmed" | "pending" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "refunded";

export interface AdminHotel {
  id: number;
  name: string;
  location: string;
  address: string;
  zipCode: string;
  description: string;
  type: string;
  stars: number;
  email: string;
  eContact1: string;
  eContact2: string;
  receptionNumber1: string;
  receptionNumber2: string;
  ownerName: string;
  managerName: string;
  managerPhone: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  adminPhone: string;
  adminNID: string;
  amenities: string[];
  rooms: string[];
  occupancy: number;
  rating: number;
  image: string;
}

export interface AdminClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  address: string;
  country: string;
  nid: string;
  passport: string;
  emergencyContact: string;
  joined: string;
  blocked: boolean;
  avatar: string;
}

export interface AdminBooking {
  id: number;
  hotelId: number;
  clientId: number;
  guestName: string;
  room: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookedAt: string;
}

export interface SystemAdminRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  dob: string;
  gender: Gender;
  address: string;
  nid: string;
  phone: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  password: string;
  dob: string;
  gender: Gender;
  address: string;
  nid: string;
  phone: string;
}

export interface AdminData {
  hotels: AdminHotel[];
  clients: AdminClient[];
  bookings: AdminBooking[];
  systemAdmins: SystemAdminRecord[];
  adminProfile: AdminProfile;
}

const STORAGE_KEY = "stayvista-admin-data";
const UPDATE_EVENT = "stayvista-admin-data-updated";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const getHotelEmoji = (type: string) => {
  const map: Record<string, string> = {
    hotel: "🏨",
    resort: "🏖️",
    boutique: "🏛️",
    hostel: "🛏️",
  };

  return map[type] || "🏨";
};

export const createAvatar = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const seedData: AdminData = {
  hotels: [
    {
      id: 1,
      name: "Grand Palace Hotel",
      location: "Dhaka",
      address: "123 Gulshan Avenue",
      zipCode: "1212",
      description: "A premium city hotel focused on business and luxury stays.",
      type: "hotel",
      stars: 5,
      email: "grandpalace@stayvista.com",
      eContact1: "+880 1711 123456",
      eContact2: "+880 1811 654321",
      receptionNumber1: "+880 2 9876543",
      receptionNumber2: "+880 2 1234567",
      ownerName: "Abdul Rahman",
      managerName: "Karim Hasan",
      managerPhone: "+880 1911 111222",
      adminEmail: "maria.garcia@stayvista.com",
      adminPassword: "admin123",
      adminName: "Maria Garcia",
      adminPhone: "+880 1611 333444",
      adminNID: "1234567890",
      amenities: ["Swimming Pool", "Free Wi-Fi", "Restaurant", "Parking", "Room Service"],
      rooms: ["Suite 301", "Deluxe 402", "Standard 112"],
      occupancy: 87,
      rating: 4.8,
      image: "🏨",
    },
    {
      id: 2,
      name: "Seaside Resort",
      location: "Cox's Bazar",
      address: "Beach Road, Kalatoli",
      zipCode: "4700",
      description: "A beachfront resort with family rooms and premium sea views.",
      type: "resort",
      stars: 4,
      email: "seaside@stayvista.com",
      eContact1: "+880 1712 222333",
      eContact2: "+880 1812 444555",
      receptionNumber1: "+880 341 765432",
      receptionNumber2: "+880 341 765433",
      ownerName: "Nusrat Jahan",
      managerName: "Imran Sarker",
      managerPhone: "+880 1912 555666",
      adminEmail: "john.smith@stayvista.com",
      adminPassword: "admin123",
      adminName: "John Smith",
      adminPhone: "+880 1612 777888",
      adminNID: "2234567890",
      amenities: ["Swimming Pool", "Free Wi-Fi", "Airport Shuttle", "Kids Play Area", "Parking"],
      rooms: ["Ocean 101", "Ocean Suite", "Family 201"],
      occupancy: 72,
      rating: 4.6,
      image: "🏖️",
    },
    {
      id: 3,
      name: "Mountain Lodge",
      location: "Sylhet",
      address: "Tea Estate Road",
      zipCode: "3100",
      description: "A quiet retreat with scenic rooms and curated nature stays.",
      type: "boutique",
      stars: 5,
      email: "mountainlodge@stayvista.com",
      eContact1: "+880 1713 123123",
      eContact2: "+880 1813 321321",
      receptionNumber1: "+880 821 123456",
      receptionNumber2: "+880 821 654321",
      ownerName: "Tariq Ahmed",
      managerName: "Sarah Lee",
      managerPhone: "+880 1913 101010",
      adminEmail: "sarah.lee@stayvista.com",
      adminPassword: "admin123",
      adminName: "Sarah Lee",
      adminPhone: "+880 1613 202020",
      adminNID: "3234567890",
      amenities: ["Free Wi-Fi", "Garden / Terrace", "CCTV Security", "Restaurant", "Power Backup"],
      rooms: ["Cabin 5", "Cabin 12", "Suite 8"],
      occupancy: 91,
      rating: 4.9,
      image: "🏔️",
    },
    {
      id: 4,
      name: "Urban Suites",
      location: "Chittagong",
      address: "Agrabad Commercial Area",
      zipCode: "4100",
      description: "A modern urban hotel for business travelers and city breaks.",
      type: "hotel",
      stars: 3,
      email: "urban@stayvista.com",
      eContact1: "+880 1714 909090",
      eContact2: "+880 1814 808080",
      receptionNumber1: "+880 31 222333",
      receptionNumber2: "+880 31 222334",
      ownerName: "Shamim Khan",
      managerName: "Afsana Noor",
      managerPhone: "+880 1914 707070",
      adminEmail: "afsana.noor@stayvista.com",
      adminPassword: "admin123",
      adminName: "Afsana Noor",
      adminPhone: "+880 1614 606060",
      adminNID: "4234567890",
      amenities: ["Free Wi-Fi", "Conference Room", "Elevator", "Parking", "24/7 Front Desk"],
      rooms: ["Standard 112", "Business 210", "Deluxe 305"],
      occupancy: 68,
      rating: 4.5,
      image: "🏢",
    },
  ],
  clients: [
    {
      id: 1,
      name: "Emma Wilson",
      email: "emma@email.com",
      phone: "+1 555 1234",
      dob: "1990-05-15",
      gender: "female",
      address: "123 Elm St, NY",
      country: "USA",
      nid: "NID-001234",
      passport: "P-US987654",
      emergencyContact: "+1 555 9999",
      joined: "2023-01-14",
      blocked: false,
      avatar: "EW",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael@email.com",
      phone: "+1 555 5678",
      dob: "1988-11-20",
      gender: "male",
      address: "456 Oak Ave, SF",
      country: "USA",
      nid: "NID-005678",
      passport: "P-US123456",
      emergencyContact: "+1 555 8888",
      joined: "2023-03-01",
      blocked: false,
      avatar: "MC",
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "+1 555 9012",
      dob: "1995-02-10",
      gender: "female",
      address: "789 Pine Rd, LA",
      country: "USA",
      nid: "NID-009012",
      passport: "P-US654321",
      emergencyContact: "+1 555 7777",
      joined: "2022-11-18",
      blocked: true,
      avatar: "SJ",
    },
    {
      id: 4,
      name: "David Brown",
      email: "david@email.com",
      phone: "+1 555 3456",
      dob: "1992-08-25",
      gender: "male",
      address: "321 Maple Dr, TX",
      country: "USA",
      nid: "NID-003456",
      passport: "P-US111222",
      emergencyContact: "+1 555 6666",
      joined: "2023-07-09",
      blocked: false,
      avatar: "DB",
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa@email.com",
      phone: "+1 555 7890",
      dob: "1985-12-01",
      gender: "female",
      address: "654 Birch Ln, WA",
      country: "USA",
      nid: "NID-007890",
      passport: "P-US333444",
      emergencyContact: "+1 555 5555",
      joined: "2022-09-03",
      blocked: false,
      avatar: "LA",
    },
  ],
  bookings: [
    {
      id: 1,
      hotelId: 1,
      clientId: 1,
      guestName: "Emma Wilson",
      room: "Suite 301",
      checkIn: "2025-02-15",
      checkOut: "2025-02-18",
      amount: 840,
      status: "confirmed",
      paymentStatus: "paid",
      bookedAt: "2025-02-01T10:30:00.000Z",
    },
    {
      id: 2,
      hotelId: 2,
      clientId: 2,
      guestName: "Michael Chen",
      room: "Ocean 101",
      checkIn: "2025-02-16",
      checkOut: "2025-02-20",
      amount: 780,
      status: "pending",
      paymentStatus: "unpaid",
      bookedAt: "2025-02-02T13:20:00.000Z",
    },
    {
      id: 3,
      hotelId: 3,
      clientId: 3,
      guestName: "Sarah Johnson",
      room: "Cabin 12",
      checkIn: "2025-02-17",
      checkOut: "2025-02-19",
      amount: 330,
      status: "confirmed",
      paymentStatus: "paid",
      bookedAt: "2025-02-03T16:05:00.000Z",
    },
    {
      id: 4,
      hotelId: 1,
      clientId: 4,
      guestName: "David Brown",
      room: "Deluxe 402",
      checkIn: "2025-02-18",
      checkOut: "2025-02-25",
      amount: 2240,
      status: "confirmed",
      paymentStatus: "paid",
      bookedAt: "2025-02-05T09:45:00.000Z",
    },
    {
      id: 5,
      hotelId: 1,
      clientId: 5,
      guestName: "Lisa Anderson",
      room: "Standard 112",
      checkIn: "2025-02-19",
      checkOut: "2025-02-21",
      amount: 560,
      status: "cancelled",
      paymentStatus: "refunded",
      bookedAt: "2025-02-06T12:10:00.000Z",
    },
    {
      id: 6,
      hotelId: 2,
      clientId: 1,
      guestName: "Emma Wilson",
      room: "Family 201",
      checkIn: "2025-03-02",
      checkOut: "2025-03-05",
      amount: 930,
      status: "confirmed",
      paymentStatus: "paid",
      bookedAt: "2025-02-11T08:20:00.000Z",
    },
    {
      id: 7,
      hotelId: 3,
      clientId: 2,
      guestName: "Michael Chen",
      room: "Suite 8",
      checkIn: "2025-03-10",
      checkOut: "2025-03-14",
      amount: 720,
      status: "pending",
      paymentStatus: "unpaid",
      bookedAt: "2025-02-12T14:00:00.000Z",
    },
    {
      id: 8,
      hotelId: 4,
      clientId: 3,
      guestName: "Sarah Johnson",
      room: "Business 210",
      checkIn: "2025-03-12",
      checkOut: "2025-03-15",
      amount: 610,
      status: "confirmed",
      paymentStatus: "paid",
      bookedAt: "2025-02-13T11:35:00.000Z",
    },
    {
      id: 9,
      hotelId: 4,
      clientId: 5,
      guestName: "Lisa Anderson",
      room: "Deluxe 305",
      checkIn: "2025-03-18",
      checkOut: "2025-03-22",
      amount: 880,
      status: "confirmed",
      paymentStatus: "paid",
      bookedAt: "2025-02-14T18:15:00.000Z",
    },
  ],
  systemAdmins: [
    {
      id: 1,
      name: "John Doe",
      email: "admin@stayvista.com",
      password: "admin123",
      dob: "1989-04-08",
      gender: "male",
      address: "Dhaka, Bangladesh",
      nid: "ADMIN-001",
      phone: "+880 1700 000001",
    },
    {
      id: 2,
      name: "Priya Ahmed",
      email: "priya@stayvista.com",
      password: "admin123",
      dob: "1991-09-22",
      gender: "female",
      address: "Chittagong, Bangladesh",
      nid: "ADMIN-002",
      phone: "+880 1700 000002",
    },
  ],
  adminProfile: {
    name: "John Doe",
    email: "admin@stayvista.com",
    password: "admin123",
    dob: "1989-04-08",
    gender: "male",
    address: "Dhaka, Bangladesh",
    nid: "ADMIN-001",
    phone: "+880 1700 000001",
  },
};

const getSeedData = () => clone(seedData);

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const getNextId = (items: Array<{ id: number }>) =>
  items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;

export const sortBookingsByRecent = (bookings: AdminBooking[]) =>
  [...bookings].sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

export const readAdminData = (): AdminData => {
  if (typeof window === "undefined") {
    return getSeedData();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = getSeedData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AdminData>;
    return {
      hotels: parsed.hotels ?? getSeedData().hotels,
      clients: parsed.clients ?? getSeedData().clients,
      bookings: parsed.bookings ?? getSeedData().bookings,
      systemAdmins: parsed.systemAdmins ?? getSeedData().systemAdmins,
      adminProfile: parsed.adminProfile ?? getSeedData().adminProfile,
    };
  } catch {
    const fallback = getSeedData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

export const writeAdminData = (data: AdminData) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(UPDATE_EVENT));
};

export const useAdminData = () => {
  const [data, setData] = useState<AdminData>(() => getSeedData());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sync = () => setData(readAdminData());
    sync();
    window.addEventListener(UPDATE_EVENT, sync);

    return () => window.removeEventListener(UPDATE_EVENT, sync);
  }, []);

  const saveData = (updater: AdminData | ((current: AdminData) => AdminData)) => {
    const current = readAdminData();
    const next = typeof updater === "function" ? updater(current) : updater;
    writeAdminData(next);
    setData(next);
  };

  return { data, saveData };
};
