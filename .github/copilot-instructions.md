# Copilot instructions for Raj Jobs (client)

Quick summary

- This repository is a Next.js (app-router) frontend located under `client/` (Next 16, React 19, TypeScript). Start locally with: `cd client && npm install && npm run dev` (default: http://localhost:3000). ✅

What to know first (big picture)

- App structure: it's a single Next.js app using the `app/` directory. Key files:
  - `app/layout.tsx` — global layout (loads `Navbar` and `Footer`).
  - `app/page.tsx` and route folders (e.g. `app/courses`, `app/downloads`, `app/auth`).
  - UI components are in `components/` and design-system primitives are under `components/ui/`.
- Styling: Tailwind + custom CSS in `app/globals.css`. Shadcn-style components are present (`components.json`). Use Tailwind utility classes and `cn()` helper for conditional class composition (`lib/utils.ts`).
- Conventions:
  - Server components are the default (app dir). Add `"use client"` at top for components that use hooks/browser APIs (example: `app/auth/page.tsx`, `app/courses/[courseId]/page.tsx`).
  - Use the `@/` path alias for imports (configured in `tsconfig.json`).
  - UI components follow shadcn patterns (e.g., `components/ui/button.tsx` uses `class-variance-authority` + `cva`). When adding UI primitives follow the same pattern and export consistently.
  - Route-level loading UI handled via `loading.tsx` files in route folders (see `app/downloads/loading.tsx`).
  - Dynamic routes use `[param]` (example: `app/courses/[courseId]/page.tsx`). `next/navigation` helpers like `notFound()` are used.

Data & integration points

- Currently pages use mocked data (examples: `app/courses/[courseId]/page.tsx` uses `getCourseData`). Replace mock functions with server-side fetches (prefer server components or `fetch()` in server components) or add API routes if needed.
- No backend API or server code in this repo — hooking to an external API or adding `app/api` routes is expected for real data.
- Static assets live in `public/` and are referenced directly (logo `/logo.png`), using `next/image` in components (ensure `width/height` or `fill` usage, see `components/navbar.tsx`).

Developer workflows

- Local dev: `npm run dev` (from `client/`).
- Build for production: `npm run build` and `npm start` to run the build.
- Lint: `npm run lint` (ESLint configured in `eslint.config.mjs`).
- No test framework found — adding tests should follow TypeScript + Jest/Testing Library conventions if introduced.

Code patterns and small rules for the agent

- Prefer server components for data fetching and rendering; only mark components with `"use client"` when they require state/events/browser APIs.
- When editing styles, check `app/globals.css` and reuse Tailwind utilities; prefer `cn()` for class merging (`lib/utils.ts`).
- When adding UI primitives, mimic existing `components/ui/*` patterns (CVA variants, `Slot`/`asChild` pattern, and `cn` usage). See `components/ui/button.tsx` for canonical example.
- Keep TypeScript strictness and annotate exported component props — `tsconfig.json` has `strict: true`.
- Use the `components.json` file as canonical config for adding shadcn-generated components.

Files to reference when making changes

- `app/layout.tsx`, `app/page.tsx` — app entry / layout
- `components/` and `components/ui/` — UI building blocks
- `lib/utils.ts` — `cn()` helper for class names
- `components.json` — shadcn component config
- `app/*/loading.tsx` — pattern for loading UI
- `package.json` — run scripts: `dev`, `build`, `start`, `lint`

Missing / noteworthy items

- No CI config, no tests, and no agent instruction files exist yet — this file is intended to be the minimal guidance for new AI agents.
- No environment variables or secrets usage detected; the repo ignores `.env*` in `.gitignore`.

If anything's unclear or you'd like this expanded into automated pull-request templates or a CI job checklist, say which part to expand and I will iterate. 🔧