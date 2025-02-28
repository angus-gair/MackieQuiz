import { Cog, BookOpen } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/use-auth";
import { cn } from "../lib/utils";
import { useIsMobile } from "../hooks/use-mobile";

export function BottomNav() {
  const { user } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();

  // Don't render navigation on auth page or admin pages
  if (location === '/auth' || location.startsWith('/admin')) return null;
  
  // Don't show bottom navigation on desktop since we have top nav
  if (!isMobile) {
    // Still show the admin button for admin users on desktop
    if (user?.isAdmin) {
      return (
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/admin">
            <Button 
              variant={location.startsWith('/admin') ? "default" : "outline"} 
              size="sm" 
              className={cn(
                "h-12 w-12 rounded-full shadow-lg",
                location.startsWith('/admin') 
                  ? "bg-primary text-white" 
                  : "bg-background border border-primary/30"
              )}
            >
              <Cog className="h-5 w-5" />
              <span className="sr-only">Admin</span>
            </Button>
          </Link>
        </div>
      );
    }
    return null;
  }

  // On mobile, just show the prominent Quiz button and Admin button (if admin)
  const isActive = (path: string) => {
    if (path === '/') {
      return location === path;
    }
    return location.startsWith(path);
  };

  return (
    <>
      {/* Just show the Quiz button prominently */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Link href="/quiz">
          <Button 
            variant="default"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all",
              isActive("/quiz") && "ring-4 ring-primary/20",
              "button-hover"
            )}
          >
            <BookOpen className="h-6 w-6" />
            <span className="sr-only">Take Quiz</span>
          </Button>
        </Link>
      </div>

      {/* Admin Button (Only for admin users) */}
      {user?.isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/admin">
            <Button 
              variant={location.startsWith('/admin') ? "default" : "outline"} 
              size="sm" 
              className={cn(
                "h-12 w-12 rounded-full shadow-lg",
                location.startsWith('/admin') 
                  ? "bg-primary text-white" 
                  : "bg-background border border-primary/30"
              )}
            >
              <Cog className="h-5 w-5" />
              <span className="sr-only">Admin</span>
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}