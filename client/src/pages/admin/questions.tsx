import { useQuery } from "@tanstack/react-query";
import { Question } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { HeaderNav } from "@/components/header-nav";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type WeeklyQuestions = {
  week: string;
  current?: boolean;
  questions: Array<Question & { category: string }>;
};

const mockData: WeeklyQuestions[] = [
  {
    week: "Week of Feb 9",
    current: true,
    questions: []
  },
  {
    week: "Week of Feb 16",
    questions: [
      {
        id: 1,
        question: "Which management team member has perfomed in a circus?",
        options: ["Jonno", "Belinda", "Dan", "Ferg"],
        correctAnswer: "Belinda",
        explanation: "",
        category: "Team - Member"
      },
      {
        id: 2,
        question: "Last week we discussed Australia chardonnay, which Chardonnay is most like a Chablis in style (clean, refreshing with notes of apple, citrus and pear)",
        options: ["Mercer Chardonnay", "Golding Chardonnay", "Garagiste Le Stagiaire Chardonnay", "Levantine Hill 'Coldstream Guard' Chardonnay"],
        correctAnswer: "Garagiste Le Stagiaire Chardonnay",
        explanation: "",
        category: "Wine Varietals"
      },
      {
        id: 3,
        question: "What temperature should red wine be served at?",
        options: ["8-10°C (Fridge Temperature)", "16-18°C (Room Temperature)", "20-22°C (Warm)", "25°C or above"],
        correctAnswer: "16-18°C (Room Temperature)",
        explanation: "",
        category: "Wine Service"
      }
    ]
  }
];

export default function QuestionsPage() {
  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <HeaderNav />
      <main className="pt-16 px-4 pb-24">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="h-8 mr-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Question Management</h1>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {mockData.map((week) => (
              <AccordionItem 
                key={week.week} 
                value={week.week}
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                  <div className="flex items-center gap-2">
                    {week.current && (
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    )}
                    <span>{week.week}</span>
                    {week.current && (
                      <span className="text-sm text-muted-foreground">(Current)</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t">
                  <div className="px-4 py-2">
                    {week.questions.map((question, index) => (
                      <div key={question.id} className="py-4 first:pt-2 last:pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-muted-foreground">
                            Category: {question.category}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                        <Card>
                          <CardContent className="pt-4">
                            <p className="font-medium mb-3">{question.question}</p>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
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
                        {index < week.questions.length - 1 && (
                          <div className="h-px bg-border my-4" />
                        )}
                      </div>
                    ))}
                    <Button className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
}