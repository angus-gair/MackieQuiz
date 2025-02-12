import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Question } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminArchivedPage() {
  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions/archived"],
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Archived Questions</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pt-14 pb-16">
        <div className="p-4 space-y-3">
          {questions?.map((question) => (
            <Card key={question.id} className="relative">
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-medium leading-tight flex-1">
                    {question.question}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Week of: {format(new Date(question.weekOf), 'PPP')}
                </p>
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
    </div>
  );
}
