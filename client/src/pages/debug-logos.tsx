import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

export default function DebugLogosPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }

  // Define the team logos we want to test
  const logos = [
    { name: "Pour Decisions", path: "/images/pour_decisions.PNG" },
    { name: "Sip Happens", path: "/images/sip_happends.PNG" },
    { name: "Grape Minds", path: "/images/grape_minds.PNG" },
    { name: "Kingsford Corkers", path: "/images/kingsford_corkers.png" }
  ];

  // Additional test for SVG logos
  const svgLogos = [
    { name: "Pour Decisions (SVG)", path: "/images/team-logos/pour_decisions.svg" },
    { name: "Sip Happens (SVG)", path: "/images/team-logos/sip_happends.svg" },
    { name: "Grape Minds (SVG)", path: "/images/team-logos/grape_minds.svg" },
    { name: "Kingsford Corkers (SVG)", path: "/images/team-logos/kingsford_corkers.svg" }
  ];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Team Logo Debug Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Team Logos from /images/ directory (PNG format)</h2>
        <div className="grid grid-cols-2 gap-4">
          {logos.map((logo) => (
            <Card key={logo.name} className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-2">{logo.name}</h3>
                <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-center">
                  <img 
                    src={logo.path} 
                    alt={`${logo.name} logo`} 
                    className="h-24 w-24 object-contain"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Path: {logo.path}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Team Logos as SVG (for comparison)</h2>
        <div className="grid grid-cols-2 gap-4">
          {svgLogos.map((logo) => (
            <Card key={logo.name} className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-2">{logo.name}</h3>
                <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-center">
                  <img 
                    src={logo.path} 
                    alt={`${logo.name} logo`} 
                    className="h-24 w-24 object-contain"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Path: {logo.path}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Direct embedded SVG (test)</h2>
        <div className="bg-slate-100 p-4 rounded-lg w-48 h-48">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="w-full h-full">
            <circle cx="120" cy="120" r="110" fill="#0D4C92"/>
            <path d="M65 90 L120 65 L175 90 V140 C175 165 150 180 120 180 C90 180 65 165 65 140 V90Z" fill="#FFFFFF"/>
            <path d="M85 100 L120 80 L155 100 V135 C155 155 140 165 120 165 C100 165 85 155 85 135 V100Z" fill="#0D4C92"/>
            <circle cx="120" cy="120" r="110" stroke="#FFFFFF" strokeWidth="4"/>  
          </svg>
        </div>
      </div>
    </div>
  );
}