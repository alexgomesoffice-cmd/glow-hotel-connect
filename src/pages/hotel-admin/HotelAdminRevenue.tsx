import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Receipt, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const revenueStats = [
  { label: "This Month", value: "$42,850", change: "+12.5%", up: true, gradient: "from-green-500 to-emerald-500", icon: DollarSign },
  { label: "Last Month", value: "$38,100", change: "+8.2%", up: true, gradient: "from-primary to-accent", icon: Wallet },
  { label: "Avg. Daily", value: "$1,428", change: "-2.1%", up: false, gradient: "from-amber-500 to-orange-500", icon: TrendingUp },
  { label: "Year to Date", value: "$312,400", change: "+15.8%", up: true, gradient: "from-purple-500 to-pink-500", icon: Receipt },
];

const recentTransactions = [
  { date: "Feb 21", description: "Suite 301 - Alice Martin", amount: "+$350", type: "income" },
  { date: "Feb 21", description: "Room Service - Suite 301", amount: "+$85", type: "income" },
  { date: "Feb 20", description: "Deluxe 205 - Robert Kim", amount: "+$220", type: "income" },
  { date: "Feb 20", description: "Maintenance - Suite 402", amount: "-$150", type: "expense" },
  { date: "Feb 19", description: "Standard 112 - Sophie Chen", amount: "+$120", type: "income" },
  { date: "Feb 19", description: "Supplies restock", amount: "-$320", type: "expense" },
];

const HotelAdminRevenue = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold">Revenue</h1>
      <p className="text-muted-foreground">Track your hotel's financial performance</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {revenueStats.map((stat, index) => (
        <Card key={stat.label} className="relative overflow-hidden hover-lift animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.up ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                  <span className={`text-sm font-medium ${stat.up ? "text-green-500" : "text-destructive"}`}>{stat.change}</span>
                </div>
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

    {/* Transactions */}
    <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
            <Receipt className="h-4 w-4 text-primary-foreground" />
          </div>
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-1">
          {recentTransactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${t.type === "income" ? "bg-green-500" : "bg-destructive"}`} />
                <div>
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
              </div>
              <span className={`font-semibold ${t.type === "income" ? "text-green-500" : "text-destructive"}`}>{t.amount}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default HotelAdminRevenue;
