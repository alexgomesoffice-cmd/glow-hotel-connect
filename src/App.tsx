import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import HotelDetail from "./pages/HotelDetail";
import Destinations from "./pages/Destinations";
import Popular from "./pages/Popular";
import CarRental from "./pages/CarRental";
import Attractions from "./pages/Attractions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ManagerLayout from "./components/manager/ManagerLayout";
import ManagerOverview from "./pages/manager/ManagerOverview";
import ManagerHotels from "./pages/manager/ManagerHotels";
import ManagerRooms from "./pages/manager/ManagerRooms";
import ManagerAddHotel from "./pages/manager/ManagerAddHotel";
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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<ManagerOverview />} />
              <Route path="hotels" element={<ManagerHotels />} />
              <Route path="rooms" element={<ManagerRooms />} />
              <Route path="add-hotel" element={<ManagerAddHotel />} />
              <Route path="add-room" element={<ManagerAddRoom />} />
              <Route path="reservations" element={<ManagerReservations />} />
              <Route path="revenue" element={<ManagerRevenue />} />
              <Route path="reviews" element={<ManagerReviews />} />
              <Route path="settings" element={<ManagerSettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
