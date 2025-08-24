# ClinicalRxQ Membership Portal

A React-based membership portal for community pharmacists providing access to clinical programs, training materials, protocols, and resources. Built with modern web technologies and powered by Supabase for authentication and content delivery.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: esbuild with custom scripts
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with persistence
- **Routing**: React Router v7
- **Authentication**: Supabase GoTrue
- **Backend**: Supabase (PostgreSQL + Storage)
- **Form Handling**: React Hook Form + Zod validation

### Project Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components (button, card, etc.)
│   ├── layout/          # Shell components and navigation
│   ├── auth/            # Authentication components
│   ├── resources/       # Content display components
│   └── common/          # Shared utility components
├── pages/               # Route-based page components
├── services/            # API and external service integrations
├── stores/              # Zustand state management
├── lib/                 # Utility functions and helpers
├── config/              # Configuration files
└── types/              # TypeScript type definitions
```

## 🚀 Build Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Environment Variables
Create a `.env` file in the root directory:
```bash
VITE_SUPABASE_URL=https://xeyfhlmflsibxzjsirav.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
node scripts/lint.mjs

# Run linting with auto-fix
node scripts/lint.mjs --fix
```

### Build Configuration
- **Development**: esbuild dev server with hot reload
- **Production**: Minified bundle with tree shaking
- **Supported Files**: `.tsx`, `.ts`, `.css`, `.svg`, `.png`, `.jpeg`, `.jpg`
- **Output**: `dist/` directory

## 🔐 Authentication System

### Architecture Overview
The authentication system uses a layered architecture with Supabase GoTrue as the backend:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Login.tsx     │───▶│  authStore.ts    │───▶│  supabase.ts    │
│  (UI Layer)     │    │ (State Manager)  │    │ (Service Layer) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ AuthContext.tsx │◀───│   Zustand Store  │    │  lib/supabase.ts│
│ (React Context) │    │   (Persistence)  │    │  (Auth Client)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Authentication Flow

#### Login Process:
1. User enters credentials in `Login.tsx`
2. `Login.tsx` calls `useAuthStore().login(email, password)`
3. `authStore.login()` calls `authService.signIn(email, password)`
4. `authService.signIn()` calls `supabaseAuth.signIn()`
5. `supabaseAuth.signIn()` makes REST API call to Supabase
6. On success: session stored in localStorage
7. `authService.getCurrentProfile()` fetches user data
8. `authStore` updates state: `{ user, isAuthenticated: true }`
9. `Login.tsx` navigates to `/dashboard`

#### App Initialization:
1. App starts → `AuthProvider` mounts
2. `AuthProvider` calls `useAuthStore().checkAuth()`
3. `checkAuth()` calls `supabaseAuth.getSession()`
4. If valid session exists → fetch profile → set authenticated
5. If no session → set unauthenticated

### Key Authentication Files

1. **`src/stores/authStore.ts`** - Main authentication state management
   - Zustand store with persistence
   - Functions: `login()`, `logout()`, `register()`, `checkAuth()`, `updateProfile()`

2. **`src/lib/supabase.ts`** - Supabase authentication client
   - GoTrue API implementation
   - Session management (store/retrieve/refresh tokens)

3. **`src/services/supabase.ts`** - Authentication service interface
   - User profile management
   - Database integration

4. **`src/components/auth/AuthContext.tsx`** - React context provider
   - Bridges Zustand store to React context
   - Handles auth initialization on app start

5. **`src/pages/Login.tsx`** - Login page component
   - Form validation with Zod
   - Secret bypass functionality (Alt+Click for testing)

### Session Management
- **Storage**: localStorage (`supabase.auth.token`)
- **Persistence**: Zustand middleware saves `{ user, isAuthenticated }`
- **Refresh**: Automatic token refresh in `lib/supabase.ts`

### Security Features
- Token storage with automatic refresh
- Session validation on app start
- Comprehensive error handling at each layer
- Full TypeScript type safety

## 📡 API Integration

### Supabase Configuration
- **URL**: `https://xeyfhlmflsibxzjsirav.supabase.co`
- **Authentication**: GoTrue REST API
- **Database**: PostgreSQL with PostgREST
- **Storage**: File bucket `clinicalrxqfiles`

### API Services

#### Authentication API (`/auth/v1/`)
- `POST /signup` - User registration
- `POST /token?grant_type=password` - User login
- `POST /logout` - User logout
- `POST /recover` - Password recovery
- `PUT /user` - Update user metadata

#### Database API (`/rest/v1/`)
- `GET /storage_files_catalog` - Content catalog queries
- `GET /profiles` - User profile data

#### Storage API (`/storage/v1/`)
- `POST /object/list/{bucket}` - List files
- `GET /object/public/{bucket}/{path}` - Public file URLs

## 📁 Content Delivery System

The content system serves clinical program materials through a sophisticated multi-layer architecture:

### 1. Core Content Service Files

#### **`src/services/storageCatalog.ts` - Main Content Service**
- **Primary Function**: `getProgramResourcesGrouped(slug: ProgramSlug)`
- **Content Categories**: `forms`, `protocols`, `resources`, `training`
- **Data Sources**:
  - Primary: `storage_files_catalog` PostgreSQL table
  - Fallback: Direct Supabase Storage REST API
- **Supported Programs**:
  ```typescript
  const ProgramSlugs = [
    'mtmthefuturetoday',    // MTM The Future Today
    'timemymeds',           // TimeMyMeds
    'testandtreat',         // Test & Treat Services
    'hba1c',                // HbA1c Testing
    'oralcontraceptives'    // Oral Contraceptives
  ];
  ```

#### **`src/services/supabaseStorage.ts` - Storage Layer**
- **Key Functions**:
  - `listAllForProgram(programSlug)` - Fallback content loader
  - `listProgramCategory(programSlug, category)` - Category-specific lists
  - `buildPublicUrl(path)` - Generates downloadable file URLs
- **File Processing**:
  - Strips file extensions for display titles
  - Handles MIME type detection
  - Creates public download links

### 2. Database/Storage Integration

#### **Database Tables**
- **`storage_files_catalog`** (Primary data source):
  ```sql
  SELECT * FROM storage_files_catalog 
  WHERE bucket_name = 'clinicalrxqfiles' 
  AND file_path ILIKE '{programSlug}/{category}/%'
  ORDER BY file_path ASC
  ```

- **Supabase Storage Bucket**: `clinicalrxqfiles`
  - Direct file storage with public URLs
  - Organized folder structure: `{programSlug}/{category}/filename.ext`

#### **`src/config/supabaseConfig.ts` - Configuration**
- Supabase URL and API key management
- Environment variables with localStorage overrides
- REST API configuration for PostgREST queries

### 3. UI Component Files

#### **`src/components/resources/ProgramResourceRow.tsx` - Content Display**
- Individual file row component with:
  - File type icons (PDF, video, spreadsheet, etc.)
  - Play/Download buttons based on content type
  - Video duration extraction from filenames
  - Responsive hover effects

#### **`src/pages/ProgramDetail.tsx` - Main Page Component**
- **URL Route**: `/program/:programSlug`
- **Tab Structure**: Overview, Training, Protocols, Forms, Resources
- **Special Features**:
  - Collapsible sections for MTM forms (4 categories)
  - Nested subsections for Prescriber Communication
  - Test & Treat forms organized by condition (COVID, Flu, Strep)
  - URL-synced tab navigation (`?tab=forms`)

### 4. Routing & Navigation

#### **`src/App.tsx` - Route Configuration**
```typescript
<Route 
  path="/program/:programSlug" 
  element={<ProtectedRoute><ProgramDetail /></ProtectedRoute>} 
/>
```

#### **`src/pages/MemberContent.tsx` - Program List**
- Lists available programs with links to ProgramDetail
- Data source: `listProgramsFromStorage()` from storageCatalog
- Creates navigation links like `/program/mtmthefuturetoday`

### 5. Content Organization Flow

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   ProgramDetail     │───▶│   storageCatalog     │───▶│ storage_files_catalog│
│   (UI Page)         │    │   (Content Service)  │    │   (Database Table)   │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
           │                           │                           │
           ▼                           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│ ProgramResourceRow  │    │  supabaseStorage     │    │ Supabase Storage    │
│ (File Display)      │    │  (Storage API)       │    │ (File Bucket)       │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

### 6. Content Structure in Storage

```
clinicalrxqfiles/
├── mtmthefuturetoday/
│   ├── forms/
│   │   ├── utilityforms/          # General Forms
│   │   ├── medflowsheets/         # Medical Conditions Flowsheets
│   │   ├── outcomestip/           # Outcomes TIP Forms
│   │   └── prescribercomm/        # Prescriber Communication
│   │       ├── druginteractions/
│   │       ├── needsdrugtherapy/
│   │       ├── optimizemedicationtherapy/
│   │       └── suboptimaldrugselection_hrm/
│   ├── protocols/                 # Protocol Manuals
│   ├── training/                  # Training Modules
│   └── resources/                 # Additional Resources
├── testandtreat/
│   └── forms/
│       ├── covid/                 # COVID Forms
│       ├── flu/                   # Flu Forms
│       └── strep/                 # Strep Forms
├── timemymeds/
├── hba1c/
└── oralcontraceptives/
```

### 7. Special Content Features

#### **MTM Forms Organization**
- **4-Level Hierarchy**: Main sections with collapsible subsections
- **Prescriber Communication**: Nested 5-part organization
  - General, Drug Interactions, Needs Drug Therapy, Optimize Medication, Suboptimal/High Risk
- **Smart Categorization**: Automatic folder-based organization

#### **Test & Treat Forms**
- **Condition-Based**: COVID, Flu, Strep sections
- **Collapsible Interface**: Default collapsed with smooth animations

#### **Content Type Handling**
- **Video Content**: Automatic duration extraction and play buttons
- **Document Files**: Download buttons with appropriate icons
- **File Type Detection**: Smart icons (PDF, Excel, Word, generic)
- **Public URLs**: Direct download/view links for all content

### 8. Performance & Reliability

#### **Data Source Strategy**
- **Primary**: Database catalog for fast queries and metadata
- **Fallback**: Direct storage listing for reliability
- **Caching**: Browser-level caching of API responses

#### **Error Handling**
- Graceful fallback from database to storage API
- User-friendly error messages for missing content
- Loading states during content fetching

#### **Scalability**
- PostgREST queries with efficient indexing
- Public CDN-style URLs for file delivery
- Lazy loading of content sections

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Tailwind CSS for consistent styling
- Component-based architecture

### Testing
- No test suite currently configured
- Manual testing during development
- Build verification before deployment

### Deployment
- Static build output in `dist/`
- Environment variables required for production
- Supabase configuration for backend services

## 📚 Additional Resources

### Key Dependencies
- `react` + `react-dom` - UI framework
- `zustand` - State management
- `react-router` - Routing
- `react-hook-form` + `zod` - Forms and validation
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `esbuild` - Build tool

### File Structure Notes
- All pages are protected routes except public marketing pages
- Authentication state persists across browser sessions
- Content is dynamically loaded based on user access
- File uploads and management handled through Supabase Storage

### Support
For technical issues or questions about the codebase, refer to the inline code documentation and TypeScript type definitions throughout the project.