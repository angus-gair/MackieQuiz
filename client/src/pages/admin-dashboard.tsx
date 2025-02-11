import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminDashboardPage() {
  const modules = [
    {
      icon: <PlusCircle className="h-6 w-6" />,
      title: "Question Management",
      description: "Create and manage weekly quiz questions",
      href: "/admin/questions"
    },
    {
      icon: <BarChart2 className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "View quiz performance and user statistics",
      href: "/admin/analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="mr-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((module) => (
            <Card key={module.href}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {module.icon}
                  <span>{module.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <Button asChild className="w-full">
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