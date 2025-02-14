import { Link, useLocation } from "wouter";
import { Trophy, Settings, UserCircle, LogOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export function HeaderNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [showTrophyAnimation, setShowTrophyAnimation] = useState(false);

  useEffect(() => {
    const handleQuizComplete = () => {
      setShowTrophyAnimation(true);
    };
    window.addEventListener('quiz-complete', handleQuizComplete);
    return () => window.removeEventListener('quiz-complete', handleQuizComplete);
  }, []);

  const handleReset = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/questions/weekly"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/answers"] })
    ]);
    window.location.reload();
  };

  // Don't render navigation on auth page - moved after hooks
  if (location === '/auth') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/">
            <h1 className="text-lg font-semibold cursor-pointer">Weekly Quiz</h1>
          </Link>
          <nav className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleReset}
              className={cn(
                "h-8 w-8 p-0",
                !showTrophyAnimation && "hidden"
              )}
            >
              <RotateCw className="h-4 w-4" />
              <span className="sr-only">Reset Quiz</span>
            </Button>
            <Link href="/leaderboard">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0 relative",
                  location === '/leaderboard' && "text-primary",
                  showTrophyAnimation && "animate-pulse after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-yellow-500/30 after:animate-ping"
                )}
              >
                <Trophy className={cn(
                  "h-4 w-4",
                  showTrophyAnimation ? "text-yellow-500 animate-bounce" : "text-muted-foreground"
                )} />
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
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