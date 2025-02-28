# Testing Guide

## Overview

This document provides guidelines for implementing automated testing for the Business Knowledge Enhancement Platform. It outlines testing strategies, tools, and approaches for different parts of the application.

## Testing Pyramid

We recommend following the testing pyramid approach:

```
    /\
   /  \
  /    \
 / E2E  \
/--------\
/  Integration \
/--------------\
/     Unit      \
/----------------\
```

- **Unit Tests**: Numerous tests for individual functions and components
- **Integration Tests**: Tests for interaction between components
- **End-to-End Tests**: A smaller number of tests for critical user flows

## Unit Testing

### Frontend Unit Testing

For testing React components and hooks:

1. **Testing Library**: React Testing Library
2. **Test Runner**: Vitest
3. **Mocking**: Jest mocking or MSW (Mock Service Worker)

Key areas to test:
- UI Components (rendering, interactions)
- Custom Hooks (state changes, side effects)
- Utility Functions (pure functions)
- Context Providers (state management)

Example component test:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Backend Unit Testing

For testing backend functions and utilities:

1. **Testing Framework**: Vitest or Jest
2. **Database**: In-memory database or test database
3. **Mocking**: Mock external services

Key areas to test:
- Utility Functions
- Data Transformations
- Schema Validations
- Route Handlers (with mocked dependencies)

Example backend test:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatDateForPg, parseDateFromPg } from '../utils/date-handlers';

describe('Date Handlers', () => {
  it('formats date for PostgreSQL correctly', () => {
    const date = new Date('2023-01-15T12:00:00Z');
    expect(formatDateForPg(date)).toBe('2023-01-15');
  });

  it('parses date from PostgreSQL correctly', () => {
    expect(parseDateFromPg('2023-01-15')).toBe('2023-01-15');
  });
});
```

## Integration Testing

Integration tests verify that different parts of the application work together correctly.

### API Integration Tests

Testing API endpoints with actual database interactions:

1. **Testing Framework**: Supertest with Vitest/Jest
2. **Database**: Test database (isolated from production)
3. **Setup/Teardown**: Initialize and clean up database between tests

Key flows to test:
- Authentication (login, register, logout)
- Quiz Operations (create, submit answers)
- User Management (create, update, delete)
- Team Operations (assign team, get stats)

Example API test:
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { db } from '../db';

describe('Question API', () => {
  let authCookie: string;
  
  beforeAll(async () => {
    // Login to get authentication cookie
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'password' });
    authCookie = res.headers['set-cookie'][0];
  });
  
  beforeEach(async () => {
    // Clean up test database
    await db.delete(questions);
  });
  
  it('creates a new question', async () => {
    const question = {
      question: 'Test question?',
      correctAnswer: 'Correct',
      options: ['Wrong', 'Correct', 'Also wrong'],
      category: 'Test',
      explanation: 'This is a test',
      weekOf: '2023-01-15'
    };
    
    const res = await request(app)
      .post('/api/questions')
      .set('Cookie', authCookie)
      .send(question);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.question).toBe(question.question);
  });
});
```

### Frontend Integration Tests

Testing interactions between components:

1. **Testing Library**: React Testing Library
2. **Mocking**: MSW for API mocking
3. **Test Runner**: Vitest

Key areas to test:
- Page Flows (e.g., quiz completion flow)
- Form Submissions with API Interactions
- Authentication Flows
- Complex UI Interactions

Example frontend integration test:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import AuthPage from '@/pages/auth-page';
import { server } from '../mocks/server';
import { rest } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Authentication Flow', () => {
  it('allows user to login successfully', async () => {
    server.use(
      rest.post('/api/login', (req, res, ctx) => {
        return res(ctx.json({ id: 1, username: 'testuser' }));
      })
    );
    
    render(
      <QueryClientProvider client={queryClient}>
        <AuthPage />
      </QueryClientProvider>
    );
    
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

End-to-end tests verify complete user flows work correctly.

### Tools and Setup

1. **Testing Framework**: Playwright or Cypress
2. **Browser Coverage**: Test across Chrome, Firefox, Safari
3. **Test Database**: Isolated test database with pre-loaded fixtures

### Key User Flows to Test

1. **Authentication Flow**
   - Registration
   - Login
   - Password Reset

2. **Quiz Flow**
   - Taking a weekly quiz
   - Submitting answers
   - Viewing results

3. **Admin Flows**
   - Creating questions
   - Managing users
   - Viewing analytics

4. **Team Flows**
   - Joining a team
   - Viewing team leaderboard
   - Team progress tracking

Example E2E test (Playwright):
```typescript
import { test, expect } from '@playwright/test';

test('user can login and take a quiz', async ({ page }) => {
  // Login
  await page.goto('/auth');
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Verify login success
  await expect(page).toHaveURL('/home');
  await expect(page.locator('h1')).toContainText('Welcome');
  
  // Navigate to quiz
  await page.click('a[href="/quiz"]');
  await expect(page).toHaveURL('/quiz');
  
  // Take quiz
  await page.click('.quiz-option', { position: 0 });
  await page.click('button:has-text("Submit")');
  
  // Verify completion
  await expect(page).toHaveURL('/quiz-completion');
  await expect(page.locator('h2')).toContainText('Results');
});
```

## API Testing

Dedicated API testing ensures the backend works correctly independently of the frontend.

### Tools and Approach

1. **Testing Tool**: Postman, Insomnia, or Supertest
2. **Test Structure**: Organized by resource and operation
3. **Environment Config**: Test config with isolation from production

### API Test Coverage

Ensure coverage for:
- All HTTP methods (GET, POST, DELETE, etc.)
- Happy paths and error paths
- Edge cases (empty responses, pagination, etc.)
- Authentication requirements

Example Postman Collection structure:
```
- Authentication
  - Login
  - Register
  - Logout
- Questions
  - Get Questions
  - Create Question
  - Delete Question
  - Archive Question
- Answers
  - Submit Answer
  - Get User Answers
- Users
  - Get Users
  - Update User
  - Delete User
```

## Performance Testing

Performance testing ensures the application meets performance requirements.

### Areas to Test

1. **Page Load Performance**
   - Initial load time
   - Time to interactive
   - First contentful paint

2. **API Response Times**
   - Response time for critical endpoints
   - Response under load

3. **Rendering Performance**
   - Component rendering time
   - Scroll performance
   - Animation smoothness

### Tools

1. **Lighthouse**: Web performance auditing
2. **WebPageTest**: Detailed performance analysis
3. **k6**: Load testing for APIs
4. **React Profiler**: Component rendering performance

## Accessibility Testing

Verify the application is accessible to all users.

### Tools and Approach

1. **Automated Testing**: axe-core, Lighthouse Accessibility
2. **Manual Testing**: Keyboard navigation, screen reader testing
3. **Contrast Checking**: Color contrast analysis

### Key Areas to Test

1. **Keyboard Navigation**: Tab order, focus indicators
2. **Screen Reader Compatibility**: ARIA attributes, semantic HTML
3. **Color Contrast**: Meeting WCAG standards
4. **Responsive Design**: Accessibility across device sizes

## Test Automation and CI/CD

Integrate tests with CI/CD pipelines for continuous testing.

### Setup

1. **Continuous Integration**: GitHub Actions or similar
2. **Test Runners**: Configure to run in CI environment
3. **Test Reports**: Generate and publish test reports
4. **Coverage Reports**: Track test coverage over time

### Example GitHub Actions Workflow

```yaml
name: Test Suite

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run API tests
        run: npm run test:api
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Generate coverage report
        run: npm run test:coverage
```

## Test Data Management

Strategies for managing test data:

1. **Test Fixtures**: Predefined data for consistent testing
2. **Factory Methods**: Generate test data programmatically
3. **Cleanup**: Reset database between tests
4. **Isolated Environments**: Prevent test interference

Example test data factory:
```typescript
export const createTestUser = (overrides = {}) => ({
  username: `user_${Math.random().toString(36).substring(2, 8)}`,
  password: 'password123',
  team: 'Test Team',
  isAdmin: false,
  ...overrides
});

export const createTestQuestion = (overrides = {}) => ({
  question: 'Test question?',
  correctAnswer: 'Correct',
  options: ['Wrong', 'Correct', 'Also wrong'],
  category: 'General',
  explanation: 'This is a test explanation',
  weekOf: new Date().toISOString().split('T')[0],
  ...overrides
});
```

## Mocking Strategies

Approaches for mocking external dependencies:

1. **API Mocking**: MSW for intercepting and mocking API calls
2. **Service Mocking**: Mock service implementations
3. **Module Mocking**: Replace actual modules with test doubles
4. **Environment Mocking**: Mock browser APIs and environment

Example MSW setup:
```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/questions', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          question: 'Test question?',
          correctAnswer: 'Correct',
          options: ['Wrong', 'Correct', 'Also wrong'],
          category: 'Test',
          explanation: 'Test explanation',
          weekOf: '2023-01-15'
        }
      ])
    );
  }),
  rest.post('/api/login', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 1,
        username: 'testuser',
        isAdmin: false
      })
    );
  })
];

export const server = setupServer(...handlers);
```

## Test Documentation

Strategies for documenting tests:

1. **Test Descriptions**: Clear test names and descriptions
2. **Documentation Comments**: Explain test setup and assertions
3. **Test Organization**: Logical grouping of tests
4. **Coverage Reports**: Generate and maintain test coverage reports