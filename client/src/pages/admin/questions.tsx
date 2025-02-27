import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Archive,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, InsertQuestion, DimDate } from "@shared/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, startOfWeek } from "date-fns";
import { Loader2 } from 'lucide-react';

const PREDEFINED_CATEGORIES = [
  "Operations",
  "Specials",
  "Wine Varietals",
  "Beer",
  "Spirits",
  "Team - Member",
  "Team - Manager",
  "Customer Service",
  "Services",
];

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<InsertQuestion>>({
    options: ["", "", "", ""],
  });

  // Get available weeks from the dim_date table
  const { data: availableWeeks, isLoading: isLoadingWeeks } = useQuery<DimDate[]>({
    queryKey: ["/api/weeks/available"],
  });

  // Get questions for all weeks
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const isLoading = isLoadingWeeks || isLoadingQuestions;

  const createQuestionMutation = useMutation({
    mutationFn: async (question: InsertQuestion) => {
      if (!selectedWeek) {
        throw new Error('Week not selected');
      }
      const formattedDate = format(selectedWeek, 'yyyy-MM-dd');
      const questionData = {
        ...question,
        weekOf: formattedDate,
      };

      const res = await apiRequest("POST", "/api/questions", questionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setNewQuestion({ options: ["", "", "", ""] });
      setSelectedWeek(null);
      toast({
        title: "Success",
        description: "Question created successfully",
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const archiveQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/questions/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: "Question archived successfully",
      });
    },
  });

  const getQuestionsForWeek = (week: Date, questions: Question[] = []) => {
    if (!questions) return [];
    const weekStart = startOfWeek(week);
    return questions.filter(q => {
      if (!q.weekOf || q.isArchived) return false;
      const questionWeekStart = startOfWeek(parseISO(q.weekOf));
      return format(weekStart, 'yyyy-MM-dd') === format(questionWeekStart, 'yyyy-MM-dd');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-lg font-semibold">Question Management</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto pt-[72px] pb-8 px-4">
        <div className="space-y-4">
          {availableWeeks?.map((weekData) => {
            const weekQuestions = getQuestionsForWeek(weekData.week, questions);
            const isCurrentWeek = weekData.weekIdentifier === 'Current';

            return (
              <Card key={weekData.week.toString()} className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                  <div>
                    <h2 className="text-base font-semibold">
                      Week of {format(weekData.week, 'MMM dd')}
                      {isCurrentWeek && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          (Current)
                        </span>
                      )}
                    </h2>
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWeek(weekData.week)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle>
                          Add Question for Week of {format(weekData.week, 'MMM dd')}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!newQuestion.question || !newQuestion.correctAnswer || !newQuestion.category || !newQuestion.explanation) {
                              toast({
                                title: "Error",
                                description: "Please fill in all fields",
                                variant: "destructive",
                              });
                              return;
                            }
                            createQuestionMutation.mutate(newQuestion as InsertQuestion);
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <Label>Question Text</Label>
                            <Textarea
                              value={newQuestion.question || ""}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                              className="mt-2"
                              placeholder="Enter your question"
                            />
                          </div>

                          <div>
                            <Label>Options</Label>
                            <div className="mt-2 space-y-2">
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
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label>Correct Answer</Label>
                            <Select
                              value={newQuestion.correctAnswer}
                              onValueChange={(value) => setNewQuestion(prev => ({ ...prev, correctAnswer: value }))}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select correct option" />
                              </SelectTrigger>
                              <SelectContent>
                                {newQuestion.options?.map((option, index) => (
                                  <SelectItem key={index} value={option || ""}>
                                    Option {index + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Category</Label>
                            <Select
                              value={newQuestion.category}
                              onValueChange={(value) => setNewQuestion(prev => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {PREDEFINED_CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Explanation</Label>
                            <Textarea
                              value={newQuestion.explanation || ""}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                              className="mt-2"
                              placeholder="Explain why this is the correct answer"
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={createQuestionMutation.isPending}
                          >
                            {createQuestionMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding Question...
                              </>
                            ) : (
                              "Add Question"
                            )}
                          </Button>
                        </form>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="divide-y">
                  {weekQuestions.map((question) => (
                    <div key={question.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">
                            {question.question}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Category: {question.category}
                          </p>
                          <div className="mt-3 space-y-2">
                            {question.options.map((option) => (
                              <div
                                key={option}
                                className={cn(
                                  "text-sm px-3 py-2 rounded-md",
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to archive this question?")) {
                              archiveQuestionMutation.mutate(question.id);
                            }
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {weekQuestions.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No questions added for this week yet
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        {/* Bonus Question Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                setSelectedWeek(null);
              }}
            >
              <Star className="h-4 w-4" />
              Add Bonus Question
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Add Bonus Question</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newQuestion.question || !newQuestion.correctAnswer || !newQuestion.category || !newQuestion.explanation || !newQuestion.bonusPoints) {
                    toast({
                      title: "Error",
                      description: "Please fill in all fields",
                      variant: "destructive",
                    });
                    return;
                  }
                  createQuestionMutation.mutate({...newQuestion, isBonus: true} as InsertQuestion);
                }}
                className="space-y-4"
              >
                {/* Same form fields as regular question plus bonus fields */}
                <div>
                  <Label>Bonus Points</Label>
                  <Input
                    type="number"
                    value={newQuestion.bonusPoints || ""}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, bonusPoints: parseInt(e.target.value, 10) }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Available From</Label>
                  <Input
                    type="date"
                    value={newQuestion.availableFrom ? format(newQuestion.availableFrom, 'yyyy-MM-dd') : ""}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, availableFrom: parseISO(e.target.value) }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Available Until</Label>
                  <Input
                    type="date"
                    value={newQuestion.availableUntil ? format(newQuestion.availableUntil, 'yyyy-MM-dd') : ""}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, availableUntil: parseISO(e.target.value) }))}
                    className="mt-1.5"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createQuestionMutation.isPending}
                >
                  {createQuestionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Bonus Question...
                    </>
                  ) : (
                    "Add Bonus Question"
                  )}
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>

        {/* View Archived Questions Link */}
        <Link href="/admin/questions/archived">
          <Button
            variant="outline"
            className="w-full gap-2"
          >
            <Archive className="h-4 w-4" />
            View Archived Questions
          </Button>
        </Link>
      </div>
    </div>
  );
}