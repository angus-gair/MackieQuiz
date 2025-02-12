import { AdminLayout } from "@/components/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Question } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { Link } from "wouter";

export default function QuestionsPage() {
  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  return (
    <AdminLayout>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Question Management</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage quiz questions
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/questions/archived">
                <Archive className="h-4 w-4 mr-2" />
                View Archived
              </Link>
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {questions?.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-base">{question.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md ${
                        option === question.correctAnswer
                          ? "bg-primary/10 border border-primary"
                          : "bg-muted"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}