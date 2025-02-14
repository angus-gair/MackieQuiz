import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocation }t from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, Answer } from "@shared/schema";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { useIsMobile } from "@/hooks/use-mobile";
import { HeaderNav } from "@/components/header-nav";

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

    // Dispatch quiz completion event to trigger trophy animation
    window.dispatchEvent(new Event('quiz-complete'));
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
      <HeaderNav />
      <main className="pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <Card className="quiz-card">
            <CardContent className="pt-4">
              <h2 className="text-xl font-bold text-primary truncate scale">Welcome, {user?.username}!</h2>
              <p className="text-sm text-muted-foreground truncate">Team: {user?.team}</p>
            </CardContent>
          </Card>

          {!submitted && questions && (
            <Card className="quiz-card">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Question Progress</p>
                  <span className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1}/{questions.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          )}

          {submitted ? (
            <div className="space-y-4">
              {questions?.map((question, index) => (
                <Card key={question.id} className="overflow-hidden card">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-start gap-2">
                      {answers?.find(a => a.questionId === question.id)?.correct ?
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5 success-animation" /> :
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5 success-animation" />
                      }
                      <span>{question.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      disabled
                      value={selectedAnswers[question.id]}
                      className="space-y-2"
                    >
                      {question.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2 rounded-md p-2 bg-muted/30 card-answer">
                          <RadioGroupItem value={option} />
                          <Label className={cn(
                            "text-sm radio-label",
                            option === question.correctAnswer && "text-green-600 font-medium",
                            option === selectedAnswers[question.id] && option !== question.correctAnswer && "text-red-600"
                          )}>
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="mt-3 p-2 rounded-md bg-muted/30 text-sm explanation-panel">
                      <p className="font-medium mb-1">
                        {answers?.find(a => a.questionId === question.id)?.correct ? "Correct!" : "Incorrect"}
                      </p>
                      <p className="text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                className="w-full button-hover"
                onClick={() => setLocation("/leaderboard")}
              >
                View Leaderboard
              </Button>
            </div>
          ) : currentQuestion && (
            <Card key={quizKey} className="quiz-card">
              <CardHeader className="py-3">
                <CardTitle className="text-base font-medium leading-relaxed">
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
                      />
                      <Label
                        htmlFor={`${currentQuestion.id}-${option}`}
                        className="text-sm cursor-pointer text-[#3a474e]"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    size="sm"
                    className="h-8"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="text-sm">Previous</span>
                  </Button>
                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canGoNext}
                      size="sm"
                      className="h-8"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!canGoNext}
                      size="sm"
                      className="h-8"
                    >
                      <span className="text-sm">Next</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}