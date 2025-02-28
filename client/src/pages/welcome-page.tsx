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
    <div className="min-h-screen pb-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 fade-in">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 animate-bounce-slow">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <BrainCircuit className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-dynamic-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
            Welcome, {user?.username || 'Guest'}! 🎉
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-dynamic-sm">
            Ready to enhance your knowledge and have fun with your team? Let's go!
          </p>
        </div>

        {/* Quick Stats Cards (if logged in) */}
        {user && (
          <div className="mb-10 mt-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <Card className="relative shadow-md border border-blue-100 rounded-xl overflow-hidden bg-white">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="font-medium flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center shadow-sm mr-2">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-blue-700">Team:</span> <span className="ml-1 font-bold text-indigo-700">{user.team || 'Unassigned'}</span>
                    </div>
                    <div className="bg-blue-100 rounded-full px-3 py-1 text-xs font-semibold text-blue-700">Your Stats</div>
                  </CardTitle>
                  <CardDescription className="text-blue-600/90 font-medium mt-1">
                    Work together with your teammates and climb the leaderboard!
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3 pt-4">
                  {statsLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="bg-blue-50 rounded-xl p-3 text-center">
                          <Skeleton className="h-3 w-16 mb-1 mx-auto" />
                          <Skeleton className="h-5 w-10 mx-auto" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="text-xs text-blue-700/80 font-medium uppercase tracking-wide">Quizzes</div>
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">{userStats?.completedQuizzes || 0}</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="text-xs text-blue-700/80 font-medium uppercase tracking-wide">Correct</div>
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">{userStats?.correctAnswers || 0}</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="text-xs text-blue-700/80 font-medium uppercase tracking-wide">Badges</div>
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">{userStats?.achievementCount || 0}</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="text-xs text-blue-700/80 font-medium uppercase tracking-wide">Rank</div>
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">#{userStats?.rank || '-'}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-2 pb-4 px-4">
                  <Link href="/quiz" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all gap-1 rounded-xl py-5">
                      Start This Week's Challenge
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <h2 className="text-dynamic-lg font-semibold mb-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
          <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          Cool Features
        </h2>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="border border-blue-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-blue-600">Weekly Knowledge Quiz</h3>
                  <p className="text-sm text-muted-foreground">
                    Challenge yourself with fun quizzes and learn something new every week!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-purple-500"></div>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-indigo-600">Team Competition</h3>
                  <p className="text-sm text-muted-foreground">
                    Join forces with your team and climb to the top of the leaderboard together!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-blue-600">Earn Cool Badges</h3>
                  <p className="text-sm text-muted-foreground">
                    Collect awesome badges and show off your achievements to everyone!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-blue-500"></div>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-indigo-600">Track Your Journey</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch your knowledge grow and see how far you've come on your learning adventure!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-dynamic-lg font-semibold mb-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
          <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          Jump Right In!
        </h2>
        <div className="grid grid-cols-1 gap-3 mb-8">
          <Link href="/quiz">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-80 transition duration-300"></div>
              <Button variant="outline" className="relative w-full justify-between bg-white border border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all h-14 group-hover:shadow-md">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center shadow-md mr-3">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-blue-700">Take Weekly Quiz</span>
                </div>
                <div className="flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-1 pr-3 group-hover:bg-gradient-to-r group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                  <span className="text-xs text-blue-700 mr-1">Start</span>
                  <ChevronRight className="h-4 w-4 text-blue-500" />
                </div>
              </Button>
            </div>
          </Link>
          
          <Link href="/leaderboard">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-80 transition duration-300"></div>
              <Button variant="outline" className="relative w-full justify-between bg-white border border-indigo-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all h-14 group-hover:shadow-md">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center shadow-md mr-3">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-indigo-700">View Leaderboard</span>
                </div>
                <div className="flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-1 pr-3 group-hover:bg-gradient-to-r group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                  <span className="text-xs text-indigo-700 mr-1">Check</span>
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                </div>
              </Button>
            </div>
          </Link>
          
          <Link href="/profile">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-80 transition duration-300"></div>
              <Button variant="outline" className="relative w-full justify-between bg-white border border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all h-14 group-hover:shadow-md">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white flex items-center justify-center shadow-md mr-3">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-blue-700">Your Achievements</span>
                </div>
                <div className="flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full p-1 pr-3 group-hover:bg-gradient-to-r group-hover:from-blue-200 group-hover:to-cyan-200 transition-colors">
                  <span className="text-xs text-blue-700 mr-1">View</span>
                  <ChevronRight className="h-4 w-4 text-blue-500" />
                </div>
              </Button>
            </div>
          </Link>
        </div>

        {/* Feedback Section */}
        <div className="relative mt-8 mb-4 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
          <div className="relative rounded-xl overflow-hidden">
            <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl border border-blue-100 text-center">
              <div className="flex justify-center mb-4 animate-bounce-slow">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-8 w-8" />
                </div>
              </div>
              <h3 className="font-bold mb-2 text-dynamic-lg bg-gradient-to-r from-indigo-600 to-blue-600 inline-block text-transparent bg-clip-text">We'd Love Your Thoughts!</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Got ideas to make our platform even better? We're all ears! Your feedback helps us create an awesome experience for everyone.
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200 px-6 py-5 rounded-lg">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Share Your Ideas
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Tell Us What You Think!</DialogTitle>
                    <DialogDescription>
                      Your feedback helps us make the platform more fun and useful for everyone.
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

        {/* Maintainer Note */}
        <div className="text-center mt-8 pb-4">
          <div className="flex justify-center gap-1 items-center mb-2">
            <div className="h-1 w-1 rounded-full bg-blue-300"></div>
            <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
            <div className="h-1 w-1 rounded-full bg-blue-300"></div>
            <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
            <div className="h-1 w-1 rounded-full bg-blue-300"></div>
            <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
            <div className="h-1 w-1 rounded-full bg-blue-300"></div>
          </div>
          <p className="max-w-md mx-auto text-xs text-blue-500 font-medium">
            Project Round Table is lovingly maintained by Belinda Mackie. Got ideas? Want to help? Let's chat! 💙
          </p>
        </div>
      </div>
    </div>
  );
}