import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TeamsPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-primary">Teams</h1>
        </div>

        <div className="space-y-4">
          {teamGroups && Object.entries(teamGroups).map(([team, members]) => (
            <Card key={team}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  {team}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {members.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {user.weeklyScore || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
