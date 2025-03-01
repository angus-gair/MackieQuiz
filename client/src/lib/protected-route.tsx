import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { ComponentType } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If not logged in, redirect to auth
  if (!user) {
    console.log(`Protected route (${path}) - User not authenticated, redirecting to auth`);
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Team allocation page specific logic
  if (path === "/team-allocation") {
    // If already assigned to a team, redirect to home
    if (user.teamAssigned) {
      return (
        <Route path={path}>
          <Redirect to="/" />
        </Route>
      );
    }
  } else {
    // For all other protected routes except team allocation, if no team assigned, redirect to team allocation
    if (!user.teamAssigned && path !== "/team-allocation") {
      return (
        <Route path={path}>
          <Redirect to="/team-allocation" />
        </Route>
      );
    }
  }

  return <Route path={path} component={Component} />;
}