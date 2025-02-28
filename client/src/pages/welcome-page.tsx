import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Check, Award, Users, BookOpen, MessageSquare, ArrowRight, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FeedbackForm } from "@/components/ui/feedback-form";
import { cn } from "@/lib/utils";

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16 pb-16 bg-gradient-to-b from-background to-muted/10">
      <div className="container max-w-4xl px-4 py-6 mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-primary">Welcome, {user?.username}! 🎉</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ready to enhance your professional knowledge and compete with your team?
          </p>
        </div>

        {/* Today's Quick Stats (if logged in) */}
        {user && (
          <Card className="mb-8 border-primary/20 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">YOUR TEAM</h3>
                  <p className="font-semibold text-lg text-primary">{user.team}</p>
                </div>
                <Link href="/quiz">
                  <Button className="gap-1 bg-primary hover:bg-primary/90">
                    Start Quiz
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-primary">Test Your Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Challenge yourself with our curated quizzes and learn something new every day.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6" />
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

          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-primary">Win Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn badges and showcase your expertise on your profile!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-primary">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your learning journey and see your improvement over time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/quiz">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 button-hover">
              <BookOpen className="h-5 w-5 mr-2" />
              Start Quiz
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/5 button-hover">
              <Trophy className="h-5 w-5 mr-2" />
              View Leaderboard
            </Button>
          </Link>

          {/* Feedback Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto button-hover bg-gray-100 hover:bg-gray-200 text-gray-800">
                <MessageSquare className="w-5 h-5 mr-2" />
                Feedback
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
        <div className="text-center mt-12 text-sm text-muted-foreground/75 italic">
          <p className="max-w-2xl mx-auto">
            Project Round Table is lovingly maintained by Belinda Mackie. If you have ideas to make it better or would like to get involved, please drop a note through the feedback form or reach out directly—I'd love to chat!
          </p>
        </div>
      </div>
    </div>
  );
}