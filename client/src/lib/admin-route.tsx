import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";

type AdminRouteProps = {
  path: string;
  component: React.ComponentType;
  userAnalyticsOnly?: boolean;
};

export function AdminRoute({
  path,
  component: Component,
  userAnalyticsOnly = false
}: AdminRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        // For /admin/user page, only allow user "gair"
        if (userAnalyticsOnly && user?.username !== "gair") {
          window.location.href = "/";
          return null;
        }

        // For other admin pages, check isAdmin
        if (!user?.isAdmin) {
          window.location.href = "/";
          return null;
        }

        return <Component />;
      }}
    </Route>
  );
}