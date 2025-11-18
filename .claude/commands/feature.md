# Feature Planning

Create a new plan in specs/*.md to implement the `Feature` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan use the `Relevant Files` to focus on the right files.

## Instructions

- IMPORTANT: You're writing a plan to implement a net new feature based on the `Feature` that will add value to the CYAss property inspection application.
- IMPORTANT: The `Feature` describes the feature that will be implemented but remember we're not implementing a new feature, we're creating the plan that will be used to implement the feature based on the `Plan Format` below.
- Create the plan in the `specs/*.md` file. Name it appropriately based on the `Feature`.
- Use the `Plan Format` below to create the plan. 
- Research the codebase to understand existing patterns, architecture, and conventions before planning the feature.
- IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to implement the feature successfully.
- Use your reasoning model: THINK HARD about the feature requirements, design, and implementation approach.
- Follow existing patterns and conventions in the codebase. Don't reinvent the wheel.
- Design for extensibility and maintainability.
- If you need a new library, use `npm install` and be sure to report it in the `Notes` section of the `Plan Format`.
- Respect requested files in the `Relevant Files` section.
- Start your research by reading the `README.md` file.
- Remember: This is a PWA using Supabase as backend, not a traditional client/server architecture.

## Relevant Files

Focus on the following files:
- `README.md` - Contains the project overview and instructions.
- `app/client/**` - Contains the React frontend codebase.
- `scripts/**` - Contains the batch scripts for development workflow.
- `database/**` - Contains SQL files for Supabase database setup.
- `specs/**` - Contains project documentation and specifications.
- `/.claude/**` - Contains AI assistant documentation including protected code.

Pay special attention to:
- `/.claude/protected-code.md` - Lists code that must NOT be modified
- `/.claude/project-context.md` - Business context and requirements
- `app/client/src/services/` - Supabase integration patterns
- `app/client/src/types/` - TypeScript type definitions
- `app/client/src/components/` - Existing component patterns
- `app/client/src/hooks/` - Custom React hooks patterns

## Plan Format

```md
# Feature: <feature name>

## Feature Description
<describe the feature in detail, including its purpose and value to CYAss users (tenants, landlords, buyers, sellers, agents)>

## User Story
As a <type of CYAss user: tenant/landlord/buyer/seller/agent>
I want to <action/goal related to property inspection>
So that <benefit/value for property condition reporting>

## Problem Statement
<clearly define the specific problem or opportunity this feature addresses in the property inspection workflow>

## Solution Statement
<describe the proposed solution approach and how it integrates with existing CYAss functionality>

## Relevant Files
Use these files to implement the feature:

<find and list the files that are relevant to the feature describe why they are relevant in bullet points. If there are new files that need to be created to implement the feature, list them in an h3 'New Files' section.>

### Protected Code Considerations
<Check /.claude/protected-code.md and list any protected code areas that relate to this feature. If the feature touches protected code, note that explicit permission is required.>

### Database Schema Changes
<List any new database tables, columns, or migrations needed. Reference existing patterns in /database/ folder.>

## Implementation Plan
### Phase 1: Foundation
<describe the foundational work needed before implementing the main feature (database changes, types, services)>

### Phase 2: Core Implementation
<describe the main implementation work for the feature (components, hooks, business logic)>

### Phase 3: Integration
<describe how the feature will integrate with existing CYAss functionality (inspection flow, PDF generation, etc.)>

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to implement the feature. Order matters, start with the foundational shared changes required then move on to the specific implementation. Include creating tests throughout the implementation process. Your last step should be running the `Validation Commands` to validate the feature works correctly with zero regressions.>

## Testing Strategy
### Unit Tests
<describe unit tests needed for the feature>

### Integration Tests
<describe integration tests needed for the feature, especially Supabase integration>

### Mobile Testing
<describe mobile-specific testing requirements for PWA functionality>

### Edge Cases
<list edge cases that need to be tested, including offline scenarios>

## Acceptance Criteria
<list specific, measurable criteria that must be met for the feature to be considered complete>
- Feature works on mobile devices (primary platform)
- Feature works offline where applicable (PWA requirement)
- Feature integrates with existing inspection workflow
- Feature respects user role permissions
- Feature maintains GPS and photo capture functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

<list commands you'll use to validate with 100% confidence the feature is implemented correctly with zero regressions. every command must execute without errors so be specific about what you want to run to validate the feature works as expected.>
- `cd app/client && npm run type-check` - Validate TypeScript compilation
- `cd app/client && npm run lint` - Validate code quality
- `cd app/client && npm run build` - Ensure production build works
- `cd app/client && npm test` - Run tests for the new feature
- Manual testing on actual mobile device for camera and GPS functionality

## Notes
<optionally list any additional notes, future considerations, or context that are relevant to the feature that will be helpful to the developer>
- CYAss is a South African property inspection PWA
- Primary users are on mobile devices
- Must maintain offline capability where possible
- All features must respect Row Level Security (RLS) policies
- Payment integration uses PayFast (South African processor)
- Legal compliance requires specific disclaimers and watermarks
- Protected code areas require explicit permission before modification
```

## Feature
$ARGUMENTS

## Report
- Summarize the work you've just done in a concise bullet point list.
- Include a path to the plan you created in the `specs/*.md` file.
- Do not execute the code, only write the spec file.