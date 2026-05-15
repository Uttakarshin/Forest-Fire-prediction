import React from "react";
import { Link, useLocation } from "wouter";
import {
  Flame,
  Map as MapIcon,
  AlertTriangle,
  ShieldAlert,
  RadioReceiver,
  Users,
  Truck,
  CloudLightning,
  Bell,
  Activity,
  Menu
} from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Command Center", icon: Activity },
  { href: "/map", label: "Live Map", icon: MapIcon },
  { href: "/incidents", label: "Incidents", icon: Flame },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/zones", label: "Risk Zones", icon: ShieldAlert },
  { href: "/weather", label: "Weather Ops", icon: CloudLightning },
  { href: "/resources", label: "Resources", icon: Truck },
  { href: "/reports", label: "Citizen Reports", icon: Users },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();

  const isHealthy = health?.status === "ok";

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border/50">
        <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
          <Flame className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide uppercase text-white">Project F.I.R.E.</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Ops Command</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar/50">
        <div className="flex items-center gap-2 text-xs">
          <div className={`h-2 w-2 rounded-full ${isHealthy ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-muted-foreground uppercase font-mono tracking-wider">
            {isHealthy ? "Systems Online" : "Connection Lost"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full flex-shrink-0">
        <SidebarContent />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm tracking-wide uppercase">Ops Command</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r-sidebar-border">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative z-0">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
        
        {/* CRT Scanline Effect Overlay (subtle) */}
        <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-20" />
      </div>
    </div>
  );
}
