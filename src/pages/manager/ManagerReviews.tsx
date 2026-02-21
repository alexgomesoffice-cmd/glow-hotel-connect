import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reviews = [
  { id: 1, guest: "Alice Martin", rating: 5, date: "Feb 20, 2025", comment: "Absolutely wonderful stay! The suite was immaculate and the staff were incredibly attentive.", room: "Suite 301", replied: true },
  { id: 2, guest: "Robert Kim", rating: 4, date: "Feb 19, 2025", comment: "Great location and comfortable room. The breakfast could have more variety.", room: "Deluxe 205", replied: false },
  { id: 3, guest: "Sophie Chen", rating: 5, date: "Feb 18, 2025", comment: "Perfect for a business trip. Fast WiFi and quiet rooms. Will definitely return.", room: "Standard 112", replied: true },
  { id: 4, guest: "James Wilson", rating: 3, date: "Feb 17, 2025", comment: "Room was nice but the AC was noisy at night. Front desk resolved it quickly though.", room: "Suite 402", replied: false },
];

const ManagerReviews = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold">Reviews</h1>
      <p className="text-muted-foreground">Monitor and respond to guest feedback</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card><CardContent className="p-5 text-center"><p className="text-3xl font-bold">4.8</p><div className="flex justify-center gap-1 mt-1">{[1,2,3,4,5].map(s=><Star key={s} className="h-4 w-4 fill-amber-500 text-amber-500" />)}</div><p className="text-sm text-muted-foreground mt-1">Overall Rating</p></CardContent></Card>
      <Card><CardContent className="p-5 text-center"><p className="text-3xl font-bold">127</p><p className="text-sm text-muted-foreground mt-1">Total Reviews</p></CardContent></Card>
      <Card><CardContent className="p-5 text-center"><p className="text-3xl font-bold text-green-500">92%</p><p className="text-sm text-muted-foreground mt-1">Response Rate</p></CardContent></Card>
    </div>

    <div className="space-y-4">
      {reviews.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{r.guest}</p>
                  <span className="text-xs text-muted-foreground">• {r.room}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />)}</div>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
              </div>
              {r.replied && <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">Replied</span>}
            </div>
            <p className="text-sm mt-3 text-muted-foreground">{r.comment}</p>
            {!r.replied && (
              <Button variant="outline" size="sm" className="mt-3"><MessageSquare className="h-4 w-4 mr-2" /> Reply</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default ManagerReviews;
