import { users, questions, answers, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getQuestions(): Promise<Question[]>;
  getDailyQuestions(): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  submitAnswer(answer: InsertAnswer): Promise<Answer>;
  getUserAnswers(userId: number): Promise<Answer[]>;
  getLeaderboard(): Promise<User[]>;
  sessionStore: session.Store;
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

  async getQuestions(): Promise<Question[]> {
    return await db.select().from(questions);
  }

  async getDailyQuestions(): Promise<Question[]> {
    // Get all questions and randomly select 3
    const allQuestions = await this.getQuestions();
    return this.shuffleArray(allQuestions).slice(0, 3);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async submitAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db.insert(answers).values(answer).returning();

    // Update user's weekly score if answer is correct
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

    return newAnswer;
  }

  async getUserAnswers(userId: number): Promise<Answer[]> {
    return await db.select().from(answers).where(eq(answers.userId, userId));
  }

  async getLeaderboard(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(users.weeklyScore);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  async seedQuestions() {
    const sampleQuestions: InsertQuestion[] = [
      {
        question: "What are Dan Murphy's typical opening hours?",
        correctAnswer: "9:00 AM – 9:00 PM (Weekdays & Saturdays), 10:00 AM – 7:00 PM (Sundays)",
        options: [
          "6:00 AM – 10:00 PM",
          "9:00 AM – 9:00 PM (Weekdays & Saturdays), 10:00 AM – 7:00 PM (Sundays)",
          "10:00 AM – 5:00 PM every day",
          "24/7"
        ],
        category: "Operations",
        explanation: "Dan Murphy's opening hours vary by location, but generally, stores operate from 9:00 AM to 9:00 PM on weekdays and Saturdays and from 10:00 AM to 7:00 PM on Sundays. However, public holidays or specific store policies may affect these hours."
      },
      {
        question: "How can you find your nearest Dan Murphy's store?",
        correctAnswer: "Use the 'Find a Store' tool on their website",
        options: [
          "Call customer service and ask",
          "Use the 'Find a Store' tool on their website",
          "Google 'Dan Murphy's near me'",
          "Walk around and look for one"
        ],
        category: "Customer Service",
        explanation: "Dan Murphy's has a store locator tool on its website where you can enter your postcode or suburb to find the nearest store. This tool provides store addresses, trading hours, and any special services offered at each location."
      },
      {
        question: "Does Dan Murphy's offer online ordering and delivery?",
        correctAnswer: "Yes, with same-day delivery and in-store pickup options",
        options: [
          "No, only in-store purchases are available",
          "Yes, but only for wine",
          "Yes, with same-day delivery and in-store pickup options",
          "Only for bulk orders"
        ],
        category: "Services",
        explanation: "Dan Murphy's offers online ordering through their website, with options for home delivery and in-store pickup. Customers in metro areas can get same-day delivery, while 30-minute in-store pickup is available at selected locations."
      }
    ];

    for (const question of sampleQuestions) {
      await this.createQuestion(question);
    }
  }
}

export const storage = new DatabaseStorage();