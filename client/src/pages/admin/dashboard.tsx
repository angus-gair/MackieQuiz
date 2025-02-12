import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, BarChart2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const { user } = useAuth();

  const modules = [
    {
      icon: <PlusCircle className="h-4 w-4" />,
      title: "Question Management",
      description: "Create and manage weekly quiz questions",
      href: "/admin/questions"
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "User Management",
      description: "Manage user team assignments and compositions",
      href: "/admin/users"
    },
    // Only show User Analytics module for user "gair"
    ...(user?.username === "gair" ? [{
      icon: <BarChart2 className="h-4 w-4" />,
      title: "User Analytics",
      description: "Monitor user interactions, sessions, and behavior",
      href: "/admin/user"
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-primary">Admin Dashboard</h1>
        </div>
        <div className="space-y-2">
          {modules.map((module) => (
            <Card key={module.href}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {module.icon}
                  <span>{module.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <p className="text-xs text-muted-foreground mb-3">
                  {module.description}
                </p>
                <Button asChild className="w-full h-8 text-xs">
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