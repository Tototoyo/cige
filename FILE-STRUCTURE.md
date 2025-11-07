# 📁 CineGen AI - Complete File Structure

This document provides a comprehensive overview of every file in the project.

---

## Root Directory

```
cinegen-ai-production/
├── 📄 .env.example              Environment variables template
├── 📄 .env.local                Your actual environment variables (git ignored)
├── 📄 .gitignore                Git ignore rules
├── 📄 DEPLOYMENT-CHECKLIST.md   Complete deployment guide
├── 📄 FILE-STRUCTURE.md          This file
├── 📄 index.html                 HTML entry point
├── 📄 metadata.json              Project metadata
├── 📄 package.json               Dependencies and scripts
├── 📄 postcss.config.js          PostCSS configuration
├── 📄 PROJECT-SUMMARY.md         Complete project overview
├── 📄 QUICK-START.md             Quick start guide
├── 📄 README.md                  Main documentation
├── 📄 SETUP-GUIDE.md             Detailed setup instructions
├── 📄 supabase-schema.sql        Complete database schema
├── 📄 tailwind.config.js         Tailwind CSS configuration
├── 📄 tsconfig.json              TypeScript configuration
├── 📄 vite.config.ts             Vite build configuration
├── 📂 docs/                      Complete documentation
├── 📂 public/                    Static assets
└── 📂 src/                       Source code
```

---

## 📂 docs/ - Documentation

```
docs/
├── ARCHITECTURE-DIAGRAM.md            System architecture diagrams
├── COMPLETE-IMPLEMENTATION-GUIDE.md   Full implementation reference
├── IMPLEMENTATION-SUMMARY.md          Implementation overview
├── INDEX.md                           Documentation index
├── README-START-HERE.md               Main guide (start here!)
├── adsense-compliance-guide.md        AdSense requirements
└── cinegen-ai-improvement-analysis.md Technical analysis
```

**Purpose:** Complete documentation covering architecture, implementation, compliance, and technical details.

---

## 📂 src/ - Source Code

```
src/
├── 📄 App.tsx                Main React component with routing
├── 📄 constants.ts           Application constants
├── 📄 index.css              Global styles with Tailwind
├── 📄 index.tsx              Application entry point
├── 📄 types.ts               TypeScript type definitions
│
├── 📂 components/            React components
│   ├── AdPlaceholder.tsx         AdSense placeholder
│   ├── AnimateImagePage.tsx      Image animation interface
│   ├── CostEstimator.tsx         Generation cost calculator
│   ├── EditVideoPage.tsx         Video editing interface
│   ├── ErrorModal.tsx            Error display modal
│   ├── ExplainerStoryboardOutput.tsx  Storyboard output display
│   ├── ExplainerVideoGenerator.tsx    Explainer video generator
│   ├── GeneratedImageModal.tsx   Image preview modal
│   ├── HistoryPage.tsx           Generation history view
│   ├── KineticTypographyGenerator.tsx Typography generator
│   ├── LogoAnimator.tsx          Logo animation generator
│   ├── SavingProgressPage.tsx    Save progress indicator
│   ├── VideoCard.tsx             Video display card
│   ├── VideoGrid.tsx             Video grid layout
│   ├── VideoPlayer.tsx           Video player component
│   ├── YouTubeIntroGenerator.tsx YouTube intro generator
│   └── icons.tsx                 Icon components
│
├── 📂 contexts/              React contexts
│   └── AuthContext.tsx           Authentication context (legacy)
│
├── 📂 lib/                   External service configurations
│   └── supabase.ts               Supabase client setup
│
├── 📂 stores/                State management (Zustand)
│   └── authStore.ts              Authentication state store
│
├── 📂 utils/                 Utility functions
│   ├── analytics.ts              Analytics tracking
│   └── history.ts                History management
│
└── 📂 pages/                 Page components (to be added)
    └── (placeholder for future pages)
```

---

## Component Details

### Core Components

#### App.tsx
- **Purpose:** Main application component
- **Features:**
  - React Router setup
  - Route definitions
  - AI service integration
  - Error handling
- **Lines:** ~922 lines
- **Key Functions:**
  - `generateImage()` - Image generation
  - `generateContent()` - Prompt generation
  - `saveGeneration()` - Save to database

#### components/ExplainerVideoGenerator.tsx
- **Purpose:** Generate explainer video prompts
- **Features:**
  - User input form
  - AI prompt generation
  - Visual storyboard creation
  - Export functionality

#### components/LogoAnimator.tsx
- **Purpose:** Generate logo animation prompts
- **Features:**
  - Logo style selection
  - Animation type options
  - Duration configuration
  - Preview generation

#### components/KineticTypographyGenerator.tsx
- **Purpose:** Generate text animation prompts
- **Features:**
  - Text input
  - Typography style selection
  - Animation effects
  - Timing configuration

#### components/YouTubeIntroGenerator.tsx
- **Purpose:** Generate YouTube intro prompts
- **Features:**
  - Channel branding
  - Intro style options
  - Duration settings
  - Music suggestions

#### components/HistoryPage.tsx
- **Purpose:** Display user's generation history
- **Features:**
  - List all generations
  - Filter by type
  - Delete generations
  - View details

---

## Configuration Files

### package.json
```json
{
  "name": "cinegen-ai",
  "version": "1.0.0",
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@supabase/supabase-js": "^2.39.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.20.0",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  }
}
```

### tsconfig.json
- TypeScript compilation settings
- Strict mode enabled
- ES2020 target
- JSX support

### vite.config.ts
- Vite build configuration
- React plugin
- Port 5173
- Host configuration

### tailwind.config.js
- Tailwind CSS customization
- Custom colors
- Content paths
- Plugin configuration

---

## Database Files

### supabase-schema.sql
- **Tables:**
  - `users` - User profiles
  - `generations` - Generated content
  - `user_stats` - Usage statistics
- **Policies:**
  - Row Level Security (RLS)
  - User data isolation
- **Functions:**
  - `handle_new_user()` - Auto-create profile
  - `update_user_stats()` - Track usage
  - `update_updated_at_column()` - Timestamp updates
- **Triggers:**
  - Auto-execute on user creation
  - Auto-execute on generation creation
  - Auto-update timestamps

---

## Environment Files

### .env.example
Template with all required variables and descriptions

### .env.local (Your file)
```env
VITE_GEMINI_API_KEY=your_key_here
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_APP_URL=http://localhost:5173
```

⚠️ **Never commit .env.local to Git!**

---

## Build Output

### dist/ (after build)
```
dist/
├── index.html           Optimized HTML
├── assets/              Bundled JS/CSS
│   ├── index-abc123.js  Main bundle
│   └── index-xyz789.css Styles
└── ...                  Other optimized assets
```

Generated by: `npm run build`

---

## Git Ignored Files

The following are in `.gitignore`:

- `node_modules/` - Dependencies
- `dist/` - Build output
- `.env.local` - Environment variables
- `.DS_Store` - macOS files
- `*.log` - Log files

---

## File Sizes (Approximate)

| File | Size | Description |
|------|------|-------------|
| App.tsx | 40 KB | Main application |
| supabase-schema.sql | 6 KB | Database schema |
| package.json | 1 KB | Dependencies |
| docs/*.md | 50-200 KB | Documentation |

**Total project size:** ~500 KB (without node_modules)
**With dependencies:** ~300 MB

---

## Adding New Files

### To add a new page:
1. Create `src/pages/YourPage.tsx`
2. Add route in `App.tsx`
3. Export from `src/pages/index.ts`

### To add a new component:
1. Create `src/components/YourComponent.tsx`
2. Import where needed
3. Add types in `src/types.ts` if needed

### To add a new utility:
1. Create `src/utils/yourUtil.ts`
2. Export functions
3. Import where needed

---

## File Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Utils:** camelCase (e.g., `formatDate.ts`)
- **Types:** PascalCase (e.g., `UserType.ts`)
- **Constants:** UPPERCASE (e.g., `API_KEYS.ts`)
- **Docs:** kebab-case (e.g., `setup-guide.md`)

---

## Import Paths

```typescript
// Absolute imports from src/
import { Component } from './components/Component'
import { authStore } from './stores/authStore'
import { supabase } from './lib/supabase'
import type { UserType } from './types'
```

---

## Build Process

1. **Development:**
   ```bash
   npm run dev
   # Vite dev server with hot reload
   ```

2. **Production:**
   ```bash
   npm run build
   # TypeScript check → Vite build → dist/
   ```

3. **Preview:**
   ```bash
   npm run preview
   # Preview production build
   ```

---

## Key Files Summary

| File | Purpose | Essential |
|------|---------|-----------|
| `README.md` | Main documentation | ✅ Yes |
| `package.json` | Dependencies | ✅ Yes |
| `supabase-schema.sql` | Database setup | ✅ Yes |
| `.env.local` | Configuration | ✅ Yes |
| `src/App.tsx` | Main app | ✅ Yes |
| `src/lib/supabase.ts` | Database client | ✅ Yes |
| `src/stores/authStore.ts` | Auth state | ✅ Yes |
| `docs/` | Documentation | 📖 Helpful |

---

## Next Steps

1. ✅ Review this file structure
2. ✅ Understand each component's purpose
3. ✅ Follow QUICK-START.md to run the app
4. ✅ Refer to specific files as needed

---

*File structure documentation - Version 1.0.0*
