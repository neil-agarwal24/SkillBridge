# NeighborNet AI Coding Instructions

## Project Overview
**NeighborNet** is a Next.js hackathon project building a skill & item sharing platform that bridges income/age gaps by connecting neighbors. The app emphasizes **mutual dignity** over charity through AI-matched offers/needs and suggested community events.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (PostCSS) with custom OKLCH color system
- **UI Components**: shadcn/ui (Radix UI primitives) in `components/ui/`
- **Animations**: Framer Motion for page transitions and micro-interactions
- **3D Visualization**: Three.js via `@react-three/fiber` and `@react-three/drei`
- **Package Manager**: pnpm

## Architecture & Key Patterns

### App Structure (App Router)
```
app/
  page.tsx           → Landing page with hero, features, CTA
  about/             → Explains bridge connections concept, social impact
  discover/          → Main matching interface (filters + list + map)
  messages/          → Chat interface (mock data)
  skills-and-needs/  → Alternative discover view
  profile/           → User profile creation (offers/needs, location, localStorage save)
```

**Shared Layout**: `app/layout.tsx` includes `<Navbar />` globally. Individual pages may re-render it (see note in discover/page.tsx).

### Component Organization
- **Feature components**: `components/` (e.g., `neighbors-list.tsx`, `community-map-3d.tsx`)
- **UI primitives**: `components/ui/` (shadcn components like `button.tsx`, `badge.tsx`)
- **State pattern**: Pages own filters/selection state; pass down as props to child components

### Data Architecture (Currently Mock)
**All data is hardcoded frontend mocks** — no backend/API exists yet:
- `components/neighbors-list.tsx` → `MOCK_NEIGHBORS` array with `offers`, `needs`, `distance`, `income`, `type`
- `components/community-map-3d.tsx` → `MAP_NEIGHBORS` (3D positions) + `CONNECTIONS` (with `isBridge` flag)
- `app/messages/page.tsx` → `mockConversations` + `mockMessages`

**Key data structure**:
```tsx
{
  id: number
  name: string
  offers: string[]      // Skills/items they share
  needs: string[]       // What they're seeking
  distance: number      // km from user
  income: 'low' | 'medium' | 'high'  // For cross-income matching
  type: 'skill-heavy' | 'high-need' | 'balanced'
  aiSuggestedMessage: string
}
```

**Profile data structure** (app/profile/page.tsx):
```tsx
{
  name: string
  bio: string
  location: string        // Address/neighborhood
  avatar: string | null
  skills: string[]        // Can offer
  items: string[]         // Can share
  needsSkills: string[]   // Looking for
  needsItems: string[]    // Need to borrow
  availability: string[]
}
```

**Data Persistence**: Profile page uses `localStorage` for temporary persistence (`neighbornet_profile` key) until backend is integrated.

### Cross-Income Bridge Visualization
The **core innovation** is visually highlighting connections that bridge income levels:
- 3D map (`community-map-3d.tsx`) renders connections with `isBridge: true` as **dashed orange lines**
- Regular connections are solid green
- Neighbor nodes color-coded by `type` (skill-heavy vs. high-need)

## Development Workflows

### Running the app
```bash
pnpm install
pnpm dev  # → http://localhost:3000
```

### Build & Type Checking
```bash
pnpm build  # TypeScript errors ignored (next.config.mjs: ignoreBuildErrors: true)
pnpm lint   # ESLint (rules not configured yet)
```

### Adding shadcn Components
Already configured in `components.json`:
```bash
npx shadcn@latest add [component-name]
```

## Code Conventions

### Styling
- Use `cn()` utility (`lib/utils.ts`) to merge Tailwind classes: `cn(baseClass, conditionalClass)`
- Color system uses **OKLCH** (see `app/globals.css`) for perceptual uniformity
- Custom properties: `--primary`, `--accent`, `--muted-foreground`, etc.
- Pill shapes default: `rounded-full` buttons, `rounded-2xl` cards

### Component Patterns
1. **Client components only**: All pages/components use `'use client'` (no SSR optimization yet)
2. **Animation pattern**:
   ```tsx
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.6 }}
   >
   ```
3. **Icon usage**: Import from `lucide-react`, wrap in shadcn `Button` with `variant="ghost"` for icon buttons
4. **Absolute imports**: Use `@/` prefix (configured in `tsconfig.json` paths)

### State Management
- **Local useState** for UI state (filters, selections, modals)
- Filter shape (see `discover/page.tsx`):
  ```tsx
  {
    skills: string[]
    items: string[]
    categories: string[]
    distance: number
    timeAvailability: string[]
    showNewNeighbors: boolean
  }
  ```

## UI Components & Patterns

### Loading States
```tsx
import { Spinner, LoadingState } from '@/components/ui/spinner'

// Inline spinner
<Spinner className="size-6" />

// Full loading state with message
<LoadingState message="Finding neighbors..." />
```

### Error Handling
```tsx
import { ErrorMessage, InlineError } from '@/components/ui/error-message'

// Full error display with retry
<ErrorMessage 
  title="Failed to load neighbors"
  message="Please check your connection and try again"
  onRetry={() => refetch()}
  variant="destructive"
/>

// Inline error for forms
<InlineError message="Please enter a valid address" />
```

### Form Patterns (Profile Page)
- Multi-select dropdowns (Skills/Items/Needs)
- Badge display for selected items
- Save to localStorage with success message
- Cancel restores from localStorage

## Key Files to Reference
- `app/about/page.tsx` → Explains bridge connections for judges/users
- `app/profile/page.tsx` → Complete profile creation flow with offers/needs
- `components/neighbors-list.tsx` → Main card list component with filtering logic
- `components/community-map-3d.tsx` → Three.js scene with bridge connections
- `components/ui/spinner.tsx` → Loading states (Spinner, LoadingState)
- `components/ui/error-message.tsx` → Error handling (ErrorMessage, InlineError)
- `app/globals.css` → Color variables and dark mode tokens
- `components/ui/button.tsx` → shadcn button with CVA variants (example for other UI components)

## Next Steps (Not Implemented)
When adding backend:
1. Replace `MOCK_NEIGHBORS` with API calls (consider React Query/SWR)
2. Add `/api/` routes for AI matching logic
3. Implement real-time messaging (consider WebSockets/Supabase)
4. Store user profiles and connection state
5. Build AI suggestion engine for "community events from aggregated needs"

## Hackathon Optimization
- **Speed over perfection**: TypeScript errors suppressed in build
- **Mock everything**: Focus on UI/UX polish before backend
- **Visual storytelling**: 3D map demonstrates "bridging" concept for judges
- **Dignity-focused design**: Use warm colors, balanced card layouts, avoid transactional language
