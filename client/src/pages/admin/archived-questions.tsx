import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ArchivedQuestionsPage() {
  const { toast } = useToast();

  const { data: archivedQuestions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions/archived"],
  });

  const unarchiveQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/questions/${id}/unarchive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/archived"] });
      toast({
        title: "Success",
        description: "Question unarchived successfully",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
        <div className="container h-full">
          <div className="flex items-center h-full px-4">
            <Link href="/admin/questions">
              <Button variant="ghost" className="mr-3">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Archived Questions</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto pt-[72px] pb-8 px-4">
        <div className="space-y-4">
          {archivedQuestions?.map((question) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-base">
                    {question.question}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Category: {question.category} • Week of {format(new Date(question.weekOf), 'MMM dd')}
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
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to unarchive this question?")) {
                      unarchiveQuestionMutation.mutate(question.id);
                    }
                  }}
                >
                  Unarchive
                </Button>
              </div>
            </Card>
          ))}
          {(!archivedQuestions || archivedQuestions.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              No archived questions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}