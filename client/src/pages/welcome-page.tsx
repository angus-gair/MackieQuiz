import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Check, Award, Users, BookOpen } from "lucide-react";

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl px-4 py-8 mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}! 🎉</h1>
          <p className="text-muted-foreground">
            Ready to test your wine knowledge and compete with your team?
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1">Test Your Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Challenge yourself with our curated wine quizzes and learn something new every day.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1">Team Competition</h3>
                  <p className="text-sm text-muted-foreground">
                    Join forces with your team members and climb the leaderboard together.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1">Win Prizes</h3>
                  <p className="text-sm text-muted-foreground">
                    Top performers have a chance to win exciting weekly prizes!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Check className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your improvement and see how you stack up against others.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/quiz">
            <Button size="lg" className="w-full sm:w-auto">
              Start Quiz
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}