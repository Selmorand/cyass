# CYAss Development Guide

## Development Workflow

### Initial Setup
```bash
# 1. Clone repository
git clone <repo-url>
cd new-cyass

# 2. Install dependencies
scripts\setup.bat

# 3. Configure environment
# Create app/client/.env with:
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# 4. Setup database
# Run SQL files in Supabase dashboard
```

### Daily Development
```bash
# Start dev server
scripts\run.bat

# In another terminal, watch for type errors
cd app/client
npm run type-check -- --watch

# Format code
npm run format

# Lint code
npm run lint
```

## Code Style Guidelines

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Prefer type over interface for unions
- Use const assertions for literals
- Avoid any type

### React Components
```typescript
// Prefer functional components with TypeScript
interface PropertyFormProps {
  onSubmit: (data: PropertyData) => Promise<void>;
  initialData?: Partial<PropertyData>;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ 
  onSubmit, 
  initialData 
}) => {
  // Component logic
};
```

### File Organization
```
components/
├── PropertyForm/
│   ├── PropertyForm.tsx      # Main component
│   ├── PropertyForm.types.ts # Type definitions
│   ├── PropertyForm.test.tsx # Tests
│   └── index.ts              # Exports
```

### State Management
- Use React Context for global state
- Use React Hook Form for forms
- Use SWR or React Query for server state
- Avoid prop drilling

## Testing Strategy

### Unit Tests
Test individual functions and components in isolation:
```typescript
describe('validateProperty', () => {
  it('should require street name', () => {
    const result = validateProperty({ street_name: '' });
    expect(result.errors).toContain('Street name required');
  });
});
```

### Integration Tests
Test feature flows:
```typescript
describe('Property Creation Flow', () => {
  it('should create property and redirect', async () => {
    // Test complete flow
  });
});
```

### E2E Tests (Future)
Critical user journeys only:
- Complete inspection flow
- PDF generation
- Authentication

## Database Conventions

### Naming
- Tables: snake_case, plural (e.g., `properties`, `inspection_reports`)
- Columns: snake_case (e.g., `created_at`, `user_id`)
- Enums: UPPER_SNAKE_CASE values

### RLS Policies
Always scope to authenticated user:
```sql
CREATE POLICY "Users can view own properties"
ON properties FOR SELECT
USING (auth.uid() = user_id);
```

### Migrations
- Number files sequentially
- Include rollback instructions
- Test on dev instance first

## API Patterns

### Supabase Queries
```typescript
// Always handle errors
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('user_id', userId);

if (error) {
  console.error('Failed to fetch properties:', error);
  throw new Error('Failed to fetch properties');
}
```

### Error Handling
```typescript
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error.message || 'Unknown error' 
  };
}
```

## Performance Guidelines

### Image Optimization
- Compress before upload (max 1MB)
- Use WebP where supported
- Lazy load images
- Generate thumbnails

### Bundle Size
- Use dynamic imports for large components
- Tree-shake unused code
- Analyze bundle regularly
- Keep under 500KB initial

### Rendering
- Memoize expensive computations
- Use React.memo for pure components
- Virtualize long lists
- Debounce user input

## Security Practices

### Never Commit
- `.env` files
- API keys
- User data
- Debug logs with sensitive info

### Always Validate
- User input on client
- User input on server (RLS)
- File uploads (type, size)
- URL parameters

### Authentication
- Check auth state before operations
- Refresh tokens appropriately
- Handle expired sessions
- Clear sensitive data on logout

## Debugging Tips

### Common Issues

1. **Camera opens gallery instead**
   - Check mobile detection
   - Verify capture attribute
   - Test on actual device

2. **Photos won't upload**
   - Check Supabase storage policies
   - Verify bucket name
   - Check file size limits

3. **PDF generation fails**
   - Check console for errors
   - Verify all data present
   - Test with minimal data first

### Useful Commands
```bash
# Check TypeScript errors
npm run type-check

# Find unused exports
npm run analyze

# Check bundle size
npm run build -- --analyze

# Test specific component
npm test PropertyForm
```

## Deployment Checklist

### Before Deploying
- [ ] Run all tests
- [ ] Check TypeScript compilation
- [ ] Review console for errors
- [ ] Test on mobile device
- [ ] Verify env variables set
- [ ] Update version number
- [ ] Write release notes

### After Deploying
- [ ] Smoke test critical flows
- [ ] Check error monitoring
- [ ] Verify database migrations
- [ ] Test PDF generation
- [ ] Monitor performance

## Getting Help

### Resources
- Project specs: `/specs`
- Protected code: `/.claude/protected-code.md`
- Context: `/.claude/project-context.md`
- README: `/README.md`

### Common Solutions
- Most issues are in `/specs/troubleshooting.md`
- Check Supabase logs for API issues
- Use browser DevTools for debugging
- Test on actual devices for mobile issues