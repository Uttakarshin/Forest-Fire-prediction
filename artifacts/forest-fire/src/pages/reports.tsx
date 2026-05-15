import React from "react";
import { useListReports } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, Clock, Flame, Eye, EyeOff, CheckCircle2, AlertCircle, HelpCircle, XCircle } from "lucide-react";

export default function Reports() {
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>();
  const { data: reports, isLoading } = useListReports({ status: statusFilter });

  const getStatusProps = (status: string) => {
    switch (status) {
      case "pending":   return { icon: <HelpCircle className="h-4 w-4" />, color: "border-yellow-500 text-yellow-500", label: "PENDING" };
      case "verified":  return { icon: <CheckCircle2 className="h-4 w-4" />, color: "border-green-500 text-green-500", label: "VERIFIED" };
      case "escalated": return { icon: <AlertCircle className="h-4 w-4" />, color: "border-destructive text-destructive", label: "ESCALATED" };
      case "dismissed": return { icon: <XCircle className="h-4 w-4" />, color: "border-muted text-muted-foreground", label: "DISMISSED" };
      default:          return { icon: <HelpCircle className="h-4 w-4" />, color: "border-muted-foreground text-muted-foreground", label: status.toUpperCase() };
    }
  };

  const pending   = reports?.filter(r => r.status === "pending").length ?? 0;
  const verified  = reports?.filter(r => r.status === "verified").length ?? 0;
  const escalated = reports?.filter(r => r.status === "escalated").length ?? 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Users className="h-6 w-6 text-secondary" />
            Citizen Reports
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest font-mono">
            Public Incident Intelligence
          </p>
        </div>
      </div>

      {/* Summary stats */}
      {!isLoading && reports && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">{pending}</div>
            <div className="text-xs text-muted-foreground uppercase font-mono tracking-wider mt-1">Pending</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-black text-green-400">{verified}</div>
            <div className="text-xs text-muted-foreground uppercase font-mono tracking-wider mt-1">Verified</div>
          </div>
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-black text-destructive">{escalated}</div>
            <div className="text-xs text-muted-foreground uppercase font-mono tracking-wider mt-1">Escalated</div>
          </div>
        </div>
      )}

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {[undefined, "pending", "verified", "escalated", "dismissed"].map((s) => (
          <Button
            key={s ?? "all"}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
          </Button>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent><Skeleton className="h-20 w-full" /></CardContent>
              </Card>
            ))
          : !reports || reports.length === 0
          ? (
              <div className="col-span-full p-12 text-center bg-card border border-border rounded-lg text-muted-foreground">
                <Users className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p className="uppercase tracking-widest">No reports submitted</p>
              </div>
            )
          : reports.map((report) => {
              const sp = getStatusProps(report.status);
              return (
                <Card key={report.id} className={`bg-card border-border overflow-hidden ${report.status === "escalated" ? "border-destructive/40" : ""}`}>
                  {report.status === "escalated" && <div className="h-1 bg-destructive animate-pulse" />}
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{report.reporterName}</span>
                      <Badge variant="outline" className={`${sp.color} text-[10px] flex items-center gap-1`}>
                        {sp.icon} {sp.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <p className="text-sm text-foreground/80 leading-relaxed">{report.description}</p>

                    <div className="flex gap-3">
                      <div className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md ${report.smokeDetected ? "bg-yellow-500/15 text-yellow-400" : "bg-muted text-muted-foreground"}`}>
                        <Eye className="h-3 w-3" />
                        Smoke {report.smokeDetected ? "YES" : "NO"}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md ${report.flamesVisible ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                        <Flame className="h-3 w-3" />
                        Flames {report.flamesVisible ? "YES" : "NO"}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <MapPin className="h-3 w-3" />
                      {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                    </div>

                    {report.reporterContact && (
                      <div className="text-xs text-muted-foreground font-mono border-t border-border/50 pt-2">
                        Contact: {report.reporterContact}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
