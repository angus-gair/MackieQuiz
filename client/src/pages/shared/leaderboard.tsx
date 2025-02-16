import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User as UserType, Achievement, UserProfile } from "@shared/schema";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  // Fetch Achievement Badges and User Profiles
  const {
    data: achievements,
    isLoading: isAchievementsLoading,
  } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const {
    data: userProfiles,
    isLoading: isProfilesLoading,
  } = useQuery<UserProfile[]>({
    queryKey: ["/api/users/profiles"],
  });

  // Helper to get user's profile
  const getUserProfile = (userId: number) => {
    if (!userProfiles) return null;
    return userProfiles.find(p => p.userId === userId);
  };

  // Fix the getUserBadges function with proper null checks
  const getUserBadges = (userId: number) => {
    if (!achievements) return [];
    const profile = getUserProfile(userId);
    const userAchievements = achievements.filter(a => a.userId === userId);

    if (profile?.showcaseAchievements?.length) {
      // Return user's selected showcase achievements with proper null checking
      return userAchievements
        .filter(a => profile.showcaseAchievements?.includes(a.id.toString()))
        .sort((a, b) => {
          const aIndex = profile.achievementShowcaseOrder?.indexOf(a.id.toString()) ?? -1;
          const bIndex = profile.achievementShowcaseOrder?.indexOf(b.id.toString()) ?? -1;
          return aIndex - bIndex;
        });
    }

    // Default to highest tier badges if no showcase set
    return userAchievements
      .filter(a => a.isHighestTier)
      .slice(0, 3);
  };

  // Helper to generate team avatar
  const getTeamAvatar = (teamName: string, userId: number) => {
    const profile = getUserProfile(userId);
    const preference = profile?.teamAvatarPreference || 'initials';
    const color = profile?.teamAvatarColor || 'bg-blue-500';

    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback className={color}>
          {preference === 'initials'
            ? teamName.substring(0, 2).toUpperCase()
            : <UsersIcon className="h-4 w-4" />
          }
        </AvatarFallback>
      </Avatar>
    );
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
              {(isUsersLoading || isAchievementsLoading || isProfilesLoading) && (
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

              {/* Individual Card */}
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
                              {achievementBadges.map((achievement) => {
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

                      {/* Team Row without Avatar */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">
                            Team:{" "}
                            <span className="font-bold text-gray-800">
                              {user.team || "—"}
                            </span>
                          </span>
                        </div>
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

              {/* Team Card */}
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
                      {/* Team Name and Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {badge && (
                            <badge.icon
                              className={`h-5 w-5 ${badge.color}`}
                              aria-label={`${badge.label} badge`}
                            />
                          )}
                          <span className="text-xs text-muted-foreground">{`#${index + 1}`}</span>
                          <span className="text-base font-semibold text-blue-800">
                            {team.teamName}
                          </span>
                        </div>
                        {/* Team Avatar */}
                        {getTeamAvatar(team.teamName, team.members)}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-600 text-sm">Score</div>
                          <div className="text-base font-semibold text-blue-800">
                            {team.totalScore}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-sm">Avg Score</div>
                          <div className="text-base font-semibold text-blue-800">
                            {Math.round(team.averageScore)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-sm">Members</div>
                          <div className="text-base font-semibold text-blue-800">
                            {team.members}
                          </div>
                        </div>
                        {/* Completion Rate - Highlighted */}
                        <div>
                          <div className="text-gray-600 text-sm font-medium">Completion Rate</div>
                          <div className={`text-base font-bold ${
                            team.weeklyCompletionPercentage >= 80 ? "text-emerald-600" :
                            team.weeklyCompletionPercentage >= 50 ? "text-amber-500" :
                            "text-destructive"
                          }`}>
                            {Math.round(team.weeklyCompletionPercentage)}%
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