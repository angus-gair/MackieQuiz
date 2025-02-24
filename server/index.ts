import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { createServer } from "http";
import net from "net";

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
    const server = createServer(app);
    registerRoutes(app);
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

    const HOST = process.env.HOST || "0.0.0.0";
    const PORT = 5000; // Always use port 5000 as required

    // Set up detailed error handler for port conflicts
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        log('==== Port Conflict Error Details ====');
        log(`ERROR: Port ${PORT} is already in use`);
        log(`Error Code: ${error.code}`);
        log(`Error Message: ${error.message}`);
        log(`Error Stack: ${error.stack}`);
        log('\nTroubleshooting Steps:');
        log('1. Stop any other running instances of the application');
        log('2. Wait a few seconds for the port to be released');
        log('3. Restart the application');
        log('4. If the issue persists, contact system administrator');
        log('====================================');
        process.exit(1);
      } else {
        log('==== Server Error Details ====');
        log(`Error Code: ${error.code}`);
        log(`Error Message: ${error.message}`);
        log(`Error Stack: ${error.stack}`);
        log('============================');
        throw error;
      }
    });

    // Start server on port 5000
    log(`Attempting to start server on ${HOST}:${PORT}...`);
    server.listen(PORT, HOST, () => {
      log(`✨ Server started successfully on ${HOST}:${PORT}`);
    });

    // Set up cleanup handler
    const cleanup = () => {
      log('Shutting down server...');
      server.close(() => {
        log('Server closed successfully');
        process.exit(0);
      });

      // Force exit after 5 seconds if graceful shutdown fails
      setTimeout(() => {
        log('Forcing exit after timeout');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

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