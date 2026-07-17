import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Crown, User, Calendar, Star, CreditCard, FileText, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard, StatusPill } from "@/components/hotel-admin/primitives";
import { useHotelStore, formatDate, formatMoney, findGuest } from "@/data/hotelAdminStore";

const HotelAdminGuestProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guest = useHotelStore((s) => s.guests.find((g) => g.id === id));
  const reservations = useHotelStore((s) => s.reservations.filter((r) => r.guestId === id));
  const reviews = useHotelStore((s) => s.reviews.filter((r) => r.guestId === id));
  const transactions = useHotelStore((s) => s.transactions.filter((t) => reservations.some((r) => r.id === t.bookingId)));

  if (!guest) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Guest not found.</p></div>;
  }

  const current = reservations.find((r) => r.status === "checked_in");
  const past = reservations.filter((r) => r.status === "checked_out" || r.status === "cancelled");
  const totalSpent = reservations.reduce((s, r) => s + r.roomCharge, 0);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>

      {/* Hero */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-primary-foreground text-lg font-bold shrink-0">
          {guest.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{guest.name}</h1>
            {guest.vip && <StatusPill label="VIP" tone="amber" icon={Crown} />}
          </div>
          <p className="text-sm text-muted-foreground">{guest.email} · {guest.phone} · {guest.nationality}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">Lifetime Value</p>
          <p className="text-xl font-bold">{formatMoney(totalSpent)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Personal Information" icon={User}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Field label="Date of Birth" value={guest.dob} />
              <Field label="NID" value={guest.nid} />
              <Field label="Nationality" value={guest.nationality} />
              <Field label="Address" value={guest.address} />
              <Field label="Member Since" value={formatDate(guest.createdAt)} />
              <Field label="Preferences" value={guest.preferences.join(", ") || "—"} />
            </div>
          </SectionCard>

          {current && (
            <SectionCard title="Current Booking" icon={Calendar}
              action={<Button variant="outline" size="sm" asChild><Link to={`/hotel-admin/reservations/${current.id}`}>Open</Link></Button>}>
              <p className="font-medium">{current.code} · {formatDate(current.checkIn)} → {formatDate(current.checkOut)}</p>
              <p className="text-sm text-muted-foreground">{formatMoney(current.roomCharge)}</p>
            </SectionCard>
          )}

          <SectionCard title="Booking History" icon={Calendar}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                  <tr><th className="text-left py-2 pr-4">Booking</th><th className="text-left py-2 pr-4">Dates</th><th className="text-left py-2 pr-4">Status</th><th className="text-right py-2">Amount</th></tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} className="border-b border-border/40">
                      <td className="py-2 pr-4"><Link to={`/hotel-admin/reservations/${r.id}`} className="font-mono text-xs hover:text-green-600">{r.code}</Link></td>
                      <td className="py-2 pr-4">{formatDate(r.checkIn)} → {formatDate(r.checkOut)}</td>
                      <td className="py-2 pr-4"><StatusPill label={r.status.replace("_", " ")} tone={r.status === "checked_in" ? "green" : r.status === "cancelled" ? "red" : "blue"} /></td>
                      <td className="py-2 text-right font-medium">{formatMoney(r.roomCharge)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Past Reviews" icon={Star}>
            {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : (
              <ul className="space-y-3">
                {reviews.map((rv) => (
                  <li key={rv.id} className="rounded-xl border border-border/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rv.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(rv.createdAt)}</span>
                    </div>
                    <p className="text-sm">{rv.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard title="Payment History" icon={CreditCard}>
            <ul className="space-y-2 text-sm">
              {transactions.map((t) => (
                <li key={t.id} className="flex justify-between">
                  <div><p className="font-medium">{t.method}</p><p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p></div>
                  <p className="font-semibold">{formatMoney(t.amount)}</p>
                </li>
              ))}
              {transactions.length === 0 && <p className="text-xs text-muted-foreground">No transactions.</p>}
            </ul>
          </SectionCard>

          <SectionCard title="Invoices" icon={FileText}>
            <ul className="space-y-2 text-sm">
              {reservations.map((r) => (
                <li key={r.id} className="flex justify-between items-center">
                  <span>Invoice {r.code}</span>
                  <Button variant="ghost" size="sm">Download</Button>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Notes & Preferences" icon={Heart}>
            <p className="text-sm text-muted-foreground">{guest.notes || "No notes yet."}</p>
            {guest.preferences.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {guest.preferences.map((p) => <StatusPill key={p} label={p} tone="green" />)}
              </div>
            )}
          </SectionCard>
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>
);

export default HotelAdminGuestProfile;
