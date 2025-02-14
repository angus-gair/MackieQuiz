import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <main className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-semibold">Weekly Quiz</h1>

      <section className="mt-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Welcome, {user?.username}! 🎉</h2>
        <p className="text-gray-700">
          Ready to expand your store knowledge and have a little fun along the way?
          This quiz isn't just about wine—it covers everything from opening hours 
          and current specials to new products and quirky facts about your coworkers!
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Test Your Knowledge */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-1">Test Your Knowledge</h3>
            <p className="text-sm text-gray-700">
              Dive into quizzes on store procedures, inventory, and fun tidbits about 
              your teammates. Learn something new every day!
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Team Competition */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-1">Team Competition</h3>
            <p className="text-sm text-gray-700">
              Join forces with your colleagues, climb the leaderboard together, and find 
              out which teammate once performed in a circus!
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Win Prizes */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-1">Win Prizes</h3>
            <p className="text-sm text-gray-700">
              Top performers each week can earn bragging rights and exciting rewards. 
              Who will claim the top spot this time?
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Get to Know Your Team */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-1">Get to Know Your Team</h3>
            <p className="text-sm text-gray-700">
              Unlock fun personal facts about your coworkers to bring the team closer 
              and spark great conversations.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-2">
        <Link href="/quiz">
          <Button className="bg-blue-900 text-white">Start Quiz</Button>
        </Link>
        <Link href="/leaderboard">
          <Button variant="outline">View Leaderboard</Button>
        </Link>
      </div>
    </main>
  );
}