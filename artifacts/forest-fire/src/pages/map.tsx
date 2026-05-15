import React from "react";
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useListIncidents, useListZones } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, ShieldAlert, Layers } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  moderate: "#eab308",
  low:      "#22c55e",
};

const ZONE_COLORS: Record<string, string> = {
  extreme:  "#ef4444",
  high:     "#f97316",
  moderate: "#eab308",
  low:      "#22c55e",
};

function FitBounds({ incidents }: { incidents: Array<{ latitude: number; longitude: number }> }) {
  const map = useMap();
  React.useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(incidents.map((i) => [i.latitude, i.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
    }
  }, [incidents, map]);
  return null;
}

export default function MapPage() {
  const { data: incidents, isLoading: loadingInc } = useListIncidents({});
  const { data: zones, isLoading: loadingZones } = useListZones();
  const [showZones, setShowZones] = React.useState(true);
  const [showIncidents, setShowIncidents] = React.useState(true);

  const isLoading = loadingInc || loadingZones;

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Flame className="h-6 w-6 text-primary" />
            Live Situational Map
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest font-mono">
            Geo-Spatial Operations View
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowIncidents((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-colors ${showIncidents ? "bg-primary/20 border-primary/50 text-primary" : "bg-muted border-border text-muted-foreground"}`}
          >
            <Flame className="h-3.5 w-3.5" /> Incidents
          </button>
          <button
            onClick={() => setShowZones((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-colors ${showZones ? "bg-secondary/20 border-secondary/50 text-secondary" : "bg-muted border-border text-muted-foreground"}`}
          >
            <ShieldAlert className="h-3.5 w-3.5" /> Risk Zones
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 flex-shrink-0">
        {Object.entries(SEVERITY_COLORS).map(([level, color]) => (
          <div key={level} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground uppercase">
            <span className="h-3 w-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color }} />
            {level}
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-border relative">
        {isLoading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Layers className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-mono uppercase tracking-wider">Loading map data...</span>
            </div>
          </div>
        )}
        <MapContainer
          center={[37.5, -119.5]}
          zoom={6}
          style={{ height: "100%", width: "100%", background: "#1a1f2e" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {incidents && incidents.length > 0 && (
            <FitBounds incidents={incidents} />
          )}

          {showZones && zones?.map((zone) => (
            <Circle
              key={`zone-${zone.id}`}
              center={[zone.latitude, zone.longitude]}
              radius={zone.radiusKm * 1000}
              pathOptions={{
                color: ZONE_COLORS[zone.riskLevel] ?? "#888",
                fillColor: ZONE_COLORS[zone.riskLevel] ?? "#888",
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: "6 4",
              }}
            >
              <Popup>
                <div className="text-sm font-sans min-w-[160px]">
                  <div className="font-bold mb-1">{zone.name}</div>
                  <div className="text-xs text-gray-500 mb-1">Risk: <b>{zone.riskLevel.toUpperCase()}</b></div>
                  <div className="text-xs text-gray-500">Score: {zone.riskScore.toFixed(1)}/100</div>
                  <div className="text-xs text-gray-500">Radius: {zone.radiusKm} km</div>
                  {zone.notes && <div className="text-xs text-gray-400 mt-1 border-t pt-1">{zone.notes}</div>}
                </div>
              </Popup>
            </Circle>
          ))}

          {showIncidents && incidents?.map((inc) => (
            <Circle
              key={`inc-${inc.id}`}
              center={[inc.latitude, inc.longitude]}
              radius={Math.max(Math.sqrt((inc.areaAffectedHa ?? 10) * 10000 / Math.PI), 5000)}
              pathOptions={{
                color: SEVERITY_COLORS[inc.severity] ?? "#888",
                fillColor: SEVERITY_COLORS[inc.severity] ?? "#888",
                fillOpacity: inc.status === "active" ? 0.35 : 0.15,
                weight: inc.status === "active" ? 2.5 : 1.5,
              }}
            >
              <Popup>
                <div className="text-sm font-sans min-w-[180px]">
                  <div className="font-bold mb-1">{inc.title}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    <b>{inc.severity.toUpperCase()}</b> · {inc.status.toUpperCase()}
                  </div>
                  {inc.areaAffectedHa != null && (
                    <div className="text-xs text-gray-500">Area: {inc.areaAffectedHa.toFixed(1)} ha</div>
                  )}
                  <div className="text-xs text-gray-500">Risk: {inc.riskScore.toFixed(0)}/100</div>
                  {inc.evacuationOrdered && (
                    <div className="text-xs text-red-600 font-bold mt-1">⚠ EVACUATION ORDERED</div>
                  )}
                  {inc.assignedTeam && (
                    <div className="text-xs text-gray-400 mt-1">Team: {inc.assignedTeam}</div>
                  )}
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      {/* Quick stats row */}
      {!isLoading && incidents && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
          {(["critical", "high", "moderate", "low"] as const).map((sev) => {
            const count = incidents.filter(i => i.severity === sev).length;
            return (
              <Card key={sev} className="bg-card border-card-border">
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-muted-foreground">{sev}</span>
                  <span className="text-xl font-black" style={{ color: SEVERITY_COLORS[sev] }}>{count}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
