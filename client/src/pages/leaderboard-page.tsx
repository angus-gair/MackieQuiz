import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Users,
  User,
  Trophy,
  Medal,
  Award,
  // Example fun icons: Flame, Star, Sparkles, etc.
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Types
import type { User as UserType } from "@shared/schema";

type TeamStats = {
  id: string;
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

  console.log("Rendering LeaderboardPage, showTeams:", showTeams);

  // Query: Individuals
  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useQuery<UserType[]>({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    staleTime: 0,
  });

  // Query: Teams
  const {
    data: teamStats = [],
    isLoading: isTeamStatsLoading,
    isError: isTeamStatsError,
  } = useQuery<TeamStats[]>({
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
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 mr-3"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-bold text-primary">Weekly Leaderboard</h1>
        </div>

        {/* Toggle: Individual vs Team */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center rounded-lg bg-muted p-1 w-64">
            <Button
              variant={!showTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setShowTeams(false);
                console.log(
                  "Switched to Individual Rankings. showTeams should be FALSE"
                );
              }}
              aria-pressed={!showTeams}
              className="w-full"
            >
              <User className="h-4 w-4" />
              <span>Individual</span>
            </Button>
            <Button
              variant={showTeams ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setShowTeams(true);
                console.log("Switched to Team Rankings. showTeams should be TRUE");
              }}
              aria-pressed={showTeams}
              className="w-full"
            >
              <Users className="h-4 w-4" />
              <span>Team</span>
            </Button>
          </div>
        </div>

        {/* Info Text */}
        <div
          key={showTeams ? "teams" : "individual"}
          className="text-sm text-center mb-6 text-red-500"
        >
          {showTeams ? (
            <p>XXX Teams are ranked by weekly quiz completion rate</p>
          ) : (
            <p>
              Individuals are ranked by total points accumulated over multiple
              weeks through quiz completions
            </p>
          )}
        </div>

        {/* Conditional Rendering of Leaderboards */}
        {showTeams ? (
          <TeamLeaderboard
            isLoading={isTeamStatsLoading}
            isError={isTeamStatsError}
            data={teamStats}
          />
        ) : (
          <IndividualLeaderboard
            isLoading={isUsersLoading}
            isError={isUsersError}
            data={users}
          />
        )}
      </div>
    </div>
  );
}

/* Subcomponent: Individuals */
function IndividualLeaderboard({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean;
  isError: boolean;
  data: UserType[];
}) {
  if (isLoading) {
    return <p className="text-center text-sm text-gray-500">Loading user leaderboard...</p>;
  }
  if (isError) {
    return <p className="text-center text-sm text-red-500">Error loading user leaderboard</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Individuals</CardTitle>
      </CardHeader>
      <CardContent>
        {data.map((user, index) => {
          const badge = BADGES[index]; // Only defined for 0,1,2 (top three)
          return (
            <div
              key={user.id}
              className="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <div className="flex items-center">
                {/* If within top 3, display the badge icon */}
                {badge && (
                  <badge.icon
                    className={`w-5 h-5 ${badge.color} mr-2`}
                    aria-label={`${badge.label} badge`}
                  />
                )}
                <span>
                  {index + 1}. {user.name}
                </span>
              </div>
              {/* Adjust field names as needed if user object differs */}
              <span>{user.totalScore ?? 0} pts</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* Subcomponent: Teams */
function TeamLeaderboard({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean;
  isError: boolean;
  data: TeamStats[];
}) {
  if (isLoading) {
    return <p className="text-center text-sm text-gray-500">Loading team leaderboard...</p>;
  }
  if (isError) {
    return <p className="text-center text-sm text-red-500">Error loading team leaderboard</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Teams</CardTitle>
      </CardHeader>
      <CardContent>
        {data.map((team, index) => {
          const badge = BADGES[index]; // Only defined for top 3
          return (
            <div
              key={team.id}
              className="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <div className="flex items-center">
                {badge && (
                  <badge.icon
                    className={`w-5 h-5 ${badge.color} mr-2`}
                    aria-label={`${badge.label} badge`}
                  />
                )}
                <span>
                  {index + 1}. {team.teamName}
                </span>
              </div>
              {/* Example field: weekly completion percentage. Adjust as needed. */}
              <span>{team.weeklyCompletionPercentage ?? 0}%</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
