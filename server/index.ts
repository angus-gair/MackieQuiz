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

    // Use the environment-provided port
    const HOST = "0.0.0.0";
    const port = parseInt(process.env.PORT || "3000"); // Changed default port to 3000

    log(`Configuration: HOST=${HOST}, PORT=${port}, ENV=${app.get("env")}`);

    // Check if port is already in use before attempting to bind
    const net = require('net');
    const testServer = net.createServer()
      .once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          log(`ERROR: Port ${port} is already in use`);
          process.exit(1);
        }
        log(`ERROR: Unexpected error checking port availability: ${err.message}`);
        process.exit(1);
      })
      .once('listening', () => {
        testServer.close();
        // Port is available, start the actual server
        server.listen(port, HOST)
          .once('listening', () => {
            log(`Server started successfully on ${HOST}:${port}`);
          })
          .once('error', (error: any) => {
            log(`ERROR: Failed to start server:`);
            log(error.stack || error.message || error);
            process.exit(1);
          });
      })
      .listen(port, HOST);

  } catch (error: any) {
    log(`FATAL: Server initialization failed:`);
    log(error.stack || error.message || error);
    process.exit(1);
  }
})();

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});