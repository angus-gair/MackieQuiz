import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Medal } from "lucide-react";
import { HeaderNav } from "@/components/header-nav";

export default function AdminAchievementsPage() {
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/admin/achievements"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Award className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <HeaderNav />
      <main className="pt-16 px-4 pb-24">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Award className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Achievement Management</h1>
          </div>

          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Milestone</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Earned At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements?.map((achievement) => (
                  <TableRow key={achievement.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {achievement.badge ? (
                          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
                            <Medal className="w-5 h-5 text-primary" />
                          </div>
                        ) : (
                          <Award className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{achievement.type}</TableCell>
                    <TableCell>{achievement.name}</TableCell>
                    <TableCell>{achievement.description}</TableCell>
                    <TableCell>{achievement.milestone}</TableCell>
                    <TableCell className="font-medium">
                      {achievement.user?.username || 'Unknown User'}
                    </TableCell>
                    <TableCell>
                      {new Date(achievement.earnedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}