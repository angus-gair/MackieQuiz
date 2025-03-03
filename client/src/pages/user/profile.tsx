import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Award } from "lucide-react";
import type { Achievement } from "@shared/schema";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/user"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-4">
      <div className="mx-auto px-4" style={{ width: '672px', maxWidth: '100%' }}>
        {/* Centered Page Title */}
        <div className="text-center mb-4 mt-2">
          <h1 className="text-dynamic-lg font-bold text-foreground">Your Profile</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-base text-[#3a474e]">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Username</label>
              <p className="text-sm font-medium text-[#3a474e]">{user?.username}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Team</label>
              <p className="text-sm font-medium text-[#3a474e]">{user?.team || 'Unassigned'}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Weekly Progress</label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Quizzes</p>
                  <p className="text-sm font-medium text-primary">{user?.weeklyQuizzes || 0}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-sm font-medium text-primary">{user?.weeklyScore || 0}</p>
                </div>
              </div>
            </div>
            <Button asChild className="w-full bg-[#18365a] hover:bg-[#18365a]/90">
              <Link href="/settings">
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card className="mt-4 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2 text-[#3a474e]">
              <Award className="h-4 w-4 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex flex-col items-center p-3 bg-muted/30 rounded-lg text-center hover:bg-muted/50 transition-colors"
                    title={achievement.description}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-xs font-medium truncate w-full text-[#3a474e]">
                      {achievement.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No achievements yet. Complete quizzes to earn badges!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}