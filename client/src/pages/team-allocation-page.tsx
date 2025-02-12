import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const TEAMS = ["Pour Decisions", "Sip Happens", "Grape Minds", "Kingsford Corkers"];

export default function TeamAllocationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [spinning, setSpinning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  const spinIntervalRef = useRef<NodeJS.Timeout>();
  const redirectTimeoutRef = useRef<NodeJS.Timeout>();

  const startSpinning = () => {
    if (spinning) return;

    setSpinning(true);
    const duration = 8000 + Math.random() * 4000; // Random duration between 8-12 seconds
    const startTime = Date.now();

    const animate = async () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= duration) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
        }
        const finalTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
        setSelectedTeam(finalTeam);
        setSpinning(false);

        try {
          const userResponse = await apiRequest("GET", "/api/user");
          if (!userResponse.ok) {
            throw new Error('Authentication check failed');
          }

          const response = await apiRequest("POST", "/api/assign-team", { team: finalTeam });
          if (!response.ok) {
            throw new Error(`Team assignment failed: ${response.status}`);
          }

          setShowConfetti(true);
          // Start automatic redirect after 6 seconds
          redirectTimeoutRef.current = setTimeout(() => {
            handleRedirect();
          }, 6000);
        } catch (error) {
          console.error('Team assignment error:', error);
          toast({
            title: "Error",
            description: "Failed to assign team. Please try logging in again.",
            variant: "destructive",
          });
          setSpinning(false);
          setSelectedTeam(null);
          setShowConfetti(false);
          setLocation("/auth");
        }
      } else {
        const progress = elapsed / duration;
        const intervalDelay = Math.min(1500, 400 + (progress * 1100));
        const randomTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
        setSelectedTeam(randomTeam);
      }
    };

    spinIntervalRef.current = setInterval(animate, 400);
  };

  const handleRedirect = async () => {
    if (isRedirecting) return;

    setIsRedirecting(true);
    // Clear any pending automatic redirect
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    try {
      const res = await apiRequest("GET", "/api/user");
      if (!res.ok) {
        throw new Error('Failed to verify user session');
      }
      const updatedUser = await res.json();
      queryClient.setQueryData(["/api/user"], updatedUser);
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user data. Please try logging in again.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  };

  useEffect(() => {
    if (!user?.teamAssigned && !spinning && !selectedTeam) {
      startSpinning();
    }

    return () => {
      // Cleanup all intervals and timeouts on unmount
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [user, spinning, selectedTeam]);

  useEffect(() => {
    if (showConfetti) {
      const duration = 6 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  // Change this to return an empty div instead of null
  if (!user || user.teamAssigned) {
    return <div className="hidden" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center mobile-p-2">
      <Card className="w-full max-w-[280px] sm:max-w-sm">
        <CardHeader className="mobile-space-y-1 pb-3">
          <CardTitle className="text-lg sm:text-xl">Team Assignment</CardTitle>
        </CardHeader>
        <CardContent className="mobile-space-y-2">
          <div className="text-center">
            {spinning ? (
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotateX: [0, -180, -360],
                  y: [-5, 5, -5]
                }}
                transition={{
                  duration: 1.0,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block"
              >
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="text-base sm:text-lg font-bold text-primary">
                    {selectedTeam || "Selecting team..."}
                  </span>
                </div>
              </motion.div>
            ) : selectedTeam ? (
              <div className="mobile-space-y-2">
                <p className="text-sm sm:text-base">
                  Congratulations! You've been assigned to:
                </p>
                <p className="text-lg sm:text-xl font-bold text-primary">
                  {selectedTeam}
                </p>
                <Button 
                  className="w-full mt-3"
                  size="sm"
                  onClick={handleRedirect}
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Continue to Quiz'
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full"
                size="sm"
                onClick={startSpinning}
              >
                Assign Team
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}