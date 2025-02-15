import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table remains unchanged
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  team: text("team"),
  isAdmin: boolean("is_admin").notNull().default(false),
  weeklyScore: integer("weekly_score").notNull().default(0),
  weeklyQuizzes: integer("weekly_quizzes").notNull().default(0),
  teamAssigned: boolean("team_assigned").notNull().default(false),
});

// Define relations for users
export const usersRelations = relations(users, ({ many }) => ({
  achievements: many(achievements)
}));

// Updated achievements table with badge field
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'quiz_milestone', 'streak', 'team_victory'
  milestone: integer("milestone").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  badge: text("badge").notNull(), // Added badge field for milestone badges
});

// Define relations for achievements
export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  })
}));

export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastQuizDate: date("last_quiz_date"),
  weeklyQuizzesTaken: integer("weekly_quizzes_taken").notNull().default(0),
});

export const teamStats = pgTable("team_stats", {
  id: serial("id").primaryKey(),
  teamName: text("team_name").notNull(),
  weekWins: integer("week_wins").notNull().default(0),
  currentWinStreak: integer("current_win_streak").notNull().default(0),
  longestWinStreak: integer("longest_win_streak").notNull().default(0),
  lastWinDate: date("last_win_date"),
  totalScore: integer("total_score").notNull().default(0),
});

export const powerUps = pgTable("power_ups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'hint', 'fifty_fifty'
  quantity: integer("quantity").notNull().default(0),
  lastRefillDate: timestamp("last_refill_date"),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  avatarUrl: text("avatar_url"),
  customTitle: text("custom_title"),
  preferredTheme: text("preferred_theme"),
  badges: text("badges").array(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default('pending'),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: text("options").array().notNull(),
  category: text("category").notNull(),
  explanation: text("explanation").notNull(),
  weekOf: date("week_of").notNull(),
  isArchived: boolean("is_archived").notNull().default(false),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  answer: text("answer").notNull(),
  correct: boolean("correct").notNull(),
  answeredAt: timestamp("answered_at").notNull().defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  device: text("device").notNull(),
  browser: text("browser").notNull(),
  referrer: text("referrer"),
  exitPage: text("exit_page"),
});

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  userId: integer("user_id").notNull(),
  path: text("path").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  timeSpent: integer("time_spent"),
  isError: boolean("is_error").default(false),
});

export const authEvents = pgTable("auth_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  eventType: text("event_type").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  device: text("device").notNull(),
  browser: text("browser").notNull(),
  geoLocation: jsonb("geo_location"),
  failureReason: text("failure_reason"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  isAdmin: z.boolean().optional().default(false),
  team: z.string().optional(),
  teamAssigned: z.boolean().optional().default(false)
});

export const insertQuestionSchema = createInsertSchema(questions);
export const insertAnswerSchema = createInsertSchema(answers);
export const insertSessionSchema = createInsertSchema(userSessions);
export const insertPageViewSchema = createInsertSchema(pageViews);
export const insertAuthEventSchema = createInsertSchema(authEvents);
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ 
  id: true,
  createdAt: true,
  status: true 
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ 
  id: true,
  earnedAt: true
});

export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({ 
  id: true
});

export const insertTeamStatSchema = createInsertSchema(teamStats).omit({ 
  id: true
});

export const insertPowerUpSchema = createInsertSchema(powerUps).omit({ 
  id: true
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ 
  id: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type AuthEvent = typeof authEvents.$inferSelect;
export type InsertUserSession = z.infer<typeof insertSessionSchema>;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type InsertAuthEvent = z.infer<typeof insertAuthEventSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type InsertTeamStat = z.infer<typeof insertTeamStatSchema>;
export type InsertPowerUp = z.infer<typeof insertPowerUpSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type UserStreak = typeof userStreaks.$inferSelect;
export type TeamStat = typeof teamStats.$inferSelect;
export type PowerUp = typeof powerUps.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;