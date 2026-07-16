// Booking Details page — reachable from anywhere via /admin/booking/:id.
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { findBooking, findBooking as _fb } from "@/data/adminBookings";
import { OpsCard, OpsSectionHeader } from "@/components/admin/ops/primitives";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

const OpsBookingDetail = () => {
  const { id } = useParams();
  const b = findBooking(id ?? "");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!b) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Booking not found.</p>
        <Link to="/admin/bookings" className="mt-4 inline-block text-sm text-primary hover:underline">Back to Bookings</Link>
      </div>
    );
  }

  const nights = Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86_400_000));

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 px-6 py-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/bookings" className="rounded-sm border border-border/60 bg-secondary/40 p-1 hover:bg-secondary">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <OpsSectionHeader title={`Booking ${b.id}`} description={`${b.hotelName} · ${b.hotelCity}`} className="flex-1 border-0 pb-0" />
        <Button variant="secondary" className="border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20" onClick={() => setConfirmCancel(true)} disabled={b.status === "cancelled"}>
          Cancel Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <OpsCard>
            <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Booking Summary</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-3 py-3 text-sm md:grid-cols-3">
              {[
                ["Check In", new Date(b.checkIn).toLocaleDateString()],
                ["Check Out", new Date(b.checkOut).toLocaleDateString()],
                ["Nights", String(nights)],
                ["Guests", String(b.guests)],
                ["Room", b.roomName],
                ["Amount", `৳${b.amount.toLocaleString()}`],
                ["Payment", b.payment],
                ["Status", b.status.replace("_", " ")],
                ["Created", new Date(b.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k as string} className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</span>
                  <span className="text-[13px] capitalize">{v}</span>
                </div>
              ))}
            </div>
          </OpsCard>

          <OpsCard>
            <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Guest Information</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-3 py-3 text-sm md:grid-cols-3">
              <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Name</div><div>{b.guestName}</div></div>
              <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Email</div><div>{b.guestEmail}</div></div>
              <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Phone</div><div>+880-1811-000000</div></div>
            </div>
          </OpsCard>

          <OpsCard>
            <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Booked Rooms</div>
            <div className="px-3 py-3 text-sm">
              <div className="flex items-center justify-between border-b border-border/40 py-2">
                <div>
                  <div>{b.roomName}</div>
                  <div className="text-[11px] text-muted-foreground">{nights} night{nights === 1 ? "" : "s"} · {b.guests} guest{b.guests === 1 ? "" : "s"}</div>
                </div>
                <div className="font-mono text-xs">৳{b.amount.toLocaleString()}</div>
              </div>
            </div>
          </OpsCard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <OpsCard>
              <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Payment Timeline</div>
              <ul className="divide-y divide-border/40 px-3 py-2 text-xs">
                <li className="py-1.5 flex justify-between"><span>Authorization</span><span className="text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</span></li>
                <li className="py-1.5 flex justify-between"><span>Capture</span><span className="text-muted-foreground">{b.payment === "paid" ? "Completed" : "—"}</span></li>
                <li className="py-1.5 flex justify-between"><span>Refund</span><span className="text-muted-foreground">{b.payment === "refunded" ? "Processed" : "—"}</span></li>
              </ul>
            </OpsCard>
            <OpsCard>
              <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Booking Timeline</div>
              <ul className="divide-y divide-border/40 px-3 py-2 text-xs">
                <li className="py-1.5 flex justify-between"><span>Created</span><span className="text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</span></li>
                <li className="py-1.5 flex justify-between"><span>Confirmed</span><span className="text-muted-foreground">{b.status !== "pending" ? "Yes" : "—"}</span></li>
                <li className="py-1.5 flex justify-between"><span>Checked-in</span><span className="text-muted-foreground">{b.status === "checked_in" || b.status === "checked_out" ? "Yes" : "—"}</span></li>
              </ul>
            </OpsCard>
          </div>

          <OpsCard>
            <div className="border-b border-border/60 px-3 py-2 text-[13px] font-semibold">Special Requests</div>
            <div className="px-3 py-3 text-sm text-muted-foreground">{b.specialRequests ?? "No special requests."}</div>
          </OpsCard>
        </div>

        <aside className="space-y-3">
          <OpsCard className="p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Invoices</div>
            <div className="text-xs text-muted-foreground">1 invoice · ৳{b.amount.toLocaleString()}</div>
          </OpsCard>
          <OpsCard className="p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Refunds</div>
            <div className="text-xs text-muted-foreground">{b.payment === "refunded" ? `Refunded ৳${b.amount.toLocaleString()}` : "No refunds."}</div>
          </OpsCard>
          <OpsCard className="p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Cancellation Logs</div>
            <div className="text-xs text-muted-foreground">{b.status === "cancelled" ? "Cancelled by admin." : "—"}</div>
          </OpsCard>
          <OpsCard className="p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">System Logs</div>
            <div className="text-xs text-muted-foreground">All events recorded in Activity Log.</div>
          </OpsCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this booking?"
        description={`Are you sure you want to cancel booking ${b.id}? The guest will be notified and the payment will be refunded if already captured.`}
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={() => {
          setConfirmCancel(false);
          toast({ title: "Booking cancelled", description: b.id });
          navigate("/admin/bookings");
        }}
      />
    </div>
  );
};

export default OpsBookingDetail;
