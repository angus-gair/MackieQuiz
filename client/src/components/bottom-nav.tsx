import { Home, Users, BarChart3, Award, Cog, BookOpen, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Don't render navigation on auth page or admin pages
  if (location === '/auth' || location.startsWith('/admin')) return null;

  const isActive = (path: string) => {
    if (path === '/') {
      return location === path;
    }
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 shadow-md">
      <div className="flex items-center justify-around h-16 relative px-1 max-w-md mx-auto">
        {/* Home Button */}
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-16 flex flex-col gap-1 rounded-none hover:bg-primary/5",
              isActive("/") ? "text-primary font-medium border-t-2 border-primary" : "text-muted-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px]">Home</span>
          </Button>
        </Link>
        
        {/* Leaderboard Button */}
        <Link href="/leaderboard">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-16 flex flex-col gap-1 rounded-none hover:bg-primary/5",
              isActive("/leaderboard") ? "text-primary font-medium border-t-2 border-primary" : "text-muted-foreground"
            )}
          >
            <Award className="h-5 w-5" />
            <span className="text-[10px]">Leaderboard</span>
          </Button>
        </Link>
        
        {/* Quiz Button - Center, Prominent */}
        <div className="relative flex-1 flex justify-center">
          <Link href="/quiz">
            <Button 
              variant="default"
              className={cn(
                "h-14 w-14 rounded-full absolute left-1/2 -translate-x-1/2 -top-6 shadow-lg bg-primary hover:bg-primary/90 transition-all",
                isActive("/quiz") && "ring-4 ring-primary/20",
                "button-hover"
              )}
            >
              <BookOpen className="h-6 w-6" />
            </Button>
            <span className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary">
              Quiz
            </span>
          </Link>
        </div>
        
        {/* Teams Button */}
        <Link href="/teams">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-16 flex flex-col gap-1 rounded-none hover:bg-primary/5",
              isActive("/teams") ? "text-primary font-medium border-t-2 border-primary" : "text-muted-foreground"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px]">Teams</span>
          </Button>
        </Link>
        
        {/* Profile/Settings Button */}
        <Link href="/profile">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-16 flex flex-col gap-1 rounded-none hover:bg-primary/5",
              (isActive("/profile") || isActive("/settings")) ? "text-primary font-medium border-t-2 border-primary" : "text-muted-foreground"
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px]">Profile</span>
          </Button>
        </Link>
      </div>

      {/* Admin Button (Only for admin users) */}
      {user?.isAdmin && (
        <div className="fixed bottom-[72px] right-4">
          <Link href="/admin">
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-10 w-10 rounded-full bg-background shadow-md border border-primary/30",
                isActive("/admin") && "bg-primary text-white"
              )}
            >
              <Cog className="h-5 w-5" />
              <span className="sr-only">Admin</span>
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}