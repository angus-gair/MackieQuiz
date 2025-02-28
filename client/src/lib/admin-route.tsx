import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";

type AdminRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export function AdminRoute({
  path,
  component: Component
}: AdminRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user?.isAdmin) {
          window.location.href = "/";
          return null;
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}