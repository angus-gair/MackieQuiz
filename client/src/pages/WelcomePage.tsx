import { Button } from "@/components/ui/button"

export function WelcomePage({ username = "User" }) {
  return (
    <main className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-semibold">Weekly Quiz</h1>
      
      <section className="mt-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Welcome, {username}! 🎉</h2>
        <p className="text-gray-700">
          Ready to expand your store knowledge and have a little fun along the way?
          This quiz isn't just about wine—it covers everything from opening hours 
          and current specials to new products and quirky facts about your coworkers!
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Test Your Knowledge */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Test Your Knowledge</h3>
          <p className="text-sm text-gray-700">
            Challenge yourself with our curated quizzes and learn something new every day.
          </p>
        </div>

        {/* Card 2: Team Competition */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Team Competition</h3>
          <p className="text-sm text-gray-700">
            Join forces with your team members and climb the leaderboard together.
          </p>
        </div>

        {/* Card 3: Win Prizes */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Win Prizes</h3>
          <p className="text-sm text-gray-700">
            Top performers have a chance to win exciting weekly prizes!
          </p>
        </div>

        {/* Card 4: Get to Know Your Team */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Get to Know Your Team</h3>
          <p className="text-sm text-gray-700">
            Unlock fun personal facts about your coworkers and connect over common interests.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-2">
        <Button className="bg-blue-900 text-white">Start Quiz</Button>
        <Button variant="outline">View Leaderboard</Button>
      </div>
    </main>
  )
}
