import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Eye, Search, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminData } from "@/data/adminStore";
import { toast } from "@/hooks/use-toast";

const AdminClientList = () => {
  const navigate = useNavigate();
  const { data, saveData } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const bookingCountByClient = useMemo(
    () =>
      data.bookings.reduce<Record<number, number>>((accumulator, booking) => {
        accumulator[booking.clientId] = (accumulator[booking.clientId] || 0) + 1;
        return accumulator;
      }, {}),
    [data.bookings],
  );

  const filteredClients = data.clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleBlock = (id: number) => {
    const client = data.clients.find((item) => item.id === id);
    if (!client) return;

    saveData((current) => ({
      ...current,
      clients: current.clients.map((item) =>
        item.id === id ? { ...item, blocked: !item.blocked } : item,
      ),
    }));

    toast({
      title: client.blocked ? "User unblocked" : "User blocked",
      description: `${client.name} has been ${client.blocked ? "unblocked" : "blocked"}.`,
    });
  };

  const eraseClient = (id: number) => {
    const client = data.clients.find((item) => item.id === id);
    if (!client || !window.confirm(`Erase ${client.name} and remove all of this user's bookings?`)) {
      return;
    }

    saveData((current) => ({
      ...current,
      clients: current.clients.filter((item) => item.id !== id),
      bookings: current.bookings.filter((booking) => booking.clientId !== id),
    }));

    toast({ title: "Client erased", description: `${client.name} was permanently removed.` });
  };

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Bookings</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-center">Actions</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer" onClick={() => navigate(`/admin/update-client/${client.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                        {client.avatar}
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{client.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{client.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{bookingCountByClient[client.id] || 0}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{client.joined}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="See history" onClick={() => navigate(`/admin/client-history/${client.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit user" onClick={() => navigate(`/admin/update-client/${client.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Erase user" onClick={() => eraseClient(client.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Switch checked={!client.blocked} onCheckedChange={() => toggleBlock(client.id)} />
                      <span className={`text-xs font-medium ${client.blocked ? "text-destructive" : "text-primary"}`}>
                        {client.blocked ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredClients.length === 0 && <p className="py-8 text-center text-muted-foreground">No clients found.</p>}
    </div>
  );
};

export default AdminClientList;
