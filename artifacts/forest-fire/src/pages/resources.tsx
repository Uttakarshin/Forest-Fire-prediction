import React from "react";
import { useListResources } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, Navigation, Phone, ShieldCheck, HelpCircle } from "lucide-react";

export default function Resources() {
  const { data: resources, isLoading } = useListResources();

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'fire_truck': return <Truck className="h-5 w-5" />;
      case 'helicopter': return <Navigation className="h-5 w-5" />;
      default: return <ShieldCheck className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Truck className="h-6 w-6 text-secondary" />
            Emergency Resources
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest font-mono">
            Fleet & Personnel Deployment
          </p>
        </div>
        <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
          Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="pb-2 flex flex-row items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : !resources || resources.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-card border border-border rounded-lg text-muted-foreground">
            <HelpCircle className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <p className="uppercase tracking-widest">No resources cataloged</p>
          </div>
        ) : (
          resources.map(resource => (
            <Card key={resource.id} className="bg-card border-border overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${resource.isAvailable ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                    {getResourceIcon(resource.resourceType)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{resource.name}</CardTitle>
                    <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                      {resource.resourceType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Qty: </span>
                    <span className="font-mono font-medium">{resource.quantity} {resource.unit}</span>
                  </div>
                  <Badge variant={resource.isAvailable ? "outline" : "secondary"} 
                         className={resource.isAvailable ? "border-green-500 text-green-500" : ""}>
                    {resource.isAvailable ? "AVAILABLE" : "DEPLOYED"}
                  </Badge>
                </div>
                
                {resource.contactInfo && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-4 pt-3 border-t border-border/50">
                    <Phone className="h-3 w-3" />
                    {resource.contactInfo}
                  </div>
                )}
                
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8" disabled={!resource.isAvailable}>
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
