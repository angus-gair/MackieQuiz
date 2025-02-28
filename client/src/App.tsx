import { Switch, Route, RouteComponentProps, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy, ComponentType, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminRoute } from "./lib/admin-route";
import { ProtectedRoute } from "./lib/protected-route";
import { TopNav } from "./components/top-nav";
import { BottomNav } from "./components/bottom-nav";
import { useIsMobile } from "@/hooks/use-mobile";

// Define a component type that accepts any props
type AnyComponent = ComponentType<any>;

// Import WelcomePage directly to avoid dynamic import issues
import WelcomePage from "@/pages/welcome-page";

// Lazy load other components
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const ProfilePage = lazy(() => import("@/pages/user/profile"));
const TeamsPage = lazy(() => import("@/pages/teams-page"));
const LeaderboardPage = lazy(() => import("@/pages/shared/leaderboard"));
const QuizPage = lazy(() => import("@/pages/user/quiz"));
const QuizCompletionPage = lazy(() => import("@/pages/user/quiz-completion"));

// Admin imports
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminQuestions = lazy(() => import("@/pages/admin/questions"));
const AdminArchivedQuestions = lazy(() => import("@/pages/admin/archived-questions"));
const AdminUsersTeams = lazy(() => import("@/pages/admin/users-teams"));
const AdminAchievements = lazy(() => import("@/pages/admin/achievements"));
const DeploymentChecklist = lazy(() => import("@/pages/admin/deployment-checklist"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function Router() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  // Don't show navigation on auth page
  const showNav = location !== '/auth';
  
  // Determine top padding based on navigation
  const contentClasses = showNav ? "pt-16 pb-6" : "";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showNav && <TopNav />}
      
      <div className={`flex-1 ${contentClasses}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <Switch>
            <Route path="/auth" component={AuthPage as AnyComponent} />
            <Route path="/" component={WelcomePage as AnyComponent} />
            
            {/* Protected Routes */}
            <ProtectedRoute path="/leaderboard" component={LeaderboardPage as AnyComponent} />
            <ProtectedRoute path="/teams" component={TeamsPage as AnyComponent} />
            <ProtectedRoute path="/profile" component={ProfilePage as AnyComponent} />
            <ProtectedRoute path="/settings" component={SettingsPage as AnyComponent} />
            <ProtectedRoute path="/quiz" component={QuizPage as AnyComponent} />
            <ProtectedRoute path="/quiz-completion" component={QuizCompletionPage as AnyComponent} />

            {/* Admin Routes */}
            <AdminRoute path="/admin" component={AdminDashboard as AnyComponent} />
            <AdminRoute path="/admin/questions" component={AdminQuestions as AnyComponent} />
            <AdminRoute path="/admin/questions/archived" component={AdminArchivedQuestions as AnyComponent} />
            <AdminRoute path="/admin/users" component={AdminUsersTeams as AnyComponent} />
            <AdminRoute path="/admin/achievements" component={AdminAchievements as AnyComponent} />
            <AdminRoute path="/admin/deployment-checklist" component={DeploymentChecklist as AnyComponent} />

            <Route component={NotFound as AnyComponent} />
          </Switch>
        </Suspense>
      </div>
      
      {/* Show BottomNav conditionally */}
      {showNav && <BottomNav />}
    </div>
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