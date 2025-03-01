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
  const { data: questions = [], isLoading, error } = useQuery<Question[]>({
    queryKey: ["/api/questions/weekly"],
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (answer: { questionId: number; selectedOption: string }) => {
      // Find the current question to check if the answer is correct
      const question = questions.find(q => q.id === answer.questionId);
      const isCorrect = question ? question.correctAnswer === answer.selectedOption : false;
      
      return apiRequest(
        "POST",
        "/api/answers",
        {
          questionId: answer.questionId,
          answer: answer.selectedOption,
          correct: isCorrect, // Add the correct field
        }
      );
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit answer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const currentQuestion = questions[currentQuestionIndex];
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
      <div className="min-h-screen bg-background">
        <main className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-16 px-4">
          <div className="flex flex-col items-center justify-center p-4 max-w-5xl mx-auto">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-center">Error Loading Quiz</h1>
            <p className="text-muted-foreground text-center mt-2">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4 bg-[#18365a] hover:bg-[#18365a]/90">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-16 px-4">
          <div className="flex flex-col items-center justify-center p-4 max-w-5xl mx-auto">
            <div className="text-amber-500 mb-4">
              <ClipboardCheck className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-center">No Questions Available</h1>
            <p className="text-muted-foreground text-center mt-2">
              There are no quiz questions available for this week yet.
            </p>
            <Button onClick={() => setLocation("/")} className="mt-4 bg-[#18365a] hover:bg-[#18365a]/90">
              Return Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16 pb-24 px-4">
        <div className="container max-w-5xl mx-auto space-y-6">
          {/* Page structure with two columns on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress indicator - smaller on desktop */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm h-full">
                <CardHeader className="py-3">
                  <CardTitle className="text-base font-medium text-[#3a474e]">Quiz Progress</CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary">Question</span>
                    <span className="text-sm text-primary font-medium">
                      {currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-muted/50 h-3 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-[#18365a]" 
                      style={{width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`}}
                    ></div>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="mb-2">Complete all questions to finish the quiz and view your results.</p>
                    <p>Your progress is automatically saved.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Card - wider on desktop */}
            <div className="lg:col-span-2">
              {currentQuestion && (
                <Card key={quizKey} className="quiz-card shadow-sm">
                  <CardHeader className="py-4 border-b">
                    <CardTitle className="text-lg font-medium leading-relaxed text-[#3a474e]">
                      {currentQuestion.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6">
                    <RadioGroup
                      value={selectedAnswers[currentQuestion.id]}
                      onValueChange={(value) =>
                        setSelectedAnswers(prev => ({
                          ...prev,
                          [currentQuestion.id]: value,
                        }))
                      }
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option: string) => (
                        <div key={option} className="flex items-center space-x-3 rounded-md p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                          <RadioGroupItem
                            value={option}
                            id={`${currentQuestion.id}-${option}`}
                          />
                          <Label
                            htmlFor={`${currentQuestion.id}-${option}`}
                            className="text-sm cursor-pointer text-[#3a474e] font-medium"
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
                        size="sm"
                        className="h-9"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        <span className="text-sm">Previous</span>
                      </Button>
                      {isLastQuestion ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!canGoNext}
                          size="sm"
                          className="h-9 bg-[#18365a] hover:bg-[#18365a]/90"
                        >
                          Submit Quiz
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          disabled={!canGoNext}
                          size="sm"
                          className="h-9 bg-[#18365a] hover:bg-[#18365a]/90"
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
          </div>
        </div>
      </main>
    </div>
  );
}