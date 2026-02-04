import { useState } from "react";
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
  PartyPopper
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
import { Hotel, Room } from "@/data/hotels";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel;
  room: Room;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

const BookingConfirmation = ({
  isOpen,
  onClose,
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
}: BookingConfirmationProps) => {
  const [step, setStep] = useState<"details" | "payment" | "confirmed">("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const nights = differenceInDays(checkOut, checkIn);
  const roomTotal = room.price * nights;
  const cleaningFee = 45;
  const serviceFee = Math.round(roomTotal * 0.12);
  const taxes = Math.round(roomTotal * 0.1);
  const grandTotal = roomTotal + cleaningFee + serviceFee + taxes;

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep("confirmed");
  };

  const handleClose = () => {
    setStep("details");
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
              <Button variant="hero" className="flex-1">
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
              </div>
            ) : (
              // Payment Form
              <div className="space-y-4 animate-fade-in">
                {/* Price Breakdown */}
                <div className="bg-secondary/20 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold mb-3">Price Details</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">${room.price} × {nights} night{nights > 1 ? "s" : ""}</span>
                    <span>${roomTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cleaning fee</span>
                    <span>${cleaningFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>${serviceFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                    <span>${taxes}</span>
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
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
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
