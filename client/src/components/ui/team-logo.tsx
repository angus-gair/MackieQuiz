import { Wine, Coffee, Sun, Droplet } from "lucide-react";
import { FaWineGlassAlt, FaBeer, FaCoffee, FaWater } from "react-icons/fa";

// These team names are case-sensitive for exact matching
const TEAM_LOGOS: Record<string, any> = {
  "Sip Happy": { icon: FaWineGlassAlt, color: "text-red-600", bgColor: "bg-red-100" },
  "Kingsford Corkers": { icon: FaBeer, color: "text-amber-600", bgColor: "bg-amber-100" },
  "Grape Minds": { icon: Wine, color: "text-purple-600", bgColor: "bg-purple-100" },
  "Pour Decisions": { icon: FaWater, color: "text-blue-600", bgColor: "bg-blue-100" },
  // Fallback for other teams
  "default": { icon: Coffee, color: "text-stone-600", bgColor: "bg-stone-100" },
};

interface TeamLogoProps {
  teamName: string;
  size?: "sm" | "md" | "lg";
}

export function TeamLogo({ teamName, size = "md" }: TeamLogoProps) {
  const logoConfig = TEAM_LOGOS[teamName] || TEAM_LOGOS.default;
  const LogoIcon = logoConfig.icon;
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6"
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${logoConfig.bgColor}`}>
      <LogoIcon className={`${iconSizes[size]} ${logoConfig.color}`} />
    </div>
  );
}