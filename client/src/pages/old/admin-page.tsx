import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  ScrollText,
  Users,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, InsertQuestion } from "@shared/schema";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format, addWeeks, startOfWeek } from "date-fns";


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
  const [selectedQuestionSlot, setSelectedQuestionSlot] = useState<{weekOf: Date, slot: number} | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<InsertQuestion>>({
    options: ["", "", "", ""],
  });

  const currentWeek = startOfWeek(new Date());
  const futureWeeks = Array.from({ length: 4 }, (_, i) =>
    addWeeks(currentWeek, i)
  );

  const { data: weeklyQuestions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/questions");
      return await res.json();
    }
  });

  const allCategories = useMemo(() => {
    return PREDEFINED_CATEGORIES;
  }, []);

  const filteredWeeklyQuestions = useMemo(() => {
    if (!weeklyQuestions) return [];
    return weeklyQuestions.filter(q => !q.isArchived);
  }, [weeklyQuestions]);

  const createQuestionMutation = useMutation({
    mutationFn: async (question: InsertQuestion) => {
      if (!selectedQuestionSlot?.weekOf) {
        throw new Error('Week not selected');
      }
      const formattedDate = format(selectedQuestionSlot.weekOf, 'yyyy-MM-dd');
      const questionWithWeek = {
        ...question,
        weekOf: formattedDate,
      };
      const res = await apiRequest("POST", "/api/questions", questionWithWeek);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setNewQuestion({ options: ["", "", "", ""] });
      setSelectedQuestionSlot(null);
      toast({
        title: "Success",
        description: "Question created successfully",
        duration: 2000, // 2 seconds instead of default 4 seconds
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

  const getQuestionsForWeek = (week: Date, questions: Question[]) => {
    const weekString = format(week, 'yyyy-MM-dd');
    return questions.filter(q => {
      const questionDate = new Date(q.weekOf);
      const questionWeek = format(questionDate, 'yyyy-MM-dd');
      return questionWeek === weekString && !q.isArchived;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin">
            <Button variant="ghost" className="mr-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Question Management</h1>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {futureWeeks.map((week) => {
            const questions = getQuestionsForWeek(week, filteredWeeklyQuestions);
            const isCurrentWeek = week.getTime() === currentWeek.getTime();
            const weekId = week.toISOString();

            return (
              <AccordionItem key={weekId} value={weekId} className="border rounded-lg">
                <AccordionTrigger className="px-3 py-2 hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-base font-medium">
                      {isCurrentWeek && "📍"} Week of {format(week, 'MMM d')}
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
                    {[0, 1, 2].map((slot) => {
                      const question = questions[slot];

                      if (question) {
                        return (
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
                        );
                      }

                      return (
                        <Sheet key={`${weekId}-${slot}`}>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-20 border-dashed flex-col gap-1.5"
                              onClick={() => setSelectedQuestionSlot({ weekOf: week, slot })}
                            >
                              <Plus className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Question {slot + 1}
                              </span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent 
                            side="bottom" 
                            className="h-[95%] px-4 pt-4 pb-0 sm:h-full sm:max-w-xl sm:px-6 sm:pt-6"
                          >
                            <SheetHeader className="space-y-1 sm:space-y-2.5">
                              <SheetTitle className="text-base sm:text-lg">
                                Add Question {slot + 1} for {format(week, 'MMM d')}
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

                              createQuestionMutation.mutate(newQuestion as InsertQuestion);
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
                                    {allCategories.map((category) => (
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
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}