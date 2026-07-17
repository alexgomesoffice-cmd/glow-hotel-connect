import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserPlus, Crown, Shield, User as UserIcon, Mail, Phone, ArrowLeft, KeyRound, Ban, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard, StatusPill, Timeline } from "@/components/hotel-admin/primitives";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { useHotelStore, formatDate, updateStore } from "@/data/hotelAdminStore";

export const HotelAdminTeam = () => {
  const staff = useHotelStore((s) => s.staff);
  const navigate = useNavigate();
  const owner = staff.find((s) => s.role === "OWNER");
  const admin = staff.find((s) => s.role === "HOTEL_ADMIN");
  const subs = staff.filter((s) => s.role === "SUB_ADMIN");

  const Card1 = ({ member, tone }: { member: any; tone: string }) => (
    <Card className="hover-lift cursor-pointer" onClick={() => navigate(`/hotel-admin/team/${member.id}`)}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center text-primary-foreground font-semibold`}>
          {member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{member.name}</p>
            {member.role === "OWNER" && <StatusPill label="Owner" tone="amber" icon={Crown} />}
            {member.role === "HOTEL_ADMIN" && <StatusPill label="Admin" tone="green" icon={Shield} />}
            {member.role === "SUB_ADMIN" && <StatusPill label="Sub Admin" tone="blue" icon={UserIcon} />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{member.title}</p>
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground text-sm">Owner, hotel admin, and sub-admins</p>
        </div>
        <Button variant="hero" size="sm" asChild>
          <Link to="/hotel-admin/team/invite"><UserPlus className="h-4 w-4 mr-2" /> Invite Sub Admin</Link>
        </Button>
      </div>

      {owner && <div><h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Owner</h2><Card1 member={owner} tone="from-amber-400 to-orange-500" /></div>}
      {admin && <div><h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hotel Admin</h2><Card1 member={admin} tone="from-green-500 to-emerald-500" /></div>}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Sub Admins ({subs.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subs.map((m) => <Card1 key={m.id} member={m} tone="from-blue-500 to-indigo-500" />)}
        </div>
      </div>
    </div>
  );
};

export const HotelAdminTeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const member = useHotelStore((s) => s.staff.find((m) => m.id === id));
  const [confirm, setConfirm] = useState<null | "reset" | "deactivate" | "remove">(null);

  if (!member) return <div className="text-center py-16"><p className="text-muted-foreground">Member not found.</p></div>;

  const doAction = () => {
    if (confirm === "reset") toast({ title: "Password reset link sent", description: `Sent to ${member.email}` });
    if (confirm === "deactivate") {
      updateStore((s) => ({ ...s, staff: s.staff.map((m) => m.id === id ? { ...m, status: "inactive" } : m) }));
      toast({ title: "Account deactivated" });
    }
    if (confirm === "remove") {
      updateStore((s) => ({ ...s, staff: s.staff.filter((m) => m.id !== id) }));
      toast({ title: "Member removed" });
      navigate("/hotel-admin/team");
    }
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>

      <div className="rounded-2xl border border-border bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-primary-foreground text-lg font-bold shrink-0">
          {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-sm text-muted-foreground">{member.title} · <StatusPill label={member.role} tone="green" /></p>
        </div>
        <StatusPill label={member.status} tone={member.status === "active" ? "green" : "gray"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Profile" icon={UserIcon}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{member.email}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{member.phone}</p></div>
              <div><p className="text-xs text-muted-foreground">Role</p><p className="font-medium">{member.role}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(member.createdAt)}</p></div>
              <div><p className="text-xs text-muted-foreground">Last login</p><p className="font-medium">{formatDate(member.lastLoginAt)}</p></div>
            </div>
          </SectionCard>

          <SectionCard title="Permissions" icon={Shield}>
            <div className="flex flex-wrap gap-1.5">
              {member.permissions.map((p) => <StatusPill key={p} label={p} tone="blue" />)}
            </div>
          </SectionCard>

          <SectionCard title="Recent Activity" icon={UserIcon}>
            <Timeline items={member.recentActivity.map((a) => ({ at: a.at, label: a.action }))} />
          </SectionCard>
        </div>

        <aside className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => setConfirm("reset")}><KeyRound className="h-4 w-4 mr-2" /> Reset Password</Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setConfirm("deactivate")}><Ban className="h-4 w-4 mr-2" /> Deactivate</Button>
          {member.role === "SUB_ADMIN" && (
            <Button variant="destructive" className="w-full justify-start" onClick={() => setConfirm("remove")}><Trash2 className="h-4 w-4 mr-2" /> Remove</Button>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={
          confirm === "reset" ? "Send password reset?" :
          confirm === "deactivate" ? "Deactivate this account?" :
          "Remove this member?"
        }
        description={
          confirm === "reset" ? `Are you sure you want to send a password reset link to ${member.email}?` :
          confirm === "deactivate" ? `Are you sure you want to deactivate ${member.name}? They will lose access immediately.` :
          `Are you sure you want to remove ${member.name} from your team? This cannot be undone.`
        }
        variant={confirm === "remove" || confirm === "deactivate" ? "destructive" : "default"}
        confirmLabel="Confirm"
        onConfirm={doAction}
      />
    </div>
  );
};
