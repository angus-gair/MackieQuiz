import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { AchievementNotification } from "@/components/ui/achievement-notification";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, Trophy, Award, Star } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function QuizCompletionPage() {
  const [, setLocation] = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);

  // Query for latest achievement after quiz completion
  const { data: latestAchievement } = useQuery<Achievement>({
    queryKey: ["/api/achievements/latest"],
    // Only fetch once when the page loads
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Trigger confetti only when a milestone achievement is earned
  useEffect(() => {
    if (latestAchievement) {
      const isMilestone = latestAchievement.type === 'quiz_milestone';
      const milestones = [1, 3, 5, 7, 10, 13, 15, 17, 20];
      
      // Only show confetti for milestone achievements with the specified milestones
      if (isMilestone && milestones.includes(latestAchievement.milestone)) {
        setShowConfetti(true);
        
        // Extended confetti effect for milestone celebrations
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
    }
  }, [latestAchievement]);

  // Display an appropriate icon and text based on the achievement type
  const getAchievementIcon = () => {
    if (!latestAchievement) return <Trophy className="w-8 h-8 text-primary" />;
    
    if (latestAchievement.type === 'quiz_milestone') {
      return <Award className="w-8 h-8 text-primary" />;
    } else if (latestAchievement.type === 'perfect_score') {
      return <Star className="w-8 h-8 text-primary" />;
    }
    
    return <Trophy className="w-8 h-8 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-4">
      <div className="mx-auto px-4" style={{ width: '672px', maxWidth: '100%' }}>
        {/* Centered Page Title */}
        <div className="text-center mb-4 mt-2">
          <h1 className="text-dynamic-lg font-bold text-foreground">Quiz Completed</h1>
        </div>
        
        <Card className="shadow-sm p-6 w-full" style={{ minHeight: '400px' }}>
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              {getAchievementIcon()}
            </div>
            <h2 className="text-xl font-bold text-[#3a474e]">
              {showConfetti ? "Achievement Unlocked!" : "Well Done!"}
            </h2>
            <p className="text-muted-foreground">
              {showConfetti 
                ? `Congratulations! You've reached a milestone: Quiz #${latestAchievement?.milestone}`
                : "Great job! You've completed today's quiz."}
            </p>
            <div className="pt-4">
              <Button
                onClick={() => setLocation("/")}
                className="w-full bg-[#18365a] hover:bg-[#18365a]/90"
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </div>
          </div>
        </Card>

        {/* Show achievement notification for any achievement */}
        {latestAchievement && <AchievementNotification achievement={latestAchievement} />}
      </div>
    </div>
  );
}