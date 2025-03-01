import { Link, useLocation } from "wouter";
import { Trophy, Settings, UserCircle, LogOut, RotateCw, BookOpen, Home, ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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

  // Don't render navigation on auth page
  if (location === '/auth') return null;

  // Determine if we should show a back button instead of the title
  const showBackButton = location !== '/' && 
    !location.startsWith('/admin') && 
    location !== '/leaderboard' && 
    location !== '/teams' && 
    location !== '/profile' && 
    location !== '/settings' &&
    location !== '/quiz';

  // Check if it's an admin page
  const isAdminPage = location.startsWith('/admin');
  
  // Determine page title based on current route
  const getPageTitle = () => {
    if (location === '/') return 'Round Table';
    if (location === '/leaderboard') return 'Leaderboard';
    if (location === '/teams') return 'Teams';
    if (location === '/profile') return 'Your Profile';
    if (location === '/settings') return 'Settings';
    if (location === '/quiz') return 'Take Quiz';
    if (location.startsWith('/admin')) return 'Admin Dashboard';
    return 'Round Table';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button or Logo */}
          <div className="flex items-center">
            {showBackButton ? (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-1 p-2 h-8 hover:bg-primary/5"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </Button>
            ) : (
              <Link href="/">
                <div className="flex items-center">
                  <div className="icon-circle-primary mr-2">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h1 className="text-lg font-semibold text-primary">
                    {getPageTitle()}
                  </h1>
                </div>
              </Link>
            )}
          </div>
          
          {/* Right side - Navigation buttons */}
          <nav className="flex items-center gap-1">
            {/* Reset Quiz button - only shown after trophy animation */}
            {showTrophyAnimation && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                className="h-9 px-3 text-xs gap-1 border-primary/20 text-primary hover:bg-primary/5"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Reset Quiz
              </Button>
            )}

            {/* Trophy animation indicator */}
            {showTrophyAnimation && (
              <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 animate-pulse">
                <Trophy className="h-5 w-5 animate-bounce" />
              </div>
            )}

            {/* Dropdown Menu for options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 hover:bg-primary/5"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Profile link */}
                <Link href="/profile">
                  <DropdownMenuItem className={cn(
                    "cursor-pointer flex items-center gap-2",
                    location === '/profile' && "bg-primary/5 text-primary font-medium"
                  )}>
                    <UserCircle className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                
                {/* Leaderboard link */}
                <Link href="/leaderboard">
                  <DropdownMenuItem className={cn(
                    "cursor-pointer flex items-center gap-2",
                    location === '/leaderboard' && "bg-primary/5 text-primary font-medium"
                  )}>
                    <Trophy className="h-4 w-4" />
                    <span>Leaderboard</span>
                  </DropdownMenuItem>
                </Link>
                
                {/* Quiz link */}
                <Link href="/quiz">
                  <DropdownMenuItem className={cn(
                    "cursor-pointer flex items-center gap-2",
                    location === '/quiz' && "bg-primary/5 text-primary font-medium"
                  )}>
                    <BookOpen className="h-4 w-4" />
                    <span>Take Quiz</span>
                  </DropdownMenuItem>
                </Link>
                
                {/* Admin link (for admin users) */}
                {user?.isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem className={cn(
                      "cursor-pointer flex items-center gap-2",
                      isAdminPage && "bg-primary/5 text-primary font-medium"
                    )}>
                      <Settings className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                
                {/* Settings link (for non-admin users) */}
                {!user?.isAdmin && (
                  <Link href="/settings">
                    <DropdownMenuItem className={cn(
                      "cursor-pointer flex items-center gap-2",
                      location === '/settings' && "bg-primary/5 text-primary font-medium"
                    )}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                
                {/* Logout option */}
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center gap-2 text-red-500 hover:text-red-600"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}