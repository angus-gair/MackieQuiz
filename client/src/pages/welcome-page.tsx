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
    <div className="min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8 fade-in">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
              <BrainCircuit className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-dynamic-xl font-bold mb-3 text-primary">
            Welcome, {user?.username || 'Guest'}! 🎉
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-dynamic-sm">
            Ready to enhance your professional knowledge and compete with your team?
          </p>
        </div>

        {/* Quick Stats Cards (if logged in) */}
        {user && (
          <div className="mb-8">
            <Card className="shadow-sm border border-primary/10 overflow-hidden">
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-base font-medium text-primary flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Team: <span className="ml-1 font-bold">{user.team || 'Unassigned'}</span>
                </CardTitle>
                <CardDescription>
                  Collaborate with your team to climb the leaderboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-3 pt-4">
                {statsLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="profile-stat">
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="profile-stat">
                      <div className="text-xs text-muted-foreground">Completed Quizzes</div>
                      <div className="text-lg font-semibold text-primary">{userStats?.completedQuizzes || 0}</div>
                    </div>
                    <div className="profile-stat">
                      <div className="text-xs text-muted-foreground">Correct Answers</div>
                      <div className="text-lg font-semibold text-primary">{userStats?.correctAnswers || 0}</div>
                    </div>
                    <div className="profile-stat">
                      <div className="text-xs text-muted-foreground">Achievements</div>
                      <div className="text-lg font-semibold text-primary">{userStats?.achievementCount || 0}</div>
                    </div>
                    <div className="profile-stat">
                      <div className="text-xs text-muted-foreground">Rank</div>
                      <div className="text-lg font-semibold text-primary">#{userStats?.rank || '-'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0">
                <Link href="/quiz" className="w-full">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90 gap-1 button-hover">
                    Take Weekly Quiz
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <h2 className="text-dynamic-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <div className="h-6 w-1 bg-primary rounded"></div>
          Platform Features
        </h2>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="border border-primary/10 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="icon-circle-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-primary">Weekly Knowledge Quiz</h3>
                  <p className="text-sm text-muted-foreground">
                    Challenge yourself with our curated quizzes and learn something new every week.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="icon-circle-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-primary">Team Competition</h3>
                  <p className="text-sm text-muted-foreground">
                    Join forces with your team members and climb the leaderboard together.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="icon-circle-primary">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-primary">Earn Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock badges and showcase your expertise on your public profile.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="icon-circle-primary">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-primary">Track Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your learning journey and see your improvement over time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-dynamic-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <div className="h-6 w-1 bg-primary rounded"></div>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 mb-8">
          <Link href="/quiz">
            <Button variant="outline" className="w-full justify-between bg-white border border-primary/20 hover:border-primary hover:bg-primary/5 transition-all h-14">
              <div className="flex items-center">
                <div className="icon-circle-primary mr-3">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="font-medium">Take Weekly Quiz</span>
              </div>
              <ChevronRight className="h-5 w-5 text-primary/60" />
            </Button>
          </Link>
          
          <Link href="/leaderboard">
            <Button variant="outline" className="w-full justify-between bg-white border border-primary/20 hover:border-primary hover:bg-primary/5 transition-all h-14">
              <div className="flex items-center">
                <div className="icon-circle-primary mr-3">
                  <Trophy className="h-4 w-4" />
                </div>
                <span className="font-medium">View Leaderboard</span>
              </div>
              <ChevronRight className="h-5 w-5 text-primary/60" />
            </Button>
          </Link>
          
          <Link href="/profile">
            <Button variant="outline" className="w-full justify-between bg-white border border-primary/20 hover:border-primary hover:bg-primary/5 transition-all h-14">
              <div className="flex items-center">
                <div className="icon-circle-primary mr-3">
                  <Award className="h-4 w-4" />
                </div>
                <span className="font-medium">Your Achievements</span>
              </div>
              <ChevronRight className="h-5 w-5 text-primary/60" />
            </Button>
          </Link>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 bg-primary/5 border border-primary/10 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <h3 className="font-medium text-primary mb-2 text-dynamic-md">Have feedback or suggestions?</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            We're constantly improving the platform and would love to hear from you!
          </p>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-primary/90 transition-colors">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
                <DialogDescription>
                  Share your thoughts with us to help improve the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 px-1">
                {user && <FeedbackForm userId={user.id} />}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Maintainer Note */}
        <div className="text-center mt-8 text-xs text-muted-foreground/75 italic">
          <p className="max-w-md mx-auto">
            Project Round Table is lovingly maintained by Belinda Mackie. If you have ideas to make it better or would like to get involved, please reach out!
          </p>
        </div>
      </div>
    </div>
  );
}