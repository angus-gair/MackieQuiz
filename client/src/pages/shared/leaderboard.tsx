import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TeamStats = {
  name: string;
  score: number;
  avgScore: number;
  members: number;
  completionRate: number;
};

export default function LeaderboardPage() {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: teamStats } = useQuery<TeamStats[]>({
    queryKey: ["/api/analytics/teams"],
  });

  const sortedUsers = users?.sort((a, b) => (b.weeklyScore || 0) - (a.weeklyScore || 0)) || [];
  const sortedTeams = teamStats?.sort((a, b) => b.completionRate - a.completionRate) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-md mx-auto px-4 py-4">
        <div className="flex items-center mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-primary">Weekly Leaderboard</h1>
        </div>

        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-2">
            {sortedUsers.map((user, index) => (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        <span className="font-medium">{user.username}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Team: {user.team}
                        <br />
                        Quizzes: {user.weeklyQuizzes || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{user.weeklyScore || 0} pts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="team" className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Teams are ranked by weekly quiz completion rate
            </p>
            {sortedTeams.map((team, index) => (
              <Card key={team.name} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-emerald-500">
                        {team.completionRate}% completed
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Score</div>
                      <div className="font-medium">{team.score}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Score</div>
                      <div className="font-medium">{team.avgScore}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Members</div>
                      <div className="font-medium">{team.members}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}