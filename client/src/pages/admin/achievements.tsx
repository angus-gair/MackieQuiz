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

export default function AdminAchievementsPage() {
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/admin/achievements"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
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
              <TableHead>User ID</TableHead>
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
                <TableCell>{achievement.userId}</TableCell>
                <TableCell>
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}