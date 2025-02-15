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

    // Find an available port starting from the default
    let port = parseInt(process.env.PORT || "5000");
    const maxAttempts = 10;
    const HOST = "0.0.0.0";

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        log(`Attempting to start server on ${HOST}:${port} (attempt ${attempt + 1}/${maxAttempts})...`);
        await new Promise<void>((resolve, reject) => {
          server.listen(port, HOST)
            .once('listening', () => {
              log(`Server started successfully on ${HOST}:${port}`);
              resolve();
            })
            .once('error', (error: any) => {
              if (error.code === 'EADDRINUSE') {
                log(`Port ${port} is in use, trying next port...`);
                port++;
                reject(new Error('Port in use'));
              } else {
                log(`Error starting server: ${error}`);
                reject(error);
              }
            });
        });
        break; // If we get here, the server started successfully
      } catch (error: any) {
        if (error.message === 'Port in use' && attempt < maxAttempts - 1) {
          continue; // Try next port
        }
        log(`Failed to start server: ${error}`);
        throw error;
      }
    }
  } catch (error) {
    log(`Server initialization failed: ${error}`);
    process.exit(1);
  }
})();