import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TeamLogo } from "@/components/ui/team-logo";

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
        {/* Left side - Team Logo (reduced by 30%) */}
        <div className="w-1/4 bg-slate-50 flex items-center justify-center p-3">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt={`${team.teamName} logo`} 
              className="w-[70%] h-auto object-contain"
            />
          ) : (
            <div className="w-16 h-16">
              <TeamLogo teamName={team.teamName} size="lg" />
            </div>
          )}
        </div>
        
        {/* Right side - Team Info (expanded width) */}
        <div className="w-3/4 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-primary">
              {team.teamName}
            </h3>
            
            {/* Ranking Trophy Icon */}
            {index < 3 && (
              <div className="h-7 w-7 text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                  <path d="M8 21V15M16 8V21M12 21V12M4 3H20V7C20 7 17 10 12 10C7 10 4 7 4 7V3Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={
                      index === 0 ? "text-yellow-500" : 
                      index === 1 ? "text-gray-400" : 
                      "text-amber-600"
                    }
                  />
                </svg>
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