import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminRoute } from "./lib/admin-route";
import { HeaderNav } from "@/components/header-nav";

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
          <Route path="/" component={WelcomePage} />
          <Route path="/leaderboard" component={LeaderboardPage} />
          <Route path="/teams" component={TeamsPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/quiz" component={QuizPage} />
          <Route path="/quiz-completion" component={QuizCompletionPage} />

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