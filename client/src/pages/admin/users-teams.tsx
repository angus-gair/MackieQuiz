import { AdminLayout } from "@/components/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UsersTeamsPage() {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
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

  return (
    <AdminLayout>
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Users & Teams</h1>
          <p className="text-sm text-muted-foreground">
            Manage user team assignments and view team compositions
          </p>
        </div>

        <div className="grid gap-6">
          {teamGroups && Object.entries(teamGroups).map(([team, members]) => (
            <Card key={team}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {team}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {members.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Quizzes: {user.weeklyQuizzes || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Score: {user.weeklyScore || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
