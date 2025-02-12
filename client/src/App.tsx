import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SettingsPage from "@/pages/settings-page";
import ProfilePage from "@/pages/user/profile";
import TeamsPage from "@/pages/teams-page";
import LeaderboardPage from "@/pages/shared/leaderboard";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import { HeaderNav } from "@/components/header-nav";

// Admin imports
import AdminDashboard from "@/pages/admin/dashboard";
import AdminQuestions from "@/pages/admin/questions";
import AdminUsersTeams from "@/pages/admin/users-teams";
import AdminUserAnalytics from "@/pages/admin/user-analytics";

function Router() {
  return (
    <>
      <HeaderNav />
      <Switch>
        <Route path="/auth" component={AuthPage} />

        {/* Public Routes */}
        <Route path="/leaderboard" component={LeaderboardPage} />

        {/* Protected User Routes */}
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <ProtectedRoute path="/teams" component={TeamsPage} />

        {/* Admin Routes */}
        <AdminRoute path="/admin" component={AdminDashboard} />
        <AdminRoute path="/admin/questions" component={AdminQuestions} />
        <AdminRoute path="/admin/users" component={AdminUsersTeams} />
        <AdminRoute path="/admin/user" component={AdminUserAnalytics} userAnalyticsOnly />

        <Route component={NotFound} />
      </Switch>
    </>
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