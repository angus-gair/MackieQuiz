# Business Knowledge Enhancement Platform

## Overview

This document provides a comprehensive high-level overview of the Business Knowledge Enhancement Platform. This platform is designed to help organizations and teams enhance their business knowledge through interactive quizzes, leaderboards, achievements, and analytics.

## Purpose

The primary purpose of this application is to:

1. Deliver business knowledge enhancement through interactive weekly quizzes
2. Foster healthy competition between teams with leaderboards and achievements
3. Track user progress and engagement with comprehensive analytics
4. Provide administrative tools for content management and system monitoring

## Tech Stack

The application uses a modern full-stack JavaScript architecture with:

- **Frontend**: React with TypeScript, Vite, and TailwindCSS
- **Backend**: Express.js server with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **State Management**: React Context API and TanStack Query
- **UI Components**: Shadcn/UI component library
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Email Integration**: SendGrid
- **Time Management**: Date-fns with timezone support for AEDT (Australia/Sydney)

## Key Features

1. **User Authentication**: Secure login and registration system with role-based access control
2. **Weekly Quizzes**: Time-bound weekly quizzes with automatic rotation
3. **Team Management**: User assignment to teams with team-based performance tracking
4. **Achievement System**: Gamification through badges, streaks, and milestones
5. **Responsive Design**: Mobile-first approach for all device compatibility
6. **Admin Dashboard**: Comprehensive admin tools for content management
7. **Analytics**: Detailed usage statistics and performance metrics
8. **Timezone Management**: Support for Australia/Sydney timezone (AEDT)

## Application Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Application pages
│
├── server/                # Backend Express application
│   ├── auth.ts            # Authentication configuration
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data access layer
│   └── utils/             # Helper utilities
│
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and type definitions
│
└── docs/                  # Documentation
    ├── architecture/      # Architecture documentation
    ├── backend/           # Backend documentation
    ├── database/          # Database documentation
    └── frontend/          # Frontend documentation
```

## Critical Design Points

1. **Database Schema**: The application uses a well-defined schema with proper relations between entities
2. **Authentication Flow**: Users authenticate through a secure Passport.js implementation
3. **Weekly Cycle**: Questions operate on a weekly cycle with automatic archiving of past questions
4. **Mobile-First**: UI is designed for mobile users first, then adapts to larger screens
5. **Performance**: Client-side caching through TanStack Query with configurable settings
6. **Error Handling**: Comprehensive error handling and validation at all levels
7. **Analytics Tracking**: User session and activity tracking for analytics purposes

## Documentation Structure

For more detailed documentation, please refer to:

- [Architecture Overview](./architecture/README.md)
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Database Documentation](./database/README.md)