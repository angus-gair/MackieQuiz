import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building } from "lucide-react";
import type { User } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function UsersViewPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const teamGroups = users?.reduce((groups: Record<string, User[]>, user) => {
    const team = user.team || 'Unassigned';
    if (!groups[team]) {
      groups[team] = [];
    }
    groups[team].push(user);
    return groups;
  }, {} as Record<string, User[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "mb-8",
          isMobile ? "flex flex-col gap-4" : "flex items-center justify-between"
        )}>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Users & Teams Management</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Users Overview
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamGroups && Object.entries(teamGroups).map(([team, users]) => (
                  <Card key={team} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                        Team: {team}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {users.map((teamUser) => (
                          <div
                            key={teamUser.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{teamUser.username}</p>
                              <p className="text-sm text-muted-foreground">
                                {teamUser.isAdmin ? "Admin" : "Team Member"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}