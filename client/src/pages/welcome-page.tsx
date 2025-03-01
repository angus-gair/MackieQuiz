import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Link } from "wouter";
import { 
  Check, 
  Award, 
  Users, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  Trophy, 
  ChevronRight,
  Star,
  BrainCircuit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { FeedbackForm } from "../components/ui/feedback-form";
import { cn } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../components/ui/skeleton";

export default function WelcomePage() {
  const { user } = useAuth();
  
  // Additional user stats - could be extended with actual API calls
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/users/stats', user?.id],
    enabled: !!user,
    // This is a placeholder, you would typically fetch from your API
    queryFn: async () => ({
      completedQuizzes: Math.floor(Math.random() * 10) + 1,
      correctAnswers: Math.floor(Math.random() * 50) + 10,
      achievementCount: Math.floor(Math.random() * 5),
      rank: Math.floor(Math.random() * 20) + 1
    })
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-4">
      <div className="container max-w-5xl mx-auto">
        {/* Centered Page Title */}
        <div className="text-center mb-4 mt-2">
          <h1 className="text-dynamic-lg font-bold text-foreground">Welcome Dashboard</h1>
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
              <BrainCircuit className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-xl font-medium mb-2 text-[#3a474e]">
            Welcome, <span className="text-primary font-semibold">{user?.username || 'Guest'}</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Enhance your knowledge and collaborate with your team to excel together.
          </p>
        </div>

        {/* User Stats Card (if logged in) */}
        {user && (
          <div className="mb-8">
            <Card className="border shadow-sm overflow-hidden bg-white">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-[#3a474e] flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Team: <span className="text-primary">{user.team || 'Unassigned'}</span></span>
                  </div>
                  <div className="bg-muted rounded-full px-3 py-1 text-xs font-medium text-[#3a474e]">
                    Performance Overview
                  </div>
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Track your progress and contributions to your team's success.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4 pb-3">
                {statsLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="bg-muted rounded-lg p-4 text-center">
                        <Skeleton className="h-3 w-16 mb-2 mx-auto" />
                        <Skeleton className="h-6 w-12 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 text-center border shadow-sm">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Quizzes</div>
                      <div className="text-xl font-semibold text-primary">{userStats?.completedQuizzes || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border shadow-sm">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Correct</div>
                      <div className="text-xl font-semibold text-primary">{userStats?.correctAnswers || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border shadow-sm">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Badges</div>
                      <div className="text-xl font-semibold text-primary">{userStats?.achievementCount || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border shadow-sm">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Rank</div>
                      <div className="text-xl font-semibold text-primary">#{userStats?.rank || '-'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-2 pb-4 px-6 bg-muted border-t">
                <Link href="/quiz" className="w-full">
                  <Button className="w-full bg-[#18365a] hover:bg-[#18365a]/90 text-white shadow-sm">
                    Start This Week's Challenge
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <h2 className="text-lg font-semibold mb-4 text-[#3a474e] text-center">
          Platform Features
        </h2>
        <div className="grid gap-4 mb-8">
          <Card className="border overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-[#3a474e]">Weekly Knowledge Quiz</h3>
                  <p className="text-sm text-muted-foreground">
                    Challenge yourself with curated quizzes and expand your professional knowledge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-[#3a474e]">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Join forces with your team and climb the leaderboard together.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-[#3a474e]">Earn Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock badges and showcase your expertise on your profile.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold mb-4 text-[#3a474e] text-center">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-3 mb-8">
          <Link href="/quiz">
            <div className="group">
              <Button variant="outline" className="w-full justify-between bg-white border rounded-lg hover:bg-primary/5 transition-all h-12 shadow-sm hover:shadow">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-[#3a474e]">Take Weekly Quiz</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
              </Button>
            </div>
          </Link>
          
          <Link href="/leaderboard">
            <div className="group">
              <Button variant="outline" className="w-full justify-between bg-white border rounded-lg hover:bg-primary/5 transition-all h-12 shadow-sm hover:shadow">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-[#3a474e]">View Leaderboard</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
              </Button>
            </div>
          </Link>
          
          <Link href="/profile">
            <div className="group">
              <Button variant="outline" className="w-full justify-between bg-white border rounded-lg hover:bg-primary/5 transition-all h-12 shadow-sm hover:shadow">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-[#3a474e]">Your Achievements</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
              </Button>
            </div>
          </Link>
        </div>

        {/* Feedback Section */}
        <div className="mb-6">
          <div className="bg-muted p-6 rounded-lg border">
            <div className="flex flex-col items-center gap-4">
              <div className="shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1 text-center">
                <h3 className="text-lg font-medium mb-2 text-[#3a474e]">We Value Your Insights</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Your feedback helps us refine our platform to better serve your team's knowledge needs.
                </p>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#18365a] text-white hover:bg-[#18365a]/90 transition-colors shadow-sm font-medium">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Provide Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Share Your Feedback</DialogTitle>
                      <DialogDescription>
                        Your insights help us improve the platform for all team members.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 px-1">
                      {user && <FeedbackForm userId={user.id} />}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Maintainer Note */}
        <div className="border-t mt-8 pt-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            Round Table is maintained by <span className="font-medium text-[#3a474e]">Belinda Mackie</span>.
            Contact for collaboration opportunities and suggestions.
          </p>
        </div>
      </div>
    </div>
  );
}