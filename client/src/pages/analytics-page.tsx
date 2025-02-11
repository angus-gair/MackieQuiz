import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Trophy, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";

type TeamStats = {
  teamName: string;
  totalScore: number;
  averageScore: number;
  completedQuizzes: number;
  members: number;
  weeklyCompletionPercentage: number;
};

type DailyStats = {
  date: string;
  completedQuizzes: number;
  completionRate: number;
};

type TeamKnowledge = {
  week: string;
  knowledgeScore: number;
  movingAverage: number;
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data: teamStats } = useQuery<TeamStats[]>({
    queryKey: ["/api/analytics/teams"],
  });

  const { data: dailyStats } = useQuery<DailyStats[]>({
    queryKey: ["/api/analytics/daily"],
  });

  const { data: teamKnowledge } = useQuery<TeamKnowledge[]>({
    queryKey: ["/api/analytics/team-knowledge"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-full px-4 py-6 sm:px-6">
        <div className="flex items-center mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="mr-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary mb-1">Kingsford Corkers</h1>
            <p className="text-sm text-muted-foreground">Analytics Dashboard</p>
          </div>
        </div>

        {/* Team Statistics Grid - Mobile First */}
        <div className="grid gap-4 mb-6">
          {teamStats?.map((stat) => (
            <Card key={stat.teamName} className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  {stat.teamName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Weekly Score</p>
                    <p className="text-lg font-bold">{stat.totalScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <p className={cn(
                      "text-lg font-bold",
                      stat.weeklyCompletionPercentage >= 80 ? "text-green-500" :
                      stat.weeklyCompletionPercentage >= 50 ? "text-yellow-500" :
                      "text-red-500"
                    )}>
                      {stat.weeklyCompletionPercentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                    <p className="text-sm">{stat.averageScore.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="text-sm">{stat.members}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Charts - Mobile Optimized */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="teamName" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="weeklyCompletionPercentage" name="Completion %" fill="#82ca9d" />
                    <Bar dataKey="totalScore" name="Score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Weekly Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamKnowledge} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        });
                      }}
                      tick={{ fontSize: 12 }}
                      interval={isMobile ? 6 : 2}
                    />
                    <YAxis
                      domain={[60, 90]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        });
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="knowledgeScore"
                      name="Weekly Score"
                      stroke="#8884d8"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAverage"
                      name="4-Week Average"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}