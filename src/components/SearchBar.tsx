import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, Calendar as CalendarIcon, Users, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SearchBar = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setIsGuestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    params.set("guests", String(guests));
    params.set("rooms", String(rooms));
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "400ms" }}>
      <div className="glass rounded-2xl p-3 sm:p-4 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-shadow duration-500 group/bar">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover/bar:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1.2fr_1.2fr_1.3fr_auto] gap-3 sm:gap-4">
          {/* Location */}
          <div className="relative group">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block pl-1 group-focus-within:text-primary transition-colors">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all duration-300 group-focus-within:scale-110" />
              <Input
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 bg-secondary/30 border-border/50 hover:border-primary/40 focus:border-primary transition-all duration-300 hover:bg-secondary/40"
              />
            </div>
          </div>

          {/* Check-in */}
          <div className="relative group">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block pl-1">
              Check-in
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center w-full h-12 rounded-xl border border-border/50 bg-secondary/30 px-4 text-sm hover:border-primary/40 transition-all duration-300 hover:bg-secondary/40 gap-2",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="truncate">{checkIn ? format(checkIn, "MMM dd, yyyy") : "Add date"}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div className="relative group">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block pl-1">
              Check-out
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center w-full h-12 rounded-xl border border-border/50 bg-secondary/30 px-4 text-sm hover:border-primary/40 transition-all duration-300 hover:bg-secondary/40 gap-2",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="truncate">{checkOut ? format(checkOut, "MMM dd, yyyy") : "Add date"}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < (checkIn || new Date())}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests & Rooms Dropdown */}
          <div className="relative" ref={guestRef}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block pl-1">
              Guests & Rooms
            </label>
            <button
              type="button"
              onClick={() => setIsGuestOpen(!isGuestOpen)}
              className="flex items-center justify-between w-full h-12 rounded-xl border border-border/50 bg-secondary/30 px-4 text-sm hover:border-primary/40 transition-all duration-300 hover:bg-secondary/40"
            >
              <Users className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
              <span className="truncate text-left flex-1">
                {guests} {guests === 1 ? "Guest" : "Guests"} · {rooms} {rooms === 1 ? "Room" : "Rooms"}
              </span>
            </button>

            {isGuestOpen && (
              <div className="absolute top-full left-0 w-64 mt-2 rounded-xl border border-border bg-card p-4 shadow-xl z-50 space-y-4 animate-fade-in-down">
                {/* Guests row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Guests</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                      disabled={guests <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-semibold">{guests}</span>
                    <button
                      type="button"
                      onClick={() => setGuests(Math.min(6, guests + 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                      disabled={guests >= 6}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Rooms row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rooms</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                      disabled={rooms <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-semibold">{rooms}</span>
                    <button
                      type="button"
                      onClick={() => setRooms(Math.min(8, rooms + 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                      disabled={rooms >= 8}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button onClick={handleSearch} variant="hero" className="w-full h-12 gap-2 group/btn relative overflow-hidden px-5">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <Search className="h-4 w-4 transition-transform group-hover/btn:scale-110 group-hover/btn:rotate-12" />
              <span>Search</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
