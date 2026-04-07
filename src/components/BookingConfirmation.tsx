import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { 
  Check, 
  Calendar, 
  Users, 
  CreditCard, 
  Shield, 
  Clock,
  MapPin,
  Star,
  Sparkles,
  PartyPopper,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoggedInUser } from "@/utils/auth";

import { useToast } from "@/hooks/use-toast";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: any;
  room?: any; // Made room optional
  checkIn: Date;
  checkOut: Date;
  guests: number;
  selectedRoomCounts: Record<string, number>; // Added selectedRoomCounts prop
  grandTotal: number; // Added grandTotal prop
}

const BookingConfirmation = ({
  isOpen,
  onClose,
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
  selectedRoomCounts,
  grandTotal,
}: BookingConfirmationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"details" | "payment" | "confirmed">("details");
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const nights = differenceInDays(checkOut, checkIn);

  const handleConfirmBooking = async () => {
    setIsReserving(true);
    // Simulate payment processing - placeholder for future payment system
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsReserving(false);
    setStep("confirmed");
  };

  const handleReserveBooking = async () => {
    try {
      setError(null);
      const user = getLoggedInUser();

      if (!user) {
        setError("You must be logged in to make a reservation");
        toast({
          title: "Error",
          description: "Please log in to make a reservation",
          variant: "destructive",
        });
        return;
      }

      setIsReserving(true);

      console.log("[BOOKING] Attempting to create booking with data:", {
        hotel_id: hotel.id,
        check_in: format(checkIn, "yyyy-MM-dd"),
        check_out: format(checkOut, "yyyy-MM-dd"),
        room_id: room.id,
      });

      // Call backend API to create booking
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          hotel_id: hotel.id || 1,
          check_in: format(checkIn, "yyyy-MM-dd"),
          check_out: format(checkOut, "yyyy-MM-dd"),
          rooms: [
            {
              hotel_room_id: room.id || 1,
              quantity: selectedRoomCounts[room.id] || 1,
            },
          ],
          special_request: guestInfo.specialRequests || null,
          total_price: grandTotal,
        }),
      });

      console.log("[BOOKING] Response status:", response.status, response.statusText);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData;
        
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error("[BOOKING] Non-JSON response:", text);
          throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
        
        throw new Error(errorData.message || "Failed to create booking");
      }

      const bookingData = await response.json();

      console.log("[BOOKING] Booking created successfully:", bookingData.data);

      toast({
        title: "Success",
        description: "Booking reserved successfully!",
      });

      // Show confirmation screen
      setStep("confirmed");

      // After 2 seconds, close and navigate
      setTimeout(() => {
        setIsReserving(false);
        handleClose();
        navigate("/my-bookings");
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to reserve booking";
      console.error("[BOOKING] Error:", errorMsg);
      setError(errorMsg);
      setIsReserving(false);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setStep("details");
    setError(null);
    setGuestInfo({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialRequests: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass border-border/50">
        {step === "confirmed" ? (
          // Confirmation Success Screen
          <div className="text-center py-8 animate-fade-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center animate-scale-in">
                <PartyPopper className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-2 animate-fade-in-up">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Your reservation has been successfully processed
            </p>

            <div className="bg-secondary/30 rounded-2xl p-6 mb-6 text-left animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {hotel.location}
                  </p>
                  <p className="text-primary font-medium mt-1">{room.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Check-in</span>
                  <p className="font-medium">{format(checkIn, "EEE, MMM d, yyyy")}</p>
                  <p className="text-muted-foreground text-xs">After 3:00 PM</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Check-out</span>
                  <p className="font-medium">{format(checkOut, "EEE, MMM d, yyyy")}</p>
                  <p className="text-muted-foreground text-xs">Before 11:00 AM</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Confirmation #</span>
                  <span className="font-mono font-semibold text-primary">
                    SV-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Back to Hotel
              </Button>
              <Button variant="hero" className="flex-1" onClick={() => { handleClose(); navigate("/my-bookings"); }}>
                View My Bookings
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {step === "details" ? (
                  <>
                    <Sparkles className="w-6 h-6 text-primary" />
                    Complete Your Booking
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6 text-primary" />
                    Payment Details
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${step === "details" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">1</span>
                <span className="text-sm font-medium">Details</span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">2</span>
                <span className="text-sm font-medium">Payment</span>
              </div>
            </div>

            {/* Booking Summary Card */}
            <div className="bg-secondary/30 rounded-2xl p-4 mb-6">
              <div className="flex gap-4">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{hotel.name}</h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {hotel.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="font-medium">{hotel.rating}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="text-primary font-medium">{room.name}</p>
                    <p className="text-muted-foreground">{room.beds} • {room.size} m²</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Dates</p>
                    <p className="font-medium">{nights} night{nights > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Check-in</p>
                    <p className="font-medium">{format(checkIn, "MMM d")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Guests</p>
                    <p className="font-medium">{guests} guest{guests > 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
            </div>

            {step === "details" ? (
              // Guest Details Form
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="requests">Special Requests (optional)</Label>
                  <Input
                    id="requests"
                    placeholder="Early check-in, extra pillows, etc."
                    value={guestInfo.specialRequests}
                    onChange={(e) => setGuestInfo({ ...guestInfo, specialRequests: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full mt-4"
                  onClick={() => setStep("payment")}
                  disabled={!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email}
                >
                  Continue to Payment
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mt-3 border-amber-400 text-amber-600 hover:bg-amber-500/10"
                  onClick={handleReserveBooking}
                  disabled={!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || isReserving}
                >
                  {isReserving ? "Reserving..." : "Save & Skip Payment"}
                </Button>
              </div>
            ) : (
              // Payment Form
              <div className="space-y-4 animate-fade-in">
                {/* Price Breakdown */}
                <div className="bg-secondary/20 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold mb-3">Price Details</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Room charges × {nights} night{nights > 1 ? "s" : ""}</span>
                    <span>${(grandTotal / 1.12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>${(grandTotal - (grandTotal / 1.12)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-gradient text-xl">${grandTotal}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label>Card Number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    className="mt-1.5 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Expiry Date</Label>
                    <Input placeholder="MM/YY" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>CVC</Label>
                    <Input placeholder="123" className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label>Name on Card</Label>
                  <Input placeholder="JOHN DOE" className="mt-1.5 uppercase" />
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 rounded-lg p-3">
                  <Shield className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep("details")}
                  >
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    onClick={handleConfirmBooking}
                    disabled={isReserving}
                  >
                    {isReserving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Pay $${grandTotal}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingConfirmation;
