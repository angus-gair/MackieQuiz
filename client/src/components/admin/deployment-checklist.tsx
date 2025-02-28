import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, Save, PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes: string;
}

interface DeploymentSession {
  id: string;
  date: string;
  name: string;
  items: ChecklistItem[];
  completed: boolean;
}

export function DeploymentChecklist() {
  const { toast } = useToast();
  const [deploymentSessions, setDeploymentSessions] = useState<DeploymentSession[]>([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  
  // Load saved deployment sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("deploymentChecklist");
    if (savedSessions) {
      try {
        setDeploymentSessions(JSON.parse(savedSessions));
      } catch (error) {
        console.error("Failed to parse saved deployment sessions", error);
      }
    }
  }, []);

  // Save deployment sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("deploymentChecklist", JSON.stringify(deploymentSessions));
  }, [deploymentSessions]);

  // Create a new deployment session
  const createNewSession = () => {
    if (!newSessionName.trim()) {
      toast({
        title: "Session name required",
        description: "Please enter a name for the deployment session.",
        variant: "destructive",
      });
      return;
    }

    const newSession: DeploymentSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: newSessionName,
      items: [
        { id: "1", text: "Register as a new user", completed: false, notes: "" },
        { id: "2", text: "Get assigned to a team", completed: false, notes: "" },
        { id: "3", text: "Complete this week's quiz questions", completed: false, notes: "" },
        { id: "4", text: "Check the leaderboard", completed: false, notes: "" },
        { id: "5", text: "View profile and achievements", completed: false, notes: "" },
      ],
      completed: false,
    };

    setDeploymentSessions([...deploymentSessions, newSession]);
    setNewSessionName("");
    setEditingSessionId(newSession.id);

    toast({
      title: "Session created",
      description: "New deployment checklist session created successfully.",
    });
  };

  // Add a new checklist item to the current editing session
  const addChecklistItem = () => {
    if (!editingSessionId) return;
    if (!newItemText.trim()) {
      toast({
        title: "Item text required",
        description: "Please enter some text for the checklist item.",
        variant: "destructive",
      });
      return;
    }

    setDeploymentSessions(
      deploymentSessions.map((session) => {
        if (session.id === editingSessionId) {
          return {
            ...session,
            items: [
              ...session.items,
              {
                id: Date.now().toString(),
                text: newItemText,
                completed: false,
                notes: "",
              },
            ],
          };
        }
        return session;
      })
    );

    setNewItemText("");
  };

  // Toggle completion state of a checklist item
  const toggleItemCompleted = (sessionId: string, itemId: string) => {
    setDeploymentSessions(
      deploymentSessions.map((session) => {
        if (session.id === sessionId) {
          const updatedItems = session.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, completed: !item.completed };
            }
            return item;
          });
          
          // Check if all items are completed
          const allCompleted = updatedItems.every(item => item.completed);
          
          return {
            ...session,
            items: updatedItems,
            completed: allCompleted
          };
        }
        return session;
      })
    );
  };

  // Update notes for a checklist item
  const updateItemNotes = (sessionId: string, itemId: string, notes: string) => {
    setDeploymentSessions(
      deploymentSessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            items: session.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, notes };
              }
              return item;
            }),
          };
        }
        return session;
      })
    );
  };

  // Remove a checklist item
  const removeChecklistItem = (sessionId: string, itemId: string) => {
    setDeploymentSessions(
      deploymentSessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            items: session.items.filter((item) => item.id !== itemId),
          };
        }
        return session;
      })
    );
  };

  // Remove a deployment session
  const removeSession = (sessionId: string) => {
    setDeploymentSessions(
      deploymentSessions.filter((session) => session.id !== sessionId)
    );
    
    if (editingSessionId === sessionId) {
      setEditingSessionId(null);
    }

    toast({
      title: "Session removed",
      description: "Deployment checklist session removed successfully.",
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate completion percentage
  const calculateCompletion = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0;
    const completedCount = items.filter(item => item.completed).length;
    return Math.round((completedCount / items.length) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> 
            Deployment Checklist
          </CardTitle>
          <CardDescription>
            Verify each aspect of the application after deployment by walking through as a user would experience it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Create new deployment session */}
          <div className="flex items-center gap-3 mb-6">
            <Input
              placeholder="Enter deployment session name..."
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createNewSession}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>

          {/* List of deployment sessions */}
          <Accordion
            type="single" 
            collapsible
            value={editingSessionId || undefined}
            onValueChange={(value) => setEditingSessionId(value)}
          >
            {deploymentSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deployment sessions yet. Create one to get started.
              </div>
            ) : (
              deploymentSessions.map((session) => (
                <AccordionItem key={session.id} value={session.id}>
                  <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-md">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-2">
                        <span>{session.name}</span>
                        <Badge variant={session.completed ? "default" : "secondary"} className="ml-2">
                          {calculateCompletion(session.items)}% Complete
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDate(session.date)}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2">
                    <div className="space-y-4">
                      {/* Checklist items */}
                      {session.items.map((item) => (
                        <div key={item.id} className="border rounded-md p-3 bg-card">
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              id={`item-${session.id}-${item.id}`}
                              checked={item.completed}
                              onCheckedChange={() => toggleItemCompleted(session.id, item.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <Label 
                                htmlFor={`item-${session.id}-${item.id}`}
                                className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {item.text}
                              </Label>
                              <Textarea
                                placeholder="Add notes or issues found..."
                                value={item.notes}
                                onChange={(e) => updateItemNotes(session.id, item.id, e.target.value)}
                                className="h-20 text-sm"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeChecklistItem(session.id, item.id)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add new checklist item */}
                      <div className="flex items-center gap-3 mt-4">
                        <Input
                          placeholder="Add new checklist item..."
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={addChecklistItem}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>

                      {/* Session actions */}
                      <div className="flex justify-between mt-4 pt-2 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Session
                        </Button>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}