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

// Manager
import ManagerLayout from "./components/manager/ManagerLayout";
import ManagerOverview from "./pages/manager/ManagerOverview";
import ManagerRooms from "./pages/manager/ManagerRooms";
import ManagerAddRoom from "./pages/manager/ManagerAddRoom";
import ManagerReservations from "./pages/manager/ManagerReservations";
import ManagerRevenue from "./pages/manager/ManagerRevenue";
import ManagerReviews from "./pages/manager/ManagerReviews";
import ManagerSettings from "./pages/manager/ManagerSettings";

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
              <Route path="update-hotel" element={<AdminUpdateHotel />} />
              <Route path="erase-hotel" element={<AdminEraseHotel />} />
              <Route path="clients" element={<AdminClientList />} />
              <Route path="update-client" element={<AdminUpdateClient />} />
              <Route path="erase-client" element={<AdminEraseClient />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Manager Routes */}
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<ManagerOverview />} />
              <Route path="rooms" element={<ManagerRooms />} />
              <Route path="add-room" element={<ManagerAddRoom />} />
              <Route path="reservations" element={<ManagerReservations />} />
              <Route path="revenue" element={<ManagerRevenue />} />
              <Route path="reviews" element={<ManagerReviews />} />
              <Route path="settings" element={<ManagerSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
