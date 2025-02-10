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
    const duration = 10000; 
    const startTime = Date.now();

    // Show each team during the animation
    const spinInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= duration) {
        clearInterval(spinInterval);
        // Only select the random team at the very end
        const randomIndex = Math.floor(Math.random() * TEAMS.length);
        const finalTeam = TEAMS[randomIndex];
        setSelectedTeam(finalTeam);
        setSpinning(false);
        setShowConfetti(true);

        apiRequest("POST", "/api/assign-team", { team: finalTeam })
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
        // During animation, cycle through teams evenly
        const progress = elapsed / duration;
        const cycleSpeed = Math.min(800, 200 + (progress * 600)); // Slower cycle speed
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % TEAMS.length;
          setSelectedTeam(TEAMS[currentIndex]);
        }, cycleSpeed);
      }
    }, 200); // Faster initial cycling

    return () => clearInterval(spinInterval);
  };

  useEffect(() => {
    if (!user?.teamAssigned && !spinning && !selectedTeam) {
      startSpinning();
    }
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

  useEffect(() => {
    if (user?.teamAssigned) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || user.teamAssigned) return null;

  const handleContinue = async () => {
    try {
      const res = await apiRequest("GET", "/api/user");
      const updatedUser = await res.json();
      queryClient.setQueryData(["/api/user"], updatedUser);
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
                  rotateX: [0, -180, -360],
                  y: [-20, 20, -20]
                }}
                transition={{
                  duration: 1.0, 
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