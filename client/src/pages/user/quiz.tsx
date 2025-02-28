import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Question, Answer, insertAnswerSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizKey, setQuizKey] = useState(Date.now()); // Used to force re-render of quiz component

  // Fetch weekly questions
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ["/api/questions/weekly"],
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (answer: { questionId: number; selectedOption: string }) => {
      return apiRequest({
        url: "/api/answers",
        method: "POST",
        body: {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
        },
      });
    },
    onSuccess: () => {
      // Move to next question or complete quiz
      if (questions && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Quiz completed
        setLocation("/quiz-completion");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit answer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestion && questions ? 
    currentQuestionIndex === questions.length - 1 : false;
  const canGoNext = currentQuestion ? !!selectedAnswers[currentQuestion.id] : false;

  const handleNext = () => {
    if (!currentQuestion || !canGoNext) return;

    // Submit answer before moving to next question
    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      selectedOption: selectedAnswers[currentQuestion.id],
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion || !canGoNext) return;

    // Submit answer for the last question
    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      selectedOption: selectedAnswers[currentQuestion.id],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-center">Error Loading Quiz</h1>
        <p className="text-muted-foreground text-center mt-2">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-amber-500 mb-4">
          <ClipboardCheck className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-center">No Questions Available</h1>
        <p className="text-muted-foreground text-center mt-2">
          There are no quiz questions available for this week yet.
        </p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <main className="flex-1 container max-w-screen-xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Weekly Quiz</h1>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="w-full">
          {currentQuestion && (
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