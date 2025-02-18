import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema, type InsertFeedback } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FeedbackFormProps {
  userId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function FeedbackForm({ userId, onSuccess, onClose }: FeedbackFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertFeedback>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      userId,
      content: "",
      rating: 5,
      category: "general"
    }
  });

  const onSubmit = async (values: InsertFeedback) => {
    try {
      const response = await apiRequest("POST", "/api/feedback", values);
      if (response.ok) {
        toast({
          title: "Thank You!",
          description: "Your feedback has been submitted successfully.",
          duration: 5000,
        });
        form.reset();
        onSuccess?.();
        onClose?.();
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="quiz">Quiz Content</SelectItem>
                  <SelectItem value="ui">User Interface</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating (1-5)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>How would you rate your experience?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what you think..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit Feedback
        </Button>
      </form>
    </Form>
  );
}