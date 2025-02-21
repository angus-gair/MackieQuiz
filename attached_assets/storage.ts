import { users, questions, answers, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { addWeeks, startOfWeek, isAfter, isBefore, isEqual, subWeeks } from "date-fns";

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
  }[]>;
  assignTeam(userId: number, team: string): Promise<User>;
  getQuestionsByWeek(weekOf: Date): Promise<Question[]>;
  getArchivedQuestions(): Promise<Question[]>;
  archiveQuestion(id: number): Promise<void>;
  getActiveWeeks(): Promise<Date[]>;
  getCurrentWeekQuestions(): Promise<Question[]>;
  archivePastWeeks(): Promise<void>;
  cleanupAndPrepareWeeks(): Promise<void>;
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
    const startOfRequestedWeek = startOfWeek(weekOf);
    const questions = await this.getQuestions();
    return questions.filter(q => {
      if (!q.weekOf || q.isArchived) return false;
      const questionWeekStart = startOfWeek(new Date(q.weekOf));
      return isEqual(startOfRequestedWeek, questionWeekStart);
    });
  }

  async getArchivedQuestions(): Promise<Question[]> {
    const questions = await this.getQuestions();
    return questions.filter(q => q.isArchived);
  }

  async archiveQuestion(id: number): Promise<void> {
    await db
      .update(questions)
      .set({ isArchived: true })
      .where(eq(questions.id, id));
  }

  async getActiveWeeks(): Promise<Date[]> {
    const currentWeek = startOfWeek(new Date());
    // Return current week and next 3 weeks
    return Array.from({ length: 4 }, (_, i) => addWeeks(currentWeek, i));
  }

  async getCurrentWeekQuestions(): Promise<Question[]> {
    const currentWeek = startOfWeek(new Date());
    return this.getQuestionsByWeek(currentWeek);
  }

  async archivePastWeeks(): Promise<void> {
    const currentWeek = startOfWeek(new Date());
    const questions = await this.getQuestions();

    // Find questions from past weeks that aren't archived
    const pastQuestions = questions.filter(q => {
      if (!q.weekOf || q.isArchived) return false;
      const questionWeek = startOfWeek(new Date(q.weekOf));
      return isBefore(questionWeek, currentWeek);
    });

    // Archive all past questions
    await Promise.all(
      pastQuestions.map(q => this.archiveQuestion(q.id))
    );
  }

  async cleanupAndPrepareWeeks(): Promise<void> {
    // This method should be called periodically (e.g., daily) to maintain the system
    await this.archivePastWeeks();
  }
}

export const storage = new DatabaseStorage();