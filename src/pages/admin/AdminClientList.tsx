import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mail, Phone, Calendar, Eye, Edit, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

const initialClients = [
  { id: 1, name: "Emma Wilson", email: "emma@email.com", phone: "+1 555 1234", bookings: 5, joined: "Jan 2023", avatar: "EW", blocked: false },
  { id: 2, name: "Michael Chen", email: "michael@email.com", phone: "+1 555 5678", bookings: 3, joined: "Mar 2023", avatar: "MC", blocked: false },
  { id: 3, name: "Sarah Johnson", email: "sarah@email.com", phone: "+1 555 9012", bookings: 8, joined: "Nov 2022", avatar: "SJ", blocked: true },
  { id: 4, name: "David Brown", email: "david@email.com", phone: "+1 555 3456", bookings: 2, joined: "Jul 2023", avatar: "DB", blocked: false },
  { id: 5, name: "Lisa Anderson", email: "lisa@email.com", phone: "+1 555 7890", bookings: 12, joined: "Sep 2022", avatar: "LA", blocked: false },
];

const AdminClientList = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState(initialClients);

  useEffect(() => { setIsLoaded(true); }, []);

  const toggleBlock = (id: number) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newBlocked = !c.blocked;
          toast({ title: newBlocked ? "User Blocked" : "User Unblocked", description: `${c.name} has been ${newBlocked ? "blocked" : "unblocked"}.` });
          return { ...c, blocked: newBlocked };
        }
        return c;
      })
    );
  };

  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <h1 className="text-2xl sm:text-3xl font-bold">Client List</h1>
        <p className="text-muted-foreground">All registered consumers on the platform</p>
      </div>

      <div className={`relative ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clients by name or email..." className="pl-10 max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                {filtered.map((client) => (
                  <TableRow key={client.id} className="group cursor-pointer hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary-foreground">{client.avatar}</span>
                        </div>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{client.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{client.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{client.bookings}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{client.joined}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View History" onClick={() => navigate(`/admin/client-history/${client.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit User" onClick={() => navigate(`/admin/update-client/${client.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={!client.blocked}
                          onCheckedChange={() => toggleBlock(client.id)}
                        />
                        <span className={`text-xs font-medium ${client.blocked ? "text-destructive" : "text-green-500"}`}>
                          {client.blocked ? "Blocked" : "Active"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No clients found.</p>}
    </div>
  );
};

export default AdminClientList;
