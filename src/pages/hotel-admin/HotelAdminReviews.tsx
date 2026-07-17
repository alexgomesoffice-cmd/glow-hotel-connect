import { useMemo, useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import { KPI, SectionCard, StatusPill } from "@/components/hotel-admin/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useHotelStore, findGuest, formatDate, updateStore } from "@/data/hotelAdminStore";

const HotelAdminReviews = () => {
  const reviews = useHotelStore((s) => s.reviews);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyFilter, setReplyFilter] = useState("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return {
      avg, total: reviews.length,
      unanswered: reviews.filter((r) => !r.reply).length,
      latest: reviews[0] ? formatDate(reviews[0].createdAt) : "—",
    };
  }, [reviews]);

  const filtered = reviews.filter((r) => {
    if (ratingFilter !== "all" && r.rating !== +ratingFilter) return false;
    if (replyFilter === "answered" && !r.reply) return false;
    if (replyFilter === "unanswered" && r.reply) return false;
    return true;
  });

  const submitReply = (id: string) => {
    const text = replyDrafts[id]?.trim();
    if (!text) return;
    updateStore((s) => ({ ...s, reviews: s.reviews.map((r) => r.id === id ? { ...r, reply: text, repliedAt: new Date().toISOString() } : r) }));
    setReplyDrafts((p) => { const n = { ...p }; delete n[id]; return n; });
    toast({ title: "Reply posted" });
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground text-sm">What your guests are saying</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Average Rating" value={stats.avg.toFixed(1)} icon={Star} color="from-amber-500 to-orange-500" />
        <KPI title="Total Reviews" value={stats.total} icon={MessageSquare} color="from-green-500 to-emerald-500" />
        <KPI title="Unanswered" value={stats.unanswered} icon={MessageSquare} color="from-red-500 to-rose-500" />
        <KPI title="Latest" value={stats.latest} icon={Star} color="from-blue-500 to-indigo-500" />
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Rating" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={replyFilter} onValueChange={setReplyFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All replies</SelectItem>
              <SelectItem value="unanswered">Unanswered only</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.map((rv) => {
          const g = findGuest(rv.guestId);
          return (
            <Card key={rv.id} className="hover-lift">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-primary-foreground text-xs font-semibold">
                      {g?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{g?.name}</p>
                      <p className="text-xs text-muted-foreground">{rv.bookingId} · {formatDate(rv.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rv.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                    {Array.from({ length: 5 - rv.rating }).map((_, i) => <Star key={i} className="h-4 w-4 text-muted-foreground/30" />)}
                  </div>
                </div>
                <p className="text-sm">{rv.comment}</p>

                {rv.reply ? (
                  <div className="rounded-xl bg-secondary/40 border border-border/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <StatusPill label="Owner reply" tone="green" />
                      <span className="text-xs text-muted-foreground">{rv.repliedAt && formatDate(rv.repliedAt)}</span>
                    </div>
                    <p className="text-sm">{rv.reply}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea placeholder="Reply publicly to this review…" rows={2} value={replyDrafts[rv.id] || ""} onChange={(e) => setReplyDrafts((p) => ({ ...p, [rv.id]: e.target.value }))} />
                    <div className="flex justify-end">
                      <Button variant="hero" size="sm" onClick={() => submitReply(rv.id)}><Send className="h-4 w-4 mr-2" /> Post reply</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HotelAdminReviews;
