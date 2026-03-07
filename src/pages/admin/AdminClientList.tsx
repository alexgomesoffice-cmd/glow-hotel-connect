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
import ConfirmDialog from "@/components/ConfirmDialog";

const AdminClientList = () => {
  const navigate = useNavigate();
  const { data, saveData } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [eraseTarget, setEraseTarget] = useState<number | null>(null);
  const [blockTarget, setBlockTarget] = useState<number | null>(null);

  useEffect(() => { setIsLoaded(true); }, []);

  const bookingCountByClient = useMemo(
    () => data.bookings.reduce<Record<number, number>>((acc, b) => { acc[b.clientId] = (acc[b.clientId] || 0) + 1; return acc; }, {}),
    [data.bookings],
  );

  const filteredClients = data.clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const eraseClient = () => {
    if (!eraseTarget) return;
    const client = data.clients.find((c) => c.id === eraseTarget);
    saveData((cur) => ({
      ...cur,
      clients: cur.clients.filter((c) => c.id !== eraseTarget),
      bookings: cur.bookings.filter((b) => b.clientId !== eraseTarget),
    }));
    setEraseTarget(null);
    toast({ title: "Client erased", description: `${client?.name} was permanently removed.` });
  };

  const toggleBlock = () => {
    if (!blockTarget) return;
    const client = data.clients.find((c) => c.id === blockTarget);
    if (!client) return;
    saveData((cur) => ({
      ...cur,
      clients: cur.clients.map((c) => c.id === blockTarget ? { ...c, blocked: !c.blocked } : c),
    }));
    toast({ title: client.blocked ? "User unblocked" : "User blocked", description: `${client.name} has been ${client.blocked ? "unblocked" : "blocked"}.` });
    setBlockTarget(null);
  };

  const eraseClientObj = data.clients.find((c) => c.id === eraseTarget);
  const blockClientObj = data.clients.find((c) => c.id === blockTarget);

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
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">{client.avatar}</div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{client.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{client.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{bookingCountByClient[client.id] || 0}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{client.joined}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="See history" onClick={() => navigate(`/admin/client-history/${client.id}`)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit user" onClick={() => navigate(`/admin/update-client/${client.id}`)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Erase user" onClick={() => setEraseTarget(client.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Switch checked={!client.blocked} onCheckedChange={() => setBlockTarget(client.id)} />
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
        title={blockClientObj?.blocked ? "Unblock this client?" : "Block this client?"}
        description={`Are you sure you want to ${blockClientObj?.blocked ? "unblock" : "block"} ${blockClientObj?.name || "this client"}?`}
        confirmLabel={blockClientObj?.blocked ? "Yes, Unblock" : "Yes, Block"}
        onConfirm={toggleBlock}
        variant={blockClientObj?.blocked ? "default" : "destructive"}
      />
    </div>
  );
};

export default AdminClientList;
