import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, Users, Calendar, Scissors, Clock } from "lucide-react";
import { Link } from "wouter";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { format } from "date-fns";
import {
  getDashboardSchedule,
  getDashboardSummary,
  getRevenueChart,
} from "@/lib/supabase/dashboard";

export default function DashboardHome() {
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: getDashboardSummary,
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ["revenueChart"],
    queryFn: getRevenueChart,
  });

  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ["dashboardSchedule"],
    queryFn: getDashboardSchedule,
  });

  const statCards = [
    {
      title: "Revenue (Today)",
      value: summary ? `€${summary.revenueToday.toFixed(2)}` : "€0.00",
      trend: summary?.revenueGrowth ? `+${summary.revenueGrowth}% from last month` : "N/A",
      icon: TrendingUp
    },
    {
      title: "Appointments (Today)",
      value: summary?.appointmentsToday.toString() || "0",
      trend: summary ? `${summary.pendingAppointments} pending` : "",
      icon: Calendar
    },
    {
      title: "Total Clients",
      value: summary?.totalClients.toString() || "0",
      trend: summary?.newClientsMonth ? `+${summary.newClientsMonth} this month` : "",
      icon: Users
    },
    {
      title: "Avg Ticket",
      value: summary ? `€${summary.avgTicket.toFixed(2)}` : "€0.00",
      trend: "Based on completed appointments",
      icon: Scissors
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening at your shop today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/appointments">
            <Button>Manage Schedule</Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className={isLoadingSummary ? "animate-pulse" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingSummary ? "..." : stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{isLoadingSummary ? "..." : stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChart ? (
              <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                <span className="text-muted-foreground">Loading chart...</span>
              </div>
            ) : chartData && chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(new Date(val), "MMM d")}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `€${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [`€${value.toFixed(2)}`, 'Revenue']}
                      labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
                <span className="text-muted-foreground">No revenue data available</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Upcoming appointments</CardDescription>
            </div>
            <Link href="/dashboard/appointments">
              <Button variant="ghost" size="icon">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingSchedule ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : schedule && schedule.length > 0 ? (
              <div className="space-y-4">
                {schedule.map((apt) => (
                  <div key={apt.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-md w-12 h-12 flex-shrink-0">
                      <Clock className="h-4 w-4 mb-0.5" />
                      <span className="text-xs font-bold">{format(new Date(apt.scheduledAt), "HH:mm")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{apt.clientName || "Walk-in Client"}</p>
                      <p className="text-xs text-muted-foreground truncate">{apt.serviceName} • {apt.barberName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium text-muted-foreground">No more appointments today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
