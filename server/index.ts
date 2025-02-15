import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function initializeDateSystem() {
  try {
    log('Initializing date dimension table...');
    await storage.initializeDimDate();
    log('Date dimension table initialized.');

    log('Updating week statuses...');
    await storage.updateWeekStatuses();
    log('Week statuses updated.');

    log('Archiving old questions...');
    await storage.archiveOldQuestions();
    log('Question archive complete.');

    // Set up weekly updates
    setInterval(async () => {
      try {
        await storage.updateWeekStatuses();
        await storage.archiveOldQuestions();
        log('Weekly update completed successfully');
      } catch (error) {
        console.error('Error during weekly update:', error);
      }
    }, 24 * 60 * 60 * 1000); // Check daily, but only update when week changes
  } catch (error) {
    console.error('Error initializing date system:', error);
    throw error;
  }
}

(async () => {
  try {
    // Initialize the date system before starting the server
    await initializeDateSystem();
    log('Date system initialized successfully');

    const server = registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client
    const PORT = 5000;
    const HOST = "0.0.0.0";
    server.listen(PORT, HOST, () => {
      log(`Server started successfully on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();