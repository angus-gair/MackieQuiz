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
  Home,
  Users,
  BarChart3,
  Settings,
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

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState<Partial<InsertQuestion>>({
    options: ["", "", "", ""],
  });

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (question: InsertQuestion) => {
      const res = await apiRequest("POST", "/api/questions", question);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setNewQuestion({ options: ["", "", "", ""] });
      toast({
        title: "Success",
        description: "Question created successfully",
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

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
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

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold">Quiz Admin</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[92%] sm:h-full">
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
              }} className="space-y-6 overflow-y-auto pb-20">
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
      </header>

      {/* Main Content - Scrollable Area */}
      <main className="flex-1 overflow-y-auto pt-14 pb-16">
        <div className="p-4 space-y-3">
          {questions?.map((question) => (
            <Card key={question.id} className="relative">
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-medium leading-tight flex-1">
                    {question.question}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this question?")) {
                        deleteQuestionMutation.mutate(question.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete question</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Category: {question.category}
                </p>
                <div className="space-y-1.5">
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
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}