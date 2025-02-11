import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/features/auth/login-form";
import { RegisterForm } from "@/features/auth/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Redirect } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AuthPage() {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section - Visible on both mobile and desktop */}
      <div className="w-full bg-[#1e293b] text-white">
        <div className="max-w-md mx-auto text-center px-4 py-6">
          <h1 className="mb-3">
            <span className="text-2xl sm:text-3xl font-semibold block font-[Plus-Jakarta-Sans]">The Round Table:</span>
            <span className="text-xl sm:text-2xl font-light italic mt-1 block font-[Plus-Jakarta-Sans]">Kingsford Edition</span>
          </h1>
          <p className="text-sm sm:text-base mb-4 font-inter">Test your wine knowledge, compete with your team, and win weekly prizes!</p>
          <div className="rounded-lg shadow-xl overflow-hidden max-h-64 sm:max-h-72">
            <img
              src="/wine.jpg"
              alt="Wine cellar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="flex-1 flex items-start justify-center pt-2">
        <Card className="w-full max-w-sm border-0 sm:border shadow-none sm:shadow">
          <CardContent className="p-2 sm:p-3">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}