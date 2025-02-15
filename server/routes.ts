import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAnswerSchema, insertQuestionSchema } from "@shared/schema";
import { UAParser } from "ua-parser-js";

// In-memory cache settings storage
let globalCacheSettings = {
  extendedCaching: true,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retryOnReconnect: true,
};

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Cache settings routes
  app.get("/api/admin/cache-settings", (req, res) => {
    try {
      res.json({ settings: globalCacheSettings });
    } catch (error) {
      console.error('Error fetching cache settings:', error);
      res.status(500).json({ error: 'Failed to fetch cache settings' });
    }
  });

  app.post("/api/admin/cache-settings", (req, res) => {
    try {
      const newSettings = req.body.settings;
      if (!newSettings) {
        return res.status(400).json({ error: 'Missing settings in request body' });
      }

      // Update global cache settings
      globalCacheSettings = {
        ...globalCacheSettings,
        ...newSettings
      };

      res.json({ settings: globalCacheSettings });
    } catch (error) {
      console.error('Error updating cache settings:', error);
      res.status(500).json({ error: 'Failed to update cache settings' });
    }
  });

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

  // Updated achievements route
  app.get("/api/admin/achievements", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);

    try {
      // Get all achievements from all users using the storage interface
      const achievements = await Promise.all(
        (await storage.getUsers()).map(async user =>
          await storage.getUserAchievements(user.id)
        )
      );

      // Flatten the array and sort by earnedAt
      const allAchievements = achievements
        .flat()
        .sort((a, b) =>
          new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
        );

      res.json(allAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  });


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

  app.get("/api/achievements/latest", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Get the latest achievement for the user
    const achievements = await storage.getUserAchievements(req.user.id);
    // Return the most recent achievement if it exists
    const latestAchievement = achievements[0];
    res.json(latestAchievement || null);
  });

  const httpServer = createServer(app);
  return httpServer;
}