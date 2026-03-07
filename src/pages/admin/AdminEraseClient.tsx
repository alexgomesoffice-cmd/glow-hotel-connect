import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminData } from "@/data/adminStore";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

const AdminEraseClient = () => {
  const navigate = useNavigate();
  const { data, saveData } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [eraseTarget, setEraseTarget] = useState<number | null>(null);

  useEffect(() => { setIsLoaded(true); }, []);

  const filteredClients = data.clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = () => {
    if (!eraseTarget) return;
    const client = data.clients.find((c) => c.id === eraseTarget);
    saveData((cur) => ({
      ...cur,
      clients: cur.clients.filter((c) => c.id !== eraseTarget),
      bookings: cur.bookings.filter((b) => b.clientId !== eraseTarget),
    }));
    setEraseTarget(null);
    toast({ title: "Client erased", description: `${client?.name} has been permanently removed.` });
  };

  const targetClient = data.clients.find((c) => c.id === eraseTarget);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/clients")}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Erase Client</h1>
          <p className="text-muted-foreground">Permanently remove a consumer and their related bookings.</p>
        </div>
      </div>

      <div className={`relative ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className="pl-10" />
      </div>

      <div className="space-y-4">
        {filteredClients.map((client, index) => (
          <Card key={client.id} className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(index + 2) * 80}ms` }}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">{client.avatar}</div>
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setEraseTarget(client.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Erase
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && <p className="py-8 text-center text-muted-foreground">No clients found.</p>}

      <ConfirmDialog
        open={!!eraseTarget}
        onOpenChange={(open) => !open && setEraseTarget(null)}
        title="Erase this client?"
        description={`Are you sure you want to permanently erase ${targetClient?.name || "this client"} and remove all their bookings? This action cannot be undone.`}
        confirmLabel="Yes, Erase"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
};

export default AdminEraseClient;
