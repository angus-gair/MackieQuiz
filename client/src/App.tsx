import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import { HeaderNav } from "@/components/header-nav";

// Lazy load components
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const ProfilePage = lazy(() => import("@/pages/user/profile"));
const TeamsPage = lazy(() => import("@/pages/teams-page"));
const LeaderboardPage = lazy(() => import("@/pages/shared/leaderboard"));
const TeamAllocationPage = lazy(() => import("@/pages/team-allocation-page"));
const WelcomePage = lazy(() => import("@/pages/welcome-page"));

// Admin imports
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminQuestions = lazy(() => import("@/pages/admin/questions"));
const AdminUsersTeams = lazy(() => import("@/pages/admin/users-teams"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

function Router() {
  return (
    <>
      <HeaderNav />
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/auth" component={AuthPage} />

          {/* Public Routes */}
          <Route path="/leaderboard" component={LeaderboardPage} />

          {/* Protected User Routes */}
          <ProtectedRoute path="/" component={WelcomePage} />
          <ProtectedRoute path="/quiz" component={HomePage} />
          <ProtectedRoute path="/settings" component={SettingsPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/teams" component={TeamsPage} />
          <ProtectedRoute path="/team-allocation" component={TeamAllocationPage} />

          {/* Admin Routes - Simplified */}
          <AdminRoute path="/admin" component={AdminDashboard} />
          <AdminRoute path="/admin/questions" component={AdminQuestions} />
          <AdminRoute path="/admin/users" component={AdminUsersTeams} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
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