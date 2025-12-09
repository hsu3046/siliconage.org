# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Silicon Age is an interactive visualization of computing and AI history from the transistor era to modern AI. It displays a knowledge graph showing relationships between Companies, People, and Technologies using D3.js force-directed graph visualization with React and TypeScript.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate AI content cache
npm run generate-cache

# i18n: Extract node IDs for translation
npm run i18n:extract

# i18n: Translate extracted nodes
npm run i18n:translate

# i18n: Full sync (extract + translate)
npm run i18n:sync
```

## Debug Mode

Visit `/debug` in development mode to access the Debug Dashboard with:
- Node browser with integrity checking
- Link relationship viewer
- Statistics dashboard
- Data management tools

## Environment Setup

- Create a `.env` file with `VITE_GOOGLE_API_KEY` for Gemini API integration
- The API key is used for AI-powered node detail generation via Google's Gemini 2.0 Flash model
- Note: The `.env` file contains the actual API key and should not be committed (already in `.gitignore`)

## Core Architecture

### Data Model (`types.ts`)

The application uses three primary entity types:

- **Category**: COMPANY, PERSON, TECHNOLOGY
- **LinkType**: CREATES, POWERS, CONTRIBUTES, ENGAGES (each with different visual weight and semantic meaning)
- **NodeData**: Core entity with metadata including:
  - `impactRole`: Role-based classification (CompanyRole, PersonRole, TechRole) that affects visual sizing
  - `_radius`: Visual node size (computed by ranking algorithm)
  - `_zoneRadius`: Company influence zone radius (for COMPANY nodes only)
  - `techCategoryL1/L2`: Hierarchical tech categorization
  - `companyCategories`: Multi-category classification for companies

### Data Definition (`constants.ts`)

- All historical data is defined in a single large file using builder functions:
  - `createCompany()`, `createPerson()`, `createTech()`
  - Link creation helpers (with optional story, startYear, endYear):
    - `linkPowers()` - Dependency/infrastructure (orange, solid line)
    - `linkCreates()` - Creation/founding (cyan, solid line)
    - `linkContributes()` - Evolution/influence (purple, dotted line)
    - `linkRival()` - Competition/rivalry (uses ENGAGES type, rivalry icon)
    - `linkPartner()` - Cooperation/partnership (uses ENGAGES type, heart icon)
- `ERAS`: Timeline divisions (Genesis, Silicon Dawn, PC Revolution, Internet Age, Mobile Revolution, Rise of AI, AI Renaissance)
- `CATEGORY_COLORS`, `COMPANY_CATEGORY_COLORS`: Visual theming
- `addEvent()`: Create timeline events without nodes (for HistoryView stories)

### Visual Sizing Algorithm (`utils/ranking.ts`)

**Critical**: The `calculateSiliconRank()` function must run ONCE at app initialization (see [App.tsx:24](App.tsx#L24)) to compute all node radii before rendering.

**Technology nodes**: Fixed sizes based on TechRole hierarchy
- L0 (FOUNDATION - Theory/Physics): 50px radius
- L1 (CORE - Hardware): 35px radius
- L2 (PLATFORM - Runtime): 25px radius
- L3 (APPLICATION): 15px radius

**Company nodes**: Base 35px radius + dynamic zone radius (80-250px) calculated from:
- Connection type weights (CREATES=10, POWERS=8, CONTRIBUTES=3, ENGAGES=1)
- Connected node category multipliers (TECHNOLOGY=1.0, COMPANY=0.3, PERSON=0.1)
- TechRole bonuses for connected technologies

**Person nodes**: Fixed minimum 10px radius

### State Management (`App.tsx`)

Root component manages all global state:
- `viewMode`: 'MAP' | 'TIMELINE' | 'CARD' | 'LINKS' (four different visualization modes)
- `selectedNode`: Currently selected entity for detail panel
- `focusNodeId`: Node to center and highlight in map view
- `visibleCategories`: Toggle visibility by Category
- `visibleLinkTypes`: Toggle visibility by LinkType
- `companyMode`: 'FULL' | 'MINIMAL' | 'HIDDEN' (affects company node display)
  - In Map view: 3-state toggle (FULL → MINIMAL → HIDDEN → FULL)
    - FULL: Shows company nodes with labels and influence zones
    - MINIMAL: Shows only company nodes without zones (reduces visual clutter)
    - HIDDEN: Hides all company nodes
  - In History/Card views: 2-state toggle (FULL ↔ HIDDEN)

Data flows down to four main view components that share the same dataset but render differently.

### View Components

**MapView** ([components/MapView.tsx](components/MapView.tsx))
- D3.js force-directed graph with custom physics configuration
- All physics parameters centralized in `PHYSICS_CONFIG` object (lines 24-95)
- Uses multiple force simulations: forceX/Y (spreading), charge (repulsion), collide (overlap prevention), link (connection strength)
- Implements custom "Featured Node of the Day" highlighting
- Handles responsive layout with landscape/portrait physics adjustments
- Company zone rendering: semi-transparent circles showing influence radius

**HistoryView** ([components/HistoryView.tsx](components/HistoryView.tsx))
- Timeline-based chronological view organized by ERAS
- Year-based sorting and grouping

**CardView** ([components/CardView.tsx](components/CardView.tsx))
- Grid-based card layout for browsing entities
- Sortable and filterable

**LinksView** ([components/LinksView.tsx](components/LinksView.tsx))
- Relationship-focused view showing connections between entities

**DetailPanel** ([components/DetailPanel.tsx](components/DetailPanel.tsx))
- Displays detailed information about selected node
- Integrates with Gemini AI for enhanced content (via `geminiService.ts`)

### AI Content System

**Three-tier caching strategy**:

1. **Static cache** (`services/staticCache.ts`): Pre-generated AI responses compiled at build time
2. **LocalStorage cache**: Client-side persistence for runtime-generated content
3. **Live API calls**: Fallback to Gemini API with Google Search grounding

**Generation script** (`scripts/generateCache.ts`):
- Parses `constants.ts` to extract all nodes
- Batches API calls (5 nodes per batch, 2-second delay)
- Generates structured JSON responses with summary, significance, and keyFacts
- Outputs to `services/staticCache.ts`

### Internationalization (i18n)

The app supports multiple languages (English, Korean, Japanese):

- Translation files: `locales/{en,ko,ja}/ui.json` and `locales/{en,ko,ja}/nodes.json`
- `useLocale()` hook provides `t()` function and current locale
- Translations are lazy-loaded for performance
- HTML `lang` attribute is automatically updated for proper font rendering
- Node descriptions can be localized via the nodes.json files
- UI strings use dot notation keys (e.g., `t('about.title')`)

### Routing and URLs

SEO-friendly URLs using react-router-dom:

- Node detail pages: `/{category}/{id}` (e.g., `/company/apple`, `/tech/transistor`)
- View modes: `/history`, `/cards`, `/links` (map view is at `/`)
- About page: `/about`
- Legacy query params supported for backwards compatibility: `?node=apple`
- URL updates happen automatically when navigating, maintaining deep-linkability

### Path Aliases

TypeScript uses `@/*` alias mapping to repository root (configured in [tsconfig.json:21](tsconfig.json#L21) and [vite.config.ts:18](vite.config.ts#L18)).

## Key Technical Details

### D3 Force Simulation Integration

The MapView component manages D3's force simulation lifecycle:
- Simulation is created/updated when data or filters change
- Multiple forces work together to position nodes (see `PHYSICS_CONFIG` at [MapView.tsx:25-102](components/MapView.tsx#L25-L102))
- All physics parameters are centralized in `PHYSICS_CONFIG` for easy tuning:
  - `forceX`/`forceY`: Spreading forces (different for landscape vs portrait)
  - `charge`: Repulsion between nodes (stronger for companies)
  - `collide`: Overlap prevention with buffer zones
  - `link`: Connection strength and distance
  - `focusMode`: Separate physics for focused view (tighter clustering)
- Company separation and link-based gravity create semantic clustering
- Focus mode adjusts forces to highlight specific nodes and their connections

### Focus Mode

Double-clicking any node activates Focus Mode, which:
- Shows only the focused node and its 1st and 2nd degree connections
- Ignores category/link type filters (shows all connections)
- Uses tighter physics for better readability (see `PHYSICS_CONFIG.focusMode`)
- Displays focus indicator in header with exit button
- Updates URL to node detail page (e.g., `/company/apple`)
- Press ESC or click exit button to return to normal view
- Different views show different connection depths:
  - MapView: Shows 1st and 2nd degree connections
  - HistoryView/CardView/LinksView: Shows only 1st degree connections

### Node Filtering

Filtering is non-destructive: original `INITIAL_DATA` remains unchanged. Filtered data is computed in `App.tsx` using `useMemo` based on:
- `visibleCategories`: Show/hide entire categories
- `visibleLinkTypes`: Show/hide specific relationship types
- Links are included only if both source and target nodes are visible
- In Focus Mode, category and link type filters are bypassed

### Performance Considerations

- Components use `React.memo()` where appropriate
- Large computations wrapped in `useMemo()` hooks
- D3 simulation runs in-place on node objects (mutation-based for performance)
- The ranking algorithm runs once at startup, not on every render

## Adding New Entities

When adding entities to `constants.ts`:

1. Use the builder functions: `createCompany()`, `createPerson()`, `createTech()`
2. Specify appropriate `impactRole` (affects visual sizing via ranking algorithm):
   - For tech: TechRole.L0_THEORY_PHYSICS, L1_CORE_HARDWARE, L2_RUNTIME_PLATFORM, L3_END_APPLICATION
   - For people: PersonRole.VISIONARY, THEORIST, BUILDER, LEADER, INVESTOR
3. Add relevant metadata:
   - Tech: `techCategoryL1/L2` for categorization
   - Companies: `companyCategories` (array), optional `marketCap: { current, peak }`
   - People: `primaryRole`, `secondaryRole`, `birthYear`, `deathYear`
4. Create relationships using link helper functions:
   - `linkPowers(source, target, story?, startYear?, endYear?)` - Infrastructure/dependency
   - `linkCreates(source, target, story?, startYear?, endYear?)` - Creation/founding
   - `linkContributes(source, target, story?, startYear?, endYear?)` - Influence/evolution
   - `linkRival(source, target, story?, startYear?, endYear?)` - Competition
   - `linkPartner(source, target, story?, startYear?, endYear?)` - Collaboration
5. Optionally add timeline events with `addEvent(story, year, endYear?, relatedNodes?)`
6. Run `npm run generate-cache` to regenerate AI content for the new entity
7. Run `npm run i18n:sync` to extract and translate the new entity (if using i18n)
8. The ranking algorithm automatically processes new nodes on app startup (no manual intervention needed)

## Testing AI Features Locally

The Gemini service requires `VITE_GOOGLE_API_KEY` environment variable. Missing keys will log console errors but won't crash the app - it falls back to generic error messages.
