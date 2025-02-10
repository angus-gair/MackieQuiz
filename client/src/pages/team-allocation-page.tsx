import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const TEAMS = ["Pour Decisions", "Sip Happens", "Grape Minds", "Kensington Corkers"];

export default function TeamAllocationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [spinning, setSpinning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const startSpinning = () => {
    if (spinning) return;

    setSpinning(true);
    let currentIndex = 0;
    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    const spinInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(spinInterval);
        const randomIndex = Math.floor(Math.random() * TEAMS.length);
        const selectedTeam = TEAMS[randomIndex];
        setSelectedTeam(selectedTeam);
        setSpinning(false);
        setShowConfetti(true);

        // Assign team in backend but don't update queryClient yet
        apiRequest("POST", "/api/assign-team", { team: selectedTeam })
          .catch((error) => {
            toast({
              title: "Error",
              description: "Failed to assign team. Please try again.",
              variant: "destructive",
            });
            setSpinning(false);
            setSelectedTeam(null);
          });
      } else {
        currentIndex = (currentIndex + 1) % TEAMS.length;
        setSelectedTeam(TEAMS[currentIndex]);
      }
    }, 100);

    return () => clearInterval(spinInterval);
  };

  // Start spinning on mount
  useEffect(() => {
    if (!user?.teamAssigned && !spinning && !selectedTeam) {
      startSpinning();
    }
  }, [user, spinning, selectedTeam]);

  useEffect(() => {
    if (showConfetti) {
      const duration = 3 * 1000;
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

  // If user already has a team, redirect to quiz
  useEffect(() => {
    if (user?.teamAssigned) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || user.teamAssigned) return null;

  const handleContinue = async () => {
    try {
      // Fetch fresh user data after team assignment
      const res = await apiRequest("GET", "/api/user");
      const updatedUser = await res.json();
      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], updatedUser);
      // Navigate to the quiz page
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Team Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {spinning ? (
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block"
              >
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-2xl font-bold text-primary">
                    {selectedTeam || "Selecting team..."}
                  </span>
                </div>
              </motion.div>
            ) : selectedTeam ? (
              <div className="space-y-4">
                <p className="text-lg">
                  Congratulations! You've been assigned to:
                </p>
                <p className="text-2xl font-bold text-primary">
                  {selectedTeam}
                </p>
                <Button 
                  className="w-full mt-4"
                  onClick={handleContinue}
                >
                  Continue to Quiz
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full"
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