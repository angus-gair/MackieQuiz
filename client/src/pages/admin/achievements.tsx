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
import { Award } from "lucide-react";
import { HeaderNav } from "@/components/header-nav";

type AchievementWithUser = Achievement & {
  user: {
    username: string;
  };
};

export default function AdminAchievementsPage() {
  const { data: achievements, isLoading } = useQuery<AchievementWithUser[]>({
    queryKey: ["/api/admin/achievements"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
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
                    <TableCell>{achievement.type}</TableCell>
                    <TableCell>{achievement.name}</TableCell>
                    <TableCell>{achievement.description}</TableCell>
                    <TableCell>{achievement.milestone}</TableCell>
                    <TableCell>{achievement.user?.username || 'Unknown User'}</TableCell>
                    <TableCell>
                      {new Date(achievement.earnedAt).toLocaleDateString()}
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