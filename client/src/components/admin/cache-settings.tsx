import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useCacheSettings } from "@/hooks/use-cache-settings";
import { Loader2 } from "lucide-react";

export function CacheSettings() {
  const { settings, isLoading, toggleExtendedCaching } = useCacheSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Settings</CardTitle>
        <CardDescription>
          Control application-wide caching behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium">Extended Caching</h4>
            <p className="text-sm text-muted-foreground">
              {settings.extendedCaching
                ? "Using extended cache (5-10 minutes)"
                : "Using minimal cache (1-2 minutes)"}
            </p>
          </div>
          <Switch
            checked={settings.extendedCaching}
            onCheckedChange={toggleExtendedCaching}
          />
        </div>
      </CardContent>
    </Card>
  );
}
