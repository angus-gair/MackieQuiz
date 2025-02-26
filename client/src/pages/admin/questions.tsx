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
import { format, addWeeks, startOfWeek, parseISO, isEqual } from "date-fns";
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
  const { data: availableWeeks } = useQuery<DimDate[]>({
    queryKey: ["/api/weeks/available"],
  });

  // Get questions including bonus questions
  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  // Get active bonus questions
  const { data: bonusQuestions } = useQuery<Question[]>({
    queryKey: ["/api/questions/bonus/active"],
  });

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

          <Accordion type="single" collapsible className="space-y-2 mb-4">
            {availableWeeks?.map((weekData) => {
              const weekQuestions = getQuestionsForWeek(weekData.week, questions);
              const isCurrentWeek = weekData.weekIdentifier === 'Current';

              return (
                <AccordionItem key={weekData.week.toString()} value={weekData.week.toString()} className="border rounded-lg">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-base font-medium">
                        {isCurrentWeek && "📍"} Week of {format(weekData.week, 'MMM d')}
                      </span>
                      {isCurrentWeek && (
                        <span className="text-xs font-normal text-muted-foreground">
                          (Current)
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-2">
                      {weekQuestions.map((question) => (
                        <Card key={question.id} className="relative">
                          <div className="p-2 sm:p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-medium leading-tight flex-1">
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
                                <Archive className="h-4 w-4" />
                              </Button>
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

                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 border-dashed flex items-center justify-center gap-2"
                            onClick={() => {
                              setSelectedWeek(weekData.week);
                              setIsBonus(false);
                            }}
                          >
                            <Plus className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Add Question
                            </span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent 
                          side="bottom" 
                          className="h-[95%] px-4 pt-4 pb-0 sm:h-full sm:max-w-xl sm:px-6 sm:pt-6"
                        >
                          <SheetHeader className="space-y-1 sm:space-y-2.5">
                            <SheetTitle className="text-base sm:text-lg">
                              Add Question for {format(weekData.week, 'MMM d')}
                            </SheetTitle>
                          </SheetHeader>
                          <Separator className="my-3 sm:my-4" />
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
                          }} className="flex flex-col space-y-3 sm:space-y-4 overflow-y-auto">
                            <div className="space-y-1.5 sm:space-y-2">
                              <Label className="text-xs font-medium sm:text-sm">Question Text</Label>
                              <Textarea
                                value={newQuestion.question || ""}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                                placeholder="Enter the question text"
                                className="min-h-[60px] sm:min-h-[80px] text-sm resize-none"
                              />
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                              <Label className="text-xs font-medium sm:text-sm">Options</Label>
                              <div className="grid gap-1.5 sm:gap-2">
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
                                    className="h-8 sm:h-9 text-sm"
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                              <Label className="text-xs font-medium sm:text-sm">Correct Answer</Label>
                              <Select
                                value={newQuestion.correctAnswer ? 
                                  (newQuestion.options?.indexOf(newQuestion.correctAnswer) + 1).toString() : 
                                  undefined}
                                onValueChange={(value) => {
                                  const selectedIndex = parseInt(value) - 1;
                                  const selectedOption = newQuestion.options?.[selectedIndex] || '';
                                  setNewQuestion(prev => ({ ...prev, correctAnswer: selectedOption }));
                                }}
                              >
                                <SelectTrigger className="h-8 sm:h-9 text-sm">
                                  <SelectValue placeholder="Select the correct option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4].map((optionNum) => (
                                    <SelectItem 
                                      key={optionNum} 
                                      value={optionNum.toString()}
                                      className="text-sm"
                                    >
                                      Option {optionNum}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                              <Label className="text-xs font-medium sm:text-sm">Category</Label>
                              <Select
                                value={newQuestion.category}
                                onValueChange={(value) => setNewQuestion(prev => ({ ...prev, category: value }))}
                              >
                                <SelectTrigger className="h-8 sm:h-9 text-sm">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PREDEFINED_CATEGORIES.map((category) => (
                                    <SelectItem 
                                      key={category} 
                                      value={category}
                                      className="text-sm"
                                    >
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                              <Label className="text-xs font-medium sm:text-sm">Explanation</Label>
                              <Textarea
                                value={newQuestion.explanation || ""}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                                placeholder="Explain why this is the correct answer"
                                className="min-h-[60px] sm:min-h-[80px] text-sm resize-none"
                              />
                            </div>

                            <div className="sticky bottom-0 -mx-4 sm:-mx-6 mt-auto">
                              <div className="px-4 py-3 sm:px-6 bg-background/80 backdrop-blur-sm border-t">
                                <Button
                                  type="submit"
                                  className="w-full h-9 text-sm font-medium"
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
                              </div>
                            </div>
                          </form>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2 h-9 mb-4"
                onClick={() => {
                  setIsBonus(true);
                  setSelectedWeek(null);
                }}
              >
                <Star className="h-4 w-4" />
                Add Bonus Question
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className="h-[95%] px-4 pt-4 pb-0 sm:h-full sm:max-w-xl sm:px-6 sm:pt-6"
            >
              <SheetHeader className="space-y-1 sm:space-y-2.5">
                <SheetTitle className="text-base sm:text-lg">
                  Add Bonus Question
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-3 sm:my-4" />
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

                createQuestionMutation.mutate({...newQuestion, isBonus: true} as InsertQuestion & {isBonus?: boolean; bonusPoints?: number; availableFrom?: Date; availableUntil?: Date;});
              }} className="flex flex-col space-y-3 sm:space-y-4 overflow-y-auto">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs font-medium sm:text-sm">Question Text</Label>
                  <Textarea
                    value={newQuestion.question || ""}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the question text"
                    className="min-h-[60px] sm:min-h-[80px] text-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs font-medium sm:text-sm">Options</Label>
                  <div className="grid gap-1.5 sm:gap-2">
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
                        className="h-8 sm:h-9 text-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs font-medium sm:text-sm">Correct Answer</Label>
                  <Select
                    value={newQuestion.correctAnswer ? 
                      (newQuestion.options?.indexOf(newQuestion.correctAnswer) + 1).toString() : 
                      undefined}
                    onValueChange={(value) => {
                      const selectedIndex = parseInt(value) - 1;
                      const selectedOption = newQuestion.options?.[selectedIndex] || '';
                      setNewQuestion(prev => ({ ...prev, correctAnswer: selectedOption }));
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-sm">
                      <SelectValue placeholder="Select the correct option" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((optionNum) => (
                        <SelectItem 
                          key={optionNum} 
                          value={optionNum.toString()}
                          className="text-sm"
                        >
                          Option {optionNum}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs font-medium sm:text-sm">Category</Label>
                  <Select
                    value={newQuestion.category}
                    onValueChange={(value) => setNewQuestion(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-sm">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_CATEGORIES.map((category) => (
                        <SelectItem 
                          key={category} 
                          value={category}
                          className="text-sm"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs font-medium sm:text-sm">Explanation</Label>
                  <Textarea
                    value={newQuestion.explanation || ""}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Explain why this is the correct answer"
                    className="min-h-[60px] sm:min-h-[80px] text-sm resize-none"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs font-medium sm:text-sm">Bonus Points</Label>
                  <Input
                    type="number"
                    value={newQuestion.bonusPoints || ""}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, bonusPoints: parseInt(e.target.value, 10) }))}
                    placeholder="Enter bonus points"
                    className="h-8 sm:h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs font-medium sm:text-sm">Available From</Label>
                  <Input
                    type="date"
                    value={newQuestion.availableFrom ? format(newQuestion.availableFrom, 'yyyy-MM-dd') : ""}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, availableFrom: parseISO(e.target.value) }))}
                    placeholder="Select available from date"
                    className="h-8 sm:h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs font-medium sm:text-sm">Available Until</Label>
                  <Input
                    type="date"
                    value={newQuestion.availableUntil ? format(newQuestion.availableUntil, 'yyyy-MM-dd') : ""}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, availableUntil: parseISO(e.target.value) }))}
                    placeholder="Select available until date"
                    className="h-8 sm:h-9 text-sm"
                  />
                </div>
                <div className="sticky bottom-0 -mx-4 sm:-mx-6 mt-auto">
                  <div className="px-4 py-3 sm:px-6 bg-background/80 backdrop-blur-sm border-t">
                    <Button
                      type="submit"
                      className="w-full h-9 text-sm font-medium"
                      disabled={createQuestionMutation.isPending}
                    >
                      {createQuestionMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding Question...
                        </>
                      ) : (
                        "Add Bonus Question"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </SheetContent>
          </Sheet>

          <Link href="/admin/questions/archived" className="block">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2 h-9"
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