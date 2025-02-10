import { users, questions, answers, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
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
    trendValue?: number;
    trend2023?: number;
    trend2024?: number;
    trend2025?: number;
  }[]>;
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
    const [user] = await db.insert(users).values(insertUser).returning();
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
    return await db.select().from(questions);
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

    return Array.from(teamStats.entries()).map(([teamName, stats]) => ({
      teamName,
      totalScore: stats.totalScore,
      averageScore: stats.totalScore / stats.members,
      completedQuizzes: stats.completedQuizzes,
      members: stats.members,
      weeklyCompletionPercentage: (stats.weeklyCompleted / stats.members) * 100
    }));
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
    const startDate = new Date('2023-01-01');
    const today = new Date();
    const weeks: { week: string; knowledgeScore: number; movingAverage: number; trendValue?: number; trend2023?: number; trend2024?: number; trend2025?: number }[] = [];
    const movingAveragePeriod = 4; // 4-week moving average

    // Generate weekly data from 2023-01-01 to today
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      // Generate a score between 60-90 with some randomization and overall upward trend
      const daysFromStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const baseScore = 75 + (daysFromStart * 0.01); // Slight upward trend
      const randomVariation = (Math.random() - 0.5) * 10; // +/- 5 points variation
      const knowledgeScore = Math.min(Math.max(baseScore + randomVariation, 60), 90);

      weeks.push({
        week: currentDate.toISOString().split('T')[0],
        knowledgeScore,
        movingAverage: 0 // Will be calculated after
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
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

    // Calculate trend lines for each year
    const calculateTrendForPeriod = (data: typeof weeks, startDate: Date, endDate: Date) => {
      const periodData = data.filter(w => {
        const weekDate = new Date(w.week);
        return weekDate >= startDate && weekDate <= endDate;
      });

      if (periodData.length === 0) return null;

      const n = periodData.length;
      const xValues = Array.from({ length: n }, (_, i) => i);
      const yValues = periodData.map(w => w.knowledgeScore);

      const sumX = xValues.reduce((a, b) => a + b, 0);
      const sumY = yValues.reduce((a, b) => a + b, 0);
      const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
      const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return { slope, intercept, startIndex: weeks.indexOf(periodData[0]) };
    };

    // Calculate trends for each year
    const trends = [
      {
        year: 2023,
        start: new Date('2023-01-01'),
        end: new Date('2023-12-31'),
        field: 'trend2023'
      },
      {
        year: 2024,
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
        field: 'trend2024'
      },
      {
        year: 2025,
        start: new Date('2025-01-01'),
        end: today,
        field: 'trend2025'
      }
    ].map(year => ({
      ...year,
      trend: calculateTrendForPeriod(weeks, year.start, year.end)
    }));

    // Apply trend values to weeks
    weeks.forEach((week, i) => {
      const weekDate = new Date(week.week);
      trends.forEach(({ trend, start, end, field }) => {
        if (trend && weekDate >= start && weekDate <= end) {
          const relativeIndex = i - trend.startIndex;
          week[field] = Number((trend.slope * relativeIndex + trend.intercept).toFixed(1));
        }
      });
    });

    return weeks;
  }
}

export const storage = new DatabaseStorage();