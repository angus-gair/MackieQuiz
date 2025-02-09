import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, Answer } from "@shared/schema";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { useIsMobile } from "@/hooks/use-mobile";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const isMobile = useIsMobile();

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

  useEffect(() => {
    if (showConfetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

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
    setShowConfetti(true);
  };

  const answeredQuestions = new Set(answers?.map(a => a.questionId));
  const progress = questions ? (answeredQuestions.size / questions.length) * 100 : 0;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "mb-8",
          isMobile ? "flex flex-col gap-4" : "flex justify-between items-center"
        )}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Welcome, {user?.username}!</h1>
            <p className="text-muted-foreground">Team: {user?.team}</p>
          </div>
          <div className={cn(
            "flex gap-4",
            isMobile ? "flex-col w-full" : ""
          )}>
            <Link href="/leaderboard" className={isMobile ? "w-full" : ""}>
              <Button variant="outline" className={cn(
                "button-hover",
                isMobile ? "w-full justify-center" : ""
              )}>
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className={cn(
                "button-hover",
                isMobile ? "w-full justify-center" : ""
              )}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="mb-6 card">
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

        <div className="space-y-4 sm:space-y-6">
          {questions?.map((question) => {
            const isAnswered = answeredQuestions.has(question.id);
            const userAnswer = answers?.find(a => a.questionId === question.id)?.answer;
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <Card key={question.id} className="card">
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
                    className="space-y-3"
                  >
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label 
                          htmlFor={`${question.id}-${option}`}
                          className={cn(
                            "transition-colors duration-200",
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
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
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
              className="w-full button-hover mt-4"
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
            >
              Submit Answers
            </Button>
          )}

          {submitted && (
            <Button 
              className="w-full button-hover mt-4"
              onClick={() => setLocation("/leaderboard")}
            >
              View Leaderboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}