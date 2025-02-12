import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Clock, ArrowLeft, Globe, Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Redirect } from 'wouter';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

type SessionStats = {
  totalSessions: number;
  averageSessionDuration: number;
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  peakUsageHours: { hour: number; count: number }[];
};

type PageViewStats = {
  mostVisitedPages: { path: string; views: number }[];
  averageTimeOnPage: { path: string; avgTime: number }[];
  bounceRate: number;
  errorPages: { path: string; errors: number }[];
};

type AuthStats = {
  totalLogins: number;
  failedLogins: number;
  locationBreakdown: { country: string; count: number }[];
  failureReasons: { reason: string; count: number }[];
};

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

  const { data: sessionStats } = useQuery<SessionStats>({
    queryKey: ["/api/analytics/sessions"],
  });

  const { data: pageViewStats } = useQuery<PageViewStats>({
    queryKey: ["/api/analytics/pageviews"],
  });

  const { data: authStats } = useQuery<AuthStats>({
    queryKey: ["/api/analytics/auth"],
  });

  const { data: teamStats } = useQuery<TeamStats[]>({
    queryKey: ["/api/analytics/teams"],
  });

  const { data: dailyStats } = useQuery<DailyStats[]>({
    queryKey: ["/api/analytics/daily"],
  });

  const { data: teamKnowledge } = useQuery<TeamKnowledge[]>({
    queryKey: ["/api/analytics/team-knowledge"],
  });

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

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
            <h1 className="text-xl font-bold text-primary mb-1">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">User Interaction & Performance Metrics</p>
          </div>
        </div>

        {/* Top Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionStats?.totalSessions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Avg. Duration: {Math.round(sessionStats?.averageSessionDuration || 0)} mins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Page Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pageViewStats?.mostVisitedPages?.[0]?.views || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Bounce Rate: {Math.round(pageViewStats?.bounceRate || 0)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Auth Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{authStats?.totalLogins || 0}</div>
              <p className="text-xs text-muted-foreground">
                Failed Attempts: {authStats?.failedLogins || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="space-y-6">
          {/* Session Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Device Breakdown */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sessionStats?.deviceBreakdown}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {sessionStats?.deviceBreakdown?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Peak Usage Hours */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionStats?.peakUsageHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour"
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(hour) => `${hour}:00`}
                      />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page View Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Page View Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Most Visited Pages */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pageViewStats?.mostVisitedPages?.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="path"
                        tick={{ fontSize: 12 }}
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Error Pages */}
                {pageViewStats?.errorPages?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-2">Error Pages</h3>
                    <div className="grid gap-2">
                      {pageViewStats.errorPages.map((page) => (
                        <div
                          key={page.path}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <span className="text-sm truncate flex-1">{page.path}</span>
                          <span className="text-sm font-medium text-destructive">
                            {page.errors} errors
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Auth Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authentication Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Location Breakdown */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={authStats?.locationBreakdown}
                        dataKey="count"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {authStats?.locationBreakdown?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Failure Reasons */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Login Failure Reasons</h3>
                  <div className="space-y-2">
                    {authStats?.failureReasons?.map((reason) => (
                      <div
                        key={reason.reason}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="text-sm truncate flex-1">{reason.reason}</span>
                        <span className="text-sm font-medium">{reason.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Score</p>
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
                      <p className="text-xs text-muted-foreground">Avg</p>
                      <p className="text-lg">{stat.averageScore.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="text-lg">{stat.members}</p>
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
    </div>
  );
}