import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SettingsPage from "@/pages/settings-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";

// Admin imports
import AdminDashboard from "@/pages/admin/dashboard";
import AdminQuestions from "@/pages/admin/questions";
import AdminArchived from "@/pages/admin/archived";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminUserAnalytics from "@/pages/admin/user-analytics";
import AdminUsersTeams from "@/pages/admin/users-teams";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />

      {/* Public Routes */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />

      {/* Admin Routes */}
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/questions" component={AdminQuestions} />
      <AdminRoute path="/admin/questions/archived" component={AdminArchived} />
      <AdminRoute path="/admin/users" component={AdminUsersTeams} />
      <AdminRoute path="/admin/analytics" component={AdminAnalytics} />
      <AdminRoute path="/admin/user" component={AdminUserAnalytics} userAnalyticsOnly />

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