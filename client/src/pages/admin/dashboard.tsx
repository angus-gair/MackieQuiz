import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, Award, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CacheSettings } from "@/components/admin/cache-settings";
import { FeedbackView } from "@/components/admin/feedback-view";
import { CacheProvider } from "@/hooks/use-cache-settings";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoggingOutAllUsers, setIsLoggingOutAllUsers] = useState(false);
  
  // Mutation for logging out all users
  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/logout-all-users", "POST");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All users have been logged out of the system.",
        variant: "default"
      });
      setIsLoggingOutAllUsers(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to logout all users: ${error.message}`,
        variant: "destructive"
      });
      setIsLoggingOutAllUsers(false);
    }
  });
  
  const handleLogoutAllUsers = () => {
    if (window.confirm("Are you sure you want to log out ALL users from the system? This action cannot be undone.")) {
      setIsLoggingOutAllUsers(true);
      logoutAllMutation.mutate();
    }
  };

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
          
          {/* System Administration Section */}
          <div className="mb-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-primary" />
                  System Administration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use this button to log out all users from the system. This will invalidate all active sessions.
                      Users will need to log in again. <span className="font-medium text-destructive">Use with caution!</span>
                    </p>
                    <Button 
                      variant="destructive" 
                      className="w-full sm:w-auto"
                      onClick={handleLogoutAllUsers}
                      disabled={isLoggingOutAllUsers || logoutAllMutation.isPending}
                    >
                      {isLoggingOutAllUsers ? (
                        <>
                          <span className="mr-2">Logging out all users...</span>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out All Users
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;