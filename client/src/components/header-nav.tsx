import { Link, useLocation } from "wouter";
import { Trophy, Users, UserCircle, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function HeaderNav() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="border-b">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Navigation Links */}
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm" className={location === '/leaderboard' ? 'bg-accent' : ''}>
                <Trophy className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/teams">
              <Button variant="ghost" size="sm" className={location === '/teams' ? 'bg-accent' : ''}>
                <Users className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className={location === '/profile' ? 'bg-accent' : ''}>
                <UserCircle className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Admin Link - Only show for admins */}
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className={location.startsWith('/admin') ? 'bg-accent' : ''}>
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {/* Logout Button */}
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
