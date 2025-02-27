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
  Star,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, InsertQuestion, DimDate } from "@shared/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isEqual, startOfWeek } from "date-fns";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [isBonus, setIsBonus] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<InsertQuestion> & {
    isBonus?: boolean;
    bonusPoints?: number;
    availableFrom?: Date;
    availableUntil?: Date;
  }>({
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

  // Get active bonus questions
  const { data: bonusQuestions, isLoading: isLoadingBonus } = useQuery<Question[]>({
    queryKey: ["/api/questions/bonus/active"],
  });

  const isLoading = isLoadingWeeks || isLoadingQuestions || isLoadingBonus;

  const createQuestionMutation = useMutation({
    mutationFn: async (question: InsertQuestion & {
      isBonus?: boolean;
      bonusPoints?: number;
      availableFrom?: Date;
      availableUntil?: Date;
    }) => {
      if (!selectedWeek && !question.isBonus) {
        throw new Error('Week not selected');
      }

      const endpoint = question.isBonus ? "/api/questions/bonus" : "/api/questions";
      const formattedDate = selectedWeek ? format(selectedWeek, 'yyyy-MM-dd') : undefined;

      const questionData = {
        ...question,
        weekOf: formattedDate,
      };

      const res = await apiRequest("POST", endpoint, questionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/bonus/active"] });
      setNewQuestion({ options: ["", "", "", ""] });
      setSelectedWeek(null);
      setIsBonus(false);
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
    const weekStart = startOfWeek(week);
    return questions.filter(q => {
      if (!q.weekOf || q.isArchived || q.isBonus) return false;
      const questionWeekStart = startOfWeek(parseISO(q.weekOf));
      return isEqual(weekStart, questionWeekStart);
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
            <h1 className="text-2xl font-bold">Question Management</h1>
          </div>
        </div>
      </div>

      <div className="container pt-[72px] pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Bonus Questions Section */}
          {bonusQuestions && bonusQuestions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Active Bonus Questions
              </h2>
              <div className="space-y-2">
                {bonusQuestions.map((question) => (
                  <Card key={question.id} className="relative border-yellow-500/20">
                    <div className="p-2 sm:p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium leading-tight flex-1">
                          {question.question}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-yellow-500">
                            {question.bonusPoints} points
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to archive this bonus question?")) {
                                archiveQuestionMutation.mutate(question.id);
                              }
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Category: {question.category}
                      </p>
                      <div className="space-y-1">
                        {question.options.map((option) => (
                          <div
                            key={option}
                            className={cn(
                              "text-xs px-2 py-1 rounded-md",
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
                ))}
              </div>
            </div>
          )}

          {/* Weekly Questions Section */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Questions
            </h2>
            <div className="space-y-4">
              {availableWeeks?.map((weekData) => {
                const weekQuestions = getQuestionsForWeek(weekData.week, questions);
                const isCurrentWeek = weekData.weekIdentifier === 'Current';

                return (
                  <Card key={weekData.week.toString()} className="overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium">
                          {isCurrentWeek && "📍"} Week of {format(weekData.week, 'MMM d')}
                        </span>
                        {isCurrentWeek && (
                          <span className="text-xs text-muted-foreground">
                            (Current)
                          </span>
                        )}
                      </div>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWeek(weekData.week);
                              setIsBonus(false);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Question
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-xl">
                          <SheetHeader>
                            <SheetTitle>
                              Add Question for {format(weekData.week, 'MMM d')}
                            </SheetTitle>
                          </SheetHeader>
                          <div className="mt-6">
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

                              createQuestionMutation.mutate({...newQuestion, isBonus: false} as InsertQuestion);
                            }} 
                            className="space-y-4">
                              <div>
                                <Label>Question Text</Label>
                                <Textarea
                                  value={newQuestion.question || ""}
                                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                                  className="mt-1.5"
                                />
                              </div>

                              <div>
                                <Label>Options</Label>
                                <div className="mt-1.5 space-y-2">
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
                                  <SelectTrigger className="mt-1.5">
                                    <SelectValue placeholder="Select the correct option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {newQuestion.options?.map((option, index) => (
                                      <SelectItem key={index} value={option}>
                                        Option {index + 1}: {option}
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
                                  <SelectTrigger className="mt-1.5">
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
                              <h3 className="font-medium">{question.question}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Category: {question.category}
                              </p>
                              <div className="mt-2 space-y-1">
                                {question.options.map((option) => (
                                  <div
                                    key={option}
                                    className={cn(
                                      "text-sm px-3 py-1.5 rounded-md",
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
                        <div className="p-4 text-center text-muted-foreground">
                          No questions added for this week yet
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Bonus Question Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline"
                className="w-full mb-4 gap-2"
                onClick={() => {
                  setIsBonus(true);
                  setSelectedWeek(null);
                }}
              >
                <Star className="h-4 w-4" />
                Add Bonus Question
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Add Bonus Question</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <form onSubmit={(e) => {
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
                className="space-y-4">
                  {/* Form fields are the same as regular questions plus bonus-specific fields */}
                  {/* ... existing form fields ... */}
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
          <Link href="/admin/questions/archived" className="block">
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
    </div>
  );
}