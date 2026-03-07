import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import HotelDetail from "./pages/HotelDetail";
import Destinations from "./pages/Destinations";
import DestinationHotels from "./pages/DestinationHotels";
import Popular from "./pages/Popular";
import CarRental from "./pages/CarRental";
import Attractions from "./pages/Attractions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import HotelAdminLogin from "./pages/HotelAdminLogin";
import NotFound from "./pages/NotFound";
import ExploreHotels from "./pages/ExploreHotels";
import SearchHotels from "./pages/SearchHotels";
import UserProfile from "./pages/UserProfile";
import MyBookings from "./pages/MyBookings";
import UserSettings from "./pages/UserSettings";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import AdminAddHotel from "./pages/admin/AdminAddHotel";
import AdminCurrentHotels from "./pages/admin/AdminCurrentHotels";
import AdminUpdateHotel from "./pages/admin/AdminUpdateHotel";
import AdminEraseHotel from "./pages/admin/AdminEraseHotel";
import AdminClientList from "./pages/admin/AdminClientList";
import AdminUpdateClient from "./pages/admin/AdminUpdateClient";
import AdminClientHistory from "./pages/admin/AdminClientHistory";
import AdminClientProfile from "./pages/admin/AdminClientProfile";
import AdminEraseClient from "./pages/admin/AdminEraseClient";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminHotelBookings from "./pages/admin/AdminHotelBookings";
import AdminBookingDetail from "./pages/admin/AdminBookingDetail";
import AdminAllBookings from "./pages/admin/AdminAllBookings";
import AdminAddSystemAdmin from "./pages/admin/AdminAddSystemAdmin";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import HotelAdminLayout from "./components/hotel-admin/HotelAdminLayout";
import HotelAdminOverview from "./pages/hotel-admin/HotelAdminOverview";
import HotelAdminRooms from "./pages/hotel-admin/HotelAdminRooms";
import HotelAdminAddRoom from "./pages/hotel-admin/HotelAdminAddRoom";
import HotelAdminReservations from "./pages/hotel-admin/HotelAdminReservations";
import HotelAdminReservationDetail from "./pages/hotel-admin/HotelAdminReservationDetail";
import HotelAdminAddSubAdmin from "./pages/hotel-admin/HotelAdminAddSubAdmin";
import HotelAdminGuestProfile from "./pages/hotel-admin/HotelAdminGuestProfile";
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
            <Route path="/destination/:name" element={<DestinationHotels />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/car-rental" element={<CarRental />} />
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/hotel-admin-login" element={<HotelAdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/explore" element={<ExploreHotels />} />
            <Route path="/search" element={<SearchHotels />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/user-settings" element={<UserSettings />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardHome />} />
              <Route path="add-hotel" element={<AdminAddHotel />} />
              <Route path="add-system-admin" element={<AdminAddSystemAdmin />} />
              <Route path="hotels" element={<AdminCurrentHotels />} />
              <Route path="update-hotel/:id" element={<AdminUpdateHotel />} />
              <Route path="erase-hotel" element={<AdminEraseHotel />} />
              <Route path="clients" element={<AdminClientList />} />
              <Route path="update-client/:id" element={<AdminUpdateClient />} />
              <Route path="client-history/:id" element={<AdminClientHistory />} />
              <Route path="client-profile/:clientId" element={<AdminClientProfile />} />
              <Route path="erase-client" element={<AdminEraseClient />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="bookings/hotel/:hotelId" element={<AdminHotelBookings />} />
              <Route path="booking/:bookingId" element={<AdminBookingDetail />} />
              <Route path="all-bookings" element={<AdminAllBookings />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="/hotel-admin" element={<HotelAdminLayout />}>
              <Route index element={<HotelAdminOverview />} />
              <Route path="rooms" element={<HotelAdminRooms />} />
              <Route path="add-room" element={<HotelAdminAddRoom />} />
              <Route path="add-sub-admin" element={<HotelAdminAddSubAdmin />} />
              <Route path="reservations" element={<HotelAdminReservations />} />
              <Route path="reservations/:id" element={<HotelAdminReservationDetail />} />
              <Route path="guest/:id" element={<HotelAdminGuestProfile />} />
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
