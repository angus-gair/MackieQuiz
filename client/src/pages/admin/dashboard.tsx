import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CacheSettings } from "@/components/admin/cache-settings";

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
    {
      icon: <Award className="h-4 w-4" />,
      title: "Achievement Management",
      description: "View and manage user achievements and milestones",
      href: "/admin/achievements"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="pt-16 px-4 pb-24">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-primary mb-6">Admin Dashboard</h1>

          {/* Cache Settings Section */}
          <div className="mb-6">
            <CacheSettings />
          </div>

          {/* Module Cards */}
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
      </main>
    </div>
  );
}