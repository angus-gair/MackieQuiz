import { Link, useLocation } from "wouter";
import { Trophy, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function HeaderNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/">
            <h1 className="text-lg font-semibold cursor-pointer">Weekly Quiz</h1>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/leaderboard">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0",
                  location === '/leaderboard' && "text-primary"
                )}
              >
                <Trophy className="h-4 w-4" />
                <span className="sr-only">Leaderboard</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0",
                  location === '/profile' && "text-primary"
                )}
              >
                <UserCircle className="h-4 w-4" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
            {user?.isAdmin ? (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 w-8 p-0",
                    location.startsWith('/admin') && "text-primary"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Admin Settings</span>
                </Button>
              </Link>
            ) : (
              <Link href="/settings">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 w-8 p-0",
                    location === '/settings' && "text-primary"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}