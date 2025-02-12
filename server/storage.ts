import { users, questions, answers, userSessions, pageViews, authEvents, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer, type UserSession, type InsertUserSession, type PageView, type InsertPageView, type AuthEvent, type InsertAuthEvent } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Existing methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getQuestions(): Promise<Question[]>;
  getDailyQuestions(): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  submitAnswer(answer: InsertAnswer): Promise<Answer>;
  getUserAnswers(userId: number): Promise<Answer[]>;
  getLeaderboard(): Promise<User[]>;
  sessionStore: session.Store;
  deleteQuestion(id: number): Promise<void>;
  getTeamStats(): Promise<{
    teamName: string;
    totalScore: number;
    averageScore: number;
    completedQuizzes: number;
    members: number;
    weeklyCompletionPercentage: number;
  }[]>;
  getDailyStats(): Promise<{
    date: string;
    completedQuizzes: number;
    completionRate: number;
  }[]>;
  getTeamKnowledge(): Promise<{
    week: string;
    knowledgeScore: number;
    movingAverage: number;
  }[]>;
  assignTeam(userId: number, team: string): Promise<User>;
  getQuestionsByWeek(weekOf: Date): Promise<Question[]>;
  getActiveWeeks(): Promise<Date[]>;
  getArchivedQuestions(): Promise<Question[]>;
  archiveQuestion(id: number): Promise<void>;
  getWeeklyQuestions(): Promise<Question[]>;

  // New analytics methods
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSession(id: number, endTime: Date, exitPage?: string): Promise<UserSession>;
  recordPageView(pageView: InsertPageView): Promise<PageView>;
  recordAuthEvent(event: InsertAuthEvent): Promise<AuthEvent>;

  // Analytics queries
  getSessionAnalytics(): Promise<{
    totalSessions: number;
    averageSessionDuration: number;
    deviceBreakdown: { device: string; count: number }[];
    browserBreakdown: { browser: string; count: number }[];
    peakUsageHours: { hour: number; count: number }[];
  }>;
  getPageViewAnalytics(): Promise<{
    mostVisitedPages: { path: string; views: number }[];
    averageTimeOnPage: { path: string; avgTime: number }[];
    bounceRate: number;
    errorPages: { path: string; errors: number }[];
  }>;
  getAuthEventAnalytics(): Promise<{
    totalLogins: number;
    failedLogins: number;
    locationBreakdown: { country: string; count: number }[];
    failureReasons: { reason: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      teamAssigned: false // Ensure new users start with teamAssigned as false
    }).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getQuestions(): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.isArchived, false))
      .orderBy(questions.weekOf);
  }

  async getDailyQuestions(): Promise<Question[]> {
    const allQuestions = await this.getQuestions();
    return this.shuffleArray(allQuestions).slice(0, 3);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async submitAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db.insert(answers).values(answer).returning();

    if (answer.correct) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, answer.userId));

      await db
        .update(users)
        .set({
          weeklyScore: (user?.weeklyScore || 0) + 10,
        })
        .where(eq(users.id, answer.userId));
    }

    const userAnswers = await this.getUserAnswers(answer.userId);
    const today = new Date();
    const todaysAnswers = userAnswers.filter(a => {
      const answerDate = new Date(a.answeredAt);
      return answerDate.toDateString() === today.toDateString();
    });

    if (todaysAnswers.length % 3 === 0) {
      await db
        .update(users)
        .set({
          weeklyQuizzes: sql`${users.weeklyQuizzes} + 1`,
        })
        .where(eq(users.id, answer.userId));
    }

    return newAnswer;
  }

  async getUserAnswers(userId: number): Promise<Answer[]> {
    return await db.select().from(answers).where(eq(answers.userId, userId));
  }

  async getLeaderboard(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.weeklyScore));
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = (day + 6) % 7; // Adjust to make Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private formatDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  async getTeamStats() {
    const allUsers = await this.getUsers();
    const startOfWeek = this.getStartOfWeek();

    // Get all answers from this week
    const weeklyAnswers = await db
      .select()
      .from(answers)
      .where(gte(answers.answeredAt, startOfWeek));

    // Calculate weekly quiz completions per user
    const weeklyCompletions = new Map<number, boolean>();
    for (const answer of weeklyAnswers) {
      const userAnswers = weeklyAnswers.filter(a => a.userId === answer.userId);
      weeklyCompletions.set(answer.userId, userAnswers.length >= 3);
    }

    const teamStats = new Map<string, {
      totalScore: number;
      members: number;
      completedQuizzes: number;
      weeklyCompleted: number;
    }>();

    for (const user of allUsers) {
      if (!user.team) continue; // Skip users without teams

      const stats = teamStats.get(user.team) || { 
        totalScore: 0, 
        members: 0, 
        completedQuizzes: 0,
        weeklyCompleted: 0 
      };

      stats.totalScore += user.weeklyScore || 0;
      stats.members += 1;
      stats.completedQuizzes += user.weeklyQuizzes || 0;

      if (weeklyCompletions.get(user.id)) {
        stats.weeklyCompleted += 1;
      }

      teamStats.set(user.team, stats);
    }

    const results = Array.from(teamStats.entries()).map(([teamName, stats]) => ({
      teamName,
      totalScore: stats.totalScore,
      averageScore: stats.totalScore / stats.members,
      completedQuizzes: stats.completedQuizzes,
      members: stats.members,
      weeklyCompletionPercentage: (stats.weeklyCompleted / stats.members) * 100
    }));

    // Sort by completion percentage first, then by average score
    return results.sort((a, b) => {
      const completionDiff = b.weeklyCompletionPercentage - a.weeklyCompletionPercentage;
      if (completionDiff === 0) {
        return b.averageScore - a.averageScore;
      }
      return completionDiff;
    });
  }

  async getDailyStats() {
    // Get start of current week (Monday)
    const startOfWeek = this.getStartOfWeek();

    // Get all answers from this week
    const weekAnswers = await db
      .select()
      .from(answers)
      .where(and(
        gte(answers.answeredAt, startOfWeek),
        sql`date(${answers.answeredAt}) <= current_date`
      ));

    // Initialize stats for all days of the week
    const weekDays: { date: Date; stats: { completedQuizzes: number; totalAnswers: number; completionRate: number } }[] = [];

    // Generate all days of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date,
        stats: { completedQuizzes: 0, totalAnswers: 0, completionRate: 0 }
      });
    }

    // Get all users for calculating completion rate
    const allUsers = await this.getUsers();
    const totalUsers = allUsers.length;

    // Process answers
    for (const answer of weekAnswers) {
      const answerDate = new Date(answer.answeredAt);
      const dayEntry = weekDays.find(
        d => d.date.toDateString() === answerDate.toDateString()
      );

      if (dayEntry) {
        dayEntry.stats.totalAnswers += 1;

        if (dayEntry.stats.totalAnswers % 3 === 0) {
          dayEntry.stats.completedQuizzes += 1;
          // Calculate completion rate as percentage of users who completed the quiz
          dayEntry.stats.completionRate = (dayEntry.stats.completedQuizzes / totalUsers) * 100;
        }
      }
    }

    // Convert to required format
    return weekDays.map(({ date, stats }) => ({
      date: this.formatDayName(date),
      completedQuizzes: stats.completedQuizzes,
      completionRate: stats.completionRate
    }));
  }

  async getTeamKnowledge() {
    // Generate 2 years of weekly data (104 weeks)
    const weeks: { week: string; knowledgeScore: number; movingAverage: number }[] = [];
    const today = new Date();
    const movingAveragePeriod = 4; // 4-week moving average

    // Generate base knowledge scores with some randomization and trend
    for (let i = 0; i < 104; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));

      // Generate a score between 60-90 with some randomization and overall upward trend
      const baseScore = 75 + (i * 0.1); // Slight upward trend
      const randomVariation = (Math.random() - 0.5) * 10; // +/- 5 points variation
      const knowledgeScore = Math.min(Math.max(baseScore + randomVariation, 60), 90);

      weeks.unshift({
        week: date.toISOString().split('T')[0],
        knowledgeScore,
        movingAverage: 0 // Will be calculated after
      });
    }

    // Calculate moving average
    for (let i = 0; i < weeks.length; i++) {
      if (i >= movingAveragePeriod - 1) {
        const movingSum = weeks
          .slice(i - movingAveragePeriod + 1, i + 1)
          .reduce((sum, week) => sum + week.knowledgeScore, 0);
        weeks[i].movingAverage = Number((movingSum / movingAveragePeriod).toFixed(1));
      } else {
        weeks[i].movingAverage = weeks[i].knowledgeScore;
      }
    }

    return weeks;
  }

  async assignTeam(userId: number, team: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        team,
        teamAssigned: true
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  async getQuestionsByWeek(weekOf: Date): Promise<Question[]> {
    const startOfWeek = new Date(weekOf);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setMinutes(0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59);

    return await db
      .select()
      .from(questions)
      .where(
        and(
          sql`${questions.weekOf} >= DATE(${startOfWeek})`,
          sql`${questions.weekOf} < DATE(${endOfWeek})`,
          eq(questions.isArchived, false)
        )
      );
  }

  async getActiveWeeks(): Promise<Date[]> {
    const result = await db
      .select({ weekOf: questions.weekOf })
      .from(questions)
      .where(eq(questions.isArchived, false))
      .groupBy(questions.weekOf)
      .orderBy(questions.weekOf);

    return result.map(r => r.weekOf);
  }

  async getArchivedQuestions(): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.isArchived, true))
      .orderBy(desc(questions.weekOf));
  }

  async archiveQuestion(id: number): Promise<void> {
    await db
      .update(questions)
      .set({ isArchived: true })
      .where(eq(questions.id, id));
  }
  async getWeeklyQuestions(): Promise<Question[]> {
    const allQuestions = await this.getQuestions();
    return this.shuffleArray(allQuestions).slice(0, 3);
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db
      .insert(userSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateUserSession(id: number, endTime: Date, exitPage?: string): Promise<UserSession> {
    const [updatedSession] = await db
      .update(userSessions)
      .set({ endTime, exitPage })
      .where(eq(userSessions.id, id))
      .returning();
    return updatedSession;
  }

  async recordPageView(pageView: InsertPageView): Promise<PageView> {
    const [newPageView] = await db
      .insert(pageViews)
      .values(pageView)
      .returning();
    return newPageView;
  }

  async recordAuthEvent(event: InsertAuthEvent): Promise<AuthEvent> {
    const [newEvent] = await db
      .insert(authEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async getSessionAnalytics() {
    const sessions = await db.select().from(userSessions);
    const totalSessions = sessions.length;

    // Calculate average session duration
    const durationsInMinutes = sessions
      .filter(s => s.endTime)
      .map(s => {
        const duration = new Date(s.endTime!).getTime() - new Date(s.startTime).getTime();
        return duration / (1000 * 60); // Convert to minutes
      });
    const averageSessionDuration = durationsInMinutes.reduce((a, b) => a + b, 0) / durationsInMinutes.length;

    // Get device breakdown
    const deviceCounts = new Map<string, number>();
    sessions.forEach(s => {
      deviceCounts.set(s.device, (deviceCounts.get(s.device) || 0) + 1);
    });

    // Get browser breakdown
    const browserCounts = new Map<string, number>();
    sessions.forEach(s => {
      browserCounts.set(s.browser, (browserCounts.get(s.browser) || 0) + 1);
    });

    // Calculate peak usage hours
    const hourCounts = new Map<number, number>();
    sessions.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return {
      totalSessions,
      averageSessionDuration,
      deviceBreakdown: Array.from(deviceCounts.entries()).map(([device, count]) => ({ device, count })),
      browserBreakdown: Array.from(browserCounts.entries()).map(([browser, count]) => ({ browser, count })),
      peakUsageHours: Array.from(hourCounts.entries()).map(([hour, count]) => ({ hour, count })),
    };
  }

  async getPageViewAnalytics() {
    const views = await db.select().from(pageViews);

    // Calculate most visited pages
    const pageCounts = new Map<string, number>();
    views.forEach(v => {
      pageCounts.set(v.path, (pageCounts.get(v.path) || 0) + 1);
    });

    // Calculate average time on page
    const pageTimeTotals = new Map<string, { total: number; count: number }>();
    views.forEach(v => {
      if (v.timeSpent) {
        const current = pageTimeTotals.get(v.path) || { total: 0, count: 0 };
        pageTimeTotals.set(v.path, {
          total: current.total + v.timeSpent,
          count: current.count + 1
        });
      }
    });

    // Calculate error pages
    const errorCounts = new Map<string, number>();
    views.filter(v => v.isError).forEach(v => {
      errorCounts.set(v.path, (errorCounts.get(v.path) || 0) + 1);
    });

    // Calculate bounce rate (sessions with only one page view)
    const sessionPageCounts = new Map<number, number>();
    views.forEach(v => {
      sessionPageCounts.set(v.sessionId, (sessionPageCounts.get(v.sessionId) || 0) + 1);
    });
    const bounceSessions = Array.from(sessionPageCounts.values()).filter(count => count === 1).length;
    const bounceRate = (bounceSessions / sessionPageCounts.size) * 100;

    return {
      mostVisitedPages: Array.from(pageCounts.entries())
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views),
      averageTimeOnPage: Array.from(pageTimeTotals.entries())
        .map(([path, { total, count }]) => ({ 
          path, 
          avgTime: total / count 
        })),
      bounceRate,
      errorPages: Array.from(errorCounts.entries())
        .map(([path, errors]) => ({ path, errors }))
        .sort((a, b) => b.errors - a.errors),
    };
  }

  async getAuthEventAnalytics() {
    const events = await db.select().from(authEvents);

    const totalLogins = events.filter(e => e.eventType === 'login').length;
    const failedLogins = events.filter(e => e.eventType === 'login_failed').length;

    // Calculate location breakdown
    const locationCounts = new Map<string, number>();
    events.forEach(e => {
      const location = e.geoLocation as { country: string } | null;
      if (location?.country) {
        locationCounts.set(location.country, (locationCounts.get(location.country) || 0) + 1);
      }
    });

    // Calculate failure reasons
    const failureReasonCounts = new Map<string, number>();
    events.filter(e => e.failureReason).forEach(e => {
      failureReasonCounts.set(e.failureReason!, (failureReasonCounts.get(e.failureReason!) || 0) + 1);
    });

    return {
      totalLogins,
      failedLogins,
      locationBreakdown: Array.from(locationCounts.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
      failureReasons: Array.from(failureReasonCounts.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count),
    };
  }
}

export const storage = new DatabaseStorage();