import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "wouter";
import { 
  BookOpen, 
  Users, 
  Award, 
  CheckCircle,
  PartyPopper
} from "lucide-react";

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto pt-6 pb-20 px-4">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.username || 'Guest'} <PartyPopper className="h-5 w-5 inline-block ml-1" /></h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Ready to enhance your professional knowledge and compete with your team?
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Test Your Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Challenge yourself with our curated quizzes and learn something new every day.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Team Competition</h3>
                  <p className="text-sm text-muted-foreground">
                    Join forces with your team members and climb the leaderboard together.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Win Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn badges and showcase your expertise!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your learning journey and see your improvement over time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Link href="/quiz">
            <Button className="px-6 py-2 bg-primary text-white hover:bg-primary/90">
              Start Quiz
            </Button>
          </Link>
          
          <Link href="/leaderboard">
            <Button variant="outline" className="px-6 py-2">
              View Leaderboard
            </Button>
          </Link>
        </div>

        {/* Maintainer Note */}
        <div className="text-center text-sm text-muted-foreground mt-16">
          <p>
            Project Round Table is lovingly maintained by Belinda Mackie. If you have ideas to make it better or would like to get involved, please reach out directly—I'd love to chat!
          </p>
        </div>
      </main>
    </div>
  );
}