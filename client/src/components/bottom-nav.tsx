import { Home, Users, BarChart3, Settings } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16">
        <Link href="/">
          <Button variant="ghost" size="lg" className="h-16 px-6">
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
        {user?.isAdmin ? (
          <Link href="/admin/users">
            <Button variant="ghost" size="lg" className="h-16 px-6">
              <Users className="h-5 w-5" />
              <span className="sr-only">Users</span>
            </Button>
          </Link>
        ) : (
          <Link href="/profile">
            <Button variant="ghost" size="lg" className="h-16 px-6">
              <Users className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
        )}
        <Link href={user?.isAdmin ? "/admin/analytics" : "/leaderboard"}>
          <Button variant="ghost" size="lg" className="h-16 px-6">
            <BarChart3 className="h-5 w-5" />
            <span className="sr-only">{user?.isAdmin ? "Analytics" : "Leaderboard"}</span>
          </Button>
        </Link>
        <Link href={user?.isAdmin ? "/admin" : "/settings"}>
          <Button variant="ghost" size="lg" className="h-16 px-6">
            <Settings className="h-5 w-5" />
            <span className="sr-only">{user?.isAdmin ? "Admin" : "Settings"}</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}
