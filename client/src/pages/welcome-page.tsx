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
    <div className="min-h-screen pb-24 bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 fade-in">
        {/* Welcome Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <BrainCircuit className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-3xl font-medium mb-3 text-slate-800">
            Welcome, <span className="text-blue-700 font-semibold">{user?.username || 'Guest'}</span>
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-base">
            Enhance your knowledge and collaborate with your team to excel together.
          </p>
        </div>

        {/* User Stats Card (if logged in) */}
        {user && (
          <div className="mb-12 mt-4">
            <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-slate-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Team: <span className="text-blue-700">{user.team || 'Unassigned'}</span></span>
                  </div>
                  <div className="bg-slate-100 rounded-full px-3 py-1 text-xs font-medium text-slate-600">
                    Performance Overview
                  </div>
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">
                  Track your progress and contributions to your team's success.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 pb-4">
                {statsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="bg-slate-50 rounded-lg p-4 text-center">
                        <Skeleton className="h-3 w-16 mb-2 mx-auto" />
                        <Skeleton className="h-6 w-12 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Quizzes</div>
                      <div className="text-2xl font-semibold text-blue-700">{userStats?.completedQuizzes || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Correct</div>
                      <div className="text-2xl font-semibold text-blue-700">{userStats?.correctAnswers || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Badges</div>
                      <div className="text-2xl font-semibold text-blue-700">{userStats?.achievementCount || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Rank</div>
                      <div className="text-2xl font-semibold text-blue-700">#{userStats?.rank || '-'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-2 pb-6 px-6 bg-slate-50 border-t border-slate-100">
                <Link href="/quiz" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    Start This Week's Challenge
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <h2 className="text-xl font-semibold mb-6 text-slate-800 flex items-center gap-3">
          <div className="h-5 w-0.5 bg-blue-600 rounded-full"></div>
          Platform Features
        </h2>
        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <Card className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-slate-800">Weekly Knowledge Quiz</h3>
                  <p className="text-sm text-slate-500">
                    Challenge yourself with curated quizzes and expand your professional knowledge each week.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-slate-800">Team Collaboration</h3>
                  <p className="text-sm text-slate-500">
                    Join forces with your team members and climb the leaderboard together through knowledge sharing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-slate-800">Earn Achievements</h3>
                  <p className="text-sm text-slate-500">
                    Unlock badges and showcase your expertise on your professional profile.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-slate-800">Track Progress</h3>
                  <p className="text-sm text-slate-500">
                    Monitor your learning journey with detailed analytics and see your improvement over time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-6 text-slate-800 flex items-center gap-3">
          <div className="h-5 w-0.5 bg-blue-600 rounded-full"></div>
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-4 mb-10">
          <Link href="/quiz">
            <div className="group">
              <Button variant="outline" className="w-full justify-between bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all h-12 shadow-sm hover:shadow">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-slate-800">Take Weekly Quiz</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </Button>
            </div>
          </Link>
          
          <Link href="/leaderboard">
            <div className="group">
              <Button variant="outline" className="w-full justify-between bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all h-12 shadow-sm hover:shadow">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-slate-800">View Leaderboard</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </Button>
            </div>
          </Link>
          
          <Link href="/profile">
            <div className="group">
              <Button variant="outline" className="w-full justify-between bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all h-12 shadow-sm hover:shadow">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-slate-800">Your Achievements</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </Button>
            </div>
          </Link>
        </div>

        {/* Feedback Section */}
        <div className="mb-8">
          <div className="bg-slate-50 p-8 rounded-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0">
                <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-medium mb-2 text-slate-800">We Value Your Insights</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-md">
                  Your feedback is essential in helping us refine our platform to better serve your team's knowledge needs.
                </p>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm font-medium">
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
        <div className="border-t border-slate-200 mt-12 pt-8 pb-4 text-center">
          <p className="text-xs text-slate-500">
            Project Round Table is maintained by <span className="font-medium text-blue-600">Belinda Mackie</span>.
            Contact for collaboration opportunities and suggestions.
          </p>
        </div>
      </div>
    </div>
  );
}