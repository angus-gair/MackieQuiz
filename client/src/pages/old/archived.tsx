import { AdminLayout } from "@/components/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Question } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ArchivedQuestionsPage() {
  const { data: archivedQuestions } = useQuery<Question[]>({
    queryKey: ["/api/questions/archived"],
  });

  return (
    <AdminLayout>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Archived Questions</h1>
            <p className="text-sm text-muted-foreground">
              View and manage archived quiz questions
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/questions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {archivedQuestions?.map((question) => (
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