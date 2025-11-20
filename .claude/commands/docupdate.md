# Documentation Update
> Check if documentation is up to date with recent code changes and update accordingly.

## Instructions

You are performing a comprehensive documentation audit and update. Follow these steps systematically:

### 1. Analyze Recent Changes
- Review recent git commits (last 20) to identify significant code changes
- Focus on commits that affect:
  - Architecture (storage, auth, services)
  - Protected code areas (camera, storage, PDF generation)
  - New features or integrations
  - Configuration changes (environment variables, build setup)
  - Database schema changes

### 2. Check Key Code Areas
Read and analyze these critical files for changes:
- `app/client/src/services/*.ts*` - Service layer (especially storage, auth, PDF)
- `app/client/src/components/ItemInspection.tsx` - Protected camera code
- `app/client/src/hooks/*.ts` - Custom hooks
- `database/*.sql` - Database schema and migrations
- `app/client/.env.example` - Environment variable requirements
- `app/client/package.json` - Dependencies

### 3. Audit Documentation Files
Read and compare against current code:
- `.claude/CLAUDE.md` - Tech stack, guidelines, protected code warnings
- `.claude/project-context.md` - Architecture, tech stack, data flow, constraints
- `.claude/protected-code.md` - Protected code areas and why they're protected
- `README.md` - Project overview, setup, tech stack, features
- Feature-specific docs in root (e.g., `CLOUDFLARE_R2_SETUP.md`, `R2_CONFIGURATION.md`)

### 4. Identify Documentation Gaps
Check for discrepancies between code and documentation:

**Architecture Changes:**
- Has the storage system changed? (Supabase, R2, other)
- Are there new services or integrations?
- Has the authentication flow changed?
- Are there new environment variables?

**Protected Code Changes:**
- Have any protected areas been modified?
- Are there new areas that should be protected?
- Do the line numbers in protected-code.md match current code?

**Feature Updates:**
- Are new features documented in README.md?
- Are new features listed in project-context.md "Current Development Phase"?
- Do feature-specific docs exist and are they accurate?

**Tech Stack Changes:**
- Are new dependencies documented?
- Are deployment instructions up to date?
- Are scripts and commands documented?

**Business Rules:**
- Have validation rules changed?
- Are there new constraints or requirements?
- Are role permissions documented correctly?

### 5. Update Documentation
For each gap identified, update the relevant documentation files:

**Priority 1 - Critical Documentation:**
- `.claude/CLAUDE.md` - Most visible to AI assistants
- `.claude/protected-code.md` - Prevents accidental breakage
- `README.md` - First thing developers read

**Priority 2 - Context Documentation:**
- `.claude/project-context.md` - Detailed context
- Feature-specific docs - Setup and configuration

**Priority 3 - Supporting Documentation:**
- `STRUCTURE.md` - If project structure changed
- `specs/*.md` - If implementation differs from spec

### 6. Verify Consistency
After updates, ensure:
- All mentions of tech stack are consistent across files
- Protected code warnings appear in all relevant places
- Environment variables are documented in README and .env.example
- Setup instructions work with current architecture
- Line numbers in protected-code.md are accurate

## Specific Checks

### Storage Architecture
- [ ] Is the current storage system (R2/Supabase/other) documented?
- [ ] Are bucket names documented?
- [ ] Is the fallback mechanism explained?
- [ ] Are environment variables listed?

### Protected Code
- [ ] Are all protected areas listed with accurate line numbers?
- [ ] Are new protected areas identified?
- [ ] Is the reasoning for protection documented?

### Dependencies
- [ ] Are all package.json dependencies explained in README?
- [ ] Are major libraries documented in tech stack?
- [ ] Are setup scripts up to date?

### Configuration
- [ ] Are all environment variables documented?
- [ ] Are deployment steps accurate?
- [ ] Are development scripts documented?

### Features
- [ ] Are all implemented features listed in README?
- [ ] Are alpha/beta features marked appropriately?
- [ ] Are disabled features documented?

## Report Format

After completing the audit and updates, provide a report:

### Documentation Status: [UP TO DATE | NEEDS UPDATES | UPDATED]

### Recent Changes Analyzed:
- List significant commits reviewed
- Highlight architectural changes

### Gaps Identified:
- List each documentation gap found
- Note severity (Critical/Important/Minor)

### Updates Made:
- List each file updated
- Summarize changes per file
- Note line numbers or sections modified

### Remaining Work:
- List any documentation that needs user input
- Note any ambiguities that need clarification

### Recommendations:
- Suggest documentation improvements
- Identify areas needing more detail
- Recommend new documentation files if needed

## Notes

- **DO NOT modify code** - This command only updates documentation
- **Preserve protected code warnings** - Never remove or weaken these
- **Maintain consistency** - Same information should be identical across files
- **Be thorough** - Check every section of every documentation file
- **Verify accuracy** - Don't guess, read the actual code
- **Update line numbers** - Ensure protected-code.md line references are current
- **Ask if uncertain** - Use AskUserQuestion for ambiguous situations

## Validation

After updates, verify:
1. All documentation files are valid markdown
2. No broken internal links
3. Protected code warnings are prominent
4. Tech stack descriptions are consistent
5. Setup instructions are sequential and complete

## Common Documentation Debt

Watch for these frequent issues:
- Outdated line numbers in protected-code.md
- Missing environment variables in README
- Tech stack changes not reflected everywhere
- New features missing from project-context.md
- Deprecated features still documented
- Inconsistent terminology across files
- Missing "Why" explanations for architectural decisions
