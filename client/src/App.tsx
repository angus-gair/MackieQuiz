import { Switch, Route, useLocation, RouteComponentProps } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy, ComponentType, FunctionComponent } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminRoute } from "./lib/admin-route";
import { ProtectedRoute } from "./lib/protected-route";
import { HeaderNav } from "@/components/header-nav";
import { BottomNav } from "@/components/bottom-nav";

// Define a type for route component props
type RouteComponent = ComponentType<RouteComponentProps>;

// Import WelcomePage directly to avoid dynamic import issues
import WelcomePage from "@/pages/welcome-page";

// Lazy load other components with proper type assertions
const NotFound = lazy(() => import("@/pages/not-found")) as unknown as RouteComponent;
const HomePage = lazy(() => import("@/pages/home-page")) as unknown as RouteComponent;
const AuthPage = lazy(() => import("@/pages/auth-page")) as unknown as RouteComponent;
const SettingsPage = lazy(() => import("@/pages/settings-page")) as unknown as RouteComponent;
const ProfilePage = lazy(() => import("@/pages/user/profile")) as unknown as RouteComponent;
const TeamsPage = lazy(() => import("@/pages/teams-page")) as unknown as RouteComponent;
const LeaderboardPage = lazy(() => import("@/pages/shared/leaderboard")) as unknown as RouteComponent;
const QuizPage = lazy(() => import("@/pages/user/quiz")) as unknown as RouteComponent;
const QuizCompletionPage = lazy(() => import("@/pages/user/quiz-completion")) as unknown as RouteComponent;

// Admin imports
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard")) as unknown as RouteComponent;
const AdminQuestions = lazy(() => import("@/pages/admin/questions")) as unknown as RouteComponent;
const AdminArchivedQuestions = lazy(() => import("@/pages/admin/archived-questions")) as unknown as RouteComponent;
const AdminUsersTeams = lazy(() => import("@/pages/admin/users-teams")) as unknown as RouteComponent;
const AdminAchievements = lazy(() => import("@/pages/admin/achievements")) as unknown as RouteComponent;
const DeploymentChecklist = lazy(() => import("@/pages/admin/deployment-checklist")) as unknown as RouteComponent;

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeaderNav />
      <div className="flex-1 pb-16">
        <Suspense fallback={<LoadingSpinner />}>
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route path="/" component={WelcomePage} />
            
            {/* Protected Routes */}
            <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
            <ProtectedRoute path="/teams" component={TeamsPage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/settings" component={SettingsPage} />
            <ProtectedRoute path="/quiz" component={QuizPage} />
            <ProtectedRoute path="/quiz-completion" component={QuizCompletionPage} />

            {/* Admin Routes */}
            <AdminRoute path="/admin" component={AdminDashboard} />
            <AdminRoute path="/admin/questions" component={AdminQuestions} />
            <AdminRoute path="/admin/questions/archived" component={AdminArchivedQuestions} />
            <AdminRoute path="/admin/users" component={AdminUsersTeams} />
            <AdminRoute path="/admin/achievements" component={AdminAchievements} />
            <AdminRoute path="/admin/deployment-checklist" component={DeploymentChecklist} />

            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </div>
      <BottomNav />
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