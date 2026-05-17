import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Marketplace from "@/pages/marketplace";
import BarbershopDetail from "@/pages/marketplace/barbershop";
import DashboardHome from "@/pages/dashboard/index";
import DashboardAppointments from "@/pages/dashboard/appointments";
import DashboardClients from "@/pages/dashboard/clients/index";
import DashboardClientDetail from "@/pages/dashboard/clients/[id]";
import DashboardBarbers from "@/pages/dashboard/barbers";
import DashboardServices from "@/pages/dashboard/services";
import DashboardSettings from "@/pages/dashboard/settings";
import DashboardFinancial from "@/pages/dashboard/financial";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Marketplace */}
      <Route path="/" component={Home} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/barbershops/:id" component={BarbershopDetail} />

      {/* ERP Dashboard */}
      <Route path="/dashboard" component={DashboardHome} />
      <Route path="/dashboard/appointments" component={DashboardAppointments} />
      <Route path="/dashboard/clients" component={DashboardClients} />
      <Route path="/dashboard/clients/:id" component={DashboardClientDetail} />
      <Route path="/dashboard/barbers" component={DashboardBarbers} />
      <Route path="/dashboard/services" component={DashboardServices} />
      <Route path="/dashboard/financial" component={DashboardFinancial} />
      <Route path="/dashboard/settings" component={DashboardSettings} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
