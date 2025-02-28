import { Link, useLocation } from "wouter";
import { Trophy, Settings, UserCircle, LogOut, RotateCw, BookOpen, Home, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";

export function HeaderNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [showTrophyAnimation, setShowTrophyAnimation] = useState(false);
  const isMobile = useIsMobile();

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

  // Determine if we should show a back button instead of the title
  const showBackButton = location !== '/' && 
    !location.startsWith('/admin') && 
    location !== '/leaderboard' && 
    location !== '/teams' && 
    location !== '/profile' && 
    location !== '/settings';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {showBackButton ? (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-1 p-2 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Button>
          ) : (
            <Link href="/">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h1 className="text-lg font-semibold text-primary">
                  Weekly Quiz
                </h1>
              </div>
            </Link>
          )}
          
          <nav className="flex items-center gap-3">
            {/* Reset Quiz button - only shown after trophy animation */}
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

            {/* Leaderboard button with trophy animation */}
            <Link href="/leaderboard">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0 relative",
                  location === '/leaderboard' && "text-primary bg-primary/10",
                  showTrophyAnimation && "animate-pulse after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-yellow-500/30 after:animate-ping"
                )}
              >
                <Trophy className={cn(
                  "h-4 w-4",
                  showTrophyAnimation ? "text-yellow-500 animate-bounce" : ""
                )} />
                <span className="sr-only">Leaderboard</span>
              </Button>
            </Link>

            {/* Profile button */}
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0",
                  location === '/profile' && "text-primary bg-primary/10"
                )}
              >
                <UserCircle className="h-4 w-4" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>

            {/* Logout button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>

            {/* Admin or Settings button */}
            {user?.isAdmin ? (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 w-8 p-0",
                    location.startsWith('/admin') && "text-primary bg-primary/10"
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
                    location === '/settings' && "text-primary bg-primary/10"
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