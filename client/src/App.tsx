import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminDashboardPage from "@/pages/admin-dashboard";
import AdminQuestionsPage from "@/pages/admin-questions-page";
import AdminArchivedPage from "@/pages/admin-archived-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import UsersTeamsPage from "@/pages/users-teams-page";
import UsersViewPage from "@/pages/users-view-page";
import AnalyticsPage from "@/pages/analytics-page";
import UserAnalyticsPage from "@/pages/user-analytics-page";
import SettingsPage from "@/pages/settings-page";
import TeamAllocationPage from "@/pages/team-allocation-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/users" component={UsersViewPage} />
      <ProtectedRoute path="/team-allocation" component={TeamAllocationPage} />
      <AdminRoute path="/admin" component={AdminDashboardPage} />
      <AdminRoute path="/admin/questions" component={AdminQuestionsPage} />
      <AdminRoute path="/admin/questions/archived" component={AdminArchivedPage} />
      <AdminRoute path="/admin/users" component={UsersTeamsPage} />
      <AdminRoute path="/admin/analytics" component={AnalyticsPage} />
      <AdminRoute path="/admin/user" component={UserAnalyticsPage} userAnalyticsOnly />
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
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;