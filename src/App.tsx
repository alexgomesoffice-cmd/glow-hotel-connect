import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/utils/ProtectedRoute";
import Index from "./pages/Index";
import HotelDetail from "./pages/HotelDetail";
import Destinations from "./pages/Destinations";
import DestinationHotels from "./pages/DestinationHotels";
import Popular from "./pages/Popular";
import CarRental from "./pages/CarRental";
import Attractions from "./pages/Attractions";
import Blog from "./pages/Blog";
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
import OpsShell from "./components/admin/ops/OpsShell";
import OpsDashboard from "./pages/admin/ops/OpsDashboard";
import OpsWorkQueue from "./pages/admin/ops/OpsWorkQueue";
import OpsCaseReview from "./pages/admin/ops/OpsCaseReview";
import OpsHotels from "./pages/admin/ops/OpsHotels";
import OpsHotelWorkspace from "./pages/admin/ops/OpsHotelWorkspace";
import OpsCatalog from "./pages/admin/ops/OpsCatalog";
import OpsPlatformSettings from "./pages/admin/ops/OpsPlatformSettings";
import OpsBookings from "./pages/admin/ops/OpsBookings";
import OpsBookingDetail from "./pages/admin/ops/OpsBookingDetail";
import OpsActivityLog from "./pages/admin/ops/OpsActivityLog";
import OpsCreateHotel from "./pages/admin/ops/OpsCreateHotel";
import AdminClientList from "./pages/admin/AdminClientList";
import AdminUpdateClient from "./pages/admin/AdminUpdateClient";
import AdminClientHistory from "./pages/admin/AdminClientHistory";
import AdminClientProfile from "./pages/admin/AdminClientProfile";
import AdminBookingDetail from "./pages/admin/AdminBookingDetail";
import AdminAllBookings from "./pages/admin/AdminAllBookings";
import AdminAddSystemAdmin from "./pages/admin/AdminAddSystemAdmin";
import AdminHotelBookings from "./pages/admin/AdminHotelBookings";
import HotelAdminLayout from "./components/hotel-admin/HotelAdminLayout";
import HotelAdminOverview from "./pages/hotel-admin/HotelAdminOverview";
import HotelAdminRooms from "./pages/hotel-admin/HotelAdminRooms";
import HotelAdminAddRoom from "./pages/hotel-admin/HotelAdminAddRoom";
import HotelAdminEditRoom from "./pages/hotel-admin/HotelAdminEditRoom";
import HotelAdminReservations from "./pages/hotel-admin/HotelAdminReservations";
import HotelAdminReservationDetail from "./pages/hotel-admin/HotelAdminReservationDetail";
import HotelAdminAddSubAdmin from "./pages/hotel-admin/HotelAdminAddSubAdmin";
import HotelAdminGuests from "./pages/hotel-admin/HotelAdminGuests";
import HotelAdminGuestProfile from "./pages/hotel-admin/HotelAdminGuestProfile";
import HotelAdminPropertyListing from "./pages/hotel-admin/HotelAdminPropertyListing";
import HotelAdminDraftCenter from "./pages/hotel-admin/HotelAdminDraftCenter";
import HotelAdminDocuments from "./pages/hotel-admin/HotelAdminDocuments";
import { HotelAdminTeam, HotelAdminTeamDetail } from "./pages/hotel-admin/HotelAdminTeam";
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
            <Route path="/blog" element={<Blog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/hotel-admin-login" element={<HotelAdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/explore" element={<ExploreHotels />} />
            <Route path="/search" element={<SearchHotels />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/user-settings" element={<UserSettings />} />

            <Route path="/admin" element={<ProtectedRoute element={<OpsShell />} requiredRole="SYSTEM_ADMIN" />}>
              <Route index element={<OpsDashboard />} />
              <Route path="work-queue" element={<OpsWorkQueue />} />
              <Route path="cases/:id" element={<OpsCaseReview />} />
              <Route path="hotels" element={<OpsHotels />} />
              <Route path="hotels/new" element={<OpsCreateHotel />} />
              <Route path="hotels/:id" element={<OpsHotelWorkspace />} />
              <Route path="bookings" element={<OpsBookings />} />
              <Route path="all-bookings" element={<OpsBookings />} />
              <Route path="bookings/hotel/:hotelId" element={<AdminHotelBookings />} />
              <Route path="booking/:id" element={<OpsBookingDetail />} />
              <Route path="booking/:bookingId/legacy" element={<AdminBookingDetail />} />
              <Route path="activity" element={<OpsActivityLog />} />
              <Route path="clients" element={<AdminClientList />} />
              <Route path="update-client/:id" element={<AdminUpdateClient />} />
              <Route path="client-history/:id" element={<AdminClientHistory />} />
              <Route path="client-profile/:clientId" element={<AdminClientProfile />} />
              <Route path="catalog/cities" element={<OpsCatalog kind="cities" />} />
              <Route path="catalog/hotel-types" element={<OpsCatalog kind="hotel-types" />} />
              <Route path="catalog/amenities" element={<OpsCatalog kind="amenities" />} />
              <Route path="catalog/bed-types" element={<OpsCatalog kind="bed-types" />} />
              <Route path="system-admins" element={<AdminAddSystemAdmin />} />
              <Route path="platform-settings" element={<OpsPlatformSettings />} />
              <Route path="all-bookings-legacy" element={<AdminAllBookings />} />
            </Route>

            <Route path="/hotel-admin" element={<ProtectedRoute element={<HotelAdminLayout />} requiredRole="HOTEL_ADMIN" />}>
              <Route index element={<HotelAdminOverview />} />
              <Route path="rooms" element={<HotelAdminRooms />} />
              <Route path="add-room" element={<HotelAdminAddRoom />} />
              <Route path="edit-room/:roomDetailsId" element={<HotelAdminEditRoom />} />
              <Route path="add-sub-admin" element={<HotelAdminAddSubAdmin />} />
              <Route path="listing" element={<HotelAdminPropertyListing />} />
              <Route path="drafts" element={<HotelAdminDraftCenter />} />
              <Route path="documents" element={<HotelAdminDocuments />} />
              <Route path="guests" element={<HotelAdminGuests />} />
              <Route path="team" element={<HotelAdminTeam />} />
              <Route path="team/:id" element={<HotelAdminTeamDetail />} />
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
