import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAnswerSchema, insertQuestionSchema } from "@shared/schema";
import { UAParser } from "ua-parser-js";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Middleware to capture analytics for all routes
  app.use(async (req, res, next) => {
    const startTime = Date.now();
    const ua = new UAParser(req.headers["user-agent"]);

    // Create or update session
    if (req.isAuthenticated()) {
      const session = await storage.createUserSession({
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "",
        device: ua.getDevice().type || "desktop",
        browser: ua.getBrowser().name || "unknown",
        referrer: req.headers.referer || null,
      });

      // Store session ID for page view tracking
      req.analyticsSessionId = session.id;
    }

    // Continue with request
    res.on("finish", async () => {
      if (req.analyticsSessionId) {
        const timeSpent = Date.now() - startTime;

        // Record page view
        await storage.recordPageView({
          sessionId: req.analyticsSessionId,
          userId: req.user.id,
          path: req.path,
          timeSpent,
          isError: res.statusCode >= 400,
        });

        // Update session end time and exit page
        await storage.updateUserSession(
          req.analyticsSessionId,
          new Date(),
          req.path
        );
      }
    });

    next();
  });

  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const users = await storage.getUsers();
    res.json(users);
  });

  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const result = await storage.updateUser(id, req.body);
    res.json(result);
  });

  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.deleteUser(id);
    res.sendStatus(200);
  });

  app.get("/api/questions/weekly", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const questions = await storage.getWeeklyQuestions();
    res.json(questions);
  });

  app.get("/api/questions", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      console.log("Questions API: Unauthorized access attempt");
      return res.sendStatus(401);
    }
    try {
      const questions = await storage.getQuestions();
      console.log(`Questions API: Retrieved ${questions.length} questions`);
      res.json(questions);
    } catch (error) {
      console.error("Questions API Error:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.post("/api/questions", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);

    const question = insertQuestionSchema.parse(req.body);
    const result = await storage.createQuestion(question);
    res.json(result);
  });

  app.delete("/api/questions/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);

    const id = parseInt(req.params.id);
    await storage.deleteQuestion(id);
    res.sendStatus(200);
  });

  app.get("/api/questions/weekly/:date", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const weekOf = new Date(req.params.date);
    const questions = await storage.getQuestionsByWeek(weekOf);
    res.json(questions);
  });

  app.get("/api/questions/weeks", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const weeks = await storage.getActiveWeeks();
    res.json(weeks);
  });

  app.get("/api/questions/archived", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const questions = await storage.getArchivedQuestions();
    res.json(questions);
  });

  app.post("/api/questions/:id/archive", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.archiveQuestion(id);
    res.sendStatus(200);
  });

  app.patch("/api/questions/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const result = await storage.updateQuestion(id, req.body);
      res.json(result);
    } catch (error) {
      console.error("Question Update Error:", error);
      res.status(500).json({ error: "Failed to update question" });
    }
  });

  app.post("/api/answers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const answer = insertAnswerSchema.parse({
      ...req.body,
      userId: req.user.id
    });

    const result = await storage.submitAnswer(answer);
    res.json(result);
  });

  app.get("/api/answers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const answers = await storage.getUserAnswers(req.user.id);
    res.json(answers);
  });

  app.get("/api/leaderboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  app.get("/api/analytics/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const stats = await storage.getTeamStats();
    res.json(stats);
  });

  app.get("/api/analytics/daily", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const stats = await storage.getDailyStats();
    res.json(stats);
  });

  app.get("/api/analytics/team-knowledge", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const stats = await storage.getTeamKnowledge();
    res.json(stats);
  });

  app.post("/api/assign-team", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { team } = req.body;
    if (!team) return res.sendStatus(400);

    const result = await storage.assignTeam(req.user.id, team);
    res.json(result);
  });

  // New analytics routes
  app.get("/api/analytics/sessions", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const stats = await storage.getSessionAnalytics();
    res.json(stats);
  });

  app.get("/api/analytics/pageviews", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const stats = await storage.getPageViewAnalytics();
    res.json(stats);
  });

  app.get("/api/analytics/auth", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const stats = await storage.getAuthEventAnalytics();
    res.json(stats);
  });

  const httpServer = createServer(app);
  return httpServer;
}