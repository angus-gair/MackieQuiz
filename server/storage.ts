import { users, questions, answers, userSessions, pageViews, authEvents, achievements, userStreaks, teamStats, powerUps, userProfiles, type User, type InsertUser, type Question, type InsertQuestion, type Answer, type InsertAnswer, type UserSession, type InsertUserSession, type PageView, type InsertPageView, type AuthEvent, type InsertAuthEvent, type Achievement, type InsertAchievement, type UserStreak, type TeamStat, type PowerUp, type UserProfile, type InsertUserProfile, type AchievementProgress, type InsertAchievementProgress} from "@shared/schema";
import { feedback, type Feedback, type InsertFeedback } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { log } from "./vite";

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
          // Calculate total completed quizzes for achievements
          const totalQuizzes = Math.floor(userAnswers.length / 3);
          log(`User ${answer.userId} has completed ${totalQuizzes} quizzes total`);

          // Explicitly check for first quiz achievement
          if (totalQuizzes === 1) {
            const [firstQuizAchievement] = await db.insert(achievements).values({
              userId: answer.userId,
              type: 'quiz_milestone',
              milestone: 1,
              name: 'First Quiz Complete',
              description: 'Completed your first quiz!',
              icon: 'quiz-1'
            }).returning();
            log(`Created first quiz achievement for user ${answer.userId}`);
          }

          // Check for other milestone achievements (3, 5, 7, 10)
          const milestones = [3, 5, 7, 10];
          if (milestones.includes(totalQuizzes)) {
            const [achievement] = await db.insert(achievements).values({
              userId: answer.userId,
              type: 'quiz_milestone',
              milestone: totalQuizzes,
              name: `${totalQuizzes} Quizzes Complete!`,
              description: `You've completed ${totalQuizzes} quizzes!`,
              icon: `quiz-${totalQuizzes}`
            }).returning();
            log(`Created ${totalQuizzes} quiz milestone achievement for user ${answer.userId}`);
          }

        } catch (err) {
          log(`Error creating achievements: ${err}`);
        }

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

        try {
          //Check for perfect quiz completion
          if (todaysAnswers.length % 3 === 0) {
            const latestQuizAnswers = todaysAnswers.slice(-3);
            const isPerfectQuiz = latestQuizAnswers.every(a => a.correct);
            if (isPerfectQuiz) {
              await this.awardPerfectQuizAchievement(answer.userId);
            }

            //Check for team contribution
            const user = await this.getUser(answer.userId);
            if (user?.team) {
              await this.awardTeamContributionAchievement(answer.userId, 'Quiz');
            }
          }
        } catch (error) {
          console.error('Error in achievement tracking:', error);
        }
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



  private async checkMilestoneAchievement(userId: number, quizCount: number): Promise<Achievement | null> {
    const milestones = [1, 3, 5, 7, 10];
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

    const milestoneAchievement = await this.checkMilestoneAchievement(userId, quizCount);
    if (milestoneAchievement) {
      newAchievements.push(milestoneAchievement);
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
    const [existing] = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.type, 'perfect_score')
        )
      );

    if (!existing) {
      const [achievement] = await db.insert(achievements).values({
        userId,
        type: 'perfect_score',
        milestone: 1,
        name: 'Perfect Quiz Master',
        description: 'Completed a quiz with all correct answers!',
        icon: 'perfect-score',
        badge: 'perfect-1',
        category: 'quiz',
        tier: 'gold',
        isHighestTier: true
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
      const [newFeedback] = await db
        .insert(feedback)
        .values({
          ...feedbackData,
          createdAt: new Date()
        })
        .returning();
      console.log('Feedback created successfully:', newFeedback); // Debug log
      return newFeedback;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  async getFeedback(): Promise<Feedback[]> {
    try {
      return await db
        .select({
          id: feedback.id,
          userId: feedback.userId,
          content: feedback.content,
          rating: feedback.rating,
          category: feedback.category,
          createdAt: feedback.createdAt,
          user: {
            username: users.username
          }
        })
        .from(feedback)
        .leftJoin(users, eq(feedback.userId, users.id))
        .orderBy(desc(feedback.createdAt));
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
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

export const storage = new DatabaseStorage();