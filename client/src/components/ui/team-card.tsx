import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TeamLogo } from "@/components/ui/team-logo";
import { Trophy, Medal, Award } from "lucide-react";

// Define team types used by this component
type TeamStats = {
  teamName: string;
  totalScore: number;
  averageScore: number;
  completedQuizzes: number;
  members: number;
  weeklyCompletionPercentage: number;
};

// Map of team names to their PNG logo files
const TEAM_LOGOS: Record<string, string> = {
  "Pour Decisions": "/images/pour_decisions.PNG",
  "Sip Happens": "/images/sip_happends.PNG",
  "Grape Minds": "/images/grape_minds.PNG",
  "Kingsford Corkers": "/images/kingsford_corkers.png",
};

interface TeamCardProps {
  team: TeamStats;
  index: number;
  isTopThree?: boolean;
}

export function TeamCard({ team, index, isTopThree = false }: TeamCardProps) {
  // Get the correct logo for this team
  const logoSrc = TEAM_LOGOS[team.teamName];
  
  // Determine completion rate styling
  const completionRateColor = 
    team.weeklyCompletionPercentage >= 80 ? "bg-green-50 text-green-600" :
    team.weeklyCompletionPercentage >= 50 ? "bg-yellow-50 text-amber-500" :
    "bg-red-50 text-red-500";
  
  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-md transition-all duration-200",
        isTopThree ? "border-primary/20" : "border-gray-200"
      )}
    >
      <CardContent className="p-0 flex">
        {/* Left side - Team Logo (larger size) */}
        <div className="w-[30%] bg-slate-100 flex items-center justify-center pt-16 pb-6 px-3">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt={`${team.teamName} logo`} 
              className="w-full h-auto object-contain max-h-28"
            />
          ) : (
            <div className="w-20 h-20">
              <TeamLogo teamName={team.teamName} size="lg" />
            </div>
          )}
        </div>
        
        {/* Right side - Team Info (adjusted width) */}
        <div className="w-[70%] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-primary">
              {team.teamName}
            </h3>
            
            {/* Ranking Trophy Icon */}
            {index < 4 && (
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                index === 0 ? "bg-yellow-100" : 
                index === 1 ? "bg-gray-100" : 
                index === 2 ? "bg-amber-100" :
                "bg-slate-100"
              )}>
                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                {index === 2 && <Award className="h-5 w-5 text-amber-600" />}
                {index === 3 && <span className="text-xs font-semibold text-slate-500">4th</span>}
              </div>
            )}
          </div>
          
          {/* Stats Grid - Larger text and better spacing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-2.5 rounded">
              <div className="text-sm text-gray-500 font-medium">Total Score</div>
              <div className="text-base font-semibold text-primary">
                {team.totalScore}
              </div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded">
              <div className="text-sm text-gray-500 font-medium">Avg Score</div>
              <div className="text-base font-semibold text-primary">
                {Math.round(team.averageScore)}
              </div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded">
              <div className="text-sm text-gray-500 font-medium">Members</div>
              <div className="text-base font-semibold text-primary">
                {team.members}
              </div>
            </div>
            
            {/* Completion Rate - Highlighted */}
            <div className={cn("p-2.5 rounded", completionRateColor.split(" ")[0])}>
              <div className="text-sm text-gray-600 font-medium">Completion</div>
              <div className={cn("text-base font-bold", completionRateColor.split(" ")[1])}>
                {Math.round(team.weeklyCompletionPercentage)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}