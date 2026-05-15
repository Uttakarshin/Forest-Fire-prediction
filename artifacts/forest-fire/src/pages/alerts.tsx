import React from "react";
import { useListAlerts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bell, Clock, MapPin, Plus } from "lucide-react";

export default function Alerts() {
  const [activeTab, setActiveTab] = React.useState("all");
  const { data: alerts, isLoading } = useListAlerts();

  const filteredAlerts = React.useMemo(() => {
    if (!alerts) return [];
    if (activeTab === "all") return alerts;
    return alerts.filter(a => a.alertType === activeTab);
  }, [alerts, activeTab]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'danger': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            Alert Management
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest font-mono">
            Broadcast & Emergency Notifications
          </p>
        </div>
        <Button className="bg-yellow-500 text-white hover:bg-yellow-600">
          <Plus className="mr-2 h-4 w-4" /> Issue Alert
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="fire_warning">Fire Warning</TabsTrigger>
          <TabsTrigger value="evacuation">Evacuation</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredAlerts.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-card border border-border rounded-lg text-muted-foreground">
            <Bell className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <p className="uppercase tracking-widest">No active alerts</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <Card key={alert.id} className={`bg-card border-border overflow-hidden relative ${!alert.isActive ? 'opacity-60' : ''}`}>
              {alert.severity === 'critical' && alert.isActive && (
                <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse" />
              )}
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={alert.isActive ? "default" : "secondary"} className="uppercase text-[10px] tracking-wider">
                    {alert.alertType.replace('_', ' ')}
                  </Badge>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold">{alert.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-foreground/80 mb-4">{alert.message}</p>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground font-mono">
                  {alert.affectedZone && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Zone: {alert.affectedZone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" /> {new Date(alert.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
