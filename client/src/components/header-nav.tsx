import { Link, useLocation } from "wouter";
import { Trophy, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function HeaderNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [showTrophyAnimation, setShowTrophyAnimation] = useState(false);

  useEffect(() => {
    const handleQuizComplete = () => {
      setShowTrophyAnimation(true);
    };
    window.addEventListener('quiz-complete', handleQuizComplete);
    return () => window.removeEventListener('quiz-complete', handleQuizComplete);
  }, []);

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
                  "h-8 w-8 p-0 relative",
                  location === '/leaderboard' && "text-primary"
                )}
              >
                {showTrophyAnimation ? (
                  <>
                    {/* Multiple radiating circles for enhanced effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-amber-200/70"
                      initial={{ scale: 0.1, opacity: 0 }}
                      animate={{
                        scale: [1, 2.5],
                        opacity: [0.7, 0]
                      }}
                      transition={{
                        duration: 2.5,
                        ease: "easeOut",
                        times: [0, 1],
                        repeat: Infinity
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-amber-200/70"
                      initial={{ scale: 0.1, opacity: 0 }}
                      animate={{
                        scale: [1, 2.5],
                        opacity: [0.7, 0]
                      }}
                      transition={{
                        duration: 2.5,
                        ease: "easeOut",
                        times: [0, 1],
                        repeat: Infinity,
                        delay: 1.25 // Offset for second ring
                      }}
                    />
                    {/* Trophy icon with gentle floating animation */}
                    <motion.div
                      initial={{ scale: 1, y: 0 }}
                      animate={{
                        y: [-4, 4, -4]
                      }}
                      transition={{
                        duration: 3.0,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative z-10"
                    >
                      <Trophy className="h-4 w-4 text-amber-400" />
                    </motion.div>
                  </>
                ) : (
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                )}
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