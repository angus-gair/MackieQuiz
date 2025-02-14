import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UsersTeamsPage() {
  const { toast } = useToast();
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const removeUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User removed successfully",
      });
    },
  });

  // Group users by team
  const teamGroups = users?.reduce((acc, user) => {
    const team = user.team || "Unassigned";
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
        <div className="container h-full">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center">
              <Link href="/admin">
                <Button variant="ghost" className="mr-3">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Users & Teams</h1>
            </div>
            <Button
              size="sm"
              className="h-8"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              <span className="text-sm">Add User</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container pt-[72px] pb-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-sm text-muted-foreground">
            Users Overview
          </div>

          {teamGroups && Object.entries(teamGroups).map(([team, members]) => (
            <Card key={team} className="p-4">
              <div className="text-base font-semibold mb-4">
                Team: {team}
              </div>

              <div className="space-y-2">
                {members.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Team Member
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to remove this user?")) {
                            removeUserMutation.mutate(user.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}