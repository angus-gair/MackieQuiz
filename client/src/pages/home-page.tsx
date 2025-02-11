import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle2, XCircle, LogOut, ArrowLeft, ArrowRight, Plus, Users, Cog } from "lucide-react";
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
  const [quizKey, setQuizKey] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only reset scroll position on mount
    window.scrollTo(0, 0);
  }, []);

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions/weekly"],
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

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

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

  const handleReset = async () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setShowConfetti(false);
    setQuizKey(prev => prev + 1);
    setCurrentQuestionIndex(0);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/questions/weekly"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/answers"] })
    ]);
  };

  const today = new Date();
  const answeredQuestions = new Set(answers?.filter(a => {
    const answerDate = new Date(a.answeredAt);
    return answerDate.toDateString() === today.toDateString();
  }).filter(a => {
    const answerTime = new Date(a.answeredAt).getTime();
    const todaysAnswers = answers?.filter(a => {
      const date = new Date(a.answeredAt);
      return date.toDateString() === today.toDateString();
    }) ?? [];

    const quizzes = [];
    let currentQuiz = [];
    for (const answer of todaysAnswers.sort((a, b) => 
      new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime()
    )) {
      currentQuiz.push(answer);
      if (currentQuiz.length === 3) {
        quizzes.push([...currentQuiz]);
        currentQuiz = [];
      }
    }

    if (!submitted) {
      return currentQuiz.some(qa => qa.id === a.id);
    }

    if (quizzes.length === 0) {
      return false;
    }

    const lastQuiz = quizzes[quizzes.length - 1];
    return lastQuiz.some(qa => qa.id === a.id);
  }).map(a => a.questionId));

  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const currentQuestion = questions?.[currentQuestionIndex];
  const canGoNext = currentQuestion && selectedAnswers[currentQuestion.id];
  const isLastQuestion = questions && currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Weekly Quiz</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline-block sm:ml-2">Leaderboard</span>
                </Button>
              </Link>
              <Link href={user?.isAdmin ? "/admin/users" : "/users"}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline-block sm:ml-2">Users</span>
                </Button>
              </Link>
              {user?.isAdmin ? (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3">
                    <Cog className="h-4 w-4" />
                    <span className="hidden sm:inline-block sm:ml-2">Admin</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3">
                    <Cog className="h-4 w-4" />
                    <span className="hidden sm:inline-block sm:ml-2">Settings</span>
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline-block sm:ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Welcome, {user?.username}!</h1>
            <p className="text-muted-foreground">Team: {user?.team}</p>
          </div>

          <Card className="mb-6">
            <CardHeader className="py-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  Progress
                </CardTitle>
                <p className="text-sm text-muted-foreground slide-up">
                  {submitted ? "Quiz completed!" : `Question ${currentQuestionIndex + 1} of ${questions?.length || 0}`}
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="w-full">
                <Progress 
                  value={progress} 
                  className="h-3 rounded-full" 
                />
              </div>
            </CardContent>
          </Card>

          {submitted ? (
            <div className="space-y-4">
              {questions?.map((question, index) => (
                <Card 
                  key={question.id}
                  className="quiz-card slide-down overflow-hidden"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg flex items-start gap-2">
                      {answers?.find(a => a.questionId === question.id)?.correct ? 
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> :
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      }
                      <span>{question.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <RadioGroup
                        disabled
                        value={selectedAnswers[question.id]}
                        className="space-y-2"
                      >
                        {question.options.map((option) => (
                          <div key={option} className="flex items-center space-x-2 rounded-md p-2 bg-muted/30">
                            <RadioGroupItem 
                              value={option} 
                              checked={selectedAnswers[question.id] === option}
                              className="radio-group-item"
                            />
                            <Label 
                              className={cn(
                                "radio-label text-sm sm:text-base",
                                option === question.correctAnswer && "text-green-600 font-semibold",
                                option === selectedAnswers[question.id] && option !== question.correctAnswer && "text-red-600"
                              )}
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <p className="font-semibold mb-1 text-sm sm:text-base">
                        {answers?.find(a => a.questionId === question.id)?.correct ? "Correct!" : "Incorrect"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                className="w-full slide-up"
                onClick={() => setLocation("/leaderboard")}
                style={{ animationDelay: '800ms' }}
              >
                View Leaderboard
              </Button>
            </div>
          ) : (
            currentQuestion && (
              <div key={quizKey} className="space-y-4">
                <Card className="quiz-card">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      {currentQuestion.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={selectedAnswers[currentQuestion.id]}
                      onValueChange={(value) =>
                        setSelectedAnswers(prev => ({
                          ...prev,
                          [currentQuestion.id]: value,
                        }))
                      }
                      className="space-y-2"
                    >
                      {currentQuestion.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2 rounded-md p-2 bg-muted/30">
                          <RadioGroupItem 
                            value={option} 
                            id={`${currentQuestion.id}-${option}`}
                            className="radio-group-item"
                          />
                          <Label 
                            htmlFor={`${currentQuestion.id}-${option}`}
                            className="radio-label cursor-pointer text-sm sm:text-base"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="flex justify-between mt-6">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="h-9"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      {isLastQuestion ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!canGoNext}
                          className="h-9"
                        >
                          Submit Quiz
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          disabled={!canGoNext}
                          className="h-9"
                        >
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}