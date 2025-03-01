import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { AchievementNotification } from "@/components/ui/achievement-notification";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, Trophy } from "lucide-react";

export default function QuizCompletionPage() {
  const [, setLocation] = useLocation();

  // Query for latest achievement after quiz completion
  const { data: latestAchievement } = useQuery<Achievement>({
    queryKey: ["/api/achievements/latest"],
    // Only fetch once when the page loads
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-4">
      <div className="container max-w-5xl mx-auto">
        {/* Centered Page Title */}
        <div className="text-center mb-4 mt-2">
          <h1 className="text-dynamic-lg font-bold text-foreground">Quiz Completed</h1>
        </div>
        
        <Card className="shadow-sm p-6 w-full" style={{ minHeight: '400px' }}>
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-[#3a474e]">Well Done!</h2>
            <p className="text-muted-foreground">
              Great job! You've completed today's quiz.
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

        {/* Achievement notification will show automatically if there's a new achievement */}
        <AchievementNotification achievement={latestAchievement} />
      </div>
    </div>
  );
}