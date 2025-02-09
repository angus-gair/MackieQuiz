import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, Answer } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions/daily"],
  });

  const { data: answers } = useQuery<Answer[]>({
    queryKey: ["/api/answers"],
  });

  const answerMutation = useMutation({
    mutationFn: async (data: { questionId: number; answer: string }) => {
      const res = await apiRequest("POST", "/api/answers", {
        ...data,
        correct: questions?.find(q => q.id === data.questionId)?.correctAnswer === data.answer
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/answers"] });
    }
  });

  const answeredQuestions = new Set(answers?.map(a => a.questionId));
  const progress = questions ? (answeredQuestions.size / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
            <p className="text-muted-foreground">Team: {user?.team}</p>
          </div>
          <Link href="/leaderboard">
            <Button variant="outline">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Medal className="mr-2 h-5 w-5 text-yellow-500" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {answeredQuestions.size} of {questions?.length || 0} questions answered
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {questions?.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-xl">{question.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  disabled={answeredQuestions.has(question.id)}
                  onValueChange={(value) =>
                    answerMutation.mutate({
                      questionId: question.id,
                      answer: value,
                    })
                  }
                >
                  {question.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                      <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
