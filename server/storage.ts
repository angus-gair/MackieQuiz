import { users, questions, answers, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

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

    // Get user's current data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, answer.userId));

    if (!user) return newAnswer;

    // Check if this is the last answer of the quiz (3 questions)
    const userAnswers = await this.getUserAnswers(answer.userId);
    const today = new Date();
    const todaysAnswers = userAnswers.filter(a => {
      const answerDate = new Date(a.answeredAt);
      return answerDate.toDateString() === today.toDateString();
    });

    if (todaysAnswers.length % 3 === 0) {
      // Update streak
      const lastQuizDate = user.lastQuizDate ? new Date(user.lastQuizDate) : null;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = user.currentStreak || 0;
      if (!lastQuizDate || lastQuizDate.toDateString() === yesterday.toDateString()) {
        // Maintain or increase streak
        newStreak += 1;
      } else if (lastQuizDate.toDateString() !== today.toDateString()) {
        // Reset streak if not consecutive days
        newStreak = 1;
      }

      // Calculate achievements
      let achievements = user.achievements as Achievement[] || [];

      // Check for new achievements
      if (newStreak === 3) {
        achievements.push({
          id: 'streak-3',
          name: 'Three Day Streak',
          description: 'Completed quizzes for three consecutive days',
          icon: '🔥',
          unlockedAt: new Date().toISOString()
        });
      } else if (newStreak === 7) {
        achievements.push({
          id: 'streak-7',
          name: 'Week Warrior',
          description: 'Completed quizzes for seven consecutive days',
          icon: '🏆',
          unlockedAt: new Date().toISOString()
        });
      }

      if (user.weeklyScore >= 100) {
        const hasScoreAchievement = achievements.some(a => a.id === 'score-100');
        if (!hasScoreAchievement) {
          achievements.push({
            id: 'score-100',
            name: 'Century Scorer',
            description: 'Reached 100 points in weekly score',
            icon: '💯',
            unlockedAt: new Date().toISOString()
          });
        }
      }

      // Update user data
      await db
        .update(users)
        .set({
          weeklyScore: (user?.weeklyScore || 0) + (answer.correct ? 10 : 0),
          weeklyQuizzes: sql`${users.weeklyQuizzes} + 1`,
          currentStreak: newStreak,
          lastQuizDate: today,
          achievements: achievements
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