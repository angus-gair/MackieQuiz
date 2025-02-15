import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User as UserType, Achievement } from "@shared/schema";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  User as UserIcon,
  Users as UsersIcon,
  Star,
  Target,
  Medal as MedalIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderNav } from "@/components/header-nav";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
type TeamStats = {
  teamName: string;
  totalScore: number;
  averageScore: number;
  completedQuizzes: number;
  members: number;
  weeklyCompletionPercentage: number;
};

// Top-3 badge configs
const BADGES = [
  { icon: Trophy, color: "text-yellow-500", label: "Gold" },
  { icon: Medal, color: "text-gray-400", label: "Silver" },
  { icon: Award, color: "text-amber-600", label: "Bronze" },
];

// Achievement badge icons
const ACHIEVEMENT_ICONS = {
  perfect_score: Star,
  team_contribution: Target,
  quiz_milestone: MedalIcon,
};

export default function LeaderboardPage() {
  // Fetch Individuals
  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  // Fetch Teams
  const {
    data: teamStats,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useQuery<TeamStats[]>({
    queryKey: ["/api/analytics/teams"],
  });

  // Fetch Achievement Badges
  const {
    data: achievements,
    isLoading: isAchievementsLoading,
  } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  // Helper to get user's highest tier badges
  const getUserBadges = (userId: number) => {
    if (!achievements) return [];
    return achievements.filter(
      (a) => a.userId === userId && a.isHighestTier
    ).slice(0, 3); // Show up to 3 highest tier badges
  };

  // Sort individuals by weekly score (descending)
  const sortedUsers =
    users?.sort((a, b) => (b.weeklyScore || 0) - (a.weeklyScore || 0)) || [];

  // Sort teams by weekly completion percentage (descending)
  const sortedTeams =
    teamStats?.sort(
      (a, b) => b.weeklyCompletionPercentage - a.weeklyCompletionPercentage
    ) || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <HeaderNav />

      <main className="pt-16 px-4 pb-24">
        <div className="container max-w-md mx-auto">
          {/* Back Button & Title */}
          <div className="flex items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-8 mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-primary">Weekly Leaderboard</h1>
          </div>

          {/* Tabs / Toggle */}
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 rounded-md overflow-hidden h-10">
              <TabsTrigger
                value="individual"
                className="flex items-center justify-center gap-2 px-3 text-sm font-medium [aria-selected='true']:bg-blue-900 [aria-selected='true']:text-white"
              >
                <UserIcon className="h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="flex items-center justify-center gap-2 px-3 text-sm font-medium [aria-selected='true']:bg-blue-900 [aria-selected='true']:text-white"
              >
                <UsersIcon className="h-4 w-4" />
                Team
              </TabsTrigger>
            </TabsList>

            {/* ---------------- INDIVIDUAL TAB ---------------- */}
            <TabsContent value="individual" className="space-y-4">
              <p className="text-xs text-muted-foreground leading-tight">
                Individuals are ranked by total score as determined by
                the number of correct answers, accumulated over each week.
              </p>

              {/* Loading / Error / Empty */}
              {(isUsersLoading || isAchievementsLoading) && (
                <p className="text-center text-sm text-muted-foreground">
                  Loading individual leaderboard...
                </p>
              )}
              {isUsersError && (
                <p className="text-center text-sm text-red-500">
                  Error loading individual leaderboard
                </p>
              )}
              {!isUsersLoading && !isUsersError && sortedUsers.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No users found.
                </p>
              )}

              {/* Render Individuals */}
              {sortedUsers.map((user, index) => {
                const badge = BADGES[index]; // top-3 only
                const achievementBadges = getUserBadges(user.id);

                return (
                  <Card
                    key={user.id}
                    className={`border rounded-lg overflow-hidden ${
                      index === 0 ? "border-yellow-500" : "border-gray-300"
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Name / Score Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {badge && (
                            <badge.icon
                              className={`h-5 w-5 ${badge.color}`}
                              aria-label={`${badge.label} badge`}
                            />
                          )}
                          <span className="text-xs text-muted-foreground">{`#${index + 1}`}</span>
                          {/* Name and Achievement Badges */}
                          <div className="flex items-center gap-1">
                            <span className="text-base font-semibold text-blue-800">
                              {user.username}
                            </span>
                            {/* Achievement Badges */}
                            <TooltipProvider>
                              {achievementBadges.map((achievement, i) => {
                                const IconComponent = ACHIEVEMENT_ICONS[achievement.type as keyof typeof ACHIEVEMENT_ICONS] || Award;
                                return (
                                  <Tooltip key={achievement.id}>
                                    <TooltipTrigger>
                                      <IconComponent 
                                        className={`h-4 w-4 ${
                                          achievement.tier === 'gold' ? 'text-yellow-500' :
                                          achievement.tier === 'silver' ? 'text-gray-400' :
                                          'text-amber-600'
                                        }`}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-sm font-semibold">{achievement.name}</p>
                                      <p className="text-xs">{achievement.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </TooltipProvider>
                          </div>
                        </div>
                        {/* Weekly Score */}
                        <div className="text-base font-semibold text-emerald-600">
                          {user.weeklyScore || 0} pts
                        </div>
                      </div>

                      {/* One line with "Team: X" (left) and "Quizzes: Y" (right) */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Team:{" "}
                          <span className="font-bold text-gray-800">
                            {user.team || "—"}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Quizzes:{" "}
                          <span className="font-bold text-gray-800">
                            {user.weeklyQuizzes || 0}
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* ---------------- TEAM TAB ---------------- */}
            <TabsContent value="team" className="space-y-4">
              {/* Two-line description */}
              <p className="text-xs text-muted-foreground leading-tight">
                Teams are ranked by weekly quiz completion rate. See how your group compares across each week.
              </p>

              {/* Loading / Error / Empty */}
              {isTeamsLoading && (
                <p className="text-center text-sm text-muted-foreground">
                  Loading team leaderboard...
                </p>
              )}
              {isTeamsError && (
                <p className="text-center text-sm text-red-500">
                  Error loading team leaderboard
                </p>
              )}
              {!isTeamsLoading && !isTeamsError && sortedTeams.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No teams found.
                </p>
              )}

              {/* Render Teams */}
              {sortedTeams.map((team, index) => {
                const badge = BADGES[index]; // top-3 only
                return (
                  <Card
                    key={team.teamName}
                    className={`border rounded-lg overflow-hidden ${
                      index === 0 ? "border-yellow-500" : "border-gray-300"
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Team Name / % Completed */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {badge && (
                            <badge.icon
                              className={`h-5 w-5 ${badge.color}`}
                              aria-label={`${badge.label} badge`}
                            />
                          )}
                          <span className="text-xs text-muted-foreground">{`#${index + 1}`}</span>
                          {/* Name in darker blue, larger font */}
                          <span className="text-base font-semibold text-blue-800">
                            {team.teamName}
                          </span>
                        </div>
                        <div className="text-base font-semibold text-emerald-600">
                          {Math.round(team.weeklyCompletionPercentage)}% completed
                        </div>
                      </div>

                      {/* Stats Row: Score, Avg Score, Members */}
                      <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-gray-600">Score</div>
                          <div className="text-base font-semibold text-blue-800">
                            {team.totalScore}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Avg Score</div>
                          <div className="text-base font-semibold text-blue-800">
                            {Math.round(team.averageScore)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Members</div>
                          <div className="text-base font-semibold text-blue-800">
                            {team.members}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}