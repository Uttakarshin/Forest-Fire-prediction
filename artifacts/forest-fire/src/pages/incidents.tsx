import React from "react";
import { useListIncidents } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Search, MapPin, Clock, Wind, Droplets } from "lucide-react";

export default function Incidents() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>();

  const { data: incidents, isLoading } = useListIncidents({ status: statusFilter });

  const filteredIncidents = React.useMemo(() => {
    if (!incidents) return [];
    if (!search) return incidents;
    return incidents.filter(
      (i) =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [incidents, search]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-orange-500 text-white";
      case "moderate": return "bg-yellow-500 text-white";
      default: return "bg-blue-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "border-destructive text-destructive";
      case "contained": return "border-yellow-500 text-yellow-500";
      case "resolved": return "border-green-500 text-green-500";
      default: return "border-blue-500 text-blue-500";
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Flame className="h-6 w-6 text-primary" />
            Incident Management
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest font-mono">
            Active Threat Tracking
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            className="pl-9 bg-background border-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button variant={!statusFilter ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(undefined)}>All</Button>
          <Button variant={statusFilter === "active" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("active")}>Active</Button>
          <Button variant={statusFilter === "contained" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("contained")}>Contained</Button>
          <Button variant={statusFilter === "monitoring" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("monitoring")}>Monitoring</Button>
          <Button variant={statusFilter === "resolved" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("resolved")}>Resolved</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[280px]">Incident</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Area (ha)</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Conditions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No incidents found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="font-medium">{incident.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.createdAt).toLocaleString()}
                    </div>
                    {incident.evacuationOrdered && (
                      <Badge className="mt-1 bg-destructive/20 text-destructive border-destructive/30 text-[10px]">
                        EVACUATION ORDERED
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(incident.status)}>
                      {incident.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="font-mono text-xs">
                        {incident.latitude.toFixed(3)}, {incident.longitude.toFixed(3)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {incident.areaAffectedHa ? incident.areaAffectedHa.toFixed(1) : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${incident.riskScore > 75 ? "bg-destructive" : incident.riskScore > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${incident.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{incident.riskScore.toFixed(0)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs font-mono text-muted-foreground">
                      {incident.windSpeed != null && (
                        <span className="flex items-center gap-1">
                          <Wind className="h-3 w-3" /> {incident.windSpeed} km/h
                        </span>
                      )}
                      {incident.humidity != null && (
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3 w-3" /> {incident.humidity}%
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
