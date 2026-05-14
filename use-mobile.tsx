import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { EmployeeGate } from "@/components/EmployeeGate";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Fields from "@/pages/Fields";
import Inbox from "@/pages/Inbox";
import Request from "@/pages/Request";
import NotFound from "@/pages/not-found";

function EmployeeRoutes() {
  return (
    <EmployeeGate>
      <Layout>
        <Switch>
          <Route path="/employee" component={Dashboard} />
          <Route path="/employee/customers" component={Customers} />
          <Route path="/employee/customers/:id" component={CustomerDetail} />
          <Route path="/employee/fields" component={Fields} />
          <Route path="/employee/inbox" component={Inbox} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </EmployeeGate>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/request" component={Request} />
            <Route path="/employee/:rest*">
              <EmployeeRoutes />
            </Route>
            <Route path="/employee">
              <EmployeeRoutes />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
