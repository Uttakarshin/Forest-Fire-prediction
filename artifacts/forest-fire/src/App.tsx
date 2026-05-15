import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/layout";

import Dashboard from "@/pages/dashboard";
import MapPage from "@/pages/map";
import Incidents from "@/pages/incidents";
import Alerts from "@/pages/alerts";
import Zones from "@/pages/zones";
import Reports from "@/pages/reports";
import Resources from "@/pages/resources";
import Weather from "@/pages/weather";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/map" component={MapPage} />
        <Route path="/incidents" component={Incidents} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/zones" component={Zones} />
        <Route path="/reports" component={Reports} />
        <Route path="/resources" component={Resources} />
        <Route path="/weather" component={Weather} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="forest-fire-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
