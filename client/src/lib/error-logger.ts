import { apiRequest } from "./queryClient";

interface ErrorLog {
  message: string;
  timestamp: string;
  context?: string;
  stack?: string;
}

export async function logError(error: Error | string, context?: string) {
  const errorLog: ErrorLog = {
    message: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString(),
    context,
    stack: error instanceof Error ? error.stack : undefined
  };

  // Log to console for development
  console.error("Error logged:", errorLog);

  // Send to backend
  try {
    await apiRequest("/api/logs/error", {
      method: "POST",
      body: errorLog
    });
  } catch (e) {
    // Fallback console log if we can't reach the server
    console.error("Failed to log error to server:", e);
  }

  return errorLog;
}
