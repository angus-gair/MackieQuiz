import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { User } from "@shared/schema";

const BADGES = [
  { icon: Trophy, color: "text-yellow-500" },
  { icon: Medal, color: "text-gray-400" },
  { icon: Award, color: "text-amber-600" },
];

export default function LeaderboardPage() {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mr-4 button-hover">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Weekly Leaderboard</h1>
        </div>

        <div className="grid gap-6">
          {users?.map((user, index) => {
            const Badge = BADGES[index]?.icon;
            const color = BADGES[index]?.color;

            return (
              <Card key={user.id} className={`card ${index === 0 ? 'border-yellow-500/50' : ''}`}>
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {Badge && (
                        <Badge className={`h-6 w-6 mr-3 ${color}`} />
                      )}
                      <span>{user.username}</span>
                    </div>
                    <span className="text-xl font-bold">{user.weeklyScore} pts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Team: {user.team}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quizzes completed this week: {user.weeklyQuizzes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}