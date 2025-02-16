import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import type { Feedback } from "@shared/schema";
import { format } from "date-fns";

export function FeedbackView() {
  const { data: feedback } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Recent Feedback</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback?.length === 0 && (
          <p className="text-sm text-muted-foreground">No feedback received yet</p>
        )}
        {feedback?.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{item.category}</p>
                <p className="text-sm text-muted-foreground">
                  Rating: {item.rating}/5
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-sm">{item.content}</p>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
