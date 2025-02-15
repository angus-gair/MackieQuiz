import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy, ComponentType } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import { HeaderNav } from "@/components/header-nav";

// Lazy load components with proper typing
const NotFound = lazy(() => import("@/pages/not-found")) as ComponentType;
const HomePage = lazy(() => import("@/pages/home-page")) as ComponentType;
const AuthPage = lazy(() => import("@/pages/auth-page")) as ComponentType;
const SettingsPage = lazy(() => import("@/pages/settings-page")) as ComponentType;
const ProfilePage = lazy(() => import("@/pages/user/profile")) as ComponentType;
const TeamsPage = lazy(() => import("@/pages/teams-page")) as ComponentType;
const LeaderboardPage = lazy(() => import("@/pages/shared/leaderboard")) as ComponentType;
const TeamAllocationPage = lazy(() => import("@/pages/team-allocation-page")) as ComponentType;
const WelcomePage = lazy(() => import("@/pages/welcome-page")) as ComponentType;

// Admin imports
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard")) as ComponentType;
const AdminQuestions = lazy(() => import("@/pages/admin/questions")) as ComponentType;
const AdminUsersTeams = lazy(() => import("@/pages/admin/users-teams")) as ComponentType;
const AdminAchievements = lazy(() => import("@/pages/admin/achievements")) as ComponentType;

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

          {/* Admin Routes */}
          <AdminRoute path="/admin" component={AdminDashboard} />
          <AdminRoute path="/admin/questions" component={AdminQuestions} />
          <AdminRoute path="/admin/users" component={AdminUsersTeams} />
          <AdminRoute path="/admin/achievements" component={AdminAchievements} />

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