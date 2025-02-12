import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";

const BADGES = [
  { icon: Trophy, color: "text-yellow-500" },
  { icon: Medal, color: "text-gray-400" },
  { icon: Award, color: "text-amber-600" },
];

type TeamStats = {
  teamName: string;
  totalScore: number;
  averageScore: number;
  completedQuizzes: number;
  members: number;
  weeklyCompletionPercentage: number;
};

export default function LeaderboardPage() {
  const isMobile = useIsMobile();
  const [showTeams, setShowTeams] = useState(false);

  const { data: users } = useQuery<UserType[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: teamStats } = useQuery<TeamStats[]>({
    queryKey: ["/api/analytics/teams"],
  });

  const sortedTeamStats = teamStats?.sort((a, b) =>
    b.weeklyCompletionPercentage - a.weeklyCompletionPercentage
  );

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

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center rounded-lg bg-muted p-1 w-64">
            <Button
              variant={!showTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowTeams(false)}
              className={cn(
                "w-full relative flex items-center justify-center gap-2",
                !showTeams && "bg-primary text-primary-foreground",
                showTeams && "hover:bg-transparent"
              )}
            >
              <User className="h-4 w-4" />
              <span>Individual</span>
            </Button>
            <Button
              variant={showTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowTeams(true)}
              className={cn(
                "w-full relative flex items-center justify-center gap-2",
                showTeams && "bg-primary text-primary-foreground",
                !showTeams && "hover:bg-transparent"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Team</span>
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {showTeams ? (
            sortedTeamStats?.map((team, index) => {
              const Badge = BADGES[index]?.icon;
              const color = BADGES[index]?.color;

              return (
                <Card key={team.teamName} className={cn("overflow-hidden", index === 0 && "border-yellow-500/50")}>
                  <CardHeader className="py-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2 min-w-0">
                        {Badge && (
                          <Badge className={cn("h-4 w-4 flex-shrink-0", color)} />
                        )}
                        <span className="truncate">{team.teamName}</span>
                      </div>
                      <span className="text-base font-bold ml-2">{Math.round(team.weeklyCompletionPercentage)}%</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Members: {team.members}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Score: {team.totalScore}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            users?.map((user, index) => {
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
            })
          )}
        </div>
      </div>
    </div>
  );
}