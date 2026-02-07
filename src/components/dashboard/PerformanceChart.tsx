import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Jan", engagement: 2400, reach: 4000 },
  { name: "Feb", engagement: 1398, reach: 3000 },
  { name: "Mar", engagement: 9800, reach: 2000 },
  { name: "Apr", engagement: 3908, reach: 2780 },
  { name: "May", engagement: 4800, reach: 1890 },
  { name: "Jun", engagement: 3800, reach: 2390 },
  { name: "Jul", engagement: 4300, reach: 3490 },
];

export function PerformanceChart() {
  return (
    <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Performance</p>
          <CardTitle className="text-2xl">Momentum Overview</CardTitle>
        </div>
        <Tabs defaultValue="30d" className="w-auto">
          <TabsList className="h-8 bg-muted/60">
            <TabsTrigger value="7d" className="px-3 text-xs">
              7D
            </TabsTrigger>
            <TabsTrigger value="30d" className="px-3 text-xs">
              30D
            </TabsTrigger>
            <TabsTrigger value="90d" className="px-3 text-xs">
              90D
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                }}
              />
              <Area type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" strokeWidth={2.2} fillOpacity={1} fill="url(#colorEngagement)" />
              <Area type="monotone" dataKey="reach" stroke="hsl(var(--chart-2))" strokeWidth={2.2} fillOpacity={1} fill="url(#colorReach)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
