# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

```
/app/client/    # Frontend React application with Vite, TypeScript, and Tailwind CSS
/app/service/   # Service layer documentation (CYAss uses Supabase BaaS)
/database/      # SQL files for database schema, migrations, and RLS policies
/data/          # Data storage directory (for future local storage needs)
/scripts/       # Batch scripts for setup, running, building, and testing
/specs/         # Project specifications, documentation, and architectural decisions
/.claude/       # AI-specific documentation and guidelines
```

## Important Guidelines

### Directory Usage
- `/app/client/`: Create and edit all UI/frontend files here (React components, styles, etc.)
- `/app/service/`: Documentation for Supabase integration (no server code - using BaaS)
- `/database/`: SQL scripts for Supabase database setup and migrations
- `/scripts/`: Batch files for Windows development workflow
- `/specs/`: Save all specification documentation and architectural decisions
- `/.claude/`: AI assistant context and protected code documentation

### Technology Stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS + React Router + PWA
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Storage**: Cloudflare R2 (photos/PDFs) with Supabase Storage fallback
- **PDF Generation**: @react-pdf/renderer
- **Deployment**: Netlify + Supabase + Cloudflare R2

### Development Commands
```bash
# Setup
scripts\setup.bat

# Development
scripts\run.bat

# Build for production
scripts\build.bat

# Run tests
scripts\test.bat
```

## CRITICAL - DO NOT MODIFY WITHOUT PERMISSION

### Mobile Camera Functionality
**⚠️ NEVER modify the camera capture code in ItemInspection.tsx without explicit permission**

The camera implementation uses specific mobile device detection and dynamic DOM manipulation to ensure the camera opens directly instead of the gallery. See `/.claude/protected-code.md` for details.

### Photo Upload & PDF Linking System
**⚠️ NEVER modify the Supabase Storage integration without explicit permission**

The photo upload system uses the 'property-photos' bucket with specific RLS policies. The PDF generation includes clickable thumbnails with external links. See `/.claude/protected-code.md` for protected areas.

## Business Rules
- **Mandatory Comments**: Any condition that is not 'Good' or 'N/A' MUST have a comment
- **GPS Capture**: All properties must capture GPS coordinates with accuracy tracking
- **SA Address Format**: Use South African address structure
- **Photo Requirements**: Multiple photos per item with compression
- **PDF Watermarking**: "CYAss SOLO REPORT - Created by {ROLE} - Not jointly signed"

## Notes
- DO NOT use scripts to execute Playwright tests, use MCP if needed
- Always maintain the existing functionality when reorganizing code
- Preserve all Supabase configuration and environment variables
- Keep mobile-specific implementations intact
- See `/.claude/` folder for additional context and guidelines