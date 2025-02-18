import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
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

(async () => {
  try {
    log('Starting server initialization...');
    log('Initializing Express routes...');
    const server = registerRoutes(app);
    log('Routes registered successfully');

    if (app.get("env") === "development") {
      log('Setting up Vite for development...');
      try {
        await setupVite(app, server);
        log('Vite setup completed successfully');
      } catch (error) {
        log(`Failed to setup Vite: ${error}`);
        throw error;
      }
    } else {
      log('Setting up static serving for production...');
      serveStatic(app);
      log('Static serving setup completed');
    }

    // Force port 5000 for development
    const HOST = process.env.HOST || "0.0.0.0";
    process.env.PORT = "5000"; // Explicitly set port 5000
    const PORT = parseInt(process.env.PORT, 10);

    log(`Starting server on port ${PORT}...`);
    server.listen(PORT, HOST)
      .once('listening', () => {
        log(`✨ Server started successfully on ${HOST}:${PORT}`);
      })
      .once('error', (error: any) => {
        if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
          log(`ERROR: Port ${PORT} is already in use. Please free up port ${PORT} and try again.`);
        } else {
          log(`ERROR: Failed to start server:`);
          log(error.stack || error.message || error);
        }
        process.exit(1);
      });

  } catch (error: any) {
    log(`FATAL: Server initialization failed:`);
    log(error.stack || error.message || error);
    process.exit(1);
  }
})();

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});