import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Globe, BedDouble, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchEndUsers, fetchBookings, EndUserResponse, BookingResponse } from "@/services/adminApi";
import { useState, useEffect } from "react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const AdminClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<EndUserResponse | null>(null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [endUsersData, bookingsData] = await Promise.all([
          fetchEndUsers(),
          fetchBookings()
        ]);

        const foundClient = endUsersData.find(c => c.end_user_id === Number(clientId));
        if (!foundClient) {
          toast({
            title: "Not Found",
            description: "Client not found",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }

        setClient(foundClient);
        setBookings(bookingsData.filter(b => b.end_user_id === Number(clientId)));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load client data";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientId, toast, navigate]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading client profile...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Client not found</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const totalSpent = bookings.filter((b) => b.payment_status === "paid").reduce((s, b) => s + b.total_amount, 0);
  const initials = client.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button variant="outline" size="icon" className="shrink-0 hover:border-primary/50 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary-foreground">{initials}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{client.name || "Unknown Guest"}</h1>
            <p className="text-muted-foreground">Guest Profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <Card className="relative overflow-hidden hover-lift">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stays</p>
                <p className="text-2xl font-bold mt-1">{bookings.length}</p>
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
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Guest ID</span><span className="text-sm font-medium">#{client.end_user_id}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Mail className="h-3 w-3 text-primary" />{client.email}</span>
            </div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{client.name || "Not provided"}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Account Status</span><Badge variant={client.is_blocked ? "destructive" : "default"}>{client.is_blocked ? "Blocked" : "Active"}</Badge></div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Calendar className="h-4 w-4 text-primary-foreground" />
              </div>
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><Calendar className="h-3 w-3 text-amber-500" />{new Date(client.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Bookings</span><span className="text-sm font-medium">{bookings.length}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Revenue</span><span className="text-sm font-medium">{formatCurrency(totalSpent)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminClientProfile;
