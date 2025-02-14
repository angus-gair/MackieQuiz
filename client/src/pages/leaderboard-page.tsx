import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
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
  id: string;
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
  const [, setLocation] = useLocation();

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  const { data: teamStats = [] } = useQuery<TeamStats[]>({
    queryKey: ["/api/analytics/teams"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/teams");
      if (!res.ok) throw new Error("Failed to fetch team stats");
      return res.json();
    },
  });

  const sortedUsers = users.sort((a, b) => b.weeklyScore - a.weeklyScore);
  const sortedTeamStats = teamStats.sort((a, b) => b.weeklyCompletionPercentage - a.weeklyCompletionPercentage || b.averageScore - a.averageScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="h-8 mr-3" onClick={() => setLocation("/")}>  
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-bold text-primary">Weekly Leaderboard</h1>
        </div>

        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center rounded-lg bg-muted p-1 w-64">
            <Button
              variant={!showTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowTeams(false)}
              aria-pressed={!showTeams}
              className={cn("w-full", !showTeams && "bg-primary text-primary-foreground")}
            >
              <User className="h-4 w-4" />
              <span>Individual</span>
            </Button>
            <Button
              variant={showTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowTeams(true)}
              aria-pressed={showTeams}
              className={cn("w-full", showTeams && "bg-primary text-primary-foreground")}
            >
              <Users className="h-4 w-4" />
              <span>Team</span>
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center mb-6">
          {showTeams ? "Teams are ranked by weekly quiz completion rate" : "Individuals are ranked by total points accumulated over multiple weeks through quiz completions"}
        </div>

        <div className="space-y-3">
          {showTeams ? (
            sortedTeamStats.map((team, index) => {
              const Badge = BADGES[index]?.icon ?? null;
              const color = BADGES[index]?.color ?? "text-gray-500";

              return (
                <Card key={team.id} className={cn("overflow-hidden", index === 0 && "border-yellow-500/50")}> 
                  <CardHeader className="py-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2 min-w-0">
                        {Badge && <Badge className={cn("h-4 w-4 flex-shrink-0", color)} />}
                        <span className="truncate">{team.teamName}</span>
                      </div>
                      <span className={cn("text-base font-bold", team.weeklyCompletionPercentage >= 80 ? "text-green-500" : team.weeklyCompletionPercentage >= 50 ? "text-yellow-500" : "text-red-500")}>{Math.round(team.weeklyCompletionPercentage)}% completed</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div><p className="text-xs text-muted-foreground">Score</p><p className="text-sm font-medium">{team.totalScore}</p></div>
                      <div><p className="text-xs text-muted-foreground">Avg Score</p><p className="text-sm font-medium">{Math.round(team.averageScore)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Members</p><p className="text-sm font-medium">{team.members}</p></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            sortedUsers.map((user, index) => {
              const Badge = BADGES[index]?.icon ?? null;
              const color = BADGES[index]?.color ?? "text-gray-500";
              return (
                <Card key={user.id} className={cn("overflow-hidden", index === 0 && "border-yellow-500/50")}> 
                  <CardHeader className="py-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2 min-w-0">
                        {Badge && <Badge className={cn("h-4 w-4 flex-shrink-0", color)} />}
                        <span className="truncate">{user.username}</span>
                      </div>
                      <span className="text-base font-bold ml-2">{user.weeklyScore} pts</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
