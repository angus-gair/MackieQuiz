import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { AchievementNotification } from "@/components/ui/achievement-notification";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "wouter";
import { Home, Trophy } from "lucide-react";

export default function QuizCompletionPage() {
  const navigate = useNavigate();

  // Query for latest achievement after quiz completion
  const { data: latestAchievement } = useQuery<Achievement>({
    queryKey: ["/api/achievements/latest"],
    // Only fetch once when the page loads
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-4">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Quiz Completed!</h1>
          <p className="text-muted-foreground">
            Great job! You've completed today's quiz.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => navigate("/")}
              className="w-full"
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
  );
}