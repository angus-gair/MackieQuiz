import { Home, Users, BarChart3, Settings, Cog } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="lg" 
            className={cn(
              "h-16 px-6",
              location === "/" && "text-primary"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
        <Link href="/teams">
          <Button 
            variant="ghost" 
            size="lg" 
            className={cn(
              "h-16 px-6",
              location === "/teams" && "text-primary"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="sr-only">Teams</span>
          </Button>
        </Link>
        <Link href="/leaderboard">
          <Button 
            variant="ghost" 
            size="lg" 
            className={cn(
              "h-16 px-6",
              location === "/leaderboard" && "text-primary"
            )}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="sr-only">Leaderboard</span>
          </Button>
        </Link>
        <Link href={user?.isAdmin ? "/admin" : "/settings"}>
          <Button 
            variant="ghost" 
            size="lg" 
            className={cn(
              "h-16 px-6",
              (location === "/admin" || location === "/settings") && "text-primary"
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