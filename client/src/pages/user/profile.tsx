import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 mr-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Profile</h1>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Username</label>
              <p className="text-sm font-medium">{user?.username}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Team</label>
              <p className="text-sm font-medium">{user?.team || 'Unassigned'}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Weekly Progress</label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Quizzes</p>
                  <p className="text-sm font-medium">{user?.weeklyQuizzes || 0}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-sm font-medium">{user?.weeklyScore || 0}</p>
                </div>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/settings">
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
