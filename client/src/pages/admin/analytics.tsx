import { AdminLayout } from "@/components/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Activity } from "lucide-react";

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

export default function AnalyticsPage() {
  const { data: teamStats } = useQuery<TeamStats[]>({
    queryKey: ["/api/analytics/teams"],
  });

  const { data: dailyStats } = useQuery<DailyStats[]>({
    queryKey: ["/api/analytics/daily"],
  });

  return (
    <AdminLayout>
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor team performance and engagement
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Active Teams
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Weekly Completion
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats
                  ? Math.round(
                      teamStats.reduce(
                        (acc, team) => acc + team.weeklyCompletionPercentage,
                        0
                      ) / teamStats.length
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quizzes Completed
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats?.reduce(
                  (acc, team) => acc + team.completedQuizzes,
                  0
                ) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Team</th>
                    <th className="text-right py-2 px-4">Members</th>
                    <th className="text-right py-2 px-4">Weekly Completion</th>
                    <th className="text-right py-2 px-4">Avg. Score</th>
                    <th className="text-right py-2 px-4">Total Quizzes</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats?.map((team) => (
                    <tr key={team.teamName} className="border-b">
                      <td className="py-2 px-4">{team.teamName}</td>
                      <td className="text-right py-2 px-4">{team.members}</td>
                      <td className="text-right py-2 px-4">
                        {Math.round(team.weeklyCompletionPercentage)}%
                      </td>
                      <td className="text-right py-2 px-4">
                        {Math.round(team.averageScore)}
                      </td>
                      <td className="text-right py-2 px-4">
                        {team.completedQuizzes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Daily Completion Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dailyStats?.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center p-2 bg-muted rounded-lg"
                >
                  <span className="text-sm font-medium">{day.date}</span>
                  <span className="text-2xl font-bold">
                    {Math.round(day.completionRate)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {day.completedQuizzes} completed
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
