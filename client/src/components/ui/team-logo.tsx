import { Coffee } from "lucide-react";

// Team logo mapping to PNG files
// The keys must match team names exactly (case-sensitive)
const TEAM_LOGOS: Record<string, string> = {
  "Sip Happens": "/images/sip_happends.PNG",
  "Kingsford Corkers": "/images/kingsford_corkers.png",
  "Grape Minds": "/images/grape_minds.PNG",
  "Pour Decisions": "/images/pour_decisions.PNG",
};

// Fallback icon for teams without logos
const DefaultLogo = Coffee;

interface TeamLogoProps {
  teamName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TeamLogo({ teamName, size = "md", className = "" }: TeamLogoProps) {
  const logoPath = TEAM_LOGOS[teamName];
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  // If we have a logo path for this team, render the image
  if (logoPath) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-white border border-gray-200 ${className}`}>
        <img 
          src={logoPath} 
          alt={`${teamName} logo`} 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }
  
  // Fallback to an icon for teams without a logo
  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-stone-100 ${className}`}>
      <DefaultLogo className="w-1/2 h-1/2 text-stone-600" />
    </div>
  );
}