import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Users, Trophy } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className={cn(
          "mb-8",
          isMobile ? "flex flex-col gap-4" : "flex items-center"
        )}>
          <Link href="/admin">
            <Button variant="ghost" className="button-hover">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary ml-4">Analytics Dashboard</h1>
        </div>

        <div className="grid gap-6">
          {/* Team Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="teamName" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#82ca9d" 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === "Completion Rate (%)") {
                          return [`${value}%`, name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="right" dataKey="weeklyCompletionPercentage" name="Completion Rate (%)" fill="#82ca9d" />
                    <Bar yAxisId="left" dataKey="totalScore" name="Total Score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      stroke="#8884d8"
                      allowDecimals={false}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#82ca9d"
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === "Completion Rate (%)") {
                          return [`${value}%`, name];
                        }
                        return [Number.isInteger(value) ? value : value.toFixed(1), name];
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="completedQuizzes" 
                      name="Completed Quizzes" 
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="completionRate" 
                      name="Completion Rate (%)" 
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Team Knowledge Chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Team Knowledge Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamKnowledge}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { 
                          month: 'short',
                          year: '2-digit'
                        });
                      }}
                      interval={12} 
                    />
                    <YAxis 
                      domain={[60, 90]} 
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });
                      }}
                      formatter={(value: number) => [`${value}%`, value === 0 ? "No data" : value]}
                    />
                    <Legend />
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
                      name="4-Week Moving Average"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Team Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamStats?.map((stat) => (
              <Card key={stat.teamName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    {stat.teamName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Total Score</dt>
                      <dd className="text-2xl font-bold">{stat.totalScore}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Average Score</dt>
                      <dd>{stat.averageScore.toFixed(1)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Completed Quizzes</dt>
                      <dd>{stat.completedQuizzes}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Team Members</dt>
                      <dd>{stat.members}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Weekly Quiz Completion</dt>
                      <dd className={cn(
                        "font-semibold",
                        stat.weeklyCompletionPercentage >= 80 ? "text-green-500" :
                        stat.weeklyCompletionPercentage >= 50 ? "text-yellow-500" :
                        "text-red-500"
                      )}>
                        {stat.weeklyCompletionPercentage.toFixed(1)}%
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}