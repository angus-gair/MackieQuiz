  import { useQuery } from "@tanstack/react-query";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { ArrowLeft, Trophy, Medal, Award, Users, User } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Link, useLocation } from "wouter";
  import type { User as UserType } from "@shared/schema";
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
    const [showTeams, setShowTeams] = useState(false);
    const [, setLocation] = useLocation();

    console.log("Rendering LeaderboardPage, showTeams:", showTeams);

    const { data: users = [] } = useQuery<UserType[]>({
      queryKey: ["/api/leaderboard"],
      queryFn: async () => {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      },
      staleTime: 0,
    });

    const { data: teamStats = [] } = useQuery<TeamStats[]>({
      queryKey: ["/api/analytics/teams"],
      queryFn: async () => {
        const res = await fetch("/api/analytics/teams", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch team stats");
        return res.json();
      },
      staleTime: 0,
    });

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
                onClick={() => {
                  setShowTeams(false);
                  console.log("Switched to Individual Rankings. showTeams should be FALSE", showTeams);
                }}
                aria-pressed={!showTeams}
                className={"w-full"}
              >
                <User className="h-4 w-4" />
                <span>Individual</span>
              </Button>
              <Button
                variant={showTeams ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setShowTeams(true);
                  console.log("Switched to Team Rankings. showTeams should be TRUE", showTeams);
                }}
                aria-pressed={showTeams}
                className={"w-full"}
              >
                <Users className="h-4 w-4" />
                <span>Team</span>
              </Button>
            </div>
          </div>

          <div key={showTeams ? "teams" : "individual"} className="text-sm text-center mb-6 text-red-500">
            {showTeams ? (
              <p>Teams are ranked by weekly quiz completion rate</p>
            ) : (
              <p>Individuals are ranked by total points accumulated over multiple weeks through quiz completions</p>
            )}
          </div>
        </div>
      </div>
    );
  }
