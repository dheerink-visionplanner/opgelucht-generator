# Copilot Coding Agent Instructions

You are working on the **Opgelucht Generator** — a Next.js application that automates the workflow of transforming Google Alerts RSS feeds into publishable news articles for the Opgelucht.nl Joomla website.

## Architecture

- **Framework:** Next.js 16 (App Router) with React 19
- **Database:** SQLite via Drizzle ORM (`@libsql/client`)
- **Styling:** Tailwind CSS 4
- **Validation:** Zod 4
- **Testing:** Vitest with React Testing Library and jsdom
- **Language:** TypeScript (strict)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles (Tailwind)
│   └── api/                # API route handlers
│       └── feeds/fetch/    # RSS feed fetch endpoint
├── db/
│   ├── index.ts            # Drizzle client initialization
│   └── schema.ts           # Drizzle schema definitions
├── lib/
│   ├── services/           # Business logic services
│   │   └── __tests__/      # Service tests
│   └── types/              # Zod schemas and TypeScript types
docs/
├── architecture-design.md  # Architecture decisions
├── functional-requirements.md  # Feature overview and workflow
├── non-functional-requirements.md
└── features/               # Detailed feature specs with user stories
```

## Code Conventions

### TypeScript

- **Strict typing** — no `any`, no implicit types, no unhandled nulls
- Use exhaustive type checks with discriminated unions
- Export types alongside their Zod schemas
- Prefer `type` over `interface`

### Functions

- Keep functions under 20 lines, single responsibility
- Prefer early returns over deeply nested conditionals
- Use meaningful, descriptive names — no magic numbers
- Use immutable data structures (prefer `const`, spread, `map`/`filter`/`reduce`)

### File Organization

- Co-locate tests in `__tests__/` folders next to source files
- Services go in `src/lib/services/`
- Types and Zod schemas go in `src/lib/types/`
- API routes follow Next.js App Router conventions: `src/app/api/<resource>/<action>/route.ts`
- Pages follow Next.js conventions: `src/app/<path>/page.tsx`

### Database

- Schema defined in `src/db/schema.ts` using Drizzle ORM
- Use Drizzle's typed query builder — no raw SQL
- All schema changes require a migration: `npm run db:generate`
- Database client is initialized in `src/db/index.ts`

### Validation

- Use Zod schemas for all data validation (API inputs, parsed data)
- Define schemas in `src/lib/types/` and export both schema and inferred type
- Validate at system boundaries (API routes, external data parsing)

### Error Handling

- Validate inputs, handle edge cases, fail fast with clear errors
- API routes return proper HTTP status codes and JSON error responses
- Services throw typed errors; API routes catch and translate to HTTP responses
- Log errors with context (what failed, which entity, what input)

### Testing

- Use Vitest for all tests
- Test files use the pattern `*.test.ts` or `*.integration.test.ts`
- Unit tests for services and utilities
- Integration tests for API routes and database operations
- Use descriptive test names: `it("should extract source name from Google Alerts HTML content")`

## UI Guidelines

- The UI language is **Dutch**
- Use Tailwind CSS for all styling — no custom CSS unless necessary
- Components should be responsive (mobile-first)
- Use React Server Components where possible; client components only when needed for interactivity

## Workflow Pipeline

The app follows this pipeline: **Fetch → Review → Group → Classify → Generate → Edit → Publish as Draft**

Refer to `docs/functional-requirements.md` for the complete workflow diagram and `docs/features/` for detailed feature specifications.

## Commands

| Task               | Command               |
| ------------------ | --------------------- |
| Dev server         | `npm run dev`         |
| Build              | `npm run build`       |
| Test               | `npm test`            |
| Lint               | `npm run lint`        |
| Generate migration | `npm run db:generate` |
| Push schema        | `npm run db:push`     |
| Seed database      | `npm run db:seed`     |

## Validation Before Committing

Always verify before committing:

1. `npm run lint` — no lint errors
2. `npm test` — all tests pass
3. `npm run build` — build succeeds

## Commit Message Format

Use Conventional Commits: `<type>: #<issue-number> <short description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

Example: `feat: #15 add RSS feed list page with CRUD operations`

## Implementation Workflow (for Copilot coding agent)

When assigned to a story issue, follow this process:

### 1. Understand the Story

- Read the issue title, body, and comments (especially any "Implementation Plan" comment)
- Find the parent feature issue linked in the story body
- Read the detailed feature spec from `docs/features/` — the spec file is referenced in the implementation plan comment

### 2. Feature Spec → Issue Mapping

| Feature Issue | Spec File                                   | Stories            |
| ------------- | ------------------------------------------- | ------------------ |
| #2            | `docs/features/rss-feed-management.md`      | #15, #16, #17, #18 |
| #1            | `docs/features/rss-feed-fetching.md`        | #19, #20, #21      |
| #4            | `docs/features/news-item-review.md`         | #22, #23, #24      |
| #3            | `docs/features/topic-grouping.md`           | #25, #26, #27      |
| #6            | `docs/features/paywall-resolution.md`       | #28, #29           |
| #7            | `docs/features/category-management.md`      | #30, #31, #32, #33 |
| #12           | `docs/features/automatic-classification.md` | #34, #35, #36      |
| #11           | `docs/features/article-generation.md`       | #37, #38, #39      |
| #14           | `docs/features/article-preview-editing.md`  | #40, #41, #42      |
| #13           | `docs/features/draft-publication.md`        | #43, #44, #45, #46 |

### 3. Analyze the Codebase

- Search for existing patterns (services, API routes, components, types)
- Check `src/db/schema.ts` for existing tables — add new tables if the story requires them
- Check `src/lib/types/` for existing Zod schemas
- Look at existing services in `src/lib/services/` for patterns to follow
- Check `src/app/api/` for existing API route patterns

### 4. Implement

- Follow the acceptance criteria from the feature spec exactly
- Create database schema changes in `src/db/schema.ts` and generate migrations with `npm run db:generate`
- Create Zod types in `src/lib/types/`
- Create services in `src/lib/services/`
- Create API routes in `src/app/api/<resource>/<action>/route.ts`
- Create pages in `src/app/<path>/page.tsx`
- Create React components for UI stories — use Tailwind CSS, Dutch language labels

### 5. Test

- Write unit tests for every new service function
- Write integration tests for API routes
- Test files go in `__tests__/` folders next to source files
- Run `npm test` to verify

### 6. Validate & Commit

- Run all three validation gates: `npm run lint`, `npm test`, `npm run build`
- Fix any failures before committing
- Use commit message format: `feat: #<issue-number> <description>`
- Reference the issue in the PR description with `Closes #<issue-number>`
