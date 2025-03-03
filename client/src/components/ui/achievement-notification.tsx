import { Achievement } from "@shared/schema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { Award, Star, Trophy, Medal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

      // Only trigger small confetti for perfect score (main confetti comes from the quiz page)
      if (achievement.type === 'perfect_score') {
        // Simple confetti for perfect score
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Show toast notification for any achievement with different styles based on tier
      let toastVariant: "default" | "destructive" = "default";
      let toastStyle = {};
      
      if (achievement.tier) {
        switch (achievement.tier.toLowerCase()) {
          case 'gold':
            toastStyle = { 
              backgroundColor: '#FFC107', 
              color: '#212121',
              border: '1px solid #FFD54F'
            };
            break;
          case 'silver':
            toastStyle = { 
              backgroundColor: '#B0BEC5', 
              color: '#263238',
              border: '1px solid #CFD8DC'
            };
            break;
          case 'bronze':
            toastStyle = { 
              backgroundColor: '#8D6E63', 
              color: '#EFEBE9',
              border: '1px solid #A1887F'
            };
            break;
        }
      }
      
      toast({
        title: "Achievement Unlocked! 🏆",
        description: achievement.name,
        duration: 5000,
        variant: toastVariant,
        style: toastStyle
      });

      setShown(true);
    }
  }, [achievement, shown, toast]);

  // Choose the appropriate icon based on achievement type
  const getAchievementIcon = () => {
    if (!achievement) return <Award className="w-12 h-12 text-primary" />;
    
    switch (achievement.type) {
      case 'quiz_milestone':
        return <Medal className={`w-12 h-12 ${getTierTextColor()}`} />;
      case 'perfect_score':
        return <Star className="w-12 h-12 text-yellow-500" />;
      default:
        return <Trophy className="w-12 h-12 text-primary" />;
    }
  };
  
  // Get the appropriate background color based on tier
  const getTierBackgroundColor = () => {
    if (!achievement?.tier) return "bg-primary/10";
    
    switch (achievement.tier.toLowerCase()) {
      case 'gold':
        return "bg-yellow-100";
      case 'silver':
        return "bg-gray-200";
      case 'bronze':
        return "bg-amber-100";
      default:
        return "bg-primary/10";
    }
  };
  
  // Get the appropriate text color based on tier
  const getTierTextColor = () => {
    if (!achievement?.tier) return "text-primary";
    
    switch (achievement.tier.toLowerCase()) {
      case 'gold':
        return "text-yellow-600";
      case 'silver':
        return "text-gray-500";
      case 'bronze':
        return "text-amber-700";
      default:
        return "text-primary";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Achievement Unlocked! 🏆</DialogTitle>
        </DialogHeader>
        {achievement && (
          <div className="flex flex-col items-center space-y-4 p-6">
            <div className={`w-24 h-24 ${getTierBackgroundColor()} rounded-full flex items-center justify-center`}>
              {getAchievementIcon()}
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl mb-2">{achievement.name}</h3>
              
              {/* Display tier badge if applicable */}
              {achievement.tier && (
                <Badge variant="outline" className={`mb-3 ${getTierTextColor()}`}>
                  {achievement.tier} Tier
                </Badge>
              )}
              
              <p className="text-muted-foreground">{achievement.description}</p>
              {achievement.type === 'quiz_milestone' && (
                <p className="text-sm text-primary font-medium mt-2">
                  Milestone: Quiz #{achievement.milestone}
                </p>
              )}
              {achievement.type === 'perfect_score' && (
                <p className="text-sm text-yellow-600 font-medium mt-2">
                  Perfect Score! 🌟
                </p>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button 
            onClick={() => setOpen(false)} 
            className="w-full"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}