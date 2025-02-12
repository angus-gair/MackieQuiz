import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const sortedUsers = users?.sort((a, b) => (b.weeklyScore || 0) - (a.weeklyScore || 0)) || [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Weekly Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Top performers this week
        </p>
      </div>

      <div className="space-y-4">
        {sortedUsers.map((user, index) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {index < 3 && <Trophy className="h-4 w-4 text-yellow-500" />}
                <span>{user.username}</span>
                {user.team && (
                  <span className="text-sm text-muted-foreground">
                    ({user.team})
                  </span>
                )}
              </CardTitle>
              <div className="text-2xl font-bold">{user.weeklyScore || 0}</div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Quizzes completed: {user.weeklyQuizzes || 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
