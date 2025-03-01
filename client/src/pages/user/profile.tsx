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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-4">
      <div className="container max-w-5xl mx-auto">
        {/* Centered Page Title */}
        <div className="text-center mb-4 mt-2">
          <h1 className="text-dynamic-lg font-bold text-foreground">Your Profile</h1>
        </div>

        {/* Two-column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information - Side Column */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm h-full">
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-base text-[#3a474e] flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="h-3 w-3" />
                  </div>
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 py-5">
                <div>
                  <label className="text-xs text-muted-foreground">Username</label>
                  <p className="text-sm font-medium text-[#3a474e]">{user?.username}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Team</label>
                  <p className="text-sm font-medium text-[#3a474e]">{user?.team || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Weekly Progress</label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-xs text-muted-foreground">Quizzes</p>
                      <p className="text-sm font-medium text-primary">{user?.weeklyQuizzes || 0}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
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
          </div>

          {/* Achievements Section - Main Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm h-full">
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-base flex items-center gap-2 text-[#3a474e]">
                  <Award className="h-4 w-4 text-primary" />
                  Achievements & Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="py-5">
                {achievements && achievements.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex flex-col items-center p-4 bg-muted/30 rounded-lg text-center hover:bg-muted/50 transition-colors"
                        title={achievement.description}
                      >
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                          <Award className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-sm font-medium truncate w-full text-[#3a474e]">
                          {achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Award className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-base text-muted-foreground">
                      No achievements yet. Complete quizzes to earn badges!
                    </p>
                    <Button className="mt-4 bg-[#18365a] hover:bg-[#18365a]/90" asChild>
                      <Link href="/quiz">
                        Take a Quiz
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}