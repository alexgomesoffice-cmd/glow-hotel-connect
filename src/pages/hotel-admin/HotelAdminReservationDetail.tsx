import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, User, BedDouble, DollarSign, Clock, MessageSquare,
  Ban, Printer, LogIn, LogOut, RotateCcw, FileText, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SectionCard, StatusPill, Timeline } from "@/components/hotel-admin/primitives";
import {
  useHotelStore, findGuest, findRoom, findRoomType, formatMoney, formatDate, formatDateTime,
  updateStore,
} from "@/data/hotelAdminStore";

const HotelAdminReservationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reservation = useHotelStore((s) => s.reservations.find((r) => r.id === id));
  const [confirm, setConfirm] = useState<null | "cancel" | "refund" | "checkin" | "checkout">(null);

  const guest = reservation ? findGuest(reservation.guestId) : null;
  const room = reservation ? findRoom(reservation.roomIds[0]) : null;
  const rt = reservation ? findRoomType(reservation.roomTypeId) : null;

  const totals = useMemo(() => {
    if (!reservation) return { subtotal: 0, extras: 0, discount: 0, tax: 0, total: 0 };
    const extras = reservation.extras.reduce((s, e) => s + e.amount, 0);
    const discount = reservation.discounts.reduce((s, e) => s + e.amount, 0);
    const tax = reservation.taxes.reduce((s, e) => s + e.amount, 0);
    return {
      subtotal: reservation.roomCharge, extras, discount, tax,
      total: reservation.roomCharge + extras + tax - discount,
    };
  }, [reservation]);

  if (!reservation || !guest) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Reservation not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/hotel-admin/reservations">Back to reservations</Link></Button>
      </div>
    );
  }

  const updateStatus = (status: any, timelineLabel: string) => {
    updateStore((s) => ({
      ...s,
      reservations: s.reservations.map((r) => r.id === id ? {
        ...r, status, timeline: [...r.timeline, { at: new Date().toISOString(), label: timelineLabel }],
      } : r),
    }));
  };

  const handleAction = () => {
    if (confirm === "cancel") { updateStatus("cancelled", "Booking cancelled by hotel"); toast({ title: "Booking cancelled" }); }
    if (confirm === "refund") { toast({ title: "Refund initiated", description: "Guest will be notified." }); }
    if (confirm === "checkin") { updateStatus("checked_in", "Guest checked in"); toast({ title: "Guest checked in" }); }
    if (confirm === "checkout") { updateStatus("checked_out", "Guest checked out"); toast({ title: "Guest checked out" }); }
    setConfirm(null);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <div>
            <h1 className="text-2xl font-bold font-mono">{reservation.code}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusPill label={reservation.status.replace("_", " ")} tone={reservation.status === "checked_in" ? "green" : reservation.status === "cancelled" ? "red" : "blue"} />
              <StatusPill label={`Payment: ${reservation.payment}`} tone={reservation.payment === "paid" ? "green" : "amber"} />
              <span className="text-xs text-muted-foreground">Created {formatDate(reservation.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Booking Summary" icon={Calendar}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Check-in</p><p className="font-medium">{formatDate(reservation.checkIn)}</p></div>
              <div><p className="text-xs text-muted-foreground">Check-out</p><p className="font-medium">{formatDate(reservation.checkOut)}</p></div>
              <div><p className="text-xs text-muted-foreground">Guests</p><p className="font-medium">{reservation.adults} adults · {reservation.children} children</p></div>
              <div><p className="text-xs text-muted-foreground">Source</p><p className="font-medium">{reservation.source}</p></div>
            </div>
          </SectionCard>

          <SectionCard title="Guest Information" icon={User}
            action={<Button variant="outline" size="sm" asChild><Link to={`/hotel-admin/guests/${guest.id}`}>Open profile</Link></Button>}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{guest.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{guest.email}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{guest.phone}</p></div>
              <div><p className="text-xs text-muted-foreground">Nationality</p><p className="font-medium">{guest.nationality}</p></div>
              <div><p className="text-xs text-muted-foreground">NID</p><p className="font-medium">{guest.nid}</p></div>
              <div><p className="text-xs text-muted-foreground">VIP</p><p className="font-medium">{guest.vip ? "Yes" : "No"}</p></div>
            </div>
          </SectionCard>

          <SectionCard title="Booked Rooms" icon={BedDouble}>
            <div className="rounded-xl border border-border/50 p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Room {room?.number} · {rt?.name}</p>
                <p className="text-xs text-muted-foreground">{rt?.bedType} · Max {rt?.maxOccupancy} guests · {rt?.size} m²</p>
              </div>
              <p className="text-sm font-semibold">{formatMoney(reservation.roomCharge)}</p>
            </div>
          </SectionCard>

          <SectionCard title="Charges" icon={DollarSign}>
            <div className="space-y-2 text-sm">
              <Row label="Room charges" value={formatMoney(totals.subtotal)} />
              {reservation.extras.map((e, i) => <Row key={i} label={e.label} value={formatMoney(e.amount)} muted />)}
              {reservation.discounts.map((e, i) => <Row key={i} label={e.label} value={`- ${formatMoney(e.amount)}`} muted />)}
              {reservation.taxes.map((e, i) => <Row key={i} label={e.label} value={formatMoney(e.amount)} muted />)}
              <div className="border-t border-border/50 pt-2 flex justify-between font-semibold">
                <span>Total</span><span>{formatMoney(totals.total)}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Special Requests" icon={MessageSquare}>
            <p className="text-sm text-muted-foreground">{reservation.specialRequests || "No special requests."}</p>
          </SectionCard>

          <SectionCard title="Invoices & Documents" icon={FileText}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Invoice {reservation.code}.pdf</div>
              <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button>
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard title="Payment Timeline" icon={DollarSign}>
            <Timeline items={reservation.paymentTimeline.map((p) => ({ at: p.at, label: `${p.label} · ${formatMoney(p.amount)} · ${p.method}`, tone: "green" as const }))} />
          </SectionCard>

          <SectionCard title="Booking Timeline" icon={Clock}>
            <Timeline items={reservation.timeline.slice().reverse()} />
          </SectionCard>

          <SectionCard title="System Logs" icon={ShieldCheck}>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Booking created via {reservation.source}</li>
              <li>Payment method: card</li>
              <li>Confirmation email sent to {guest.email}</li>
            </ul>
          </SectionCard>
        </aside>
      </div>

      {/* Sticky actions */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 border-t border-border bg-card/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between gap-3 z-20">
        <p className="text-xs text-muted-foreground hidden sm:block">Actions</p>
        <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
          {reservation.status !== "checked_in" && reservation.status !== "checked_out" && (
            <Button variant="outline" size="sm" onClick={() => setConfirm("checkin")}><LogIn className="h-4 w-4 mr-2" /> Check In</Button>
          )}
          {reservation.status === "checked_in" && (
            <Button variant="outline" size="sm" onClick={() => setConfirm("checkout")}><LogOut className="h-4 w-4 mr-2" /> Check Out</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setConfirm("refund")}><RotateCcw className="h-4 w-4 mr-2" /> Refund</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Invoice</Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirm("cancel")}><Ban className="h-4 w-4 mr-2" /> Cancel</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={
          confirm === "cancel" ? "Cancel this booking?" :
          confirm === "refund" ? "Refund guest?" :
          confirm === "checkin" ? "Check guest in?" : "Check guest out?"
        }
        description={
          confirm === "cancel" ? `Are you sure you want to cancel booking ${reservation.code}? This cannot be undone.` :
          confirm === "refund" ? `Are you sure you want to refund ${formatMoney(totals.total)} to ${guest.name}?` :
          `Are you sure you want to ${confirm === "checkin" ? "check in" : "check out"} ${guest.name}?`
        }
        variant={confirm === "cancel" ? "destructive" : "default"}
        confirmLabel={confirm === "cancel" ? "Cancel booking" : "Confirm"}
        onConfirm={handleAction}
      />
    </div>
  );
};

const Row = ({ label, value, muted }: { label: string; value: string; muted?: boolean }) => (
  <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
    <span>{label}</span><span>{value}</span>
  </div>
);

export default HotelAdminReservationDetail;
