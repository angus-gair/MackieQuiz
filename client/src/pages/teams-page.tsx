import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building, Trophy, Award, Medal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TeamLogo } from "@/components/ui/team-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Fetch team stats for additional team information
  const { data: teamStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/analytics/teams"],
  });

  // Group users by team
  const teamGroups = users?.reduce((acc, user) => {
    const team = user.team || "Unassigned";
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(user);
    return acc;
  }, {} as Record<string, User[]>);
  
  // Set initial active tab to the user's team or first team
  useEffect(() => {
    if (teamGroups && Object.keys(teamGroups).length > 0 && !activeTab) {
      setActiveTab(Object.keys(teamGroups)[0]);
    }
  }, [teamGroups, activeTab]);

  // Get initials for avatar
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  // Function to get team stats for a specific team
  const getTeamStats = (teamName: string) => {
    return teamStats?.find(ts => ts.teamName === teamName);
  };
  
  // Function to sort members by score (descending)
  const sortMembersByScore = (members: User[]) => {
    return [...members].sort((a, b) => (b.weeklyScore || 0) - (a.weeklyScore || 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-4">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-6 mt-2">
          <h1 className="text-3xl font-bold text-foreground">Team Directory</h1>
          <p className="text-muted-foreground mt-2">Explore teams and their members</p>
        </div>

        {isLoadingUsers || isLoadingStats ? (
          // Loading state
          <div className="space-y-8">
            <div className="flex justify-center">
              <Skeleton className="h-10 w-[300px]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="shadow-sm overflow-hidden">
                  <CardHeader className="pb-0">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Loaded content
          <>
            {teamGroups && Object.keys(teamGroups).length > 0 ? (
              <div className="space-y-8">
                {/* Team Navigation Tabs */}
                <Tabs 
                  value={activeTab || Object.keys(teamGroups)[0]} 
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="flex justify-center mb-6">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-xl">
                      {Object.keys(teamGroups).map(team => (
                        <TabsTrigger key={team} value={team} className="flex items-center gap-2">
                          <TeamLogo teamName={team} size="sm" />
                          <span className="truncate max-w-[80px]">{team}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(teamGroups).map(([team, members]) => {
                      const stats = getTeamStats(team);
                      const sortedMembers = sortMembersByScore(members);
                      
                      return (
                        <TabsContent key={team} value={team} className="mt-0">
                          <Card className="shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-0">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <TeamLogo teamName={team} size="lg" />
                                  <div>
                                    <CardTitle className="text-xl font-bold text-foreground">
                                      {team}
                                    </CardTitle>
                                    <CardDescription>
                                      {members.length} member{members.length !== 1 ? 's' : ''}
                                    </CardDescription>
                                    {stats && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <Badge variant="outline" className="bg-primary/5 text-xs">
                                          <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                                          Score: {stats.totalScore}
                                        </Badge>
                                        <Badge variant="outline" className="bg-primary/5 text-xs">
                                          <Award className="h-3 w-3 mr-1 text-blue-500" />
                                          {Math.round(stats.weeklyCompletionPercentage)}% Completion
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                {sortedMembers.map((user, index) => (
                                  <div 
                                    key={user.id} 
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/70 transition-colors"
                                  >
                                    <Avatar className="h-9 w-9 border border-primary/20">
                                      <AvatarFallback className={index < 3 ? "bg-primary/10 text-primary" : ""}>
                                        {getInitials(user.username)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="font-medium">{user.username}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Score: {user.weeklyScore || 0}
                                      </div>
                                    </div>
                                    {index === 0 && members.length > 1 && (
                                      <Trophy className="h-4 w-4 text-amber-500" />
                                    )}
                                    {index === 1 && members.length > 2 && (
                                      <Medal className="h-4 w-4 text-gray-400" />
                                    )}
                                    {index === 2 && members.length > 3 && (
                                      <Award className="h-4 w-4 text-amber-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      );
                    })}
                  </div>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-medium mb-2">No teams available</h2>
                <p className="text-muted-foreground mb-6">
                  There are no teams created yet. Teams will appear here once they've been added.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
