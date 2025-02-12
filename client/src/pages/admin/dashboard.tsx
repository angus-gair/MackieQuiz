import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart2, Users } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AdminLayout } from "@/components/admin-layout";

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
      icon: <BarChart2 className="h-4 w-4" />,
      title: "Analytics Dashboard",
      description: "View quiz performance and user statistics",
      href: "/admin/analytics"
    },
    // Only show User Analytics module for user "gair"
    ...(user?.username === "gair" ? [{
      icon: <Users className="h-4 w-4" />,
      title: "User Analytics",
      description: "Monitor user interactions, sessions, and behavior",
      href: "/admin/user"
    }] : [])
  ];

  return (
    <AdminLayout>
      <div className="container max-w-full px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-bold text-primary mb-4">Admin Dashboard</h1>
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
                  <Link href={module.href}>
                    <a className="w-full">
                      <button className="w-full h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                        Open {module.title}
                      </button>
                    </a>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
