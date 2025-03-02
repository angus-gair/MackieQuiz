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
  Medal as MedalIcon,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TeamCard } from "@/components/ui/team-card";

// Types
type TeamStats = {
  teamName: string;
  totalScore: number;
  averageScore: number;
  completedQuizzes: number;
  members: number;
  weeklyCompletionPercentage: number;
};

// Top-3 badge configs with background colors
const BADGES = [
  { icon: Trophy, color: "text-yellow-500", bgColor: "bg-yellow-100", label: "Gold" },
  { icon: Medal, color: "text-gray-400", bgColor: "bg-gray-100", label: "Silver" },
  { icon: Award, color: "text-amber-600", bgColor: "bg-amber-100", label: "Bronze" },
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

  // Get user badges with proper null checks
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
    const color = profile?.teamAvatarColor || 'bg-primary';

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

  // Determine if any data is still loading
  const isLoading = isUsersLoading || isTeamsLoading || isAchievementsLoading || isProfilesLoading;

  return (
    <div className="min-h-screen pt-16 pb-20 bg-gradient-to-b from-background to-muted/10">
      <div className="content-container">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <div className="icon-circle-primary mr-3">
            <Trophy className="h-5 w-5" />
          </div>
          <h1 className="page-title mb-0">Weekly Leaderboard</h1>
        </div>

        {/* Tabs / Toggle */}
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-5 rounded-lg overflow-hidden h-10 bg-muted shadow-sm">
            <TabsTrigger
              value="individual"
              className="flex items-center justify-center gap-2 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <UserIcon className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="flex items-center justify-center gap-2 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <UsersIcon className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Tab Descriptions */}
          <TabsContent value="individual">
            <p className="text-sm text-muted-foreground leading-tight text-center mb-6 page-subtitle">
              Individuals are ranked by total score as determined by
              the number of correct answers over multiple weeks.
            </p>
          </TabsContent>
          
          <TabsContent value="team">
            <p className="text-sm text-muted-foreground leading-tight text-center mb-6 page-subtitle">
              Teams are ranked by weekly quiz completion rate. See how your group compares!
            </p>
          </TabsContent>

          {/* Top 3 Winners Section - Both Tabs */}
          <div className="mb-8">
            {!isLoading && (
              <div className="grid grid-cols-3 gap-3">
                {/* Second Place */}
                <TabsContent value="individual" className="col-span-1">
                  {sortedUsers[1] && (
                    <Card className="text-center border-gray-200 hover:shadow-md transition-shadow h-full">
                      <CardContent className="pt-5 pb-4 px-2 flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-2">
                          <Medal className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-sm truncate w-full">
                          {sortedUsers[1]?.username}
                        </p>
                        <p className="text-xs badge-primary">
                          {sortedUsers[1]?.weeklyScore ?? 0} pts
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="team" className="col-span-1">
                  {sortedTeams[1] && (
                    <Card className="text-center border-gray-200 hover:shadow-md transition-shadow h-full">
                      <CardContent className="pt-5 pb-4 px-2 flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-2">
                          <img 
                            src={
                              sortedTeams[1]?.teamName === "Sip Happens" 
                                ? "/images/sip_happends.PNG" 
                                : sortedTeams[1]?.teamName === "Pour Decisions" 
                                  ? "/images/pour_decisions.PNG"
                                  : sortedTeams[1]?.teamName === "Grape Minds"
                                    ? "/images/grape_minds.PNG"
                                    : sortedTeams[1]?.teamName === "Kingsford Corkers"
                                      ? "/images/kingsford_corkers.png"
                                      : ""
                            }
                            alt={`${sortedTeams[1]?.teamName} logo`}
                            className="h-10 w-10 object-contain"
                          />
                          <div className="h-7 w-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                            <Medal className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="font-semibold text-sm truncate w-full">
                          {sortedTeams[1]?.teamName}
                        </p>
                        <p className="text-xs badge-primary">
                          {Math.round(sortedTeams[1]?.weeklyCompletionPercentage)}%
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* First Place */}
                <TabsContent value="individual" className="col-span-1">
                  {sortedUsers[0] && (
                    <Card className="text-center border-yellow-300 hover:shadow-md transition-shadow h-full scale-110 relative shadow-sm">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                        1st Place
                      </div>
                      <CardContent className="pt-6 pb-4 px-2 flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center mb-2">
                          <Trophy className="h-7 w-7" />
                        </div>
                        <p className="font-bold text-primary truncate w-full mt-1">
                          {sortedUsers[0]?.username}
                        </p>
                        <p className="text-sm font-semibold badge-success">
                          {sortedUsers[0]?.weeklyScore ?? 0} pts
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="team" className="col-span-1">
                  {sortedTeams[0] && (
                    <Card className="text-center border-yellow-300 hover:shadow-md transition-shadow h-full scale-110 relative shadow-sm">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                        1st Place
                      </div>
                      <CardContent className="pt-6 pb-4 px-2 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src={
                              sortedTeams[0]?.teamName === "Sip Happens" 
                                ? "/images/sip_happends.PNG" 
                                : sortedTeams[0]?.teamName === "Pour Decisions" 
                                  ? "/images/pour_decisions.PNG"
                                  : sortedTeams[0]?.teamName === "Grape Minds"
                                    ? "/images/grape_minds.PNG"
                                    : sortedTeams[0]?.teamName === "Kingsford Corkers"
                                      ? "/images/kingsford_corkers.png"
                                      : ""
                            }
                            alt={`${sortedTeams[0]?.teamName} logo`}
                            className="h-12 w-12 object-contain"
                          />
                          <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center">
                            <Trophy className="h-5 w-5" />
                          </div>
                        </div>
                        <p className="font-bold text-primary truncate w-full mt-1">
                          {sortedTeams[0]?.teamName}
                        </p>
                        <p className="text-sm font-semibold badge-success">
                          {Math.round(sortedTeams[0]?.weeklyCompletionPercentage)}%
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Third Place */}
                <TabsContent value="individual" className="col-span-1">
                  {sortedUsers[2] && (
                    <Card className="text-center border-amber-200 hover:shadow-md transition-shadow h-full">
                      <CardContent className="pt-5 pb-4 px-2 flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                          <Award className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-sm truncate w-full">
                          {sortedUsers[2]?.username}
                        </p>
                        <p className="text-xs badge-primary">
                          {sortedUsers[2]?.weeklyScore ?? 0} pts
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="team" className="col-span-1">
                  {sortedTeams[2] && (
                    <Card className="text-center border-amber-200 hover:shadow-md transition-shadow h-full">
                      <CardContent className="pt-5 pb-4 px-2 flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-2">
                          <img 
                            src={
                              sortedTeams[2]?.teamName === "Sip Happens" 
                                ? "/images/sip_happends.PNG" 
                                : sortedTeams[2]?.teamName === "Pour Decisions" 
                                  ? "/images/pour_decisions.PNG"
                                  : sortedTeams[2]?.teamName === "Grape Minds"
                                    ? "/images/grape_minds.PNG"
                                    : sortedTeams[2]?.teamName === "Kingsford Corkers"
                                      ? "/images/kingsford_corkers.png"
                                      : ""
                            }
                            alt={`${sortedTeams[2]?.teamName} logo`}
                            className="h-10 w-10 object-contain"
                          />
                          <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Award className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="font-semibold text-sm truncate w-full">
                          {sortedTeams[2]?.teamName}
                        </p>
                        <p className="text-xs badge-primary">
                          {Math.round(sortedTeams[2]?.weeklyCompletionPercentage)}%
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </div>
            )}
          </div>

          {/* Full Ranking List Header */}
          <h2 className="text-base font-semibold text-primary mb-3">Full Rankings</h2>

          {/* Loading / Error / Empty States */}
          {isLoading && (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Card key={`skeleton-${i}`} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Individual Tab Content */}
          <TabsContent value="individual" className="space-y-3">
            {isUsersError && (
              <p className="text-center text-sm badge-danger p-2 rounded">
                Error loading individual leaderboard. Please try again.
              </p>
            )}
            
            {!isUsersLoading && !isUsersError && sortedUsers.length === 0 && (
              <p className="text-center text-sm text-muted-foreground p-4 border rounded-lg">
                No users found. Check back after some quizzes have been completed.
              </p>
            )}

            {/* Individual Card List */}
            {sortedUsers.map((user, index) => {
              const Badge = BADGES[index]?.icon ?? null;
              const color = BADGES[index]?.color ?? "text-muted-foreground";
              const bgColor = BADGES[index]?.bgColor ?? "bg-gray-50";
              const achievementBadges = getUserBadges(user.id);

              return (
                <Card
                  key={user.id}
                  className={cn(
                    "overflow-hidden hover:shadow-md transition-shadow",
                    index < 3 ? "border-primary/20" : "border-gray-200"
                  )}
                >
                  <CardContent className="p-4">
                    {/* Name / Score Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {Badge ? (
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", bgColor)}>
                            <Badge className={cn("h-5 w-5", color)} />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                          </div>
                        )}
                        
                        {/* Name and Achievement Badges */}
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-base font-semibold text-primary">
                              {user.username}
                            </span>
                            
                            {/* Achievement Badges */}
                            <TooltipProvider>
                              {achievementBadges.map((achievement) => {
                                const IconComponent = ACHIEVEMENT_ICONS[achievement.type as keyof typeof ACHIEVEMENT_ICONS] || Award;
                                return (
                                  <Tooltip key={achievement.id}>
                                    <TooltipTrigger asChild>
                                      <div className="cursor-help">
                                        <IconComponent
                                          className={`h-4 w-4 ${
                                            achievement.tier === 'gold' ? 'text-yellow-500' :
                                              achievement.tier === 'silver' ? 'text-gray-400' :
                                                'text-amber-600'
                                          }`}
                                        />
                                      </div>
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
                          
                          {/* Team Info */}
                          <span className="text-xs text-muted-foreground">
                            Team: <span className="font-medium text-gray-700">{user.team || "—"}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Score and Quiz Count */}
                      <div className="text-right">
                        <div className="badge-primary">{user.weeklyScore || 0} pts</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {user.weeklyQuizzes || 0} quizzes completed
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Team Tab Content */}
          <TabsContent value="team" className="space-y-3">
            {isTeamsError && (
              <p className="text-center text-sm badge-danger p-2 rounded">
                Error loading team leaderboard. Please try again.
              </p>
            )}
            
            {!isTeamsLoading && !isTeamsError && sortedTeams.length === 0 && (
              <p className="text-center text-sm text-muted-foreground p-4 border rounded-lg">
                No teams found. Check back after some teams have been created.
              </p>
            )}

            {/* Team Card List - Using new TeamCard component */}
            {sortedTeams.map((team, index) => (
              <TeamCard 
                key={team.teamName}
                team={team}
                index={index}
                isTopThree={index < 3}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <Link href="/quiz">
            <Button className="btn-primary button-hover">
              <BookOpen className="h-4 w-4 mr-2" />
              Take Weekly Quiz
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}