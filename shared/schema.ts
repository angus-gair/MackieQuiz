import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  team: text("team").notNull(),
  weeklyScore: integer("weekly_score").notNull().default(0),
  weeklyQuizzes: integer("weekly_quizzes").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lastQuizDate: timestamp("last_quiz_date"),
  achievements: jsonb("achievements").notNull().default('[]'::jsonb),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: text("options").array().notNull(),
  category: text("category").notNull(),
  explanation: text("explanation").notNull(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  answer: text("answer").notNull(),
  correct: boolean("correct").notNull(),
  answeredAt: timestamp("answered_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  team: true,
});

export const insertQuestionSchema = createInsertSchema(questions);
export const insertAnswerSchema = createInsertSchema(answers);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}