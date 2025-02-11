import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Plus,
  Archive,
  X
} from "lucide-react";
import { Link, Redirect } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, InsertQuestion } from "@shared/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/bottom-nav";
import { format, addWeeks, startOfWeek } from "date-fns";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState<Partial<InsertQuestion>>({
    options: ["", "", "", ""],
  });

  const { data: weeks } = useQuery<Date[]>({
    queryKey: ["/api/questions/weeks"],
  });

  // Get current week and next 3 weeks
  const currentWeek = startOfWeek(new Date());
  const futureWeeks = Array.from({ length: 4 }, (_, i) =>
    addWeeks(currentWeek, i)
  );

  // Get questions for each week
  const weeklyQuestions = useQuery<Record<string, Question[]>>({
    queryKey: ["/api/questions/weekly"],
    queryFn: async () => {
      const questionsMap: Record<string, Question[]> = {};
      await Promise.all(
        futureWeeks.map(async (week) => {
          const response = await apiRequest(
            "GET",
            `/api/questions/weekly/${week.toISOString()}`
          );
          const questions = await response.json();
          questionsMap[week.toISOString()] = questions;
        })
      );
      return questionsMap;
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (question: InsertQuestion) => {
      // Add weekOf to the question before sending
      const currentWeek = startOfWeek(new Date());
      const questionWithWeek = {
        ...question,
        weekOf: currentWeek.toISOString().split('T')[0], // Format as YYYY-MM-DD
      };
      const res = await apiRequest("POST", "/api/questions", questionWithWeek);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions/weekly"] });
      setNewQuestion({ options: ["", "", "", ""] });
      toast({
        title: "Success",
        description: "Question created successfully",
      });
    },
  });

  const archiveQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/questions/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions/weekly"] });
      toast({
        title: "Success",
        description: "Question archived successfully",
      });
    },
  });

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-3 h-12">
          <h1 className="text-base sm:text-lg font-semibold">Quiz Admin</h1>
          <div className="flex items-center gap-2">
            <Link href="/admin/archived">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                <Archive className="h-4 w-4" />
                View Archived
              </Button>
              <Button variant="outline" size="icon" className="sm:hidden">
                <Archive className="h-4 w-4" />
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[92%] sm:h-full sm:max-w-xl">
                <SheetHeader>
                  <SheetTitle>Add New Question</SheetTitle>
                </SheetHeader>
                <Separator className="my-4" />
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newQuestion.question || !newQuestion.correctAnswer || !newQuestion.category || !newQuestion.explanation) {
                    toast({
                      title: "Error",
                      description: "Please fill in all fields",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (newQuestion.options?.some(option => !option)) {
                    toast({
                      title: "Error",
                      description: "Please fill in all options",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (!newQuestion.options?.includes(newQuestion.correctAnswer)) {
                    toast({
                      title: "Error",
                      description: "Correct answer must be one of the options",
                      variant: "destructive",
                    });
                    return;
                  }

                  createQuestionMutation.mutate(newQuestion as InsertQuestion);
                }} className="space-y-4 sm:space-y-6 overflow-y-auto pb-20">
                  <div className="space-y-2">
                    <Label className="text-base">Question Text</Label>
                    <Textarea
                      value={newQuestion.question || ""}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter the question text"
                      className="min-h-[100px] text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Options</Label>
                    <div className="grid gap-3">
                      {newQuestion.options?.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(newQuestion.options || [])];
                            newOptions[index] = e.target.value;
                            setNewQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          placeholder={`Option ${index + 1}`}
                          className="h-12 text-base"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Correct Answer</Label>
                    <Input
                      value={newQuestion.correctAnswer || ""}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      placeholder="Enter the correct answer (must match one of the options)"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Category</Label>
                    <Input
                      value={newQuestion.category || ""}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Enter the question category"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Explanation</Label>
                    <Textarea
                      value={newQuestion.explanation || ""}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                      placeholder="Enter the explanation for the correct answer"
                      className="min-h-[100px] text-base"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={createQuestionMutation.isPending}
                  >
                    Add Question
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pt-12 pb-16">
        <div className="p-2 sm:p-3 space-y-4">
          {futureWeeks.map((week) => {
            const questions = weeklyQuestions.data?.[week.toISOString()] || [];
            const isCurrentWeek = week.getTime() === currentWeek.getTime();

            return (
              <div key={week.toISOString()} className="space-y-2">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  {isCurrentWeek && "📍"} Week of {format(week, 'PPP')}
                  {isCurrentWeek && (
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                      (Current Week)
                    </span>
                  )}
                </h2>
                {questions.length === 0 ? (
                  <Card className="p-2 sm:p-3">
                    <p className="text-sm text-muted-foreground">
                      No questions added for this week yet.
                    </p>
                  </Card>
                ) : (
                  questions.map((question) => (
                    <Card key={question.id} className="relative">
                      <div className="p-2 sm:p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <h3 className="text-sm sm:text-base font-medium leading-tight flex-1">
                            {question.question}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to archive this question?")) {
                                archiveQuestionMutation.mutate(question.id);
                              }
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                          >
                            <Archive className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Category: {question.category}
                        </p>
                        <div className="space-y-1">
                          {question.options.map((option) => (
                            <div
                              key={option}
                              className={cn(
                                "text-xs sm:text-sm px-2 py-1 rounded-md",
                                option === question.correctAnswer
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "bg-muted"
                              )}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}