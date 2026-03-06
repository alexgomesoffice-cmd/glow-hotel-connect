import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Globe, BedDouble, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const guests: Record<string, any> = {
  g1: { name: "Alice Martin", email: "alice@email.com", phone: "+1 555 0101", dob: "1992-03-15", gender: "Female", address: "45 Park Ave, New York", country: "USA", totalStays: 5, totalSpent: "$4,200" },
  g2: { name: "Robert Kim", email: "robert@email.com", phone: "+1 555 0102", dob: "1988-07-22", gender: "Male", address: "12 Ocean Dr, Miami", country: "USA", totalStays: 3, totalSpent: "$1,800" },
  g3: { name: "Sophie Chen", email: "sophie@email.com", phone: "+1 555 0103", dob: "1995-11-08", gender: "Female", address: "88 Dragon St, San Francisco", country: "USA", totalStays: 2, totalSpent: "$960" },
  g4: { name: "James Wilson", email: "james@email.com", phone: "+1 555 0104", dob: "1985-01-30", gender: "Male", address: "7 King's Rd, London", country: "UK", totalStays: 7, totalSpent: "$8,400" },
  g5: { name: "Emma Davis", email: "emma@email.com", phone: "+1 555 0105", dob: "1993-06-12", gender: "Female", address: "23 Elm St, Boston", country: "USA", totalStays: 1, totalSpent: "$500" },
};

const HotelAdminGuestProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const guest = guests[id || ""];

  if (!guest) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
        <Mail className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-2">Guest not found</h2>
      <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button variant="outline" size="icon" className="shrink-0 hover:border-primary/50 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary-foreground">{guest.name.split(" ").map((n: string) => n[0]).join("")}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{guest.name}</h1>
            <p className="text-muted-foreground">Guest Profile</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <Card className="relative overflow-hidden hover-lift">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stays</p>
                <p className="text-2xl font-bold mt-1">{guest.totalStays}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
                <BedDouble className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden hover-lift">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1">{guest.totalSpent}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          </CardContent>
        </Card>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Mail className="h-4 w-4 text-primary-foreground" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{guest.name}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Mail className="h-3 w-3 text-primary" />{guest.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Phone className="h-3 w-3 text-green-500" />{guest.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Date of Birth</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Calendar className="h-3 w-3 text-amber-500" />{guest.dob}</span>
            </div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Gender</span><Badge variant="secondary">{guest.gender}</Badge></div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><MapPin className="h-3 w-3 text-destructive" />{guest.address}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Country</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Globe className="h-3 w-3 text-primary" />{guest.country}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotelAdminGuestProfile;
