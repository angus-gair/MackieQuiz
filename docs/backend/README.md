# Backend Documentation

## Overview

The backend of the Business Knowledge Enhancement Platform is built with Express.js, a minimal and flexible Node.js web application framework. It provides a robust set of features for building APIs and web applications.

## Core Components

### Server Setup

The main server setup is located in `server/index.ts`. It initializes the Express application, sets up middleware, registers routes, and starts the HTTP server.

Key components:
- Express application initialization
- Middleware configuration
- Error handling setup
- HTTP server creation

### API Routes

Routes are defined in `server/routes.ts` and implement the RESTful API endpoints for the application. The main route categories include:

1. **Authentication Routes**
   - Login (`POST /api/login`)
   - Register (`POST /api/register`)
   - Logout (`POST /api/logout`)

2. **User Routes**
   - Get users (`GET /api/users`)
   - Update user (`PATCH /api/users/:id`)
   - Delete user (`DELETE /api/users/:id`)

3. **Question Routes**
   - Get questions (`GET /api/questions`)
   - Create question (`POST /api/questions`)
   - Delete question (`DELETE /api/questions/:id`)
   - Get weekly questions (`GET /api/questions/weekly`)
   - Get questions by week (`GET /api/questions/weekly/:date`)
   - Get archived questions (`GET /api/questions/archived`)
   - Archive question (`POST /api/questions/:id/archive`)

4. **Answer Routes**
   - Submit answer (`POST /api/answers`)
   - Get user answers (`GET /api/answers`)

5. **Analytics Routes**
   - Get team stats (`GET /api/analytics/teams`)
   - Get daily stats (`GET /api/analytics/daily`)
   - Get team knowledge stats (`GET /api/analytics/team-knowledge`)
   - Get session analytics (`GET /api/analytics/sessions`)
   - Get page view analytics (`GET /api/analytics/pageviews`)
   - Get auth analytics (`GET /api/analytics/auth`)

6. **Achievement Routes**
   - Get user achievements (`GET /api/achievements`)
   - Get latest achievement (`GET /api/achievements/latest`)
   - Get admin achievements (`GET /api/admin/achievements`)

7. **Miscellaneous Routes**
   - Assign team (`POST /api/assign-team`)
   - Submit feedback (`POST /api/feedback`)
   - Get/update cache settings (`GET/POST /api/admin/cache-settings`)

### Authentication System

Authentication is implemented in `server/auth.ts` using Passport.js with a local strategy. Key features include:

- Password hashing with bcrypt
- Session-based authentication
- User serialization/deserialization
- Login and registration logic

### Storage Interface

The storage interface (`server/storage.ts`) provides an abstraction layer between the API routes and the database. It implements the `IStorage` interface with methods for all data operations.

Main categories of storage operations:

1. **User Management**
   - `getUser(id)`
   - `getUserByUsername(username)`
   - `createUser(user)`
   - `updateUser(id, user)`
   - `deleteUser(id)`

2. **Quiz Management**
   - `getQuestions()`
   - `getDailyQuestions()`
   - `createQuestion(question)`
   - `deleteQuestion(id)`
   - `archiveQuestion(id)`

3. **Answer Management**
   - `submitAnswer(answer)`
   - `getUserAnswers(userId)`

4. **Analytics**
   - `getLeaderboard()`
   - `getTeamStats()`
   - `getDailyStats()`
   - `getTeamKnowledge()`
   - `getSessionAnalytics()`
   - `getPageViewAnalytics()`
   - `getAuthEventAnalytics()`

5. **Achievement System**
   - `createAchievement(achievement)`
   - `getUserAchievements(userId)`
   - `checkAndAwardAchievements(userId)`

6. **User Engagement**
   - `getOrCreateUserStreak(userId)`
   - `updateUserStreak(userId, completed)`
   - `getUserPowerUps(userId)`
   - `usePowerUp(userId, type)`

### Database Connection

Database connection is managed in `server/db.ts`, which sets up a connection pool to the PostgreSQL database using the connection string from environment variables.

```typescript
export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
```

### Middleware

Several middleware components are used throughout the application:

1. **Authentication Middleware**: Ensures users are authenticated before accessing protected routes
2. **Analytics Middleware**: Tracks user sessions and page views
3. **Error Handling Middleware**: Provides consistent error responses
4. **Rate Limiting**: Prevents abuse of the API

### Utility Functions

Utility functions are organized in the `server/utils` directory:

1. **Date Handlers**: Functions for formatting and parsing dates with timezone support
2. **Email Handling**: Email notification system using SendGrid

## API Endpoints

### User Authentication

```
POST /api/login
- Request: { username, password }
- Response: User object

POST /api/register
- Request: { username, password, [team], [isAdmin] }
- Response: User object

POST /api/logout
- Response: 200 OK
```

### User Management

```
GET /api/users
- Response: Array of User objects

PATCH /api/users/:id
- Request: Partial User object
- Response: Updated User object

DELETE /api/users/:id
- Response: 200 OK
```

### Quiz Management

```
GET /api/questions
- Response: Array of Question objects

POST /api/questions
- Request: { question, correctAnswer, options, category, explanation, weekOf }
- Response: Created Question object

DELETE /api/questions/:id
- Response: 200 OK

GET /api/questions/weekly
- Response: Array of current week's Question objects

GET /api/questions/weekly/:date
- Response: Array of Question objects for the specified week

GET /api/questions/archived
- Response: Array of archived Question objects

POST /api/questions/:id/archive
- Response: 200 OK

PATCH /api/questions/:id
- Request: Partial Question object
- Response: Updated Question object
```

### Quiz Interaction

```
POST /api/answers
- Request: { questionId, answer }
- Response: Answer object with correct/incorrect status

GET /api/answers
- Response: Array of user's Answer objects
```

### Analytics

```
GET /api/leaderboard
- Response: Array of User objects sorted by score

GET /api/analytics/teams
- Response: Array of team statistics objects

GET /api/analytics/daily
- Response: Array of daily quiz completion statistics

GET /api/analytics/team-knowledge
- Response: Array of team knowledge score time series data

GET /api/analytics/sessions
- Response: Session analytics statistics

GET /api/analytics/pageviews
- Response: Page view analytics statistics

GET /api/analytics/auth
- Response: Authentication event analytics
```

### Achievements and Gamification

```
GET /api/achievements
- Response: Array of user's Achievement objects

GET /api/achievements/latest
- Response: Latest earned Achievement object or null

GET /api/admin/achievements
- Response: Array of all Achievement objects across users
```

## Error Handling

The application implements a consistent error handling strategy:

- HTTP status codes for different error types
- Error messages in JSON format
- Validation errors with field-specific messages
- Server errors with appropriate logging

Example error response structure:
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    "field": "Field-specific error details"
  }
}
```

## Configuration

Configuration is managed through environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 5000)
- `SESSION_SECRET`: Secret for session encryption
- `NODE_ENV`: Environment (development/production)

## Performance Considerations

The backend implements several performance optimizations:

1. **Database Connection Pooling**: Reuse connections for better performance
2. **Caching**: Configurable cache settings for API responses
3. **Efficient Queries**: Optimized database queries
4. **Middleware Order**: Carefully ordered middleware for efficiency
5. **Async/Await**: Proper use of async/await for non-blocking operations

## Security Measures

Security features implemented in the backend:

1. **Password Hashing**: Secure password storage with bcrypt
2. **Input Validation**: Validation of all user inputs with Zod
3. **Session Security**: Secure session handling
4. **SQL Injection Prevention**: Parameterized queries
5. **Rate Limiting**: Protection against brute force attacks
6. **Authentication Checks**: Consistent auth checking for protected routes