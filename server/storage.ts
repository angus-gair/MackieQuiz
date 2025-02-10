import { users, questions, answers, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;  // Added this method
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;  // Added this method
  deleteUser(id: number): Promise<void>;  // Added this method
  getQuestions(): Promise<Question[]>;
  getDailyQuestions(): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  submitAnswer(answer: InsertAnswer): Promise<Answer>;
  getUserAnswers(userId: number): Promise<Answer[]>;
  getLeaderboard(): Promise<User[]>;
  sessionStore: session.Store;
  deleteQuestion(id: number): Promise<void>;
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

  // Added method to get all users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Added method to update a user
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Added method to delete a user
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
}

export const storage = new DatabaseStorage();