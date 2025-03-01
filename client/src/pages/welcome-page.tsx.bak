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

export default function WelcomePage() {
  const { user } = useAuth();

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