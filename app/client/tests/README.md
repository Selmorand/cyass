# CYAss Client Tests

This directory contains tests for the CYAss frontend application.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual components
│   ├── components/    # Component tests
│   ├── hooks/        # Custom hook tests
│   └── utils/        # Utility function tests
├── integration/      # Integration tests
│   ├── auth/         # Authentication flow tests
│   ├── forms/        # Form submission tests
│   └── api/          # API interaction tests
└── e2e/             # End-to-end tests
    ├── inspection/   # Full inspection flow
    └── report/       # Report generation tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test -- components/PropertyForm.test.tsx
```

## Test Stack

- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **MSW** - API mocking
- **Testing Library User Event** - User interaction simulation

## Writing Tests

### Component Test Example
```javascript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyForm } from '../src/components/PropertyForm'

describe('PropertyForm', () => {
  it('should validate required fields', async () => {
    render(<PropertyForm />)
    
    const submitButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(submitButton)
    
    expect(screen.getByText(/street name is required/i)).toBeInTheDocument()
  })
})
```

### API Test Example
```javascript
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { supabase } from '../src/services/supabase'

const server = setupServer(
  rest.post('*/auth/signup', (req, res, ctx) => {
    return res(ctx.json({ user: { id: '123' } }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Critical Test Areas

1. **Camera Functionality** - Test mobile detection and camera access
2. **Photo Upload** - Verify Supabase Storage integration
3. **PDF Generation** - Ensure reports generate correctly
4. **Form Validation** - Test mandatory fields and business rules
5. **Authentication** - Verify login/signup flows
6. **GPS Capture** - Test location services

## Test Coverage Goals

- Unit tests: 80% coverage
- Integration tests: Key user flows
- E2E tests: Critical paths only