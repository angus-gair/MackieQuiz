import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { CacheProvider } from "@/hooks/use-cache-settings";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import { HeaderNav } from "@/components/header-nav";

// Properly type the lazy loaded components
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
const AdminAchievements = lazy(() => import("@/pages/admin/achievements"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));

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
          <Route path="/auth">
            {(params) => <AuthPage {...params} />}
          </Route>

          {/* Public Routes */}
          <Route path="/leaderboard">
            {(params) => <LeaderboardPage {...params} />}
          </Route>

          {/* Protected User Routes */}
          <Route path="/">
            {() => <WelcomePage />}
          </Route>
          <Route path="/quiz">
            {() => <HomePage />}
          </Route>
          <Route path="/settings">
            {() => <SettingsPage />}
          </Route>
          <Route path="/profile">
            {() => <ProfilePage />}
          </Route>
          <Route path="/teams">
            {() => <TeamsPage />}
          </Route>
          <Route path="/team-allocation">
            {() => <TeamAllocationPage />}
          </Route>

          {/* Admin Routes */}
          <Route path="/admin">
            {() => <AdminDashboard />}
          </Route>
          <Route path="/admin/questions">
            {() => <AdminQuestions />}
          </Route>
          <Route path="/admin/users">
            {() => <AdminUsersTeams />}
          </Route>
          <Route path="/admin/achievements">
            {() => <AdminAchievements />}
          </Route>
          <Route path="/admin/analytics">
            {() => <AdminAnalytics />}
          </Route>

          <Route>
            {(params) => <NotFound {...params} />}
          </Route>
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CacheProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </CacheProvider>
    </QueryClientProvider>
  );
}

export default App;