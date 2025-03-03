import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAnswerSchema, insertQuestionSchema } from "@shared/schema";
import { UAParser } from "ua-parser-js";
import { sendFeedbackNotification } from "./utils/email";
import type { User } from "@shared/schema";

// Extend Express Request type with proper typing
declare global {
  namespace Express {
    interface Request {
      analyticsSessionId?: number;
      user?: User;
    }
  }
}

// In-memory cache settings storage
const globalCacheSettings = {
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      res.json({ settings: globalCacheSettings });
    } catch (error) {
      console.error('Error fetching cache settings:', error);
      res.status(500).json({ error: 'Failed to fetch cache settings' });
    }
  });

  app.post("/api/admin/cache-settings", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const newSettings = req.body.settings;
      if (!newSettings) {
        return res.status(400).json({ error: 'Missing settings in request body' });
      }

      // Update global cache settings
      Object.assign(globalCacheSettings, newSettings);

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
    if (req.isAuthenticated() && req.user) {
      const session = await storage.createUserSession({
        userId: req.user.id,
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        device: ua.getDevice().type || "desktop",
        browser: ua.getBrowser().name || "unknown",
        referrer: req.headers.referer || null,
      });

      // Store session ID for page view tracking
      req.analyticsSessionId = session.id;
    }

    // Continue with request
    res.on("finish", async () => {
      if (req.analyticsSessionId && req.user) {
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
    try {
      // Archive past weeks' questions first
      await storage.archivePastWeeks();
      // Then get current week's questions
      const questions = await storage.getCurrentWeekQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching weekly questions:", error);
      res.status(500).json({ error: "Failed to fetch weekly questions" });
    }
  });

  app.post("/api/questions/archive-past-weeks", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      console.log("Archive past weeks: Unauthorized access attempt");
      return res.sendStatus(401);
    }

    try {
      await storage.archivePastWeeks();
      console.log("Successfully archived past weeks' questions");
      res.sendStatus(200);
    } catch (error) {
      console.error("Error archiving past weeks:", error);
      res.status(500).json({ error: "Failed to archive past weeks" });
    }
  });

  app.get("/api/questions", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      console.log("Questions API: Unauthorized access attempt");
      return res.sendStatus(401);
    }
    try {
      // First archive past weeks' questions
      await storage.archivePastWeeks();

      // Then get current questions
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

  // General weekly question endpoint for users
  app.get("/api/questions/weekly", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get current week's questions for the user
      const questions = await storage.getCurrentWeekQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching current week questions:", error);
      res.status(500).json({ error: "Failed to fetch this week's questions" });
    }
  });

  // Admin endpoint for getting questions for a specific week
  app.get("/api/questions/weekly/:date", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    try {
      const weekOf = new Date(req.params.date);
      const questions = await storage.getQuestionsByWeek(weekOf);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions for week:", error);
      res.status(500).json({ error: "Failed to fetch questions for week" });
    }
  });

  app.get("/api/questions/weeks", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    try {
      const weeks = await storage.getActiveWeeks();
      res.json(weeks);
    } catch (error) {
      console.error("Error fetching weeks:", error);
      res.status(500).json({ error: "Failed to fetch weeks" });
    }
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

      // Validate the update data
      const result = await storage.updateQuestion(id, {
        ...req.body,
        updatedAt: new Date()
      });

      console.log(`Question ${id} updated successfully:`, result);
      res.json(result);
    } catch (error) {
      console.error("Question Update Error:", error);
      res.status(500).json({
        error: "Failed to update question",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/answers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Parse and validate answer data
      const answer = insertAnswerSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Submit the answer
      const result = await storage.submitAnswer(answer);
      
      // Check for any earned achievements after submitting answer
      // We need to check the number of answers to determine if a quiz was completed
      const userAnswers = await storage.getUserAnswers(req.user.id);
      
      // If the user just completed a quiz (answers count is divisible by 3)
      if (userAnswers.length % 3 === 0) {
        // Check for achievements that should be awarded
        const achievements = await storage.checkAndAwardAchievements(req.user.id);
        
        // Log how many achievements were earned
        if (achievements.length > 0) {
          console.log(`User ${req.user.id} earned ${achievements.length} achievements: ${achievements.map(a => a.name).join(', ')}`);
        }
        
        // Add achievement information to the response
        return res.json({
          answer: result,
          achievements: achievements,
          quizCompleted: true
        });
      }
      
      // Return just the answer if quiz is not completed
      res.json({
        answer: result,
        quizCompleted: false
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ 
        error: "Failed to submit answer",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
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

  app.get("/api/achievements", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const achievements = await storage.getUserAchievements(req.user.id);
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  });

  app.get("/api/users/profiles", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Get all users first to get their IDs
      const users = await storage.getUsers();
      // Fetch profiles for all users
      const profiles = await Promise.all(
        users.map(async (user) => {
          return await storage.getOrCreateUserProfile(user.id);
        })
      );

      res.json(profiles);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      res.status(500).json({ error: 'Failed to fetch user profiles' });
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
    // Add test location data
    const stats = {
      totalLogins: 450,
      failedLogins: 23,
      locationBreakdown: [
        { country: "United States", count: 150 },
        { country: "United Kingdom", count: 89 },
        { country: "Australia", count: 76 },
        { country: "Canada", count: 45 },
        { country: "Germany", count: 35 },
        { country: "France", count: 28 },
        { country: "Japan", count: 20 }
      ],
      failureReasons: [
        { reason: "Invalid Password", count: 15 },
        { reason: "Account Locked", count: 5 },
        { reason: "Invalid Username", count: 3 }
      ]
    };
    res.json(stats);
  });

  app.get("/api/achievements/latest", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Get achievements for the user that were earned in the last minute
    // This ensures we only show achievements earned in the current session
    const achievements = await storage.getUserAchievements(req.user.id);
    
    // Filter for only recent achievements (earned in the last minute)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    
    // Add extra debug info for troubleshooting
    console.log(`[Achievement Latest] User ${req.user.id} has ${achievements.length} total achievements.`);
    console.log(`[Achievement Latest] Checking for achievements newer than ${fiveMinutesAgo.toISOString()}`);
    
    const recentAchievements = achievements.filter(achievement => {
      const earnedAt = new Date(achievement.earnedAt);
      const isRecent = earnedAt > fiveMinutesAgo;
      console.log(`[Achievement Filter] ${achievement.name} earned at ${earnedAt.toISOString()} - is recent: ${isRecent}`);
      return isRecent;
    });
    
    console.log(`[Achievement Latest] Found ${recentAchievements.length} recent achievements.`);
    if (recentAchievements.length > 0) {
      console.log(`[Achievement Latest] Types: ${recentAchievements.map(a => a.type).join(', ')}`);
    }
    
    // Instead of returning just one achievement, return all recent ones
    // This allows us to handle multiple achievements earned at once
    res.json(recentAchievements);
  });
  
  // New endpoint to get all achievements for a user
  app.get("/api/achievements/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const achievements = await storage.getUserAchievements(req.user.id);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  // New endpoint to reset quiz data for new users
  app.post("/api/user/reset-progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Reset the user's weekly score and quizzes
      await storage.updateUser(req.user.id, {
        weeklyScore: 0,
        weeklyQuizzes: 0
      });
      
      res.sendStatus(200);
    } catch (error) {
      console.error("Error resetting user progress:", error);
      res.status(500).json({ error: "Failed to reset user progress" });
    }
  });

  app.get("/api/analytics/navigation", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    // Add test data
    const stats = {
      externalReferrers: [
        { source: "Google", count: 150 },
        { source: "Direct", count: 100 },
        { source: "Bing", count: 45 }
      ],
      topExitPages: [
        { path: "/quiz", count: 75 },
        { path: "/leaderboard", count: 50 },
        { path: "/profile", count: 30 }
      ],
      internalFlows: [
        { from: "/home", to: "/quiz", count: 200 },
        { from: "/quiz", to: "/leaderboard", count: 150 }
      ],
      bounceRate: 35
    };
    res.json(stats);
  });
  
  // Get available weeks for admin question management
  app.get("/api/weeks/available", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    try {
      // Use the SQL query to get weeks starting on Monday
      const weeks = await storage.getAvailableWeeks();
      res.json(weeks);
    } catch (error) {
      console.error('Error fetching available weeks:', error);
      res.status(500).json({ error: 'Failed to fetch available weeks' });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log('Unauthorized feedback submission attempt');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to submit feedback'
      });
    }

    try {
      console.log('Received feedback request:', req.body); // Debug log

      const feedback = await storage.createFeedback({
        ...req.body,
        userId: req.user.id
      });

      // Send email notification to admins
      const emailSent = await sendFeedbackNotification({
        ...feedback,
        username: req.user.username
      });

      if (!emailSent) {
        console.warn('Failed to send feedback notification email, but feedback was saved');
      }

      res.json({
        success: true,
        message: 'Thank you for your feedback! We appreciate your input.'
      });
    } catch (error) {
      console.error('Error submitting feedback:', {
        error,
        body: req.body,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });

      res.status(500).json({
        error: 'Failed to submit feedback',
        message: 'An error occurred while submitting your feedback. Please try again.'
      });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);

    try {
      const feedback = await storage.getFeedback();
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}