# Frontend Documentation

## Overview

The frontend of the Business Knowledge Enhancement Platform is built with React, TypeScript, and Vite. It follows a component-based architecture with a mobile-first responsive design approach.

## Core Technologies

- **React**: UI library for building component-based interfaces
- **TypeScript**: Type-safe JavaScript superset
- **Vite**: Fast, modern frontend build tool
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn/UI**: Component library built on Radix UI primitives
- **TanStack Query**: Data fetching and cache management
- **Wouter**: Lightweight routing solution
- **React Hook Form**: Form state and validation management
- **Zod**: Schema validation library

## Application Structure

The frontend code is organized in a feature-based structure:

```
client/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # Base UI components from shadcn
│   │   └── ...         # Custom components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and configurations
│   ├── pages/          # Application pages/views
│   │   ├── admin/      # Admin-specific pages
│   │   ├── user/       # User-specific pages
│   │   └── ...         # General pages
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
└── index.html          # HTML template
```

## Routing

The application uses Wouter for client-side routing with the following main routes:

### Public Routes
- `/`: Welcome page
- `/auth`: Authentication page (login/register)

### Protected Routes (require authentication)
- `/home`: User home dashboard
- `/quiz`: Weekly quiz page
- `/quiz-completion`: Quiz completion page
- `/profile`: User profile page
- `/settings`: User settings page
- `/leaderboard`: Leaderboard display
- `/teams`: Team information and selection

### Admin Routes (require admin privileges)
- `/admin`: Admin dashboard
- `/admin/questions`: Question management
- `/admin/questions/archived`: Archived questions
- `/admin/users`: User and team management
- `/admin/achievements`: Achievement management
- `/admin/deployment-checklist`: Deployment tasks

## Components

### Core UI Components

The application uses Shadcn/UI component library, which provides a set of accessible, customizable components built on Radix UI primitives. Some key components include:

- **Button**: Various button styles and variants
- **Card**: Container for content
- **Form**: Form components with validation
- **Dialog**: Modal dialogs
- **Tabs**: Tabbed interfaces
- **Toast**: Notification system
- **Accordion**: Collapsible content sections
- **Avatar**: User avatar displays

### Custom Components

Custom components built specifically for the application:

- **HeaderNav**: Top navigation bar
- **BottomNav**: Mobile bottom navigation
- **AdminLayout**: Layout wrapper for admin pages
- **AchievementNotification**: Achievement popup display
- **GeographicHeatMap**: Visual representation of geographic data
- **FeedbackForm**: User feedback submission form

## State Management

The application uses a combination of state management approaches:

1. **Local Component State**: `useState` for component-specific state
2. **Context API**: Global state shared across components
3. **TanStack Query**: Server state management with caching

### Key Context Providers

- **AuthContext**: User authentication state and methods
- **CacheContext**: Cache configuration settings

## Data Fetching

Data fetching is handled primarily through TanStack Query:

1. **Query Hooks**: For fetching data (`useQuery`)
2. **Mutation Hooks**: For updating data (`useMutation`)
3. **Optimistic Updates**: For immediate UI feedback during mutations
4. **Cache Invalidation**: For refreshing data when updates occur

Example query pattern:
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/questions/weekly'],
  queryFn: () => apiRequest('/api/questions/weekly', { method: 'GET' })
});
```

Example mutation pattern:
```tsx
const mutation = useMutation({
  mutationFn: async (answer: InsertAnswer) => {
    return apiRequest('/api/answers', {
      method: 'POST',
      body: JSON.stringify(answer)
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/answers'] });
    toast({ title: "Answer submitted successfully" });
  },
  onError: (error) => {
    toast({ 
      title: "Failed to submit answer", 
      description: error.message,
      variant: "destructive" 
    });
  }
});
```

## Forms

Forms are built using React Hook Form with Zod validation:

1. **Form Definition**: Using `useForm` hook with Zod resolver
2. **Validation Schemas**: Based on Drizzle Zod schemas
3. **Form Submission**: Handling submission with mutations
4. **Error Messages**: Displaying validation errors to users

Example form pattern:
```tsx
const form = useForm<InsertUser>({
  resolver: zodResolver(insertUserSchema),
  defaultValues: {
    username: '',
    password: '',
    isAdmin: false
  }
});

const onSubmit = (data: InsertUser) => {
  mutation.mutate(data);
};
```

## Authentication Flow

The authentication flow is managed through custom hooks and context:

1. **Login**: POST to `/api/login` with credentials
2. **Registration**: POST to `/api/register` with user details
3. **Logout**: POST to `/api/logout` to end session
4. **Auth State**: Global auth state stored in AuthContext
5. **Protected Routes**: HOC wrapper that redirects unauthenticated users

## Mobile-First Design

The UI is designed with a mobile-first approach:

1. **Responsive Layout**: TailwindCSS responsive utility classes
2. **Touch Interactions**: Optimized for touch input
3. **Bottom Navigation**: Mobile-specific navigation pattern
4. **Media Queries**: Content adaptation for different screen sizes

## Theming and Styling

The application uses a consistent theming approach:

1. **Theme Configuration**: `theme.json` defines primary colors and UI preferences
2. **TailwindCSS**: Utility classes for rapid styling
3. **CSS Variables**: Design tokens defined as CSS variables
4. **Component Variants**: Consistent component variations with `cva`

## Error Handling

Error handling is implemented consistently across the frontend:

1. **API Error Handling**: Centralized error handling for API requests
2. **Form Validation Errors**: Displayed inline with form fields
3. **Toast Notifications**: User-friendly error messages via toast
4. **Error Boundaries**: Catch rendering errors in components

## Performance Optimizations

Several performance optimizations are implemented:

1. **Code Splitting**: Lazy loading of components
2. **Memoization**: React.memo for expensive renders
3. **Virtualization**: For long lists (especially on mobile)
4. **Optimistic Updates**: For better perceived performance
5. **Query Caching**: To reduce unnecessary network requests

## Accessibility

Accessibility features include:

1. **Semantic HTML**: Proper use of semantic elements
2. **ARIA Attributes**: For complex interactive components
3. **Keyboard Navigation**: Full keyboard support
4. **Focus Management**: Proper focus handling
5. **Color Contrast**: Sufficient contrast ratios

## Testing Considerations

The frontend is designed with testability in mind:

1. **Component Tests**: Individual component testing
2. **Integration Tests**: Testing component interactions
3. **E2E Tests**: Testing full user flows
4. **Test IDs**: Data attributes for test selection

## Build and Deployment

The frontend build process:

1. **Development Server**: `npm run dev` starts both backend and frontend
2. **Production Build**: `npm run build` creates optimized production build
3. **Static Assets**: Served from the `client/public` directory
4. **Bundle Optimization**: Code splitting and tree shaking