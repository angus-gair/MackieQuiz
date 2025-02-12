import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function AdminRoute({
  path,
  component: Component,
  userAnalyticsOnly = false
}: {
  path: string;
  component: () => React.JSX.Element;
  userAnalyticsOnly?: boolean;
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

  // For /admin/user page, only allow user "gair"
  if (userAnalyticsOnly && user?.username !== "gair") {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // For other admin pages, check isAdmin
  if (!user?.isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Component />;
}