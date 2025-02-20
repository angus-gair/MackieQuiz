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

// Function to check if a port is available
const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        resolve(false);
      })
      .once('listening', () => {
        server.close();
        resolve(true);
      })
      .listen(port);
  });
};

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
    const PORT = Number(process.env.PORT) || 5000; // Changed default to 5000

    log(`Environment PORT value: ${process.env.PORT}`);
    log(`Using PORT: ${PORT}`);

    // Check if port is available
    const portAvailable = await isPortAvailable(PORT);
    if (!portAvailable) {
      log(`Port ${PORT} is already in use. Attempting to force close...`);
      process.exit(1); // This will trigger a restart by Replit
    }

    // Set up cleanup handler
    const cleanup = () => {
      log('Shutting down server...');
      server.close(() => {
        log('Server closed successfully');
        process.exit(0);
      });
    };

    // Handle process termination
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

    // Add more detailed logging for port binding
    log(`Attempting to start server on ${HOST}:${PORT}...`);

    server.listen(PORT, HOST, () => {
      log(`✨ Server started successfully on ${HOST}:${PORT}`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        log(`❌ Port ${PORT} is already in use`);
      } else {
        log(`❌ Server error: ${error.message}`);
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