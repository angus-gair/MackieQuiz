# Database Documentation

## Overview

The Business Knowledge Enhancement Platform uses PostgreSQL as its relational database system. The database schema is managed through Drizzle ORM, which provides type-safe schema definitions and query builders.

## Schema Structure

The database schema is defined in `shared/schema.ts` and includes the following key tables:

### Core Tables

#### Users
Stores user information including authentication details and team assignments.
```typescript
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
```

#### Questions
Stores quiz questions with correct answers, options, and metadata.
```typescript
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: text("options").array().notNull(),
  category: text("category").notNull(),
  explanation: text("explanation").notNull(),
  weekOf: date("week_of").notNull(),
  isArchived: boolean("is_archived").notNull().default(false),
  weekStatus: text("week_status", { enum: weekStatus }).notNull().default('future'),
  isBonus: boolean("is_bonus").notNull().default(false),
  bonusPoints: integer("bonus_points").notNull().default(10),
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
});
```

#### Answers
Records user answers to questions.
```typescript
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  answer: text("answer").notNull(),
  correct: boolean("correct").notNull(),
  answeredAt: timestamp("answered_at").notNull().defaultNow(),
});
```

### Gamification Tables

#### Achievements
Tracks user achievements and badges.
```typescript
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  milestone: integer("milestone").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  badge: text("badge").notNull(),
  progress: integer("progress").notNull().default(0),
  category: text("category"),
  tier: text("tier").notNull().default('bronze'),
  isHighestTier: boolean("is_highest_tier").notNull().default(false),
});
```

#### User Streaks
Tracks user engagement streaks.
```typescript
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastQuizDate: date("last_quiz_date"),
  weeklyQuizzesTaken: integer("weekly_quizzes_taken").notNull().default(0),
});
```

#### Power-Ups
Manages user power-ups for quiz assistance.
```typescript
export const powerUps = pgTable("power_ups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull().default(0),
  lastRefillDate: timestamp("last_refill_date"),
});
```

### Team-Related Tables

#### Team Stats
Stores aggregated team performance metrics.
```typescript
export const teamStats = pgTable("team_stats", {
  id: serial("id").primaryKey(),
  teamName: text("team_name").notNull(),
  weekWins: integer("week_wins").notNull().default(0),
  currentWinStreak: integer("current_win_streak").notNull().default(0),
  longestWinStreak: integer("longest_win_streak").notNull().default(0),
  lastWinDate: date("last_win_date"),
  totalScore: integer("total_score").notNull().default(0),
});
```

### Analytics Tables

#### User Sessions
Tracks user session information.
```typescript
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
```

#### Page Views
Records page view analytics.
```typescript
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  userId: integer("user_id").notNull(),
  path: text("path").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  timeSpent: integer("time_spent"),
  isError: boolean("is_error").default(false),
});
```

#### Auth Events
Tracks authentication-related events.
```typescript
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
```

### Utility Tables

#### Dim Date
Dimensional date table for time-based analytics.
```typescript
export const dimDate = pgTable("dim_date", {
  dateId: serial("date_id").primaryKey(),
  date: date("date").notNull(),
  week: date("week").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  calendarMonth: text("calendar_month").notNull(),
  financialYear: integer("financial_year").notNull(),
  financialWeek: integer("financial_week").notNull(),
  weekIdentifier: text("week_identifier").notNull()
});
```

## Table Relationships

The schema defines several important relationships between tables:

1. **Users to Achievements**: One-to-many relationship where a user can have multiple achievements
2. **Questions to Dim Date**: Relationship between questions and their associated week
3. **Users to Answers**: One-to-many relationship where a user can provide multiple answers

## Schema Management

The database schema is managed using Drizzle ORM with the following operations:

1. **Schema Definition**: Defined in `shared/schema.ts`
2. **Migrations**: Generated and applied using Drizzle Kit
3. **Schema Push**: Applied using `npm run db:push` for development

## Type Safety

The schema is designed with TypeScript type safety in mind:

1. **Insert Schemas**: Created using `createInsertSchema` from Drizzle Zod
2. **Select Types**: Generated using table inference `typeof table.$inferSelect`
3. **Validation**: Schema validation using Zod

## Data Access Layer

The database is accessed through a storage interface that abstracts database operations:

1. **Interface Definition**: `IStorage` interface defined in `server/storage.ts`
2. **Implementation**: `DatabaseStorage` class implements the interface
3. **Connection Pool**: PostgreSQL connection pooling for efficient connections

## Common Database Operations

The storage interface provides methods for common operations:

1. **User Management**: CRUD operations for users
2. **Question Management**: Creating, reading, and archiving questions
3. **Answer Submission**: Recording user answers
4. **Analytics**: Methods for retrieving analytics data
5. **Achievement Tracking**: Methods for awarding and tracking achievements

## Timezone Handling

The application is configured to handle dates and times in Australia/Sydney (AEDT) timezone:

1. **Date Storage**: Dates stored in UTC in the database
2. **Date Formatting**: Utility functions in `server/utils/date-handlers.ts` for consistent formatting
3. **Week Calculation**: Helper functions for determining the start of each week

## Database Indexing

Key fields are indexed for performance:

1. **Primary Keys**: Auto-incrementing serial fields
2. **Foreign Keys**: Relationships between tables
3. **Common Query Fields**: Fields frequently used in WHERE clauses

## Database Security

Database security is implemented through multiple layers:

1. **Password Hashing**: User passwords are hashed before storage
2. **Connection Security**: Secure database connection string
3. **Query Parameters**: Parameterized queries to prevent SQL injection
4. **Access Control**: Database operations restricted by user roles