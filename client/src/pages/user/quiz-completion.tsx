import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { AchievementNotification } from "@/components/ui/achievement-notification";

export function QuizCompletionPage() {
  // Query for latest achievement after quiz completion
  const { data: latestAchievement } = useQuery<Achievement>({
    queryKey: ["/api/achievements/latest"],
    // Only fetch once when the page loads
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return (
    <div>
      {/* Existing quiz completion content */}
      
      {/* Achievement notification will show automatically if there's a new achievement */}
      <AchievementNotification achievement={latestAchievement} />
    </div>
  );
}
