import { Achievement } from "@shared/schema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { Award } from "lucide-react";

interface AchievementNotificationProps {
  achievement?: Achievement;
}

export function AchievementNotification({ achievement }: AchievementNotificationProps) {
  const { toast } = useToast();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (achievement && !shown) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Show toast with achievement details
      toast({
        title: "Achievement Unlocked! 🏆",
        description: (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold">{achievement.name}</div>
              <div className="text-sm text-muted-foreground">{achievement.description}</div>
            </div>
          </div>
        ),
        duration: 5000,
      });

      setShown(true);
    }
  }, [achievement, shown, toast]);

  return null; // This is a utility component that only shows toasts
}
