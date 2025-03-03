import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Award, Medal, Star, Trophy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Achievement } from "@shared/schema";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/user"],
  });

  // Group achievements by type for better organization
  const groupedAchievements = achievements?.reduce((groups: Record<string, Achievement[]>, achievement) => {
    const type = achievement.type || 'other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(achievement);
    return groups;
  }, {}) || {};

  // Sort milestone achievements by their milestone number
  if (groupedAchievements['quiz_milestone']) {
    groupedAchievements['quiz_milestone'].sort((a, b) => b.milestone - a.milestone);
  }

  // Helper to get appropriate icon for achievement type
  const getAchievementIcon = (achievement: Achievement) => {
    switch (achievement.type) {
      case 'quiz_milestone':
        return <Medal className="w-6 h-6 text-primary" />;
      case 'perfect_score':
        return <Star className="w-6 h-6 text-primary" />;
      case 'team_contribution':
        return <Trophy className="w-6 h-6 text-primary" />;
      default:
        return <Award className="w-6 h-6 text-primary" />;
    }
  };

  // Helper to get background class based on tier
  const getTierBackground = (tier?: string) => {
    switch (tier) {
      case 'gold':
        return 'bg-amber-100 border-amber-300';
      case 'silver':
        return 'bg-gray-100 border-gray-300';
      case 'bronze':
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-muted/30 border-muted';
    }
  };

  // Custom text based on tier
  const getTierText = (tier?: string) => {
    switch (tier) {
      case 'gold':
        return 'text-amber-800';
      case 'silver':
        return 'text-gray-700';
      case 'bronze':
        return 'text-orange-800';
      default:
        return 'text-[#3a474e]';
    }
  };

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
              Achievements ({achievements?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements && achievements.length > 0 ? (
              <>
                {/* Highlight special achievements first */}
                {groupedAchievements['perfect_score'] && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1 text-amber-500" />
                      Perfect Scores
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {groupedAchievements['perfect_score'].map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`flex flex-col items-center p-3 border rounded-lg text-center transition-colors ${getTierBackground(achievement.tier)}`}
                          title={achievement.description}
                        >
                          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-2 border border-amber-200">
                            <Star className="w-6 h-6 text-amber-500" />
                          </div>
                          <p className={`text-xs font-medium truncate w-full ${getTierText(achievement.tier)}`}>
                            {achievement.name}
                          </p>
                          <Badge variant="outline" className="mt-1 text-[10px] bg-white/50">
                            {achievement.tier || 'standard'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Milestone Achievements */}
                {groupedAchievements['quiz_milestone'] && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">Quiz Milestones</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {groupedAchievements['quiz_milestone'].map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`flex flex-col items-center p-3 border rounded-lg text-center transition-colors ${getTierBackground(achievement.tier)}`}
                          title={achievement.description}
                        >
                          <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-2 border border-primary/20">
                            {getAchievementIcon(achievement)}
                          </div>
                          <p className={`text-xs font-medium truncate w-full ${getTierText(achievement.tier)}`}>
                            {achievement.name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-[10px] bg-white/50">
                              Quiz #{achievement.milestone}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Achievement Types */}
                {Object.entries(groupedAchievements)
                  .filter(([type]) => !['quiz_milestone', 'perfect_score'].includes(type))
                  .map(([type, typeAchievements]) => (
                    <div key={type} className="mb-4">
                      <h3 className="text-sm font-semibold mb-2 capitalize">{type.replace('_', ' ')} Achievements</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {typeAchievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex flex-col items-center p-3 bg-muted/30 border border-muted rounded-lg text-center hover:bg-muted/50 transition-colors"
                            title={achievement.description}
                          >
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                              {getAchievementIcon(achievement)}
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
                    </div>
                  ))}
              </>
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