import { Home, Users, BarChart3, Settings, Cog, BookOpen } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Don't render navigation on auth page
  if (location === '/auth') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <div className="flex items-center justify-around h-16 relative">
        {/* Home Button */}
        <Link href="/">
          <Button 
            variant="ghost" 
            size="lg" 
            className={cn(
              "h-16 px-4",
              location === "/" && "text-primary font-medium"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
        
        {/* Teams Button */}
        <Link href="/teams">
          <Button 
            variant="ghost" 
            size="lg" 
            className={cn(
              "h-16 px-4",
              location === "/teams" && "text-primary font-medium"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="sr-only">Teams</span>
          </Button>
        </Link>
        
        {/* Quiz Button - Center, Prominent */}
        <Link href="/quiz">
          <Button 
            variant="default"
            size="lg" 
            className={cn(
              "h-14 w-14 rounded-full absolute left-1/2 -translate-x-1/2 -top-5 shadow-md bg-primary hover:bg-primary/90",
              location === "/quiz" && "ring-2 ring-primary/20"
            )}
          >
            <BookOpen className="h-6 w-6" />
            <span className="sr-only">Quiz</span>
          </Button>
        </Link>
        
        {/* Leaderboard Button */}
        <Link href="/leaderboard">
          <Button 
            variant="ghost" 
            size="lg" 
            className={cn(
              "h-16 px-4",
              location === "/leaderboard" && "text-primary font-medium"
            )}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="sr-only">Leaderboard</span>
          </Button>
        </Link>
        
        {/* Settings/Admin Button */}
        <Link href={user?.isAdmin ? "/admin" : "/settings"}>
          <Button 
            variant="ghost" 
            size="lg" 
            className={cn(
              "h-16 px-4",
              (location.startsWith("/admin") || location === "/settings") && "text-primary font-medium"
            )}
          >
            <Cog className="h-5 w-5" />
            <span className="sr-only">{user?.isAdmin ? "Admin" : "Settings"}</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}