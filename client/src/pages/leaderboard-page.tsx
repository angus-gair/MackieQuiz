import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { User } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const BADGES = [
  { icon: Trophy, color: "text-yellow-500" },
  { icon: Medal, color: "text-gray-400" },
  { icon: Award, color: "text-amber-600" },
];

export default function LeaderboardPage() {
  const isMobile = useIsMobile();
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-3">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "mb-4",
          isMobile ? "flex flex-col gap-2" : "flex items-center"
        )}>
          <Link href="/" className={isMobile ? "w-full" : ""}>
            <Button 
              variant="ghost" 
              className={cn(
                "button-hover",
                isMobile ? "w-full justify-center" : "mr-3"
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Weekly Leaderboard</h1>
        </div>

        <div className="grid gap-2">
          {users?.map((user, index) => {
            const Badge = BADGES[index]?.icon;
            const color = BADGES[index]?.color;

            return (
              <Card key={user.id} className={`card ${index === 0 ? 'border-yellow-500/50' : ''}`}>
                <CardHeader className="py-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center">
                      {Badge && (
                        <Badge className={`h-5 w-5 mr-2 ${color}`} />
                      )}
                      <span>{user.username}</span>
                    </div>
                    <span className="text-lg font-bold">{user.weeklyScore} pts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0.5">
                    <p className="text-sm text-muted-foreground">
                      Team: {user.team}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quizzes completed this week: {user.weeklyQuizzes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}