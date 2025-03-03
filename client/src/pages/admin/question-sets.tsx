import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuestionSet, insertQuestionSetSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Calendar, Edit, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { format } from "date-fns";

// Extended schema for the form with validation
const questionSetFormSchema = insertQuestionSetSchema.extend({
  // Add client-side validation
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  // Handle date fields as strings or Date objects
  startDate: z.union([z.string(), z.date(), z.null()]),
  endDate: z.union([z.string(), z.date(), z.null()]).nullable(),
  // Convert string arrays to comma-separated strings for easier form handling
  questionIds: z.union([z.array(z.number()), z.string()]),
  targetTeams: z.union([z.array(z.string()), z.string()]).optional(),
  rotationStrategy: z.enum(["random", "sequential", "adaptive"]),
});

export default function QuestionSetsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<QuestionSet | null>(null);
  const queryClient = useQueryClient();

  // Get all question sets
  const { data: questionSets, isLoading: isLoadingQuestionSets } = useQuery({
    queryKey: ["/api/question-sets"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/question-sets");
      return res.json() as Promise<QuestionSet[]>;
    },
  });

  // Get all available questions
  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["/api/questions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/questions");
      return res.json();
    },
  });

  // Create question set form
  const createForm = useForm<z.infer<typeof questionSetFormSchema>>({
    resolver: zodResolver(questionSetFormSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
      startDate: new Date().toISOString().split("T")[0],
      endDate: undefined,
      questionIds: [],
      targetTeams: [],
      rotationStrategy: "random",
    },
  });

  // Edit question set form
  const editForm = useForm<z.infer<typeof questionSetFormSchema>>({
    resolver: zodResolver(questionSetFormSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
      startDate: new Date().toISOString().split("T")[0],
      endDate: undefined,
      questionIds: [],
      targetTeams: [],
      rotationStrategy: "random",
    },
  });

  // Create question set mutation
  const createQuestionSetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof questionSetFormSchema>) => {
      // Handle string-to-array conversion and date conversions if needed
      const formattedData = {
        ...data,
        // Convert string dates to proper Date objects for the database
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        // Handle arrays
        questionIds: typeof data.questionIds === "string" 
          ? data.questionIds.split(",").map(id => parseInt(id.trim()))
          : data.questionIds,
        targetTeams: typeof data.targetTeams === "string" 
          ? data.targetTeams.split(",").map(team => team.trim())
          : data.targetTeams,
      };

      const res = await apiRequest("POST", "/api/question-sets", formattedData);
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-sets"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Question Set Created",
        description: "The question set has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Question Set",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update question set mutation
  const updateQuestionSetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof questionSetFormSchema> & { id: number }) => {
      const { id, ...updateData } = data;
      
      // Handle string-to-array conversion and date conversions if needed
      const formattedData = {
        ...updateData,
        // Convert string dates to proper Date objects for the database
        startDate: updateData.startDate ? new Date(updateData.startDate) : null,
        endDate: updateData.endDate ? new Date(updateData.endDate) : null,
        // Handle arrays
        questionIds: typeof updateData.questionIds === "string" 
          ? updateData.questionIds.split(",").map(id => parseInt(id.trim()))
          : updateData.questionIds,
        targetTeams: typeof updateData.targetTeams === "string" 
          ? updateData.targetTeams.split(",").map(team => team.trim())
          : updateData.targetTeams,
      };

      const res = await apiRequest("PUT", `/api/question-sets/${id}`, formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-sets"] });
      setIsEditDialogOpen(false);
      setSelectedQuestionSet(null);
      editForm.reset();
      toast({
        title: "Question Set Updated",
        description: "The question set has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Question Set",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete question set mutation
  const deleteQuestionSetMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/question-sets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-sets"] });
      toast({
        title: "Question Set Deleted",
        description: "The question set has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Question Set",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onCreateQuestionSet = (data: z.infer<typeof questionSetFormSchema>) => {
    createQuestionSetMutation.mutate(data);
  };

  const onUpdateQuestionSet = (data: z.infer<typeof questionSetFormSchema>) => {
    if (selectedQuestionSet) {
      updateQuestionSetMutation.mutate({ ...data, id: selectedQuestionSet.id });
    }
  };

  const handleEditQuestionSet = (questionSet: QuestionSet) => {
    setSelectedQuestionSet(questionSet);
    
    // Pre-fill the form with question set data
    // Convert date fields to appropriate format for form inputs
    const formattedStartDate = questionSet.startDate 
      ? typeof questionSet.startDate === 'string' 
        ? new Date(questionSet.startDate).toISOString().split("T")[0] 
        : questionSet.startDate instanceof Date 
          ? questionSet.startDate.toISOString().split("T")[0]
          : undefined
      : undefined;
      
    const formattedEndDate = questionSet.endDate 
      ? typeof questionSet.endDate === 'string' 
        ? new Date(questionSet.endDate).toISOString().split("T")[0] 
        : questionSet.endDate instanceof Date 
          ? questionSet.endDate.toISOString().split("T")[0]
          : undefined
      : undefined;
    
    editForm.reset({
      name: questionSet.name,
      description: questionSet.description,
      active: questionSet.active,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      questionIds: questionSet.questionIds || [],
      targetTeams: questionSet.targetTeams || [],
      rotationStrategy: questionSet.rotationStrategy,
    });
    
    setIsEditDialogOpen(true);
  };

  const handleDeleteQuestionSet = (id: number) => {
    if (confirm("Are you sure you want to delete this question set? This action cannot be undone.")) {
      deleteQuestionSetMutation.mutate(id);
    }
  };

  // Helper function to format dates
  const formatDate = (dateValue: string | Date | null) => {
    if (!dateValue) return "No date set";
    
    try {
      // Convert any type of date to a Date object
      const dateObj = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return format(dateObj, "dd MMM yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Question Sets</h1>
            <p className="text-muted-foreground">
              Create and manage sets of questions for quizzes
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Question Set
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Question Set</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateQuestionSet)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Weekly Retail Quiz" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Questions about weekly retail knowledge and store operations" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              value={typeof field.value === 'string' ? field.value : field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              disabled={field.disabled}
                              ref={field.ref}
                              name={field.name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              value={typeof field.value === 'string' ? field.value : field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              disabled={field.disabled}
                              ref={field.ref}
                              name={field.name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={createForm.control}
                    name="rotationStrategy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rotation Strategy</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rotation strategy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="random">Random</SelectItem>
                            <SelectItem value="sequential">Sequential</SelectItem>
                            <SelectItem value="adaptive">Adaptive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Random: Questions chosen randomly from the set<br />
                          Sequential: Questions presented in order, doesn't repeat until all are shown<br />
                          Adaptive: Questions chosen based on user performance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="questionIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question IDs</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="1, 2, 3, 4, 5" 
                            value={Array.isArray(field.value) ? field.value.join(", ") : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter comma-separated IDs of questions to include in this set
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="targetTeams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Teams (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Kingsford Corkers, Pour Decisions" 
                            value={Array.isArray(field.value) ? field.value.join(", ") : field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter comma-separated team names, or leave empty for all teams
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="form-checkbox h-4 w-4"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Inactive question sets won't be shown to users
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createQuestionSetMutation.isPending}
                    >
                      {createQuestionSetMutation.isPending && <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />}
                      Create Question Set
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className="my-6" />

        {isLoadingQuestionSets ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : questionSets?.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Question Sets Found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Create your first question set to start organizing your quiz questions.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Question Set
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active Sets</TabsTrigger>
              <TabsTrigger value="all">All Sets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questionSets
                  ?.filter(set => set.active)
                  .map(questionSet => (
                    <QuestionSetCard
                      key={questionSet.id}
                      questionSet={questionSet}
                      onEdit={() => handleEditQuestionSet(questionSet)}
                      onDelete={() => handleDeleteQuestionSet(questionSet.id)}
                      formatDate={formatDate}
                    />
                  ))}
              </div>
              {questionSets?.filter(set => set.active).length === 0 && (
                <div className="text-center p-8 border rounded-lg bg-muted">
                  <h3 className="text-lg font-medium">No Active Question Sets</h3>
                  <p className="text-muted-foreground mt-2">
                    All your question sets are currently inactive.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questionSets?.map(questionSet => (
                  <QuestionSetCard
                    key={questionSet.id}
                    questionSet={questionSet}
                    onEdit={() => handleEditQuestionSet(questionSet)}
                    onDelete={() => handleDeleteQuestionSet(questionSet.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Question Set</DialogTitle>
          </DialogHeader>
          {selectedQuestionSet && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onUpdateQuestionSet)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Weekly Retail Quiz" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Questions about weekly retail knowledge and store operations" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={typeof field.value === 'string' ? field.value : field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={field.disabled}
                            ref={field.ref}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={typeof field.value === 'string' ? field.value : field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={field.disabled}
                            ref={field.ref}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="rotationStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rotation Strategy</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rotation strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="random">Random</SelectItem>
                          <SelectItem value="sequential">Sequential</SelectItem>
                          <SelectItem value="adaptive">Adaptive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Random: Questions chosen randomly from the set<br />
                        Sequential: Questions presented in order, doesn't repeat until all are shown<br />
                        Adaptive: Questions chosen based on user performance
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="questionIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question IDs</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="1, 2, 3, 4, 5" 
                          value={Array.isArray(field.value) ? field.value.join(", ") : field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter comma-separated IDs of questions to include in this set
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="targetTeams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Teams (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Kingsford Corkers, Pour Decisions" 
                          value={Array.isArray(field.value) ? field.value.join(", ") : field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter comma-separated team names, or leave empty for all teams
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="form-checkbox h-4 w-4"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Inactive question sets won't be shown to users
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateQuestionSetMutation.isPending}
                  >
                    {updateQuestionSetMutation.isPending && <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Question Set Card Component
function QuestionSetCard({
  questionSet,
  onEdit,
  onDelete,
  formatDate
}: {
  questionSet: QuestionSet;
  onEdit: () => void;
  onDelete: () => void;
  formatDate: (date: string | Date | null) => string;
}) {
  return (
    <Card className={questionSet.active ? "" : "opacity-60"}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{questionSet.name}</CardTitle>
            <CardDescription className="mt-1">
              {questionSet.active ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{questionSet.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground mr-1">From:</span>
            <span>{formatDate(questionSet.startDate)}</span>
          </div>
          
          {questionSet.endDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-1">To:</span>
              <span>{formatDate(questionSet.endDate)}</span>
            </div>
          )}
          
          <div className="flex items-center mt-2">
            <Badge variant="secondary">
              {questionSet.rotationStrategy.charAt(0).toUpperCase() + questionSet.rotationStrategy.slice(1)}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{questionSet.questionIds.length} questions</span>
            {questionSet.targetTeams && questionSet.targetTeams.length > 0 ? (
              <span>{questionSet.targetTeams.length} target teams</span>
            ) : (
              <span>All teams</span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}