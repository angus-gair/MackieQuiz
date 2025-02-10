import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If not logged in, redirect to auth
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // For all routes except team allocation, redirect to team allocation if no team assigned
  if (path !== "/team-allocation" && !user.teamAssigned) {
    return (
      <Route path={path}>
        <Redirect to="/team-allocation" />
      </Route>
    );
  }

  // For team allocation page, redirect to home if already assigned to a team
  if (path === "/team-allocation" && user.teamAssigned) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}