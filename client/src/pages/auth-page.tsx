import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Redirect } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function AuthPage() {
  const isMobile = useIsMobile();
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

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
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-2">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-inter">Username</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-8" />
                          </FormControl>
                          <FormMessage className="text-xs font-inter" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-inter">Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="h-8" />
                          </FormControl>
                          <FormMessage className="text-xs font-inter" />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-8 text-sm font-inter" disabled={loginMutation.isPending}>
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-2">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-inter">Username</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-8" />
                          </FormControl>
                          <FormMessage className="text-xs font-inter" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-inter">Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="h-8" />
                          </FormControl>
                          <FormMessage className="text-xs font-inter" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="isAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs font-inter">Register as admin</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-8 text-sm font-inter" disabled={registerMutation.isPending}>
                      Register
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}