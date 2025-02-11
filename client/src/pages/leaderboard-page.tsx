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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 mr-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-primary">Weekly Leaderboard</h1>
        </div>

        <div className="space-y-3">
          {users?.map((user, index) => {
            const Badge = BADGES[index]?.icon;
            const color = BADGES[index]?.color;

            return (
              <Card key={user.id} className={cn("overflow-hidden", index === 0 && "border-yellow-500/50")}>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2 min-w-0">
                      {Badge && (
                        <Badge className={cn("h-4 w-4 flex-shrink-0", color)} />
                      )}
                      <span className="truncate">{user.username}</span>
                    </div>
                    <span className="text-base font-bold ml-2">{user.weeklyScore} pts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground truncate">
                      Team: {user.team}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quizzes: {user.weeklyQuizzes}
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