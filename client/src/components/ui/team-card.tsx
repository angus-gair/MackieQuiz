import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Define team types used by this component
type TeamStats = {
  teamName: string;
  totalScore: number;
  averageScore: number;
  completedQuizzes: number;
  members: number;
  weeklyCompletionPercentage: number;
};

// Map of team names to their SVG logo files
const TEAM_LOGOS: Record<string, string> = {
  "Pour Decisions": "/images/team-logos/pour_decisions.svg",
  "Sip Happy": "/images/team-logos/sip_happy.svg",
  "Grape Minds": "/images/team-logos/grape_minds.svg",
  "Kingsford Corkers": "/images/team-logos/kingsford_corkers.svg",
  // Fallback for other teams
  "default": "/images/team-logos/pour_decisions.svg",
};

interface TeamCardProps {
  team: TeamStats;
  index: number;
  isTopThree?: boolean;
}

export function TeamCard({ team, index, isTopThree = false }: TeamCardProps) {
  // Get the correct logo for this team
  const logoSrc = TEAM_LOGOS[team.teamName] || TEAM_LOGOS.default;
  
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
        {/* Left side - Team Logo */}
        <div className="w-1/3 bg-slate-100 flex items-center justify-center p-4">
          <img 
            src={logoSrc} 
            alt={`${team.teamName} logo`} 
            className="w-full h-auto"
          />
        </div>
        
        {/* Right side - Team Info */}
        <div className="w-2/3 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-primary">
              {team.teamName}
            </h3>
            
            {/* Ranking Trophy Icon */}
            {index < 3 && (
              <div className="h-6 w-6 text-muted-foreground">
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
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-500">Total Score</div>
              <div className="text-sm font-semibold text-primary">
                {team.totalScore}
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-500">Avg Score</div>
              <div className="text-sm font-semibold text-primary">
                {Math.round(team.averageScore)}
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-500">Members</div>
              <div className="text-sm font-semibold text-primary">
                {team.members}
              </div>
            </div>
            
            {/* Completion Rate - Highlighted */}
            <div className={cn("p-2 rounded", completionRateColor.split(" ")[0])}>
              <div className="text-xs text-gray-600 font-medium">Completion</div>
              <div className={cn("text-sm font-bold", completionRateColor.split(" ")[1])}>
                {Math.round(team.weeklyCompletionPercentage)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}