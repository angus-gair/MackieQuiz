import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminDashboardPage() {
  const modules = [
    {
      icon: <PlusCircle className="h-5 w-5" />,
      title: "Question Management",
      description: "Create and manage weekly quiz questions",
      href: "/admin/questions"
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Analytics Dashboard",
      description: "View quiz performance and user statistics",
      href: "/admin/analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 mr-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
        </div>

        <div className="space-y-3">
          {modules.map((module) => (
            <Card key={module.href}>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  {module.icon}
                  <span>{module.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <Button asChild className="w-full h-9 text-sm">
                  <Link href={module.href}>
                    Open {module.title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}