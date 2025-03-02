import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Trophy, Medal, Award, Users, User } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types
import type { User as UserType } from "@shared/schema";

type TeamStats = {
  teamName: string;
  totalScore: number;
  averageScore: number;
  completedQuizzes: number;
  members: number;
  weeklyCompletionPercentage: number;
};

// 1st, 2nd, 3rd place badges
const BADGES = [
  { icon: Trophy, color: "text-yellow-500", label: "Gold" },
  { icon: Medal, color: "text-gray-400", label: "Silver" },
  { icon: Award, color: "text-amber-600", label: "Bronze" },
];

export default function LeaderboardPage() {
  const [showTeams, setShowTeams] = useState(false);
  const [, setLocation] = useLocation();

  // Query: Teams
  const { data: teamStats = [] } = useQuery<TeamStats[]>({
    queryKey: ["/api/analytics/teams"],
  });

  // Query: Individuals
  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-0 py-4">
      <div className="bg-gradient-to-b from-green-100/30 to-blue-100/60 mx-auto" style={{ width: "760px" }}>
        {/* Centered Page Title */}
        <div className="text-center mb-4 mt-2 pt-4">
          <h1 className="text-dynamic-lg font-bold text-foreground">Weekly Leaderboard</h1>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center rounded-lg bg-muted p-2 w-full max-w-[25rem]">
            <Button
              variant={!showTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowTeams(false)}
              className={cn(
                "w-1/2",
                !showTeams && "bg-[#18365a] text-white hover:bg-[#18365a]/90"
              )}
            >
              <User className="h-4 w-4 mr-2" />
              <span className="text-dynamic-sm">Individual</span>
            </Button>
            <Button
              variant={showTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowTeams(true)}
              className={cn(
                "w-1/2",
                showTeams && "bg-[#18365a] text-white hover:bg-[#18365a]/90"
              )}
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="text-dynamic-sm">Team</span>
            </Button>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-dynamic-sm text-muted-foreground text-center mb-6 px-4" key={showTeams ? "team" : "individual"}>
          {showTeams
            ? "Teams are ranked by weekly quiz completion rate"
            : "Individuals are ranked by total points accumulated over multiple weeks through quiz completions"
          }
        </p>

        <div className="space-y-3 w-full px-4 pb-8">
          {showTeams ? (
            // Teams View
            teamStats.map((team, index) => {
              const Badge = BADGES[index]?.icon ?? null;
              const color = BADGES[index]?.color ?? "text-muted-foreground";

              return (
                <Card key={`team-${index}`} className={cn(
                  "overflow-hidden transition-all duration-200 hover:shadow-md w-full",
                  index === 0 && "border-yellow-500/50"
                )}>
                  <CardHeader className="py-3 px-6">
                    <CardTitle className="flex items-center justify-between text-dynamic-base">
                      <div className="flex items-center gap-2 min-w-0">
                        {Badge && <Badge className={cn("h-5 w-5 flex-shrink-0", color)} />}
                        <span className="text-[#3a474e] font-semibold truncate">
                          {index + 1}. {team.teamName}
                        </span>
                      </div>
                      <span className={cn(
                        "text-dynamic-base font-bold ml-2 flex-shrink-0",
                        team.weeklyCompletionPercentage >= 80 ? "text-emerald-600" :
                          team.weeklyCompletionPercentage >= 50 ? "text-amber-500" :
                            "text-destructive"
                      )}>
                        {Math.round(team.weeklyCompletionPercentage)}% completed
                      </span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })
          ) : (
            // Individual View
            users.map((user, index) => {
              const Badge = BADGES[index]?.icon ?? null;
              const color = BADGES[index]?.color ?? "text-muted-foreground";

              return (
                <Card key={`user-${index}`} className={cn(
                  "overflow-hidden transition-all duration-200 hover:shadow-md w-full",
                  index === 0 && "border-yellow-500/50"
                )}>
                  <CardHeader className="py-3 px-6">
                    <CardTitle className="flex items-center justify-between text-dynamic-base">
                      <div className="flex items-center gap-2 min-w-0">
                        {Badge && <Badge className={cn("h-5 w-5 flex-shrink-0", color)} />}
                        <span className="text-[#3a474e] font-semibold truncate">
                          {index + 1}. {user.username}
                        </span>
                      </div>
                      <span className="text-dynamic-base font-bold text-emerald-600 flex-shrink-0">{user.weeklyScore ?? 0} pts</span>
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