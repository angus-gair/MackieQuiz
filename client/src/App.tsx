import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import AdminArchivedPage from "@/pages/admin-archived-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import UsersTeamsPage from "@/pages/users-teams-page";
import UsersViewPage from "@/pages/users-view-page";
import AnalyticsPage from "@/pages/analytics-page";
import SettingsPage from "@/pages/settings-page";
import TeamAllocationPage from "@/pages/team-allocation-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import { FullscreenToggle } from "@/components/fullscreen-toggle";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/users" component={UsersViewPage} />
      <AdminRoute path="/admin" component={AdminPage} />
      <AdminRoute path="/admin/archived" component={AdminArchivedPage} />
      <AdminRoute path="/admin/users" component={UsersTeamsPage} />
      <AdminRoute path="/admin/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/team-allocation" component={TeamAllocationPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <FullscreenToggle />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;