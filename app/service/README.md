# CYAss Service Layer

This directory contains the service layer configuration for the CYAss application.

## Overview

CYAss uses Supabase as a Backend-as-a-Service (BaaS) platform, which provides:
- PostgreSQL database
- Authentication
- File storage
- Real-time subscriptions
- Row Level Security (RLS)

## Structure

```
app/service/
├── README.md           # This file
├── config/            # Configuration files
│   └── supabase.js    # Supabase client configuration
├── api/              # API wrapper functions
│   ├── auth.js       # Authentication services
│   ├── properties.js # Property management
│   ├── reports.js    # Report generation
│   └── storage.js    # File storage operations
└── tests/            # Service layer tests
```

## Important Notes

Unlike traditional backend architectures with server-side code, CYAss's service layer consists of:
1. Client-side API wrapper functions that interact with Supabase
2. Database schema and RLS policies defined in SQL files (see `/database` folder)
3. Configuration for the Supabase client

The actual backend infrastructure is managed by Supabase's hosted services.

## Database Setup

Database schema and migrations are located in the `/database` folder at the project root.
Run these SQL scripts in your Supabase dashboard to set up the database structure.

## Environment Variables

Required environment variables for Supabase connection:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

These are configured in the client application's `.env` file.