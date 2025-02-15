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

(async () => {
  try {
    log('Starting server initialization...');
    log('Initializing Express routes...');
    const server = registerRoutes(app);
    log('Routes registered successfully');

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

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

    // Try different ports if the default is busy
    const ports = [5000, 5001, 3000, 3001];
    const HOST = "0.0.0.0";
    let server_started = false;

    for (const PORT of ports) {
      try {
        log(`Attempting to start server on ${HOST}:${PORT}...`);
        await new Promise<void>((resolve, reject) => {
          server.listen(PORT, HOST, () => {
            log(`Server started successfully on ${HOST}:${PORT}`);
            server_started = true;
            resolve();
          }).on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
              log(`Port ${PORT} is already in use, trying next port...`);
              resolve(); // Continue to next port
            } else {
              reject(error);
            }
          });
        });

        if (server_started) break;
      } catch (error: any) {
        log(`Error starting server on port ${PORT}: ${error.message}`);
        if (PORT === ports[ports.length - 1]) {
          throw new Error('All ports are busy, cannot start server');
        }
      }
    }

  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();