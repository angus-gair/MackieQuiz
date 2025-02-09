import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAnswerSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/questions/daily", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const questions = await storage.getDailyQuestions();
    res.json(questions);
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

  const httpServer = createServer(app);
  return httpServer;
}
