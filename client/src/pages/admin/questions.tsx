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
  Plus,
  Archive,
  ArrowLeft,
  Loader2,
  CalendarIcon,
  Pencil,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, InsertQuestion, DimDate } from "@shared/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const PREDEFINED_CATEGORIES = [
  "Operations",
  "Specials",
  "Wine Varietals",
  "Beer",
  "Spirits",
  "Team - Member",
  "Team - Manager",
  "Partner Products",
  "Company Policy",
  "Industry Knowledge",
];

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [isAddQuestionSheetOpen, setIsAddQuestionSheetOpen] = useState(false);
  const [isEditQuestionSheetOpen, setIsEditQuestionSheetOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<InsertQuestion>>({
    options: ["", "", "", ""],
  });
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string | null>(null);

  // Get available weeks from the dim_date table
  const { data: availableWeeks, isLoading: isLoadingWeeks } = useQuery<DimDate[]>({
    queryKey: ["/api/weeks/available"],
  });

  // Get questions for all weeks
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const isLoading = isLoadingWeeks || isLoadingQuestions;

  // Create Question Mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (question: InsertQuestion) => {
      // Convert weekOf to string if it's a Date
      if (question.weekOf instanceof Date) {
        question.weekOf = format(question.weekOf, 'yyyy-MM-dd');
      }
      return apiRequest<Question>("/api/questions", {
        method: "POST",
        body: question,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Question created",
        description: "The question has been successfully created.",
      });
      setIsAddQuestionSheetOpen(false);
      setNewQuestion({
        options: ["", "", "", ""],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update Question Mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async (question: Question) => {
      return apiRequest<Question>(`/api/questions/${question.id}`, {
        method: "PATCH",
        body: question,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Question updated",
        description: "The question has been successfully updated.",
      });
      setIsEditQuestionSheetOpen(false);
      setEditingQuestion(null);
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Archive Question Mutation
  const archiveQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest<Question>(`/api/questions/${id}/archive`, {
        method: "PATCH",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Question archived",
        description: "The question has been successfully archived.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to archive question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newQuestion.question ||
      !newQuestion.options ||
      !newQuestion.correctAnswer ||
      !newQuestion.category ||
      !newQuestion.weekOf
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    createQuestionMutation.mutate(newQuestion as InsertQuestion);
  };

  const handleSubmitQuestionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    updateQuestionMutation.mutate(editingQuestion);
  };

  const getQuestionsForWeek = (weekData: DimDate, questions: Question[] = []) => {
    if (!questions || !weekData) return [];
    const weekDate = new Date(weekData.week);
    const formattedWeekDate = !isNaN(weekDate.getTime()) ? format(weekDate, 'yyyy-MM-dd') : '';
    
    return questions.filter(question => {
      if (typeof question.weekOf === 'string') {
        return question.weekOf === formattedWeekDate;
      } else if (question.weekOf instanceof Date) {
        return format(question.weekOf, 'yyyy-MM-dd') === formattedWeekDate;
      }
      return false;
    });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsEditQuestionSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="container">
          <div className="py-3 flex items-center gap-2">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Question Management</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto pt-[72px] pb-8 px-4">
        {/* Add Question Button at the top */}
        <div className="mb-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <Sheet open={isAddQuestionSheetOpen} onOpenChange={setIsAddQuestionSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  size="sm"
                  className="w-full md:w-auto"
                  onClick={() => {
                    if (availableWeeks && availableWeeks.length > 0) {
                      const weekDate = new Date(availableWeeks[0].week);
                      if (!isNaN(weekDate.getTime())) {
                        setSelectedWeek(weekDate);
                      }
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-4 sm:p-6 md:max-w-xl overflow-y-auto max-h-screen">
                <SheetHeader className="mb-5">
                  <SheetTitle className="text-xl">
                    Add New Question
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-4">
                  <form onSubmit={handleSubmitQuestion} className="space-y-5">
                    {/* Week selection */}
                    <div>
                      <Label className="text-sm font-medium">Select Week</Label>
                      <Select
                        value={selectedWeek && !isNaN(selectedWeek.getTime()) ? format(selectedWeek, 'yyyy-MM-dd') : undefined}
                        onValueChange={(value) => {
                          // First parse it to a Date object for local display purposes
                          const weekDate = parseISO(value);
                          setSelectedWeek(weekDate);
                          
                          // Store the string value in the newQuestion state to send to the server
                          setNewQuestion(prev => ({ 
                            ...prev, 
                            weekOf: value // Keep as string format to prevent timezone shifts
                          }));
                        }}
                      >
                        <SelectTrigger className="mt-1.5 w-full">
                          <SelectValue placeholder="Select week" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-full min-w-[200px]">
                          {availableWeeks?.map((weekData) => {
                            const weekDate = new Date(weekData.week);
                            return (
                              <SelectItem 
                                key={weekData.week.toString()} 
                                value={!isNaN(weekDate.getTime()) ? format(weekDate, 'yyyy-MM-dd') : ''}
                              >
                                Week of {!isNaN(weekDate.getTime()) ? format(weekDate, 'MMM dd') : 'Unknown'}
                                {weekData.weekIdentifier === 'Current' && " (Current)"}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Question Text</Label>
                      <Textarea
                        value={newQuestion.question || ""}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                        className="mt-1.5 min-h-[80px]"
                        placeholder="Enter your question"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Options</Label>
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
                            className="text-sm"
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Correct Answer</Label>
                      <Select
                        value={newQuestion.correctAnswer}
                        onValueChange={(value) => setNewQuestion(prev => ({ ...prev, correctAnswer: value }))}
                      >
                        <SelectTrigger className="mt-1.5 w-full">
                          <SelectValue placeholder="Select correct option" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-full min-w-[200px]">
                          {newQuestion.options?.map((option, index) => (
                            <SelectItem key={index} value={option || `Option ${index + 1}`}>
                              Option {index + 1}: {option || `Option ${index + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <Select
                        value={newQuestion.category}
                        onValueChange={(value) => setNewQuestion(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-1.5 w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-full min-w-[200px]">
                          {PREDEFINED_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Explanation</Label>
                      <Textarea
                        value={newQuestion.explanation || ""}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                        className="mt-1.5 min-h-[80px]"
                        placeholder="Explain why this is the correct answer"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-6"
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
          
          {/* Week filter radio buttons */}
          {availableWeeks && availableWeeks.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-3">Select which questions for quiz:</h3>
              <RadioGroup 
                value={selectedWeekFilter || ''} 
                onValueChange={(value) => setSelectedWeekFilter(value)}
                className="flex flex-wrap gap-2 md:gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="all-weeks" />
                  <Label htmlFor="all-weeks">All Weeks</Label>
                </div>
                
                {availableWeeks.map((weekData) => {
                  const weekDate = new Date(weekData.week);
                  const dateValue = !isNaN(weekDate.getTime()) ? format(weekDate, 'yyyy-MM-dd') : '';
                  const displayText = !isNaN(weekDate.getTime()) 
                    ? `Week of ${format(weekDate, 'MMM dd')}${weekData.weekIdentifier === 'Current' ? ' (Current)' : ''}` 
                    : 'Unknown Week';
                    
                  return (
                    <div key={dateValue} className="flex items-center space-x-2">
                      <RadioGroupItem value={dateValue} id={`week-${dateValue}`} />
                      <Label htmlFor={`week-${dateValue}`}>{displayText}</Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </Card>
          )}
        </div>

        {/* Edit Question Sheet */}
        <Sheet open={isEditQuestionSheetOpen} onOpenChange={setIsEditQuestionSheetOpen}>
          <SheetContent side="right" className="w-full p-4 sm:p-6 md:max-w-xl overflow-y-auto max-h-screen">
            <SheetHeader className="mb-5">
              <SheetTitle className="text-xl">
                Edit Question
              </SheetTitle>
            </SheetHeader>
            
            <div className="mt-4">
              {editingQuestion && (
                <form onSubmit={handleSubmitQuestionEdit} className="space-y-5">
                  <div>
                    <Label className="text-sm font-medium">Question Text</Label>
                    <Textarea
                      value={editingQuestion.question || ""}
                      onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question: e.target.value } : null)}
                      className="mt-1.5 min-h-[80px]"
                      placeholder="Enter your question"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Options</Label>
                    <div className="mt-1.5 space-y-2">
                      {editingQuestion.options?.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => {
                            if (!editingQuestion) return;
                            const newOptions = [...editingQuestion.options];
                            newOptions[index] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                          className="text-sm"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Correct Answer</Label>
                    <Select
                      value={editingQuestion.correctAnswer}
                      onValueChange={(value) => setEditingQuestion(prev => prev ? { ...prev, correctAnswer: value } : null)}
                    >
                      <SelectTrigger className="mt-1.5 w-full">
                        <SelectValue placeholder="Select correct option" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="w-full min-w-[200px]">
                        {editingQuestion.options?.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            Option {index + 1}: {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select
                      value={editingQuestion.category}
                      onValueChange={(value) => setEditingQuestion(prev => prev ? { ...prev, category: value } : null)}
                    >
                      <SelectTrigger className="mt-1.5 w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="w-full min-w-[200px]">
                        {PREDEFINED_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Explanation</Label>
                    <Textarea
                      value={editingQuestion.explanation || ""}
                      onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, explanation: e.target.value } : null)}
                      className="mt-1.5 min-h-[80px]"
                      placeholder="Explain why this is the correct answer"
                    />
                  </div>
                  
                  {/* Week selection dropdown */}
                  <div>
                    <Label className="text-sm font-medium">Select Week</Label>
                    <Select
                      value={editingQuestion.weekOf ? 
                        (typeof editingQuestion.weekOf === 'string' ? 
                          editingQuestion.weekOf : format(editingQuestion.weekOf, 'yyyy-MM-dd')) 
                        : undefined}
                      onValueChange={(value) => {
                        if (!editingQuestion) return;
                        const weekDate = parseISO(value);
                        setEditingQuestion({ 
                          ...editingQuestion, 
                          weekOf: value,  // Store as string to prevent timezone issues
                          // We don't set availableFrom and availableUntil here as they're calculated on the server
                        });
                      }}
                    >
                      <SelectTrigger className="mt-1.5 w-full">
                        <SelectValue placeholder="Select week" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="w-full min-w-[200px]">
                        {availableWeeks?.map((weekData) => {
                          const weekDate = new Date(weekData.week);
                          return (
                            <SelectItem 
                              key={weekData.week.toString()} 
                              value={!isNaN(weekDate.getTime()) ? format(weekDate, 'yyyy-MM-dd') : ''}
                            >
                              Week of {!isNaN(weekDate.getTime()) ? format(weekDate, 'MMM dd') : 'Unknown'}
                              {weekData.weekIdentifier === 'Current' && " (Current)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Note: Availability dates (Monday-Sunday) will be automatically updated based on the selected week.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={updateQuestionMutation.isPending}
                  >
                    {updateQuestionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Question...
                      </>
                    ) : (
                      "Update Question"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="space-y-4">
          {availableWeeks?.filter(weekData => {
            // If no week is selected in the filter, show all weeks
            if (!selectedWeekFilter) return true;
            
            // Otherwise, only show weeks that match the selected week date
            const weekDate = new Date(weekData.week);
            const formattedWeekDate = !isNaN(weekDate.getTime()) ? format(weekDate, 'yyyy-MM-dd') : '';
            return formattedWeekDate === selectedWeekFilter;
          }).map((weekData) => {
            const weekQuestions = getQuestionsForWeek(weekData, questions);
            const isCurrentWeek = weekData.weekIdentifier === 'Current';

            return (
              <Card key={weekData.week.toString()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {(() => {
                          const weekDate = new Date(weekData.week);
                          return !isNaN(weekDate.getTime()) 
                            ? `Week of ${format(weekDate, 'MMM dd')}` 
                            : 'Week of Unknown Date';
                        })()}
                        {isCurrentWeek && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            (Current)
                          </span>
                        )}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {weekQuestions.map((question) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="px-2 py-0 h-6 font-normal">
                                  {question.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-1">
                                  ID: {question.id}
                                </span>
                              </div>
                              <h3 className="font-medium">{question.question}</h3>
                            </div>

                            <div className="space-y-2 mb-4">
                              {question.options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                  <div className={cn(
                                    "px-2 py-1 text-sm rounded-md w-full", 
                                    option === question.correctAnswer ? 
                                      "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900" : 
                                      "bg-muted border"
                                  )}>
                                    {option}
                                    {option === question.correctAnswer && (
                                      <span className="ml-2 text-green-600 dark:text-green-400 text-xs">
                                        Correct Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {question.explanation && (
                              <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
                                <p className="text-xs font-medium mb-1">Explanation:</p>
                                <p>{question.explanation}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (confirm("Are you sure you want to archive this question?")) {
                                      archiveQuestionMutation.mutate(question.id);
                                    }
                                  }}
                                  className="text-destructive"
                                >
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}

                    {weekQuestions.length === 0 && (
                      <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
                        <p className="text-muted-foreground text-center mb-4">
                          No questions available for this week.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            const weekDate = new Date(weekData.week);
                            if (!isNaN(weekDate.getTime())) {
                              setSelectedWeek(weekDate);
                              setNewQuestion(prev => ({ 
                                ...prev, 
                                weekOf: format(weekDate, 'yyyy-MM-dd')
                              }));
                              setIsAddQuestionSheetOpen(true);
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}