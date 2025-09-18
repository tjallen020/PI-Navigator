# QI Tool Selector

QI Tool Selector helps frontline healthcare teams, managers, and facilitators quickly match their improvement goals with the right quality improvement (QI) tools. It provides fast recommendations, guided decision support, facilitator-focused capabilities, sustainment prompts, and an exportable A3 9-box PowerPoint.

## Monorepo layout

```
PI-Navigator/
├── apps/
│   ├── client/    # React + Vite frontend (TailwindCSS, SWR, Zustand)
│   └── server/    # Express + TypeScript backend with JSON decision logic
├── package.json   # npm workspaces entry point
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```
npm install
```

This installs dependencies for both the `client` and `server` workspaces.

### Environment variables

Create a `.env` file inside `apps/server` using the provided example.

```
cp apps/server/.env.example apps/server/.env
```

### Development

Start the backend and frontend in separate terminals.

```bash
cd apps/server
npm run dev
```

```bash
cd apps/client
npm run dev
```

The frontend dev server runs on http://localhost:5173 and proxies API calls to the backend on http://localhost:4000.

### Tests

Run unit tests for backend and frontend:

```
cd apps/server
npm test
```

```
cd apps/client
npm test
```

### Building for production

```
cd apps/server
npm run build

cd ../client
npm run build
```

## Key capabilities

- **Fast Track**: ≤3 clicks to get a tool package, rationale, sustainment prompts, and quick links (Start PDSA, Add Metric, Export A3 PPT).
- **Guided Path**: Decision-tree walkthrough (goal → context → filters) with breadcrumbs, rationale, and sustainment nudges.
- **Facilitator Mode**: Unlocks DMAIC/DMADV, DOE, capability analysis prompts, charter/change-plan helpers, and extended export prep.
- **Plain vs Technical labels**: Toggle in the header persists preference via local storage and is honoured in recommendations.
- **Resource filters**: Simple “under 2 hours / over 2 hours” gating for recommended tools.
- **Rationale**: Path-specific explanations for tools reused in multiple contexts (e.g., Run Chart baseline vs PDSA monitoring).
- **Sustainment nudges**: Control plan checklist, huddle reminders, and 30/60/90 day follow-ups accompany every recommendation.
- **A3 export**: `/export/a3ppt` builds a 9-box A3 PowerPoint with title, grid layout, and placeholders for charts/notes.
- **Feedback loop**: `/feedback` captures effectiveness, time vs value, and comments to inform future analytics.
- **OpenAPI**: `apps/server/src/openapi.yaml` documents the API surface.

## Seeded knowledge base

The backend ships with JSON-driven seed data for tools, packages, decision nodes (including Path E incident handling), and rationale text. Updating decision logic can be done by editing the JSON without recompiling TypeScript.

## Docker (future work)

A production Dockerfile can combine the built server bundle and static frontend assets. This project includes the core application code and tests; containerization can be layered per deployment needs.

## Accessibility and UX

- Tailwind-based theming with WCAG 2.1 AA colour contrast.
- Keyboard-focus friendly forms and buttons.
- Breadcrumb navigation for guided flow.
- Plain-language copy and helper text for frontline personas.

## Further enhancements

- Integrate with a persistent database (Prisma/PostgreSQL) for sessions and feedback instead of the in-memory store.
- Add authentication UI and role-based dashboards.
- Implement chart capture/upload for PPT export.
- Extend Playwright E2E coverage for key personas.
