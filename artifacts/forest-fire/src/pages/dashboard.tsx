import React from "react";
import { 
  useGetDashboardSummary, 
  useGetRecentActivity,
  useGetFireRiskTrend,
  useGetIncidentStats
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, AlertTriangle, ShieldAlert, Users, TrendingUp, BellRing } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();
  const { data: trend, isLoading: loadingTrend } = useGetFireRiskTrend();
  const { data: stats, isLoading: loadingStats } = useGetIncidentStats();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          Command Center
        </h1>
        <p className="text-muted-foreground uppercase text-xs tracking-widest font-mono">Live Operations Overview // {new Date().toISOString().split('T')[0]}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Active Incidents" 
          value={summary?.activeIncidents} 
          icon={<Flame className="h-4 w-4 text-primary" />} 
          loading={loadingSummary} 
          trend="+2"
          danger={summary?.activeIncidents ? summary.activeIncidents > 5 : false}
        />
        <KpiCard 
          title="Critical Alerts" 
          value={summary?.criticalAlerts} 
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />} 
          loading={loadingSummary}
          danger={summary?.criticalAlerts ? summary.criticalAlerts > 0 : false}
        />
        <KpiCard 
          title="Zones Monitored" 
          value={summary?.zonesMonitored} 
          icon={<ShieldAlert className="h-4 w-4 text-secondary" />} 
          loading={loadingSummary}
        />
        <KpiCard 
          title="Avg Risk Score" 
          value={summary?.averageRiskScore} 
          icon={<TrendingUp className="h-4 w-4 text-yellow-500" />} 
          loading={loadingSummary}
          suffix="/ 100"
          danger={summary?.averageRiskScore ? summary.averageRiskScore > 75 : false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-2 bg-card border-card-border overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Fire Risk Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[300px]">
            {loadingTrend ? (
              <div className="h-full w-full p-4"><Skeleton className="h-full w-full" /></div>
            ) : trend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="avgRiskScore" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm uppercase">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="col-span-1 bg-card border-card-border">
          <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
            <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              Live Intel Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingActivity ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                {activity.map((item, idx) => (
                  <div key={item.id} className={`p-3 border-b border-border/50 flex gap-3 items-start ${idx === 0 ? 'bg-primary/5' : ''}`}>
                    <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                      item.severity === 'critical' ? 'bg-destructive' :
                      item.severity === 'danger' ? 'bg-primary' :
                      item.severity === 'warning' ? 'bg-yellow-500' : 'bg-secondary'
                    }`} />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span className="text-sm text-foreground">{item.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm uppercase">All clear</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Stats Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-card-border overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[250px]">
            {loadingStats ? (
              <Skeleton className="h-full w-full" />
            ) : stats?.bySeverity ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.bySeverity} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="label" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <RechartsTooltip cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
        
        <Card className="bg-card border-card-border overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Incidents by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[250px]">
             {loadingStats ? (
              <Skeleton className="h-full w-full" />
            ) : stats?.byStatus ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byStatus} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, loading, trend, suffix, danger }: { title: string; value?: number; icon: React.ReactNode; loading: boolean; trend?: string; suffix?: string; danger?: boolean }) {
  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-card-border overflow-hidden relative ${danger ? 'border-destructive/50 ring-1 ring-destructive/20 shadow-[0_0_15px_rgba(255,0,0,0.1)]' : ''}`}>
      {danger && <div className="absolute top-0 right-0 w-full h-1 bg-destructive animate-pulse" />}
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-md ${danger ? 'bg-destructive/20' : 'bg-muted'}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <span className={`text-3xl font-black ${danger ? 'text-destructive' : 'text-foreground'}`}>
              {value !== undefined ? value : '--'}
            </span>
          )}
          {suffix && !loading && <span className="text-sm font-medium text-muted-foreground">{suffix}</span>}
          {trend && !loading && <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-500 border-green-500/20">{trend}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
