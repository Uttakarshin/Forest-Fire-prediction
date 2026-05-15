import React from "react";
import { useListWeatherReadings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CloudLightning, Wind, Droplets, Thermometer, MapPin, Clock,
  Flame, CloudRain, Navigation
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from "recharts";

export default function Weather() {
  const { data: readings, isLoading } = useListWeatherReadings();

  const getFwiColor = (fwi: number) => {
    if (fwi >= 75) return { badge: "bg-destructive text-destructive-foreground", label: "EXTREME" };
    if (fwi >= 50) return { badge: "bg-orange-500 text-white", label: "VERY HIGH" };
    if (fwi >= 30) return { badge: "bg-yellow-500 text-white", label: "HIGH" };
    if (fwi >= 15) return { badge: "bg-blue-500 text-white", label: "MODERATE" };
    return { badge: "bg-green-500 text-white", label: "LOW" };
  };

  const radarData = readings
    ? readings.slice(0, 1).map((r) => [
        { subject: "Temp", value: Math.min((r.temperature / 50) * 100, 100) },
        { subject: "Wind", value: Math.min((r.windSpeed / 80) * 100, 100) },
        { subject: "FWI", value: Math.min(r.fireWeatherIndex, 100) },
        { subject: "Drought", value: Math.min(((r.droughtCode ?? 0) / 500) * 100, 100) },
        { subject: "Humidity", value: 100 - r.humidity },
        { subject: "Rain", value: Math.max(0, 100 - (r.precipitation * 20)) },
      ])
    : [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <CloudLightning className="h-6 w-6 text-yellow-400" />
          Weather Operations
        </h1>
        <p className="text-muted-foreground uppercase text-xs tracking-widest font-mono">
          Fire Weather Index & Station Data
        </p>
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FWI Bar Chart */}
        <Card className="bg-card border-card-border overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
            <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Fire Weather Index by Station
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[240px]">
            {isLoading ? (
              <div className="h-full p-4"><Skeleton className="h-full w-full" /></div>
            ) : readings && readings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={readings.map(r => ({ name: r.stationName.replace(" Station", "").replace(" RAWS", ""), fwi: r.fireWeatherIndex, humidity: r.humidity }))} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "4px" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Bar dataKey="fwi" name="FWI" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={28} />
                  <Bar dataKey="humidity" name="Humidity %" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Radar chart */}
        <Card className="bg-card border-card-border overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
            <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Navigation className="h-4 w-4 text-secondary" />
              Composite Risk Profile (Latest Station)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[240px]">
            {isLoading ? (
              <div className="h-full p-4"><Skeleton className="h-full w-full" /></div>
            ) : radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData[0]} margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Radar name="Risk" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array(5).fill(0).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent><Skeleton className="h-24 w-full" /></CardContent>
              </Card>
            ))
          : !readings || readings.length === 0
          ? (
              <div className="col-span-full p-12 text-center bg-card border border-border rounded-lg text-muted-foreground">
                <CloudRain className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p className="uppercase tracking-widest">No weather readings available</p>
              </div>
            )
          : readings.map((r) => {
              const fwi = getFwiColor(r.fireWeatherIndex);
              return (
                <Card key={r.id} className="bg-card border-card-border overflow-hidden">
                  {r.fireWeatherIndex >= 75 && <div className="h-1 bg-destructive animate-pulse" />}
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base leading-tight">{r.stationName}</CardTitle>
                      <Badge className={`${fwi.badge} text-[10px] tracking-wider`}>FWI {fwi.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                      <MapPin className="h-3 w-3" />
                      {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Stat icon={<Thermometer className="h-3.5 w-3.5 text-orange-400" />} label="Temp" value={`${r.temperature.toFixed(1)}°C`} danger={r.temperature > 35} />
                      <Stat icon={<Droplets className="h-3.5 w-3.5 text-blue-400" />} label="Humidity" value={`${r.humidity.toFixed(1)}%`} danger={r.humidity < 15} />
                      <Stat icon={<Wind className="h-3.5 w-3.5 text-secondary" />} label="Wind" value={`${r.windSpeed.toFixed(1)} km/h`} danger={r.windSpeed > 35} />
                      <Stat icon={<Navigation className="h-3.5 w-3.5 text-muted-foreground" />} label="Direction" value={r.windDirection} />
                      <Stat icon={<CloudRain className="h-3.5 w-3.5 text-blue-300" />} label="Precip." value={`${r.precipitation.toFixed(1)} mm`} />
                      <Stat icon={<Flame className="h-3.5 w-3.5 text-primary" />} label="FWI" value={r.fireWeatherIndex.toFixed(1)} danger={r.fireWeatherIndex > 50} />
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(r.recordedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1">
        {icon} {label}
      </span>
      <span className={`text-sm font-mono font-bold ${danger ? "text-destructive" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
