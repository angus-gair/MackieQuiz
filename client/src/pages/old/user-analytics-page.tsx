import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Clock, ArrowLeft, Globe, Shield, ArrowRightLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Redirect } from 'wouter';
import { GeographicHeatMap } from "@/components/GeographicHeatMap";

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

type NavigationStats = {
  externalReferrers: { source: string; count: number }[];
  topExitPages: { path: string; count: number }[];
  internalFlows: { from: string; to: string; count: number }[];
  bounceRate: number;
};

export default function UserAnalyticsPage() {
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

  const { data: navigationStats } = useQuery<NavigationStats>({
    queryKey: ["/api/analytics/navigation"],
  });

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-full px-4 py-4 sm:px-6">
        <div className="flex items-center mb-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-8 mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-bold text-primary">User Analytics</h1>
            <p className="text-xs text-muted-foreground">Monitor User Engagement & Behavior</p>
          </div>
        </div>

        {/* Top Stats Overview */}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 mb-4">
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <Users className="h-3 w-3" />
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-base font-bold">{sessionStats?.totalSessions || 0}</div>
              <p className="text-[10px] text-muted-foreground">
                Avg. Duration: {Math.round(sessionStats?.averageSessionDuration || 0)} mins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Views
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-base font-bold">
                {pageViewStats?.mostVisitedPages?.[0]?.views || 0}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Bounce: {Math.round(pageViewStats?.bounceRate || 0)}%
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-2 sm:col-span-1">
            <CardHeader className="py-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Auth
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-base font-bold">{authStats?.totalLogins || 0}</div>
              <p className="text-[10px] text-muted-foreground">
                Failed: {authStats?.failedLogins || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="space-y-4">
          {/* Session Analytics */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Session Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Device Breakdown */}
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sessionStats?.deviceBreakdown}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        {sessionStats?.deviceBreakdown?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Peak Usage Hours */}
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionStats?.peakUsageHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tickFormatter={(hour) => `${hour}h`}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
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
            <CardHeader className="py-3">
              <CardTitle className="text-xs flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Page Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Most Visited Pages */}
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pageViewStats?.mostVisitedPages?.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="path"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="views" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Error Pages */}
                {pageViewStats?.errorPages && pageViewStats.errorPages.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold mb-2">Error Pages</h3>
                    <div className="grid gap-1">
                      {pageViewStats.errorPages.map((page) => (
                        <div
                          key={page.path}
                          className="flex items-center justify-between p-1.5 bg-muted rounded-md"
                        >
                          <span className="text-[10px] truncate flex-1">{page.path}</span>
                          <span className="text-[10px] font-medium text-destructive ml-2">
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
            <CardHeader className="py-3">
              <CardTitle className="text-xs flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Location Breakdown */}
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={authStats?.locationBreakdown}
                        dataKey="count"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        {authStats?.locationBreakdown?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Failure Reasons */}
                <div>
                  <h3 className="text-xs font-semibold mb-2">Login Failures</h3>
                  <div className="space-y-1">
                    {authStats?.failureReasons?.map((reason) => (
                      <div
                        key={reason.reason}
                        className="flex items-center justify-between p-1.5 bg-muted rounded-md"
                      >
                        <span className="text-[10px] truncate flex-1">{reason.reason}</span>
                        <span className="text-[10px] font-medium ml-2">{reason.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Geographic Distribution */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                {authStats?.locationBreakdown && (
                  <GeographicHeatMap data={authStats.locationBreakdown} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Flow Analytics */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" />
                User Navigation Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* External Referrers */}
                <div>
                  <h3 className="text-xs font-semibold mb-2">Top External Sources</h3>
                  <div className="grid gap-1">
                    {navigationStats?.externalReferrers.map((referrer) => (
                      <div
                        key={referrer.source}
                        className="flex items-center justify-between p-1.5 bg-muted rounded-md"
                      >
                        <span className="text-[10px] truncate flex-1">
                          {referrer.source || 'Direct Visit'}
                        </span>
                        <span className="text-[10px] font-medium ml-2">
                          {referrer.count} visits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit Pages */}
                <div>
                  <h3 className="text-xs font-semibold mb-2">Top Exit Pages</h3>
                  <div className="grid gap-1">
                    {navigationStats?.topExitPages.map((page) => (
                      <div
                        key={page.path}
                        className="flex items-center justify-between p-1.5 bg-muted rounded-md"
                      >
                        <span className="text-[10px] truncate flex-1">{page.path}</span>
                        <span className="text-[10px] font-medium ml-2">
                          {page.count} exits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Navigation Flows */}
                <div>
                  <h3 className="text-xs font-semibold mb-2">Common Navigation Paths</h3>
                  <div className="grid gap-1">
                    {navigationStats?.internalFlows.map((flow, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-1.5 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-1 text-[10px] truncate flex-1">
                          <span className="truncate">{flow.from}</span>
                          <ArrowRightLeft className="h-2 w-2 flex-shrink-0" />
                          <span className="truncate">{flow.to}</span>
                        </div>
                        <span className="text-[10px] font-medium ml-2">
                          {flow.count} times
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}