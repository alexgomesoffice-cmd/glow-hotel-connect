import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Globe, BedDouble, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminData, formatCurrency } from "@/data/adminStore";

const AdminClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { data } = useAdminData();

  const client = data.clients.find((c) => c.id === Number(clientId));
  const clientBookings = data.bookings.filter((b) => b.clientId === Number(clientId));
  const totalSpent = clientBookings.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.amount, 0);

  if (!client) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
        <Mail className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-2">Client not found</h2>
      <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button variant="outline" size="icon" className="shrink-0 hover:border-primary/50 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary-foreground">{client.avatar}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">Client Profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <Card className="relative overflow-hidden hover-lift">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stays</p>
                <p className="text-2xl font-bold mt-1">{clientBookings.length}</p>
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
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          </CardContent>
        </Card>
      </div>

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
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{client.name}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Mail className="h-3 w-3 text-primary" />{client.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Phone className="h-3 w-3 text-green-500" />{client.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Date of Birth</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Calendar className="h-3 w-3 text-amber-500" />{client.dob}</span>
            </div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Gender</span><Badge variant="secondary" className="capitalize">{client.gender}</Badge></div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              Location & ID
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><MapPin className="h-3 w-3 text-destructive" />{client.address}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Country</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Globe className="h-3 w-3 text-primary" />{client.country}</span>
            </div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">NID</span><span className="text-sm font-medium">{client.nid}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Passport</span><span className="text-sm font-medium">{client.passport}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminClientProfile;
