import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Eye, Search, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { fetchEndUsers, fetchBookings, EndUserResponse, BookingResponse } from "@/services/adminApi";
import { apiDelete, apiPut } from "@/utils/api";

const AdminClientList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<EndUserResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [eraseTarget, setEraseTarget] = useState<number | null>(null);
  const [blockTarget, setBlockTarget] = useState<number | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        const [clientsData, bookingsData] = await Promise.all([
          fetchEndUsers({ take: 100 }),
          fetchBookings({ limit: 100 }),
        ]);
        setClients(clientsData);
        setBookings(bookingsData);
        setIsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load clients";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Error loading clients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [toast]);

  const bookingCountByClient = useMemo(
    () => bookings.reduce<Record<number, number>>((acc, b) => { acc[b.end_user_id] = (acc[b.end_user_id] || 0) + 1; return acc; }, {}),
    [bookings],
  );

  const filteredClients = clients.filter(
    (c) => (c.name?.toLowerCase().includes(search.toLowerCase()) ?? false) || c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const eraseClient = async () => {
    if (!eraseTarget) return;
    const client = clients.find((c) => c.end_user_id === eraseTarget);
    
    try {
      const response = await apiDelete(`/end-users/${eraseTarget}`);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to delete client");
      }

      setClients(clients.filter((c) => c.end_user_id !== eraseTarget));
      toast({
        title: "Client Erased",
        description: `${client?.name || "Client"} has been permanently removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete client",
        variant: "destructive"
      });
    }
    setEraseTarget(null);
  };

  const toggleBlock = async () => {
    if (!blockTarget) return;
    const client = clients.find((c) => c.end_user_id === blockTarget);
    
    try {
      const newBlockStatus = !client?.is_blocked;
      const response = await apiPut(`/end-users/${blockTarget}/block`, {
        is_blocked: newBlockStatus,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update block status");
      }

      // Update the client in the list
      setClients(clients.map((c) => 
        c.end_user_id === blockTarget ? { ...c, is_blocked: newBlockStatus } : c
      ));

      toast({
        title: "Client Status Updated",
        description: `${client?.name || "Client"} has been ${newBlockStatus ? "blocked" : "unblocked"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update block status",
        variant: "destructive"
      });
    }
    setBlockTarget(null);
  };

  const eraseClientObj = clients.find((c) => c.end_user_id === eraseTarget);
  const blockClientObj = clients.find((c) => c.end_user_id === blockTarget);

  return (
    <div className="space-y-6">
      <div className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <h1 className="text-2xl sm:text-3xl font-bold">Client List</h1>
        <p className="text-muted-foreground">Manage consumers, edit details, review booking history, or erase them completely.</p>
      </div>

      <div className={`relative max-w-md ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients by name or email..." className="pl-10" />
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No clients found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Bookings</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const initials = client.name
                    ? client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "U";

                  return (
                    <TableRow key={client.end_user_id} className="cursor-pointer" onClick={() => navigate(`/admin/update-client/${client.end_user_id}`)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                            {initials}
                          </div>
                          <span className="font-medium">{client.name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{client.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{bookingCountByClient[client.end_user_id] || 0}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{new Date(client.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="See history" onClick={() => navigate(`/admin/client-history/${client.end_user_id}`)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit user" onClick={() => navigate(`/admin/update-client/${client.end_user_id}`)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Erase user" onClick={() => setEraseTarget(client.end_user_id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Switch checked={!client.is_blocked} onCheckedChange={() => setBlockTarget(client.end_user_id)} />
                          <span className={`text-xs font-medium ${client.is_blocked ? "text-destructive" : "text-primary"}`}>
                            {client.is_blocked ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filteredClients.length === 0 && <p className="py-8 text-center text-muted-foreground">No clients found.</p>}

      <ConfirmDialog
        open={!!eraseTarget}
        onOpenChange={(open) => !open && setEraseTarget(null)}
        title="Erase this client?"
        description={`Are you sure you want to permanently erase ${eraseClientObj?.name || "this client"} and remove all their bookings? This cannot be undone.`}
        confirmLabel="Yes, Erase"
        onConfirm={eraseClient}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!blockTarget}
        onOpenChange={(open) => !open && setBlockTarget(null)}
        title={blockClientObj?.is_blocked ? "Unblock this client?" : "Block this client?"}
        description={`Are you sure you want to ${blockClientObj?.is_blocked ? "unblock" : "block"} ${blockClientObj?.name || "this client"}?`}
        confirmLabel={blockClientObj?.is_blocked ? "Yes, Unblock" : "Yes, Block"}
        onConfirm={toggleBlock}
        variant={blockClientObj?.is_blocked ? "default" : "destructive"}
      />
    </div>
  );
};

export default AdminClientList;
