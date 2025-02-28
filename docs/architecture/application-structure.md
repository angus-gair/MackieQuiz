# Application Structure Visual Guide

## Lucid Chart Import Files

The following CSV files can be imported into Lucid Chart to create professional diagrams:

1. [Application Architecture](./lucidchart_app_architecture.csv) - Overall application architecture
2. [Database Schema](../database/lucidchart_database_schema.csv) - Database entities and relationships
3. [Authentication Flow](./lucidchart_auth_flow.csv) - User authentication process
4. [Quiz Flow](./lucidchart_quiz_flow.csv) - Quiz submission and processing flow
5. [Admin Dashboard](./lucidchart_admin_structure.csv) - Admin interface structure

### How to Import into Lucid Chart:

1. Log in to your Lucid Chart account
2. Create a new diagram
3. Click on "File" > "Import" > "Import from CSV"
4. Select one of the CSV files above
5. Configure the diagram settings as needed
6. Click "Import"

The CSV files are structured to automatically create flowcharts, entity-relationship diagrams, or other appropriate visualizations based on the content.

## Directory Structure

```
project-root/
│
├── client/                # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # Base UI components (shadcn)
│   │   │   ├── admin/     # Admin-specific components
│   │   │   └── ...        # Other custom components
│   │   │
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── use-auth.tsx       # Authentication hook
│   │   │   ├── use-toast.ts       # Toast notifications hook
│   │   │   └── use-cache-settings.tsx # Cache configuration hook
│   │   │
│   │   ├── lib/           # Utility functions
│   │   │   ├── admin-route.tsx    # Admin route protection
│   │   │   ├── protected-route.tsx # Auth route protection
│   │   │   ├── queryClient.ts     # API and query configuration
│   │   │   └── utils.ts           # General utilities
│   │   │
│   │   ├── pages/         # Application pages
│   │   │   ├── admin/            # Admin pages
│   │   │   ├── user/             # User-specific pages
│   │   │   ├── shared/           # Shared pages
│   │   │   └── ...               # General pages
│   │   │
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Application entry point
│   │
│   └── index.html         # HTML template
│
├── server/                # Backend Express application
│   ├── auth.ts            # Authentication configuration
│   ├── db.ts              # Database connection setup
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API endpoint definitions
│   ├── storage.ts         # Data access layer
│   ├── vite.ts            # Vite integration for development
│   └── utils/             # Helper utilities
│       ├── date-handlers.ts # Date formatting utilities
│       └── email.ts        # Email notification system
│
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and type definitions
│
├── docs/                  # Documentation
│   ├── architecture/      # Architecture documentation
│   ├── backend/           # Backend documentation
│   ├── database/          # Database documentation
│   ├── frontend/          # Frontend documentation
│   ├── testing/           # Testing documentation
│   ├── archive/           # Historical documents
│   └── README.md          # Main documentation entry point
│
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # Project dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── theme.json             # UI theme configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

## Component and Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
│                                                                  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │      Router     │   │     Context     │   │    Components   │ │
│  │    (Wouter)     │◄─►│    Providers    │◄─►│    (Shadcn)     │ │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘ │
│                                                                  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │   Form Logic    │   │   Data Fetch    │   │      Utils      │ │
│  │  (React Hook)   │◄─►│    (Query)      │◄─►│                 │ │
│  └─────────────────┘   └────────┬────────┘   └─────────────────┘ │
│                                  │                                │
└──────────────────────────────────┼────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express.js REST API                          │
│                                                                  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │     Routes      │   │    Storage      │   │  Authentication │ │
│  │                 │◄─►│    Interface    │◄─►│   (Passport)    │ │
│  └─────────────────┘   └────────┬────────┘   └─────────────────┘ │
│                                  │                                │
└──────────────────────────────────┼────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database                        │
│                                                                  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │    User Data    │   │    Questions    │   │  Analytics Data │ │
│  │                 │◄─►│    & Answers    │◄─►│                 │ │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Login Form │────►│ Auth Context│────►│  Passport   │────►│ User Session│
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       ▲                                                           │
       │                                                           │
       │                                                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│Protected    │◄────│Route Guards │◄────│ Auth Status │◄────│Database User│
│Routes       │     │             │     │ Check       │     │Record       │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Quiz Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│Weekly Quiz  │────►│User Answers │────►│Score        │────►│Achievement  │
│Questions    │     │Submission   │     │Calculation  │     │Check        │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│Result       │◄────│Streak       │◄────│Team Stats   │◄────│Leaderboard  │
│Display      │     │Update       │     │Update       │     │Update       │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Admin Dashboard Structure

```
┌───────────────────────────────────────────────────────────────┐
│                        Admin Dashboard                         │
│                                                               │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │   Question  │   │    User     │   │ Achievement │          │
│  │ Management  │   │ Management  │   │ Management  │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                               │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │  Analytics  │   │  Archived   │   │ Deployment  │          │
│  │  Dashboard  │   │  Questions  │   │ Checklist   │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│     Users     │◄───►│  Achievements │◄───►│ Achievement   │
│               │     │               │     │   Progress    │
└───────┬───────┘     └───────────────┘     └───────────────┘
        │
        │
┌───────▼───────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│   Answers     │◄───►│   Questions   │◄───►│    DimDate    │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
        ▲
        │
┌───────┴───────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  UserStreaks  │◄───►│   TeamStats   │◄───►│   PowerUps    │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
        ▲
        │
┌───────┴───────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│ UserProfiles  │     │ UserSessions  │◄───►│   PageViews   │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```