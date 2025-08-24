# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install         # Install dependencies
npm run dev         # Start development server (esbuild with hot reload)
npm run build       # Production build (minified, tree-shaken)
node scripts/lint.mjs        # Run ESLint
node scripts/lint.mjs --fix  # Auto-fix linting issues
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: esbuild with custom scripts/build.mjs
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v7 (HashRouter)
- **State Management**: Zustand stores
- **Form Handling**: React Hook Form with Zod validation
- **Backend Integration**: Supabase (REST API) and Airtable

### Project Structure
```
src/
├── components/
│   ├── ui/          # shadcn/ui component library (26 components)
│   ├── layout/      # AppShell, Header, Footer, Sidebars
│   ├── auth/        # Authentication components and context
│   └── common/      # Shared utility components
├── pages/           # Route-based page components
├── services/        # API integrations (Supabase, Airtable)
├── stores/          # Zustand state management
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
└── types/           # TypeScript definitions
```

### Path Aliases
- `@/*` resolves to `./src/*` (configured in tsconfig.json)

## Key Implementation Patterns

### Authentication
- Mock authentication system ready for Supabase GoTrue integration
- AuthContext + Zustand store pattern
- Protected routes using higher-order components

### Data Layer
- **Supabase Service**: REST-based with typed interfaces (src/services/supabase.ts)
- **Airtable Service**: Rate-limited client with retry logic (src/services/airtable.ts)
- Services use fetch API, not SDK-based implementations

### UI Components
- Base: shadcn/ui components (Radix UI + Tailwind)
- **Important**: For Button with `variant="outline"`, always include `className="bg-transparent"`
- Theme support via CSS variables
- Icons: Lucide React
- Notifications: Sonner toast system

## Development Guidelines

### Quality Assurance
1. **Always run linting after changes**: `node scripts/lint.mjs`
2. **Fix linting issues**: `node scripts/lint.mjs --fix`
3. **Never declare functions inside JSX blocks**
4. **Follow React hooks rules** (no conditional hooks)
5. **Check visual rendering** on key pages: Home, Programs, ProgramDetail, Dashboard

### Testing
Currently no test framework is configured. When implementing tests:
1. Check package.json before assuming a test framework
2. Ask user for preferred testing approach

### Environment Variables
Required for production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AIRTABLE_BASE_ID`
- `VITE_AIRTABLE_API_KEY`

## Build System

### Development Server
- esbuild with file watching and hot reload
- Serves on localhost with automatic port assignment
- Source maps enabled for debugging

### Production Build
- Minification and tree-shaking enabled
- Output to `dist/` directory
- No source maps in production
- Static files ready for deployment

### Deployment
- Vercel configuration present (vercel.json)
- API functions support in `api/` directory
- Static hosting compatible

## Important Notes

1. **ESLint Configuration**: Lives in .eslintrc.cjs - avoid editing package.json scripts
2. **Build Scripts**: Custom esbuild setup in scripts/build.mjs
3. **No TypeScript checking in build**: Use ESLint for type checking
4. **Route Structure**: Uses HashRouter - all routes must be hash-based (#/)
5. **Mock Data**: Currently using mock authentication - ready for real backend integration