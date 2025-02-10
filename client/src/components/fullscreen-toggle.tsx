import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

export function FullscreenToggle() {
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Check if we've already shown the full-screen prompt in this session
    const hasShownPrompt = sessionStorage.getItem("hasShownFullscreenPrompt");
    if (hasShownPrompt) {
      setHasTriggered(true);
    }
  }, []);

  const goFullScreen = () => {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) { // Firefox
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).webkitRequestFullscreen) { // Chrome, Safari, Opera
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) { // IE/Edge
      (elem as any).msRequestFullscreen();
    }

    setHasTriggered(true);
    sessionStorage.setItem("hasShownFullscreenPrompt", "true");
  };

  if (hasTriggered) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      onClick={goFullScreen}
    >
      <Maximize2 className="h-5 w-5" />
      <span className="sr-only">Enter Fullscreen</span>
    </Button>
  );
}
