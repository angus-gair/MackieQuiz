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

const TEAMS = ["Alpha", "Beta", "Gamma", "Delta"];

export default function TeamAllocationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [spinning, setSpinning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const startSpinning = async () => {
    if (spinning) return;

    setSpinning(true);
    let currentIndex = 0;
    const duration = 3000; // Shortened for better UX
    const startTime = Date.now();
    let spinInterval: NodeJS.Timeout;

    try {
      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= duration) {
          clearInterval(spinInterval);
          setSpinning(false);

          // Automatically assign team through API
          if (user) {
            apiRequest("POST", `/api/users/${user.id}/assign-team`)
              .then(res => res.json())
              .then(updatedUser => {
                setSelectedTeam(updatedUser.team);
                setShowConfetti(true);
                // Update the cached user data
                queryClient.setQueryData(["/api/user"], updatedUser);
              })
              .catch(() => {
                toast({
                  title: "Error",
                  description: "Failed to assign team. Please try again.",
                  variant: "destructive",
                });
                setSpinning(false);
                setSelectedTeam(null);
              });
          }
        } else {
          const progress = elapsed / duration;
          currentIndex = (currentIndex + 1) % TEAMS.length;
          setSelectedTeam(TEAMS[currentIndex]);
        }
      };

      spinInterval = setInterval(animate, 100);
    } catch (error) {
      setSpinning(false);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (showConfetti) {
      const duration = 2 * 1000;
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

  const handleContinue = () => {
    setLocation("/");
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