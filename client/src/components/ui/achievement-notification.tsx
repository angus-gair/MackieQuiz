import { Achievement } from "@shared/schema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AchievementNotificationProps {
  achievement?: Achievement;
}

export function AchievementNotification({ achievement }: AchievementNotificationProps) {
  const { toast } = useToast();
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (achievement && !shown) {
      // Show achievement modal
      setOpen(true);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Also show toast notification
      toast({
        title: "Achievement Unlocked! 🏆",
        description: achievement.name,
        duration: 5000,
      });

      setShown(true);
    }
  }, [achievement, shown, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Achievement Unlocked! 🏆</DialogTitle>
        </DialogHeader>
        {achievement && (
          <div className="flex flex-col items-center space-y-4 p-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Award className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-2">{achievement.name}</h3>
              <p className="text-muted-foreground">{achievement.description}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}