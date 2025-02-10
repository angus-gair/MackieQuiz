import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ArrowLeft, Users, BarChart3, Settings } from "lucide-react";
import { Link, Redirect } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, InsertQuestion } from "@shared/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "mb-6",
          "flex flex-col gap-4"
        )}>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" className="h-10 w-10 p-0">
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Admin Dashboard</h1>
          </div>
        </div>

        {/* Admin Navigation Cards - Grid for mobile, larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Users & Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Manage user accounts and team assignments</p>
                <Button className="w-full h-12 text-base" variant="outline">
                  View Users
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">View quiz performance and team statistics</p>
                <Button className="w-full h-12 text-base" variant="outline">
                  View Stats
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Configure application settings</p>
              <Button className="w-full h-12 text-base" variant="outline">
                Manage Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Question Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Add New Question
            </CardTitle>
          </CardHeader>
          <CardContent>
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
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question" className="text-base">Question Text</Label>
                <Textarea
                  id="question"
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
                <Label htmlFor="correctAnswer" className="text-base">Correct Answer</Label>
                <Input
                  id="correctAnswer"
                  value={newQuestion.correctAnswer || ""}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  placeholder="Enter the correct answer (must match one of the options)"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">Category</Label>
                <Input
                  id="category"
                  value={newQuestion.category || ""}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter the question category"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-base">Explanation</Label>
                <Textarea
                  id="explanation"
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
          </CardContent>
        </Card>

        {/* Existing Questions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Questions</h2>
          {questions?.map((question) => (
            <Card key={question.id} className="quiz-card">
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-4 text-lg">
                  <span className="flex-1">{question.question}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this question?")) {
                        deleteQuestionMutation.mutate(question.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete question</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-base"><strong>Category:</strong> {question.category}</p>
                  <div>
                    <p className="text-base mb-2"><strong>Options:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      {question.options.map((option) => (
                        <li key={option} className={cn(
                          "text-base",
                          option === question.correctAnswer && "text-green-600 font-semibold"
                        )}>
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-base"><strong>Explanation:</strong> {question.explanation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}