import { Calendar, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const reservations = [
  { id: "RES-001", guest: "Alice Martin", room: "Suite 301", checkIn: "2025-02-20", checkOut: "2025-02-24", status: "confirmed", total: "$1,400" },
  { id: "RES-002", guest: "Robert Kim", room: "Deluxe 205", checkIn: "2025-02-21", checkOut: "2025-02-23", status: "checked-in", total: "$440" },
  { id: "RES-003", guest: "Sophie Chen", room: "Standard 112", checkIn: "2025-02-18", checkOut: "2025-02-21", status: "checked-out", total: "$360" },
  { id: "RES-004", guest: "James Wilson", room: "Suite 402", checkIn: "2025-02-22", checkOut: "2025-02-26", status: "pending", total: "$1,600" },
  { id: "RES-005", guest: "Emma Davis", room: "Deluxe 310", checkIn: "2025-02-23", checkOut: "2025-02-25", status: "confirmed", total: "$500" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-500",
  "checked-in": "bg-blue-500/10 text-blue-500",
  "checked-out": "bg-muted text-muted-foreground",
  pending: "bg-amber-500/10 text-amber-500",
};

const ManagerReservations = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold">Reservations</h1>
      <p className="text-muted-foreground">Manage guest bookings and check-ins</p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by guest or reservation ID..." className="pl-10" />
      </div>
      <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
    </div>

    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Guest", "Room", "Check-in", "Check-out", "Total", "Status"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm">{r.id}</td>
                  <td className="py-3 px-4 font-medium">{r.guest}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{r.room}</td>
                  <td className="py-3 px-4 text-sm">{r.checkIn}</td>
                  <td className="py-3 px-4 text-sm">{r.checkOut}</td>
                  <td className="py-3 px-4 font-medium">{r.total}</td>
                  <td className="py-3 px-4"><Badge className={statusColors[r.status]}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ManagerReservations;
