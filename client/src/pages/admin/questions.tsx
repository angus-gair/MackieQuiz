import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { Question } from "@shared/schema";

export default function AdminQuestionsPage() {
  const { user } = useAuth();

  const { data: questions, isLoading, error } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
    enabled: !!user?.isAdmin, // Only run query if user is admin
  });

  console.log("Auth state:", { user, isAdmin: user?.isAdmin });
  console.log("Query state:", { questions, isLoading, error });

  if (!user?.isAdmin) {
    return <Link href="/" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-red-500">Error loading questions. Please try again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
        <div className="container h-full">
          <div className="flex items-center h-full px-4">
            <Link href="/admin">
              <Button variant="ghost" className="mr-3">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Questions</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto pt-[72px] pb-8 px-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Available Questions</h2>
          {questions && questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="space-y-2">
                    <p><strong>Question:</strong> {question.question}</p>
                    <p><strong>Options:</strong> {question.options.join(", ")}</p>
                    <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                    <p><strong>Category:</strong> {question.category}</p>
                    <p><strong>Explanation:</strong> {question.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No questions available</p>
          )}
        </Card>
      </div>
    </div>
  );
}