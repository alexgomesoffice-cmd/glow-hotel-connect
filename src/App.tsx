import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import HotelDetail from "./pages/HotelDetail";
import Destinations from "./pages/Destinations";
import Popular from "./pages/Popular";
import CarRental from "./pages/CarRental";
import Attractions from "./pages/Attractions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ExploreHotels from "./pages/ExploreHotels";
import SearchHotels from "./pages/SearchHotels";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import AdminAddHotel from "./pages/admin/AdminAddHotel";
import AdminCurrentHotels from "./pages/admin/AdminCurrentHotels";
import AdminUpdateHotel from "./pages/admin/AdminUpdateHotel";
import AdminEraseHotel from "./pages/admin/AdminEraseHotel";
import AdminClientList from "./pages/admin/AdminClientList";
import AdminUpdateClient from "./pages/admin/AdminUpdateClient";
import AdminEraseClient from "./pages/admin/AdminEraseClient";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

// Hotel Admin
import HotelAdminLayout from "./components/hotel-admin/HotelAdminLayout";
import HotelAdminOverview from "./pages/hotel-admin/HotelAdminOverview";
import HotelAdminRooms from "./pages/hotel-admin/HotelAdminRooms";
import HotelAdminAddRoom from "./pages/hotel-admin/HotelAdminAddRoom";
import HotelAdminReservations from "./pages/hotel-admin/HotelAdminReservations";
import HotelAdminRevenue from "./pages/hotel-admin/HotelAdminRevenue";
import HotelAdminReviews from "./pages/hotel-admin/HotelAdminReviews";
import HotelAdminSettings from "./pages/hotel-admin/HotelAdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/hotel/:id" element={<HotelDetail />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/car-rental" element={<CarRental />} />
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/explore" element={<ExploreHotels />} />
            <Route path="/search" element={<SearchHotels />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardHome />} />
              <Route path="add-hotel" element={<AdminAddHotel />} />
              <Route path="hotels" element={<AdminCurrentHotels />} />
              <Route path="update-hotel/:id" element={<AdminUpdateHotel />} />
              <Route path="erase-hotel" element={<AdminEraseHotel />} />
              <Route path="clients" element={<AdminClientList />} />
              <Route path="update-client" element={<AdminUpdateClient />} />
              <Route path="erase-client" element={<AdminEraseClient />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Hotel Admin Routes */}
            <Route path="/hotel-admin" element={<HotelAdminLayout />}>
              <Route index element={<HotelAdminOverview />} />
              <Route path="rooms" element={<HotelAdminRooms />} />
              <Route path="add-room" element={<HotelAdminAddRoom />} />
              <Route path="reservations" element={<HotelAdminReservations />} />
              <Route path="revenue" element={<HotelAdminRevenue />} />
              <Route path="reviews" element={<HotelAdminReviews />} />
              <Route path="settings" element={<HotelAdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
