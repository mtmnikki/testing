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
- **State Management**: Zustand stores (authStore, profilesStore, bookmarkStore)
- **Form Handling**: React Hook Form with Zod validation
- **Backend Integration**: Supabase (REST API + GoTrue auth)

### Project Structure
```
src/
├── components/
│   ├── ui/          # shadcn/ui component library (50+ components)
│   ├── layout/      # AppShell, Header, Footer, DashboardSidebarNav
│   ├── auth/        # AuthContext provider
│   ├── profiles/    # ProfileGate, AddProfileModal, ProfilesTable
│   ├── home/        # Homepage components (ThreePillars)
│   ├── resources/   # ResourceCard, ProgramResourceRow
│   └── common/      # SafeText, ErrorBoundary, ScrollToTop, BackToTop, Breadcrumbs
├── pages/           # Route-based page components
├── services/        # API integrations (supabase.ts, supabaseStorage.ts, storageCatalog.ts)
├── stores/          # Zustand state management
├── lib/             # Utility functions (utils.ts, slug.ts, cellValue.ts)
├── hooks/           # Custom React hooks (use-toast, use-mobile)
└── types/           # TypeScript definitions
```

### Path Aliases
- `@/*` resolves to `./src/*` (configured in tsconfig.json)

## Key Implementation Patterns

### Authentication & Profiles
- **Multi-profile System**: Users can have multiple profiles via ProfileGate component
- **Profile-based Access**: Protected routes require both authentication and profile selection
- **Auth Flow**: AuthContext → authStore → ProfileGate → Content
- **Supabase GoTrue**: Real authentication integrated with profiles table

### Data Layer
- **Supabase Service**: REST-based with typed interfaces (src/services/supabase.ts)
  - Programs, Training Modules, Protocol Manuals, Documentation Forms, Additional Resources
  - Patient Handouts, Clinical Guidelines, Medical Billing Resources
- **Storage Service**: Supabase storage integration (src/services/supabaseStorage.ts)
- **No Airtable**: Previously removed - all data operations go through Supabase

### Routing Structure
All routes use HashRouter (#/):
- Public: `/`, `/contact`, `/login`, `/enroll`
- Protected: `/dashboard`, `/member-content`, `/resources`, `/program/:programSlug`, `/account`, `/bookmarks`

### UI Components
- Base: shadcn/ui components (Radix UI + Tailwind)
- **Important**: For Button with `variant="outline"`, always include `className="bg-transparent"`
- Theme support via CSS variables
- Icons: Lucide React
- Notifications: Sonner toast system (top-center, 1.8s duration)

## Development Guidelines

### Quality Assurance
1. **Always run linting after changes**: `node scripts/lint.mjs`
2. **Fix linting issues**: `node scripts/lint.mjs --fix`
3. **Never declare functions inside JSX blocks**
4. **Follow React hooks rules** (no conditional hooks)
5. **Check visual rendering** on key pages: Home, Dashboard, ProgramDetail, Resources

### Testing
Currently no test framework is configured. When implementing tests:
1. Check package.json before assuming a test framework
2. Ask user for preferred testing approach

### Environment Variables
Required for production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Environment variables can also be overridden via localStorage for development:
- `localStorage.setItem('SUPABASE_URL', 'your-url')`
- `localStorage.setItem('SUPABASE_ANON_KEY', 'your-key')`

## Build System

### Development Server
- esbuild with file watching and hot reload
- Serves on localhost with automatic port assignment
- Source maps enabled for debugging
- Automatic browser refresh on file changes

### Production Build
- Minification and tree-shaking enabled
- Output to `dist/` directory
- No source maps in production
- Static files (images) handled via file loader

### Deployment
- Vercel configuration present (vercel.json)
- API functions support in `api/` directory
- Static hosting compatible

## Important Notes

1. **ESLint Configuration**: Lives in .eslintrc.cjs - avoid editing package.json scripts
2. **Build Scripts**: Custom esbuild setup in scripts/build.mjs
3. **No TypeScript checking in build**: Use ESLint for type checking
4. **Route Structure**: Uses HashRouter - all routes must be hash-based (#/)
5. **Authentication State**: Real Supabase GoTrue integration, not mock data
6. **Profile Selection**: Users must select a profile after login via ProfileGate
7. **Storage URLs**: Use `getStorageUrl()` helper for Supabase public bucket files