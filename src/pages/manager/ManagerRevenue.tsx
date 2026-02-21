import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const revenueStats = [
  { label: "This Month", value: "$42,850", change: "+12.5%", up: true },
  { label: "Last Month", value: "$38,100", change: "+8.2%", up: true },
  { label: "Avg. Daily", value: "$1,428", change: "-2.1%", up: false },
  { label: "Year to Date", value: "$312,400", change: "+15.8%", up: true },
];

const recentTransactions = [
  { date: "Feb 21", description: "Suite 301 - Alice Martin", amount: "+$350", type: "income" },
  { date: "Feb 21", description: "Room Service - Suite 301", amount: "+$85", type: "income" },
  { date: "Feb 20", description: "Deluxe 205 - Robert Kim", amount: "+$220", type: "income" },
  { date: "Feb 20", description: "Maintenance - Suite 402", amount: "-$150", type: "expense" },
  { date: "Feb 19", description: "Standard 112 - Sophie Chen", amount: "+$120", type: "income" },
  { date: "Feb 19", description: "Supplies restock", amount: "-$320", type: "expense" },
];

const ManagerRevenue = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold">Revenue</h1>
      <p className="text-muted-foreground">Track your hotel's financial performance</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {revenueStats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {stat.up ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
              <span className={`text-sm ${stat.up ? "text-green-500" : "text-destructive"}`}>{stat.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTransactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${t.type === "income" ? "bg-green-500" : "bg-destructive"}`} />
                <div>
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
              </div>
              <span className={`font-medium ${t.type === "income" ? "text-green-500" : "text-destructive"}`}>{t.amount}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ManagerRevenue;
