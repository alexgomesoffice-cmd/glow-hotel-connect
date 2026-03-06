import { Star, MessageSquare, TrendingUp, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reviews = [
  { id: 1, guest: "Alice Martin", rating: 5, date: "Feb 20, 2025", comment: "Absolutely wonderful stay! The suite was immaculate and the staff were incredibly attentive.", room: "Suite 301", replied: true },
  { id: 2, guest: "Robert Kim", rating: 4, date: "Feb 19, 2025", comment: "Great location and comfortable room. The breakfast could have more variety.", room: "Deluxe 205", replied: false },
  { id: 3, guest: "Sophie Chen", rating: 5, date: "Feb 18, 2025", comment: "Perfect for a business trip. Fast WiFi and quiet rooms. Will definitely return.", room: "Standard 112", replied: true },
  { id: 4, guest: "James Wilson", rating: 3, date: "Feb 17, 2025", comment: "Room was nice but the AC was noisy at night. Front desk resolved it quickly though.", room: "Suite 402", replied: false },
];

const HotelAdminReviews = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold">Reviews</h1>
      <p className="text-muted-foreground">Monitor and respond to guest feedback</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Overall Rating", value: "4.8", extra: <div className="flex justify-center gap-0.5 mt-1">{[1,2,3,4,5].map(s=><Star key={s} className="h-4 w-4 fill-amber-500 text-amber-500" />)}</div>, gradient: "from-amber-500 to-orange-500", icon: Star },
        { label: "Total Reviews", value: "127", extra: null, gradient: "from-primary to-accent", icon: MessageSquare },
        { label: "Response Rate", value: "92%", extra: null, gradient: "from-green-500 to-emerald-500", icon: TrendingUp },
      ].map((stat, index) => (
        <Card key={stat.label} className="relative overflow-hidden hover-lift animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                {stat.extra}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shrink-0`}>
                <stat.icon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Review cards */}
    <div className="space-y-4">
      {reviews.map((r, index) => (
        <Card key={r.id} className="hover-lift animate-fade-in-up group" style={{ animationDelay: `${(index + 4) * 100}ms` }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">{r.guest.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{r.guest}</p>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/50">• {r.room}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />)}</div>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                </div>
              </div>
              {r.replied && (
                <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> Replied
                </span>
              )}
            </div>
            <p className="text-sm mt-3 text-muted-foreground leading-relaxed pl-[52px]">{r.comment}</p>
            {!r.replied && (
              <div className="pl-[52px] mt-3">
                <Button variant="outline" size="sm" className="group-hover:border-primary/50 transition-colors">
                  <MessageSquare className="h-4 w-4 mr-2" /> Reply
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default HotelAdminReviews;
