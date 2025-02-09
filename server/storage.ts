import { users, questions, answers, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private answers: Map<number, Answer>;
  private currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed some initial questions
    this.seedQuestions();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, weeklyScore: 0 };
    this.users.set(id, user);
    return user;
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getDailyQuestions(): Promise<Question[]> {
    const allQuestions = await this.getQuestions();
    return this.shuffleArray(allQuestions).slice(0, 5);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.currentId++;
    const newQuestion: Question = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async submitAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = this.currentId++;
    const newAnswer: Answer = { ...answer, id, answeredAt: new Date() };
    this.answers.set(id, newAnswer);

    // Update user's weekly score if answer is correct
    if (newAnswer.correct) {
      const user = await this.getUser(answer.userId);
      if (user) {
        user.weeklyScore += 10;
        this.users.set(user.id, user);
      }
    }

    return newAnswer;
  }

  async getUserAnswers(userId: number): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (answer) => answer.userId === userId,
    );
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.weeklyScore - a.weeklyScore);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private seedQuestions() {
    const sampleQuestions: InsertQuestion[] = [
      {
        question: "What is the key principle of supply and demand?",
        correctAnswer: "Price increases when demand exceeds supply",
        options: [
          "Price increases when demand exceeds supply",
          "Price always stays constant",
          "Supply always meets demand",
          "Demand decreases as price decreases"
        ],
        category: "Economics"
      },
      {
        question: "What is ROI?",
        correctAnswer: "Return on Investment",
        options: [
          "Return on Investment",
          "Rate of Interest",
          "Risk of Investment",
          "Return on Income"
        ],
        category: "Finance"
      }
    ];

    sampleQuestions.forEach(q => this.createQuestion(q));
  }
}

export const storage = new MemStorage();
