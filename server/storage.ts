import { users, questions, answers, userSessions, pageViews, authEvents, achievements, userStreaks, teamStats, powerUps, userProfiles, appSettings, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer, type UserSession, type InsertUserSession, type PageView, type InsertPageView, type AuthEvent, type InsertAuthEvent, type Achievement, type InsertAchievement, type UserStreak, type TeamStat, type PowerUp, type UserProfile, type InsertUserProfile, type AppSettings} from "@shared/schema";
import { feedback, type Feedback, type InsertFeedback, dimDate } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, lt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { log } from "./vite";
import { DimDate } from "@shared/schema";
import { formatDateForPg, parseDateFromPg, createUTCDate, getWeekMonday, getWeekSunday } from "./utils/date-handlers";

// Existing methods
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
  
  // App settings methods
  getSetting(key: string): Promise<string | null>;
  getAllSettings(): Promise<AppSettings[]>;
  updateSetting(key: string, value: string, userId?: number): Promise<AppSettings>;
  getSelectedWeekFilter(): Promise<string | null>;

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

  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  checkAndAwardAchievements(userId: number): Promise<Achievement[]>;

  // Streak methods
  getOrCreateUserStreak(userId: number): Promise<UserStreak>;
  updateUserStreak(userId: number, completed: boolean): Promise<UserStreak>;

  // Team stats methods
  updateTeamStats(teamName: string, won: boolean): Promise<TeamStat>;
  getTeamLeaderboard(): Promise<TeamStat[]>;

  // Power-up methods
  getUserPowerUps(userId: number): Promise<PowerUp[]>;
  usePowerUp(userId: number, type: string): Promise<boolean>;
  refillPowerUps(userId: number): Promise<PowerUp[]>;

  // Profile methods
  getOrCreateUserProfile(userId: number): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  getAllAchievements(): Promise<Achievement[]>;

  // New achievement methods
  awardPerfectQuizAchievement(userId: number): Promise<Achievement | null>;
  awardTeamContributionAchievement(userId: number, contributionType: string): Promise<Achievement | null>;
  updateAchievementProgress(userId: number, achievementType: string, progress: number): Promise<void>;
  getHighestTierBadges(userId: number): Promise<Achievement[]>;
  trackQuizProgress(userId: number, isCorrect: boolean): Promise<void>;

  // Enhanced profile methods
  updateUserProfileShowcase(userId: number, achievementIds: string[]): Promise<UserProfile>;
  updateTeamAvatar(userId: number, preference: string, color?: string): Promise<UserProfile>;
  getHighestTierAchievements(userId: number, limit?: number): Promise<Achievement[]>;
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getFeedback(): Promise<Feedback[]>;
  getCurrentWeekQuestions(): Promise<Question[]>;
  archivePastWeeks(): Promise<void>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question>;

  // New methods for week management and bonus questions
  getCurrentWeek(): Promise<DimDate>;
  getWeekStatus(date: Date): Promise<string>;
  getQuestionsByWeekStatus(status: string): Promise<Question[]>;
  updateQuestionWeekStatuses(): Promise<void>;
  archivePastWeeks(): Promise<void>;
  createBonusQuestion(question: InsertQuestion & { bonusPoints: number; availableFrom: Date; availableUntil: Date }): Promise<Question>;
  getActiveBonusQuestions(): Promise<Question[]>;
  getAvailableWeeks(): Promise<DimDate[]>;
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
      teamAssigned: false, // Ensure new users start with teamAssigned as false
      weeklyScore: 0, // Explicitly set default values to avoid data issues
      weeklyQuizzes: 0 // Explicitly set default values to avoid data issues
    }).returning();
    
    // Log user creation for debugging
    log(`Created new user (${user.id}): ${user.username} with weeklyScore: ${user.weeklyScore}, weeklyQuizzes: ${user.weeklyQuizzes}`);
    
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
      .where(
        and(
          eq(questions.isArchived, false),
          eq(questions.isBonus, false)
        )
      )
      .orderBy(questions.weekOf);
  }

  async getDailyQuestions(): Promise<Question[]> {
    const today = new Date();
    
    // Get questions that are currently available based on date range
    const availableQuestions = await db
      .select()
      .from(questions)
      .where(
        and(
          eq(questions.isArchived, false),
          eq(questions.isBonus, false),
          lte(questions.availableFrom!, today),
          gte(questions.availableUntil!, today)
        )
      );
    
    console.log(`Found ${availableQuestions.length} available questions for today`);
    
    if (availableQuestions.length === 0) {
      // Fallback to regular questions if no available questions found
      console.log("No available questions found for the current date range, falling back to all active questions");
      const allQuestions = await this.getQuestions();
      return this.shuffleArray(allQuestions).slice(0, 3);
    }
    
    return this.shuffleArray(availableQuestions).slice(0, 3);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    try {
      // Handle timezone issues by ensuring the weekOf date is always a Monday
      let weekOfDate: Date;
      
      if (typeof question.weekOf === 'string') {
        // Parse date string and ensure it's a valid date
        weekOfDate = new Date(question.weekOf);
      } else {
        weekOfDate = new Date(question.weekOf);
      }
      
      // Use our helper function to normalize the date to Monday of the week
      weekOfDate = getWeekMonday(weekOfDate);
      
      // Format the date for PostgreSQL storage to prevent timezone issues
      const formattedWeekOf = formatDateForPg(weekOfDate);
      
      // Get the week status for this date
      const weekStatus = await this.getWeekStatus(weekOfDate);
      
      // Set availableFrom to the selected week's Monday (using UTC-safe approach)
      const availableFrom = getWeekMonday(weekOfDate);
      
      // Set availableUntil to Sunday (using UTC-safe approach)
      const availableUntil = getWeekSunday(weekOfDate);
      
      console.log(`Creating question for week of ${formattedWeekOf} (Monday) with status: ${weekStatus}`);
      console.log(`Question will be available from ${formatDateForPg(availableFrom)} to ${formatDateForPg(availableUntil)}`);
      
      // Create the question with the normalized date and availability window
      const [newQuestion] = await db
        .insert(questions)
        .values({
          question: question.question,
          correctAnswer: question.correctAnswer,
          options: question.options,
          category: question.category,
          explanation: question.explanation,
          weekOf: formattedWeekOf,
          isArchived: false, // Never archive new questions by default
          weekStatus: weekStatus as 'past' | 'current' | 'future',
          isBonus: question.isBonus || false,
          bonusPoints: question.bonusPoints || 10,
          // Store dates as proper Date objects for timestamp columns
          availableFrom: availableFrom,
          availableUntil: availableUntil
        })
        .returning();
      
      console.log(`Successfully created new question for week of ${formattedWeekOf} (Monday)`);
      return newQuestion;
    } catch (error) {
      console.error("Error creating question:", error);
      throw new Error(`Failed to create question: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async submitAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db.insert(answers).values(answer).returning();
    log(`New answer submitted for user ${answer.userId}`);

    try {
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
        log(`Updated weekly score for user ${answer.userId}`);
      }

      const userAnswers = await this.getUserAnswers(answer.userId);
      const today = new Date();
      const todaysAnswers = userAnswers.filter(a => {
        const answerDate = new Date(a.answeredAt);
        return answerDate.toDateString() === today.toDateString();
      });

      log(`User ${answer.userId} has ${todaysAnswers.length} answers today`);

      // Check if user completed a quiz (3 questions)
      const completedQuiz = todaysAnswers.length % 3 === 0;
      if (completedQuiz) {
        log(`User ${answer.userId} completed a quiz`);

        try {
          // Ensure user streak record exists and update it
          const streak = await this.getOrCreateUserStreak(answer.userId);
          await this.updateUserStreak(answer.userId, true);
          log(`Updated streak for user ${answer.userId}: current streak ${streak.currentStreak}`);
        } catch (err) {
          log(`Error updating user streak: ${err}`);
        }

        try {
          // Update team stats if user is in a team
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, answer.userId));

          if (user.team) {
            // Consider a team "won" if they completed a quiz with a perfect score
            const latestQuizAnswers = todaysAnswers.slice(-3);
            const perfectScore = latestQuizAnswers.every(a => a.correct);
            await this.updateTeamStats(user.team, perfectScore);
            log(`Updated team stats for team ${user.team}`);
            
            // Award team contribution achievement
            await this.awardTeamContributionAchievement(answer.userId, 'Quiz');
          }
        } catch (err) {
          log(`Error updating team stats: ${err}`);
        }

        try {
          // Refill power-ups weekly
          await this.refillPowerUps(answer.userId);
          log(`Refilled power-ups for user ${answer.userId}`);
        } catch (err) {
          log(`Error refilling power-ups: ${err}`);
        }
        
        // Note: We don't need to check for achievements here.
        // All achievement checking is now centralized in checkAndAwardAchievements()
        // which is called from the routes.ts after a quiz completion.
      }

      return newAnswer;
    } catch (error) {
      log(`Error in submitAnswer gamification features: ${error}`);
      // Return the answer even if gamification features fail
      return newAnswer;
    }
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
  /**
   * Get the start of the week (Monday) for a given date
   * @param date The date to get the start of the week for
   * @returns A new Date object set to the Monday of the week
   */
  private getWeekCommencing(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust to the previous Monday (or stay on Monday)
    // JavaScript: 0 = Sunday, so we adjust differently
    const diff = day === 0 ? 6 : day - 1;
    
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0); // Start of the day
    
    return result;
  }
  
  async getWeeklyQuestions(): Promise<Question[]> {
    const today = new Date();
    const weekCommencing = this.getWeekCommencing(today);
    
    console.log(`Looking for questions for the week commencing ${weekCommencing.toISOString()}`);
    
    // Get questions that match the current week
    const availableQuestions = await db
      .select()
      .from(questions)
      .where(
        and(
          eq(questions.isArchived, false),
          eq(questions.isBonus, false),
          // Filter by questions where availableFrom is in the current week
          sql`${questions.availableFrom} IS NOT NULL`,
          // Compare the week start date of availableFrom with our current week start date
          sql`DATE_TRUNC('week', ${questions.availableFrom}) = DATE_TRUNC('week', ${weekCommencing})`
        )
      );
    
    console.log(`Found ${availableQuestions.length} questions for the current week (${weekCommencing.toDateString()})`);
    
    if (availableQuestions.length === 0) {
      // Fallback to available questions if no questions found for the current week
      console.log("No questions found for the current week, falling back to available questions");
      
      const availableQuestionsAnyWeek = await db
        .select()
        .from(questions)
        .where(
          and(
            eq(questions.isArchived, false),
            eq(questions.isBonus, false),
            // When comparing dates, use nullable safety check with SQL expressions
            sql`${questions.availableFrom} IS NOT NULL AND ${questions.availableFrom} <= ${today}`,
            sql`${questions.availableUntil} IS NOT NULL AND ${questions.availableUntil} >= ${today}`
          )
        );
        
      if (availableQuestionsAnyWeek.length > 0) {
        console.log(`Found ${availableQuestionsAnyWeek.length} available questions (any week)`);
        return this.shuffleArray(availableQuestionsAnyWeek).slice(0, 3);
      }
      
      // If still no questions, fall back to all active questions
      console.log("No available questions found, falling back to all active questions");
      const allQuestions = await this.getQuestions();
      return this.shuffleArray(allQuestions).slice(0, 3);
    }
    
    return this.shuffleArray(availableQuestions).slice(0, 3);
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



  private async checkMilestoneAchievement(userId: number, quizCount: number): Promise<Achievement | null> {
    // Updated milestone list to match requirements: 1, 3, 5, 7, 10, 13, 15, 17, 20
    const milestones = [1, 3, 5, 7, 10, 13, 15, 17, 20];
    if (milestones.includes(quizCount)) {
      // Check if achievement already exists
      const [existing] = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.userId, userId),
          eq(achievements.type, 'quiz_milestone'),
          eq(achievements.milestone, quizCount)
        ));

      if (!existing) {
        const [achievement] = await db.insert(achievements).values({
          userId,
          type: 'quiz_milestone',
          milestone: quizCount,
          name: `${quizCount} Quizzes Completed`,
          description: `Completed ${quizCount} quizzes!`,
          icon: `quiz-${quizCount}`, // Frontend will map this to actual icon
          badge: `milestone-${quizCount}`,
          category: 'quiz',
          tier: quizCount >= 15 ? 'gold' : quizCount >= 7 ? 'silver' : 'bronze',
          isHighestTier: quizCount === 20 // 20 is the highest milestone
        }).returning();
        return achievement;
      }
    }
    return null;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select({
        id: achievements.id,
        userId: achievements.userId,
        type: achievements.type,
        milestone: achievements.milestone,
        earnedAt: achievements.earnedAt,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        badge: achievements.badge,
        category: achievements.category,
        tier: achievements.tier,
        progress: achievements.progress,
        isHighestTier: achievements.isHighestTier,
        user: {
          username: users.username
        }
      })
      .from(achievements)
      .leftJoin(users, eq(achievements.userId, users.id))
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.earnedAt));
  }

  async getAllAchievements(): Promise<Achievement[]> {
    const results = await db
      .select({
        id: achievements.id,
        userId: achievements.userId,
        type: achievements.type,
        milestone: achievements.milestone,
        earnedAt: achievements.earnedAt,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        badge: achievements.badge,
        user: {
          username: users.username,
        },
      })
      .from(achievements)
      .leftJoin(users, eq(achievements.userId, users.id))
      .orderBy(desc(achievements.earnedAt));

    return results;
  }

  async checkAndAwardAchievements(userId: number): Promise<Achievement[]> {
    const userAnswers = await this.getUserAnswers(userId);
    const quizCount = Math.floor(userAnswers.length / 3);
    const newAchievements: Achievement[] = [];

    console.log(`[Achievement Check] User ${userId} has completed ${quizCount} quizzes (answers: ${userAnswers.length})`);

    // Check for milestone achievements - make sure to check for first milestone (quizCount 1)
    if (quizCount > 0) {
      const milestoneAchievement = await this.checkMilestoneAchievement(userId, quizCount);
      if (milestoneAchievement) {
        newAchievements.push(milestoneAchievement);
        console.log(`[Achievement] User ${userId} earned milestone achievement for quiz #${quizCount}`);
      } else {
        console.log(`[Achievement] No milestone achievement for user ${userId} at quiz #${quizCount}`);
      }
    }
    
    // Check for perfect score achievement
    // Get the latest 3 answers (current quiz)
    const latestQuizAnswers = userAnswers.slice(-3);
    if (latestQuizAnswers.length === 3) {
      const isPerfectScore = latestQuizAnswers.every(answer => answer.correct);
      console.log(`[Achievement] User ${userId} perfect score check: ${isPerfectScore ? 'YES' : 'NO'}`);
      
      if (isPerfectScore) {
        const perfectScoreAchievement = await this.awardPerfectQuizAchievement(userId);
        if (perfectScoreAchievement) {
          newAchievements.push(perfectScoreAchievement);
          console.log(`[Achievement] User ${userId} earned perfect score achievement #${perfectScoreAchievement.milestone}`);
        }
      }
    }

    // Log combined achievements for debugging
    if (newAchievements.length > 0) {
      console.log(`[Achievement Summary] User ${userId} earned ${newAchievements.length} achievements: ${newAchievements.map(a => a.name).join(', ')}`);
    } else {
      console.log(`[Achievement Summary] User ${userId} earned no new achievements`);
    }

    return newAchievements;
  }

  async getOrCreateUserStreak(userId: number): Promise<UserStreak> {
    const [existingStreak] = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId));

    if (existingStreak) {
      return existingStreak;
    }

    const [newStreak] = await db.insert(userStreaks)
      .values({ userId, currentStreak: 0, longestStreak: 0 })
      .returning();

    return newStreak;
  }

  async updateUserStreak(userId: number, completed: boolean): Promise<UserStreak> {
    const streak = await this.getOrCreateUserStreak(userId);
    const today = new Date();
    const lastQuizDate = streak.lastQuizDate ? new Date(streak.lastQuizDate) : null;

    let currentStreak = streak.currentStreak;
    if (completed) {
      if (!lastQuizDate || isConsecutiveDay(lastQuizDate, today)) {
        currentStreak += 1;
      } else if (!isConsecutiveDay(lastQuizDate, today)) {
        currentStreak = 1;
      }
    } else if (!isConsecutiveDay(lastQuizDate, today)) {
      currentStreak = 0;
    }

    const [updatedStreak] = await db.update(userStreaks)
      .set({
        currentStreak,
        longestStreak: Math.max(currentStreak, streak.longestStreak),
        lastQuizDate: today,
        weeklyQuizzesTaken: completed ? streak.weeklyQuizzesTaken + 1 : streak.weeklyQuizzesTaken
      })
      .where(eq(userStreaks.userId, userId))
      .returning();

    return updatedStreak;
  }

  async updateTeamStats(teamName: string, won: boolean): Promise<TeamStat> {
    const [existingStat] = await db
      .select()
      .from(teamStats)
      .where(eq(teamStats.teamName, teamName));

    const today = new Date();
    const updates: Partial<TeamStat> = {
      weekWins: (existingStat?.weekWins || 0) + (won ? 1 : 0),
      lastWinDate: won ? today : existingStat?.lastWinDate
    };

    if (won) {
      updates.currentWinStreak = (existingStat?.currentWinStreak || 0) + 1;
      updates.longestWinStreak = Math.max(
        updates.currentWinStreak,
        existingStat?.longestWinStreak || 0
      );
    } else {
      updates.currentWinStreak = 0;
    }

    if (existingStat) {
      const [updatedStat] = await db.update(teamStats)
        .set(updates)
        .where(eq(teamStats.teamName, teamName))
        .returning();
      return updatedStat;
    }

    const [newStat] = await db.insert(teamStats)
      .values({
        teamName,
        weekWins: won ? 1 : 0,
        currentWinStreak: won ? 1 : 0,
        longestWinStreak: won ? 1 : 0,
        lastWinDate: won ? today : null,
        totalScore: 0
      })
      .returning();

    return newStat;
  }

  async getTeamLeaderboard(): Promise<TeamStat[]> {
    return await db
      .select()
      .from(teamStats)
      .orderBy([desc(teamStats.weekWins), desc(teamStats.currentWinStreak)]);
  }

  async getUserPowerUps(userId: number): Promise<PowerUp[]> {
    return await db
      .select()
      .from(powerUps)
      .where(eq(powerUps.userId, userId));
  }

  async usePowerUp(userId: number, type: string): Promise<boolean> {
    const [powerUp] = await db
      .select()
      .from(powerUps)
      .where(and(
        eq(powerUps.userId, userId),
        eq(powerUps.type, type)
      ));

    if (!powerUp || powerUp.quantity <= 0) {
      return false;
    }

    await db.update(powerUps)
      .set({ quantity: powerUp.quantity - 1 })
      .where(eq(powerUps.id, powerUp.id));

    return true;
  }

  async refillPowerUps(userId: number): Promise<PowerUp[]> {
    const powerUpTypes = ['hint', 'fifty_fifty'];
    const now = new Date();
    const refills: PowerUp[] = [];

    for (const type of powerUpTypes) {
      const [existing] = await db
        .select()
        .from(powerUps)
        .where(and(
          eq(powerUps.userId, userId),
          eq(powerUps.type, type)
        ));

      if (existing) {
        // Refill if it's been more than a week since last refill
        const lastRefill = existing.lastRefillDate ? new Date(existing.lastRefillDate) : null;
        if (!lastRefill || differenceInDays(now, lastRefill) >= 7) {
          const [refilled] = await db.update(powerUps)
            .set({
              quantity: 3, // Weekly allowance
              lastRefillDate: now
            })
            .where(eq(powerUps.id, existing.id))
            .returning();
          refills.push(refilled);
        }
      } else {
        const [newPowerUp] = await db.insert(powerUps)
          .values({
            userId,
            type,
            quantity: 3,
            lastRefillDate: now
          })
          .returning();
        refills.push(newPowerUp);
      }
    }

    return refills;
  }

  async getOrCreateUserProfile(userId: number): Promise<UserProfile> {
    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (existing) {
      return existing;
    }

    const [newProfile] = await db.insert(userProfiles)
      .values({
        userId,
        badges: [],
        preferredTheme: 'light'
      })
      .returning();

    return newProfile;
  }

  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updated] = await db.update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  async awardPerfectQuizAchievement(userId: number): Promise<Achievement | null> {
    // Count how many perfect scores the user has achieved
    const userAnswers = await this.getUserAnswers(userId);
    
    // Group answers by quiz completion (every 3 answers is a complete quiz)
    const completedQuizzes = Math.floor(userAnswers.length / 3);
    let perfectScoreCount = 0;
    
    // Analyze each completed quiz to count perfect scores
    for (let i = 0; i < completedQuizzes; i++) {
      const quizAnswers = userAnswers.slice(i * 3, (i + 1) * 3);
      const isPerfect = quizAnswers.every(a => a.correct);
      if (isPerfect) {
        perfectScoreCount++;
      }
    }
    
    // Count how many perfect score achievements the user already has
    const existingAchievements = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.type, 'perfect_score')
        )
      )
      .orderBy(desc(achievements.milestone));
    
    const currentMilestone = existingAchievements.length > 0 
      ? existingAchievements[0].milestone 
      : 0;
    
    // Should we award a new perfect score achievement?
    // Award if either first achievement or if perfect score count is higher than current milestone
    if (currentMilestone < perfectScoreCount) {
      // Award next perfect score milestone
      const newMilestone = currentMilestone + 1;
      const [achievement] = await db.insert(achievements).values({
        userId,
        type: 'perfect_score',
        milestone: newMilestone,
        name: `Perfect Quiz Master ${newMilestone > 1 ? newMilestone : ''}`,
        description: `Completed ${newMilestone} ${newMilestone > 1 ? 'quizzes' : 'quiz'} with all correct answers!`,
        icon: 'perfect-score',
        badge: `perfect-${newMilestone}`,
        category: 'quiz',
        tier: newMilestone >= 5 ? 'gold' : newMilestone >= 3 ? 'silver' : 'bronze',
        isHighestTier: newMilestone >= 5, // Gold tier is highest tier
        progress: 100
      }).returning();
      
      return achievement;
    }
    
    return null;
  }

  async awardTeamContributionAchievement(
    userId: number,
    contributionType: string
  ): Promise<Achievement | null> {
    try {
      const user = await this.getUser(userId);
      if (!user?.team) return null;

      // Check if user already has this achievement
      const [existingAchievement] = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.userId, userId),
          eq(achievements.type, 'team_contribution'),
          eq(achievements.category, contributionType)
        ));

      if (!existingAchievement) {
        const [achievement] = await db.insert(achievements).values({
          userId,
          type: 'team_contribution',
          category: contributionType,
          name: 'Team Contributor',
          description: `Outstanding contribution to team through ${contributionType}`,
          icon: 'team-contributor',
          earnedAt: new Date()
        }).returning();
        return achievement;
      }

      return null;
    } catch (error) {
      console.error('Error awarding team contribution achievement:', error);
      return null;
    }
  }

  async updateAchievementProgress(
    userId: number,
    achievementType: string,
    progress: number
  ): Promise<void> {
    const [existing] = await db
      .select()
      .from(achievementProgress)
      .where(
        and(
          eq(achievementProgress.userId, userId),
          eq(achievementProgress.achievementType, achievementType)
        )
      );

    if (existing) {
      await db
        .update(achievementProgress)
        .set({
          currentProgress: progress,
          lastUpdated: new Date()
        })
        .where(eq(achievementProgress.id, existing.id));
    } else {
      await db.insert(achievementProgress).values({
        userId,
        achievementType,
        currentProgress: progress,
        targetProgress: 100, // Default target
        lastUpdated: new Date()
      });
    }
  }

  async getHighestTierBadges(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.isHighestTier, true)
        )
      )
      .orderBy(desc(achievements.earnedAt))
      .limit(3); // Get top 3 highest tier badges
  }

  async trackQuizProgress(userId: number, isCorrect: boolean): Promise<void> {
    // Update quiz progress for achievements
    if (isCorrect) {
      const [progress] = await db
        .select()
        .from(achievementProgress)
        .where(
          and(
            eq(achievementProgress.userId, userId),
            eq(achievementProgress.achievementType, 'quiz_mastery')
          )
        );

      if (progress) {
        await this.updateAchievementProgress(
          userId,
          'quiz_mastery',
          progress.currentProgress + 1
        );
      } else {
        await this.updateAchievementProgress(userId, 'quiz_mastery', 1);
      }
    }
  }

  async updateUserProfileShowcase(userId: number, achievementIds: string[]): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({
        showcaseAchievements: achievementIds,
        lastProfileUpdate: new Date()
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  async updateTeamAvatar(userId: number, preference: string, color?: string): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({
        teamAvatarPreference: preference,
        teamAvatarColor: color,
        lastProfileUpdate: new Date()
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  async getHighestTierAchievements(userId: number, limit: number = 3): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(and(
        eq(achievements.userId, userId),
        eq(achievements.isHighestTier, true)
      ))
      .orderBy(desc(achievements.earnedAt))
      .limit(limit);
  }
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    try {
      console.log('Creating feedback in storage:', feedbackData); // Debug log
      
      // Ensure status is set to 'pending' if not provided
      const dataToInsert = {
        ...feedbackData,
        status: feedbackData.status || 'pending',
        createdAt: new Date()
      };
      
      // Try to create the feedback with proper error handling
      try {
        const [newFeedback] = await db
          .insert(feedback)
          .values(dataToInsert)
          .returning();
        
        console.log('Feedback created successfully:', newFeedback); // Debug log
        return newFeedback;
      } catch (e) {
        // If there's an error, check if it's because the table doesn't exist
        if (e instanceof Error && e.message.includes('relation "feedback" does not exist')) {
          console.error('Feedback table does not exist.');
          throw new Error('Feedback table does not exist. Please run database migrations.');
        }
        throw e;
      }
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  async getFeedback(): Promise<Feedback[]> {
    try {
      // This is a safer implementation that handles the case where the table might not exist yet
      try {
        return await db
          .select({
            id: feedback.id,
            userId: feedback.userId,
            content: feedback.content,
            rating: feedback.rating,
            category: feedback.category,
            status: feedback.status,
            createdAt: feedback.createdAt,
            user: {
              username: users.username
            }
          })
          .from(feedback)
          .leftJoin(users, eq(feedback.userId, users.id))
          .orderBy(desc(feedback.createdAt));
      } catch (e) {
        // If table doesn't exist or any other error, return empty array
        console.warn("Feedback table may not exist yet, returning empty array");
        return [];
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }
  async getCurrentWeekQuestions(): Promise<Question[]> {
    const currentWeek = startOfWeek(new Date());
    return this.getQuestionsByWeek(currentWeek);
  }

  async archivePastWeeks(): Promise<void> {
    const currentWeek = startOfWeek(new Date());
    const questions = await this.getQuestions();

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

  async updateQuestion(id: number, questionData: Partial<InsertQuestion>): Promise<Question> {
    try {
      // Make a copy of the question data to modify
      const updatedData: Record<string, any> = { ...questionData };

      // If weekOf is being updated, recalculate the availability dates
      if (updatedData.weekOf) {
        let weekOfDate: Date;
        
        if (typeof updatedData.weekOf === 'string') {
          // Parse date string
          weekOfDate = new Date(updatedData.weekOf);
        } else {
          weekOfDate = new Date(updatedData.weekOf);
        }
        
        // Use our helper function to normalize the date to Monday of the week
        weekOfDate = getWeekMonday(weekOfDate);
        
        // Format the date for PostgreSQL storage to prevent timezone issues
        const formattedWeekOf = formatDateForPg(weekOfDate);
        
        // Get the week status for this date
        const weekStatus = await this.getWeekStatus(weekOfDate);
        
        // Set availableFrom to the selected week's Monday (using UTC-safe approach)
        const availableFrom = getWeekMonday(weekOfDate);
        
        // Set availableUntil to Sunday (using UTC-safe approach)
        const availableUntil = getWeekSunday(weekOfDate);
        
        console.log(`Updating question to week of ${formattedWeekOf} (Monday) with status: ${weekStatus}`);
        console.log(`Question will be available from ${formatDateForPg(availableFrom)} to ${formatDateForPg(availableUntil)}`);
        
        // Update the data with the normalized values
        updatedData.weekOf = formattedWeekOf;
        updatedData.weekStatus = weekStatus as 'past' | 'current' | 'future';
        // Store as Date objects for timestamp columns
        updatedData.availableFrom = availableFrom;
        updatedData.availableUntil = availableUntil;
      }
      
      const [question] = await db
        .update(questions)
        .set(updatedData)
        .where(eq(questions.id, id))
        .returning();
        
      return question;
    } catch (error) {
      console.error("Error updating question:", error);
      throw new Error(`Failed to update question: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getCurrentWeek(): Promise<DimDate> {
    const today = new Date();
    const [currentWeek] = await db
      .select()
      .from(dimDate)
      .where(
        and(
          lte(dimDate.date, today),
          gte(sql`${dimDate.date}::date + INTERVAL '6 days'`, today)
        )
      )
      .orderBy(dimDate.date)
      .limit(1);

    if (!currentWeek) {
      throw new Error('Could not determine current week');
    }

    return currentWeek;
  }

  async getWeekStatus(date: Date): Promise<string> {
    try {
      // Format date as YYYY-MM-DD string for proper PostgreSQL date comparison
      // using our UTC-based formatting to prevent timezone issues
      const formattedDate = formatDateForPg(date);
      console.log(`Getting week status for date: ${formattedDate}`);
      
      const [week] = await db
        .select()
        .from(dimDate)
        .where(eq(dimDate.date, formattedDate));

      if (!week) {
        console.log(`No week found for date ${formattedDate}, defaulting to 'future'`);
        return 'future'; // Default to future if week not found
      }

      console.log(`Found week with identifier: ${week.weekIdentifier}`);
      return week.weekIdentifier.toLowerCase();
    } catch (error) {
      console.error(`Error in getWeekStatus: ${error}`);
      return 'future'; // Default to future on error
    }
  }

  async getQuestionsByWeekStatus(status: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(
        and(
          eq(questions.weekStatus, status.toLowerCase()),
          eq(questions.isArchived, status === 'past'),
          eq(questions.isBonus, false)
        )
      )
      .orderBy(questions.weekOf);
  }

  async updateQuestionWeekStatuses(): Promise<void> {
    const allQuestions = await this.getQuestions();

    for (const question of allQuestions) {
      const weekStatus = await this.getWeekStatus(question.weekOf);

      await db
        .update(questions)
        .set({
          weekStatus,
          isArchived: weekStatus === 'past'
        })
        .where(eq(questions.id, question.id));
    }
  }

  async getAvailableWeeks(): Promise<DimDate[]> {
    try {
      // Use the SQL query provided to get week commencing dates precisely
      // This query handles timezone adjustment correctly
      const result = await db.execute<DimDate>(sql`
        WITH WeeklyTable AS (
          SELECT 
            week,
            week_identifier,
            MAX(date) AS max_date,
            MIN(date) AS week_commencing_date
          FROM 
            dim_date
          GROUP BY 
            week, 
            week_identifier
        ),
        FutureWeeks AS (
          -- Get current week based on current date
          SELECT 
            CURRENT_DATE AS current_date,
            (SELECT week FROM dim_date WHERE date = CURRENT_DATE) AS current_week
        )
        SELECT 
          w.date_id as "dateId",
          wt.week_commencing_date as "date", 
          wt.week,
          wt.week_identifier as "weekIdentifier",
          '' as "dayOfWeek",
          '' as "calendarMonth",
          0 as "financialYear",
          0 as "financialWeek"
        FROM 
          WeeklyTable wt
        JOIN 
          FutureWeeks fw ON wt.week >= fw.current_week
          -- Current week + 3 weeks ahead
          AND wt.week <= (SELECT week FROM dim_date 
                        WHERE date = (SELECT DATE(CURRENT_DATE + INTERVAL '21 days')))
        JOIN
          dim_date w ON w.date = wt.week_commencing_date
        ORDER BY 
          wt.week
      `);
      
      // Ensure result is properly formatted as an array
      const weeks = result?.rows || [];
      
      if (weeks.length === 0) {
        console.warn("No available weeks found from SQL query, falling back to default method");
        
        // Fallback to getting current week + next 3 weeks
        const today = new Date();
        const mondayOfThisWeek = new Date(today);
        mondayOfThisWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        mondayOfThisWeek.setHours(0, 0, 0, 0);
        
        // Generate the next 4 Mondays
        const weekDates: Date[] = [];
        for (let i = 0; i < 4; i++) {
          const monday = new Date(mondayOfThisWeek);
          monday.setDate(mondayOfThisWeek.getDate() + (i * 7));
          weekDates.push(monday);
        }
        
        // Map these dates to the format of DimDate
        return weekDates.map((date, index) => ({
          dateId: index + 1,
          date: date,
          week: date,
          dayOfWeek: 'Monday',
          calendarMonth: date.toLocaleString('default', { month: 'long' }),
          financialYear: date.getFullYear(),
          financialWeek: Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7),
          weekIdentifier: index === 0 ? 'Current' : 'Future'
        }));
      }
      
      return weeks;
    } catch (error) {
      console.error("Error fetching available weeks:", error);
      
      // Fallback to getting current week + next 3 weeks on error
      const today = new Date();
      const mondayOfThisWeek = new Date(today);
      mondayOfThisWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      mondayOfThisWeek.setHours(0, 0, 0, 0);
      
      // Generate the next 4 Mondays
      const weekDates: Date[] = [];
      for (let i = 0; i < 4; i++) {
        const monday = new Date(mondayOfThisWeek);
        monday.setDate(mondayOfThisWeek.getDate() + (i * 7));
        weekDates.push(monday);
      }
      
      // Map these dates to the format of DimDate
      return weekDates.map((date, index) => ({
        dateId: index + 1,
        date: date,
        week: date,
        dayOfWeek: 'Monday',
        calendarMonth: date.toLocaleString('default', { month: 'long' }),
        financialYear: date.getFullYear(),
        financialWeek: Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7),
        weekIdentifier: index === 0 ? 'Current' : 'Future'
      }));
    }
  }

  async createBonusQuestion(question: InsertQuestion & { bonusPoints: number; availableFrom: Date; availableUntil: Date }): Promise<Question> {
    const [newQuestion] = await db
      .insert(questions)
      .values({
        ...question,
        isBonus: true,
        weekStatus: 'current', // Bonus questions are always current
      })
      .returning();

    return newQuestion;
  }

  async getActiveBonusQuestions(): Promise<Question[]> {
    const now = new Date();
    return await db
      .select()
      .from(questions)
      .where(
        and(
          eq(questions.isBonus, true),
          eq(questions.isArchived, false),
          lte(questions.availableFrom, now),
          gte(questions.availableUntil, now)
        )
      )
      .orderBy(questions.availableUntil);
  }

  // App settings methods implementation
  async getSetting(key: string): Promise<string | null> {
    try {
      const [setting] = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, key));
      
      return setting ? setting.value : null;
    } catch (error) {
      console.error(`Error fetching setting [${key}]:`, error);
      return null;
    }
  }
  
  async getAllSettings(): Promise<AppSettings[]> {
    try {
      return await db.select().from(appSettings);
    } catch (error) {
      console.error("Error fetching all settings:", error);
      return [];
    }
  }
  
  async updateSetting(key: string, value: string, userId?: number): Promise<AppSettings> {
    try {
      // Check if setting exists
      const existingSetting = await this.getSetting(key);
      
      if (existingSetting !== null) {
        // Update existing setting
        const [updatedSetting] = await db
          .update(appSettings)
          .set({ 
            value, 
            updatedAt: new Date(),
            updatedBy: userId || null
          })
          .where(eq(appSettings.key, key))
          .returning();
          
        return updatedSetting;
      } else {
        // Create new setting
        const [newSetting] = await db
          .insert(appSettings)
          .values({
            key,
            value,
            description: `Setting created on ${new Date().toISOString()}`,
            updatedAt: new Date(),
            updatedBy: userId || null
          })
          .returning();
          
        return newSetting;
      }
    } catch (error) {
      console.error(`Error updating setting [${key}]:`, error);
      throw new Error(`Failed to update setting: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async getSelectedWeekFilter(): Promise<string | null> {
    return this.getSetting('selected_week_filter');
  }
}

// Helper functions
function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function differenceInDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Normalizes any date to the Monday of its week
 * @param date Date to normalize
 * @returns Date object set to the Monday of the same week
 */
function normalizeToMonday(date: Date): Date {
  const newDate = new Date(date);
  // Set time to start of day to prevent timezone issues
  newDate.setHours(0, 0, 0, 0);
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const day = newDate.getDay();
  
  // Calculate difference to Monday
  // If Sunday (0), go back 6 days, otherwise go back (day - 1) days
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
  
  // Set date to Monday
  newDate.setDate(diff);
  return newDate;
}

/**
 * Formats a date as YYYY-MM-DD string
 * @param date Date to format
 * @returns Formatted date string
 */
function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Checks if a date is a Monday
 * @param date Date to check
 * @returns True if the date is a Monday, false otherwise
 */
function isMonday(date: Date): boolean {
  return date.getDay() === 1; // 1 = Monday in JavaScript
}

function startOfWeek(date: Date): Date {
  return normalizeToMonday(date);
}

function isBefore(date1: Date, date2: Date): boolean {
  return date1 < date2;
}

export const storage = new DatabaseStorage();