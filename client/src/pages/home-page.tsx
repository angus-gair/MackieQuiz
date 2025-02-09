import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, Answer } from "@shared/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { user } = useAuth();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async () => {
    if (!questions) return;

    for (const question of questions) {
      const answer = selectedAnswers[question.id];
      if (answer) {
        await answerMutation.mutateAsync({
          questionId: question.id,
          answer
        });
      }
    }
    setSubmitted(true);
  };

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
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
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
          {questions?.map((question) => {
            const isAnswered = answeredQuestions.has(question.id);
            const userAnswer = answers?.find(a => a.questionId === question.id)?.answer;
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-start gap-2">
                    {submitted && (
                      isCorrect ? 
                        <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" /> :
                        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <span>{question.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    disabled={submitted}
                    value={selectedAnswers[question.id]}
                    onValueChange={(value) =>
                      setSelectedAnswers(prev => ({
                        ...prev,
                        [question.id]: value,
                      }))
                    }
                  >
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label 
                          htmlFor={`${question.id}-${option}`}
                          className={cn(
                            submitted && option === question.correctAnswer && "text-green-600 font-semibold",
                            submitted && option === userAnswer && option !== question.correctAnswer && "text-red-600"
                          )}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {submitted && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="font-semibold mb-2">
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {questions && questions.length > 0 && !submitted && (
            <Button 
              className="w-full"
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
            >
              Submit Answers
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}