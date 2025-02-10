import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import confetti from 'canvas-confetti';
import { motion, animate } from "framer-motion";

const TEAMS = ["Pour Decisions", "Sip Happens", "Grape Minds", "Kensington Corkers"];

export default function TeamAllocationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [spinning, setSpinning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Start spinning animation on mount
    if (!spinning && !selectedTeam) {
      setSpinning(true);
      let currentIndex = 0;
      const duration = 5000; // 5 seconds
      const startTime = Date.now();

      const spinInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          clearInterval(spinInterval);
          // Random team selection
          const randomIndex = Math.floor(Math.random() * TEAMS.length);
          setSelectedTeam(TEAMS[randomIndex]);
          setSpinning(false);
          setShowConfetti(true);
          
          // Assign team in backend
          apiRequest("POST", "/api/assign-team", {
            team: TEAMS[randomIndex]
          });
        } else {
          // Update visible team during spin with easing
          currentIndex = (currentIndex + 1) % TEAMS.length;
          setSelectedTeam(TEAMS[currentIndex]);
        }
      }, 100); // Update every 100ms

      return () => clearInterval(spinInterval);
    }
  }, [spinning]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Team Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <motion.div
              animate={{
                scale: spinning ? [1, 1.1, 1] : 1,
                rotate: spinning ? [0, 360] : 0
              }}
              transition={{
                duration: 0.5,
                repeat: spinning ? Infinity : 0,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <div className="text-4xl font-bold text-primary mb-4">
                {selectedTeam || "Spinning..."}
              </div>
            </motion.div>
          </div>

          {!spinning && selectedTeam && (
            <div className="space-y-4 text-center">
              <p className="text-lg">
                Congratulations! You've been assigned to:
              </p>
              <p className="text-2xl font-bold text-primary">
                {selectedTeam}
              </p>
              <Button 
                className="w-full mt-4"
                onClick={() => setLocation("/")}
              >
                Continue to Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
