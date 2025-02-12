import { AdminLayout } from "@/components/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Clock, Globe, Shield, ArrowRightLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

  return (
    <AdminLayout>
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">User Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Monitor User Engagement & Behavior
          </p>
        </div>

        {/* Top Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <Users className="h-3 w-3" />
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold">{sessionStats?.totalSessions || 0}</div>
              <p className="text-xs text-muted-foreground">
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
              <div className="text-2xl font-bold">
                {pageViewStats?.mostVisitedPages?.[0]?.views || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Bounce: {Math.round(pageViewStats?.bounceRate || 0)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Auth
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold">{authStats?.totalLogins || 0}</div>
              <p className="text-xs text-muted-foreground">
                Failed: {authStats?.failedLogins || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
          {/* Session Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Analytics</CardTitle>
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
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Peak Usage Hours */}
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionStats?.peakUsageHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                {authStats?.locationBreakdown && (
                  <GeographicHeatMap data={authStats.locationBreakdown} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Navigation Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* External Referrers */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Top External Sources</h3>
                  <div className="grid gap-2">
                    {navigationStats?.externalReferrers.map((referrer) => (
                      <div
                        key={referrer.source}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="text-sm">{referrer.source || 'Direct'}</span>
                        <span className="text-sm font-medium">{referrer.count} visits</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit Pages */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Top Exit Pages</h3>
                  <div className="grid gap-2">
                    {navigationStats?.topExitPages.map((page) => (
                      <div
                        key={page.path}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="text-sm">{page.path}</span>
                        <span className="text-sm font-medium">{page.count} exits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
