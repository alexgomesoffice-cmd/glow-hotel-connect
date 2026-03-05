import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminData } from "@/data/adminStore";
import { toast } from "@/hooks/use-toast";

const AdminEraseClient = () => {
  const navigate = useNavigate();
  const { data, saveData } = useAdminData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredClients = data.clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (id: number) => {
    const client = data.clients.find((item) => item.id === id);
    if (!client) return;

    saveData((current) => ({
      ...current,
      clients: current.clients.filter((item) => item.id !== id),
      bookings: current.bookings.filter((booking) => booking.clientId !== id),
    }));

    setConfirmId(null);
    toast({ title: "Client erased", description: `${client.name} has been permanently removed.` });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                  {client.avatar}
                </div>
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
              </div>

              {confirmId === client.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Confirm erase?
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(client.id)}>Yes, Erase</Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmId(client.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Erase
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && <p className="py-8 text-center text-muted-foreground">No clients found.</p>}
    </div>
  );
};

export default AdminEraseClient;
