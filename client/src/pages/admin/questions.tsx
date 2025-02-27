import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Question } from "@shared/schema";

export default function AdminQuestionsPage() {
  const { user } = useAuth();

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  if (!user?.isAdmin) {
    return <Link href="/" />;
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
            <div>
              <div className="space-y-2">
                <p><strong>Question:</strong> {questions[0].question}</p>
                <p><strong>Options:</strong> {questions[0].options.join(", ")}</p>
                <p><strong>Correct Answer:</strong> {questions[0].correctAnswer}</p>
                <p><strong>Category:</strong> {questions[0].category}</p>
                <p><strong>Explanation:</strong> {questions[0].explanation}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No questions available</p>
          )}
        </Card>
      </div>
    </div>
  );
}