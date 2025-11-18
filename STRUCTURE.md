# CYAss Project Structure

## Complete Directory Layout

```
new-cyass/
├── .claude/                     # AI assistant documentation
│   ├── CLAUDE.md               # Main AI guidance file
│   ├── protected-code.md       # Code that must not be modified
│   ├── project-context.md      # Business and technical context
│   └── development-guide.md    # Development best practices
│
├── app/
│   ├── client/                 # Frontend React application
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/         # Route pages
│   │   │   ├── services/      # API services
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── types/         # TypeScript definitions
│   │   │   ├── contexts/      # React contexts
│   │   │   ├── config/        # App configuration
│   │   │   ├── utils/         # Utility functions
│   │   │   └── assets/        # Static assets
│   │   ├── public/            # Public static files
│   │   ├── tests/             # Test files
│   │   ├── package.json       # Dependencies
│   │   ├── vite.config.ts     # Vite configuration
│   │   ├── tsconfig.json      # TypeScript config
│   │   └── index.html         # Entry HTML
│   │
│   └── service/               # Service layer docs
│       └── README.md          # Supabase integration info
│
├── database/                   # Database setup files
│   ├── database-setup.sql     # Main schema
│   ├── create-*.sql          # Table creation scripts
│   ├── fix-*.sql             # Migration fixes
│   ├── add-*.sql             # Feature additions
│   └── supabase/             # Supabase specific
│       └── setup.sql
│
├── data/                      # Data storage (future use)
│
├── scripts/                   # Development scripts
│   ├── setup.bat             # Install dependencies
│   ├── run.bat               # Start dev server
│   ├── build.bat             # Build for production
│   └── test.bat              # Run tests
│
├── specs/                     # Documentation
│   ├── README.md             # Original project docs
│   ├── CYASS_DEVELOPMENT_PLAN.md
│   ├── PROTECTION_SUMMARY.md
│   ├── STORAGE_POLICIES_SETUP.md
│   ├── SUPABASE_SETUP.md
│   └── SUPABASE_STORAGE_SETUP.md
│
├── README.md                  # Project overview
└── STRUCTURE.md              # This file
```

## Key Differences from Original CYA-PWA

### Improvements
1. **Organized Structure**: Clear separation of concerns with app/, database/, scripts/, specs/
2. **AI Documentation**: Dedicated .claude/ folder for AI assistant context
3. **Service Layer**: Placeholder for backend services (currently using Supabase BaaS)
4. **Scripts**: Convenient batch files for common tasks
5. **Test Structure**: Organized test directory ready for implementation

### Maintained Features
- All React components and functionality preserved
- Database SQL files organized but unchanged
- Configuration files maintained
- PWA capabilities intact
- Supabase integration unchanged

## Quick Reference

### Where to find things:
- **React Components**: `/app/client/src/components/`
- **Page Routes**: `/app/client/src/pages/`
- **API Services**: `/app/client/src/services/`
- **Database Schema**: `/database/`
- **Documentation**: `/specs/` and `/.claude/`
- **Dev Scripts**: `/scripts/`

### Important Files:
- **Protected Code List**: `/.claude/protected-code.md`
- **Supabase Config**: `/app/client/src/services/supabase.ts`
- **Camera Implementation**: `/app/client/src/components/ItemInspection.tsx`
- **PDF Generation**: `/app/client/src/services/pdf.tsx`
- **Main Database Schema**: `/database/database-setup.sql`

## Development Flow

1. **Setup**: Run `scripts\setup.bat`
2. **Configure**: Add `.env` file in `/app/client/`
3. **Database**: Run SQL files in Supabase dashboard
4. **Develop**: Run `scripts\run.bat`
5. **Test**: Run `scripts\test.bat`
6. **Build**: Run `scripts\build.bat`
7. **Deploy**: Upload `/app/client/dist/` to hosting

This structure follows the george project's organization while maintaining all CYA-PWA functionality.