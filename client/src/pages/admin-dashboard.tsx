import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin-layout";
import { PlusCircle, BarChart2, Activity } from "lucide-react";
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
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Site Metrics",
      description: "Monitor site usage and engagement",
      href: "/admin/metrics"
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    </AdminLayout>
  );
}
