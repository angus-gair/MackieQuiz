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
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/questions" component={AdminQuestions} />
      <ProtectedRoute path="/admin/questions/archived" component={AdminArchived} />
      <ProtectedRoute path="/admin/users" component={AdminUsersTeams} />
      <ProtectedRoute path="/admin/analytics" component={AdminAnalytics} />
      <ProtectedRoute path="/admin/user" component={AdminUserAnalytics} />

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