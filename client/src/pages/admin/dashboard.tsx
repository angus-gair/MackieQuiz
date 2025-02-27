import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CacheSettings } from "@/components/admin/cache-settings";
import { FeedbackView } from "@/components/admin/feedback-view";
import { CacheProvider } from "@/hooks/use-cache-settings";

const AdminDashboard = () => {
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-primary mb-6">Admin Dashboard</h1>

          {/* Module Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {modules.map((module) => (
              <Card key={module.href} className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {module.icon}
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={module.href}>
                      Open {module.title}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cache Settings Section */}
          <CacheProvider>
            <div className="mb-6 mt-8">
              <CacheSettings />
            </div>
          </CacheProvider>

          {/* Feedback Section */}
          <div className="mb-6">
            <FeedbackView />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;