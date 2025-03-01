import { Link, useLocation } from "wouter";
import { 
  Home, 
  Award, 
  Users, 
  BookOpen, 
  User, 
  LogOut, 
  ChevronLeft,
  Menu,
  RotateCw
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/use-auth";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { queryClient } from "../lib/queryClient";
import { useIsMobile } from "../hooks/use-mobile";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";

export function TopNav() {
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

  // Determine if we should show a back button
  const showBackButton = location !== '/' && 
    !location.startsWith('/admin') && 
    location !== '/leaderboard' && 
    location !== '/teams' && 
    location !== '/profile' && 
    location !== '/settings';

  // Check if it's an admin page
  const isAdminPage = location.startsWith('/admin');
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location === path;
    }
    return location.startsWith(path);
  };

  // Get page title based on current location
  const getPageTitle = () => {
    if (location === '/') return '';
    if (location === '/leaderboard') return 'Leaderboard';
    if (location === '/teams') return 'Teams';
    if (location === '/profile') return 'Your Profile';
    if (location === '/settings') return 'Settings';
    if (location === '/quiz') return 'Quiz';
    if (location.startsWith('/admin')) return 'Admin Dashboard';
    return '';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo or Back Button */}
          <div className="flex items-center">
            {showBackButton ? (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-1 p-2 h-9 hover:bg-primary/5"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </Button>
            ) : (
              <Link href="/">
                <div className="flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full overflow-hidden">
                    <img 
                      src="/images/roundtable.png" 
                      alt="Round Table Logo" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h1 className="text-lg font-semibold text-primary hidden sm:block">
                    Round Table
                  </h1>
                </div>
              </Link>
            )}
            
            {/* Page Title removed from here - will be centered in page content */}
          </div>
          
          {/* Navigation Links - Desktop Only */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "gap-2 px-3 py-5 h-16", 
                  isActive("/") && "bg-primary/5 text-primary"
                )}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>
            
            <Link href="/leaderboard">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "gap-2 px-3 py-5 h-16", 
                  isActive("/leaderboard") && "bg-primary/5 text-primary"
                )}
              >
                <Award className="h-4 w-4" />
                <span>Leaderboard</span>
              </Button>
            </Link>
            
            <Link href="/teams">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "gap-2 px-3 py-5 h-16", 
                  isActive("/teams") && "bg-primary/5 text-primary"
                )}
              >
                <Users className="h-4 w-4" />
                <span>Teams</span>
              </Button>
            </Link>
            
            <Link href="/quiz">
              <Button 
                variant={isActive("/quiz") ? "default" : "ghost"}
                size="sm" 
                className={cn(
                  "gap-2 px-4 py-5 h-16 font-medium", 
                  isActive("/quiz") && "bg-primary text-white"
                )}
              >
                <BookOpen className="h-4 w-4" />
                <span>Take Quiz</span>
              </Button>
            </Link>
            
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "gap-2 px-3 py-5 h-16", 
                  isActive("/profile") && "bg-primary/5 text-primary"
                )}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Button>
            </Link>
          </nav>
          
          {/* Right Side - User Actions */}
          <div className="flex items-center gap-1">
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

            {/* Mobile Menu - Dropdown */}
            <div className="md:hidden">
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
                  {/* Home */}
                  <Link href="/">
                    <DropdownMenuItem className={cn(
                      "cursor-pointer flex items-center gap-2",
                      isActive("/") && "bg-primary/5 text-primary font-medium"
                    )}>
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  {/* Leaderboard */}
                  <Link href="/leaderboard">
                    <DropdownMenuItem className={cn(
                      "cursor-pointer flex items-center gap-2",
                      isActive("/leaderboard") && "bg-primary/5 text-primary font-medium"
                    )}>
                      <Award className="h-4 w-4" />
                      <span>Leaderboard</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  {/* Teams */}
                  <Link href="/teams">
                    <DropdownMenuItem className={cn(
                      "cursor-pointer flex items-center gap-2",
                      isActive("/teams") && "bg-primary/5 text-primary font-medium"
                    )}>
                      <Users className="h-4 w-4" />
                      <span>Teams</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  {/* Quiz */}
                  <Link href="/quiz">
                    <DropdownMenuItem className={cn(
                      "cursor-pointer flex items-center gap-2",
                      isActive("/quiz") && "bg-primary/5 text-primary font-medium"
                    )}>
                      <BookOpen className="h-4 w-4" />
                      <span>Take Quiz</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  {/* Profile */}
                  <Link href="/profile">
                    <DropdownMenuItem className={cn(
                      "cursor-pointer flex items-center gap-2",
                      isActive("/profile") && "bg-primary/5 text-primary font-medium"
                    )}>
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  {/* Admin link (for admin users) */}
                  {user?.isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem className={cn(
                        "cursor-pointer flex items-center gap-2",
                        isAdminPage && "bg-primary/5 text-primary font-medium"
                      )}>
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
            </div>

            {/* Desktop - User & Logout buttons */}
            <div className="hidden md:flex items-center gap-1">
              {/* Logout button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 gap-2 hover:bg-primary/5"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}