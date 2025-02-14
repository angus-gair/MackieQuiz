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
            Ready to expand your store knowledge and have a little fun along the way?
            This quiz isn't just about wine—it covers everything from opening hours 
            and current specials to new products and quirky facts about your coworkers!
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
                    Dive into quizzes on store procedures, inventory, and fun tidbits about 
                    your teammates. Learn something new every day!
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
                    Join forces with your colleagues, climb the leaderboard together, and find 
                    out which teammate once performed in a circus!
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
                    Top performers each week can earn bragging rights and exciting rewards. 
                    Who will claim the top spot this time?
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
                  <h3 className="font-semibold mb-1">Get to Know Your Team</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock fun personal facts about your coworkers to bring the team closer 
                    and spark great conversations.
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