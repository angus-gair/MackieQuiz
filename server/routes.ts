import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAnswerSchema, insertQuestionSchema } from "@shared/schema";
import { log } from "./vite";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
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

  app.post("/api/logs/error", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { message, context, stack, timestamp } = req.body;

    // Log the error with additional context
    log(`Client Error [${context || 'unknown'}]: ${message}${stack ? '\nStack: ' + stack : ''}`, 'error');

    res.status(200).json({ message: "Error logged successfully" });
  });

  const httpServer = createServer(app);
  return httpServer;
}