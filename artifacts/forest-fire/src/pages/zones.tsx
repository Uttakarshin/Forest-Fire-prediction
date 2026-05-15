import React from "react";
import { useListZones } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, MapPin, Clock, TreePine, Users, AlertCircle } from "lucide-react";

export default function Zones() {
  const { data: zones, isLoading } = useListZones();

  const getRiskColor = (level: string) => {
    switch (level) {
      case "extreme": return { badge: "bg-destructive text-destructive-foreground", bar: "bg-destructive", card: "border-destructive/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]" };
      case "high": return { badge: "bg-orange-500 text-white", bar: "bg-orange-500", card: "border-orange-500/30" };
      case "moderate": return { badge: "bg-yellow-500 text-white", bar: "bg-yellow-500", card: "border-yellow-500/30" };
      case "low": return { badge: "bg-green-500 text-white", bar: "bg-green-500", card: "border-green-500/30" };
      default: return { badge: "bg-blue-500 text-white", bar: "bg-blue-500", card: "" };
    }
  };

  const extremeCount = zones?.filter((z) => z.riskLevel === "extreme").length ?? 0;
  const highCount = zones?.filter((z) => z.riskLevel === "high").length ?? 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-orange-400" />
          Risk Zone Analysis
        </h1>
        <p className="text-muted-foreground uppercase text-xs tracking-widest font-mono">
          Terrain & Fuel Load Assessment
        </p>
      </div>

      {/* Summary banner */}
      {!isLoading && zones && (extremeCount > 0 || highCount > 0) && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-bold text-destructive">{extremeCount} extreme</span> and{" "}
            <span className="font-bold text-orange-400">{highCount} high</span> risk zones currently active — elevated suppression readiness required.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading
          ? Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))
          : !zones || zones.length === 0
          ? (
            <div className="col-span-full p-12 text-center bg-card border border-border rounded-lg text-muted-foreground">
              <ShieldAlert className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p className="uppercase tracking-widest">No zones configured</p>
            </div>
          )
          : zones.map((zone) => {
              const colors = getRiskColor(zone.riskLevel);
              return (
                <Card key={zone.id} className={`bg-card overflow-hidden border ${colors.card}`}>
                  {zone.riskLevel === "extreme" && (
                    <div className="h-1 w-full bg-destructive animate-pulse" />
                  )}
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`${colors.badge} uppercase text-[10px] tracking-wider`}>
                        {zone.riskLevel} risk
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">{zone.radiusKm} km radius</span>
                    </div>
                    <CardTitle className="text-base leading-tight">{zone.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Risk Score Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-mono uppercase tracking-wider">Risk Score</span>
                        <span className="font-mono font-bold">{zone.riskScore.toFixed(1)} / 100</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} transition-all`}
                          style={{ width: `${zone.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {zone.latitude.toFixed(2)}, {zone.longitude.toFixed(2)}
                      </div>
                      {zone.forestType && (
                        <div className="flex items-center gap-1">
                          <TreePine className="h-3 w-3" />
                          {zone.forestType}
                        </div>
                      )}
                      {zone.populationDensity && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {zone.populationDensity} pop.
                        </div>
                      )}
                      {zone.lastAssessed && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(zone.lastAssessed).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {zone.notes && (
                      <p className="text-xs text-muted-foreground border-t border-border/50 pt-3 leading-relaxed">
                        {zone.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
