# QI Tool Selector

QI Tool Selector accelerates problem solving for frontline care teams, managers, and facilitators. It provides a guided decision experience, plain-language explanations, sustainment nudges, and one-click A3 (9-box) exports for spreading improvement.

## Project layout

```
.
├── apps
│   ├── backend   # Express + Prisma API
│   └── frontend  # React + Vite experience
├── docs          # OpenAPI specification and collateral
├── prisma        # Database schema and seed data (in backend app)
└── scripts       # Automation hooks (future use)
```

## Features

- **Three experience modes** (Fast Track, Guided, Facilitator) matched to frontline, manager, and QI facilitator personas.
- **Plain vs. technical labels** toggle that persists per user.
- JSON-driven **decision tree** with complexity/resource filters and tailored rationales.
- Sustainment prompts for **control plans, huddles, and 30/60/90 follow-ups**.
- Feedback loop capturing effectiveness, time vs. value, and qualitative insights.
- **pptxgenjs-powered 9-box A3 export** with placeholders for charts and logos.
- Role-based access with JWT auth (frontline, manager, facilitator, admin).
- Prisma data model aligned to the specification plus Vitest/RTL coverage for critical logic.
- Docker-ready structure with environment configuration.

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- (Optional) Docker & docker-compose for containerised runs

### Install dependencies

```bash
npm install
```

This installs both backend and frontend workspaces and runs `prisma generate` automatically.

### Environment variables

Copy the backend example environment file:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Adjust values as needed. The default configuration uses a local SQLite database for development.

### Database

Generate the SQLite database and seed reference data:

```bash
cd apps/backend
npx prisma migrate dev --name init
npm run prisma:seed
cd -
```

### Run the backend API

```bash
cd apps/backend
npm run dev
```

The API listens on `http://localhost:4000` by default.

### Run the frontend

In a separate terminal:

```bash
cd apps/frontend
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies API requests.

### Testing

Run the complete test suite:

```bash
npm test
```

This executes Vitest-based tests in both workspaces.

## Docker

A Dockerfile and compose definition can be added to the `scripts/` folder for production deployment. The current structure aligns with multi-stage Node builds and Prisma migrations.

## API documentation

An OpenAPI 3.0 document lives in [`docs/openapi.yaml`](docs/openapi.yaml). Import it into tools such as Stoplight, Postman, or Redocly to explore available endpoints and payloads.

## Accessibility & UX

- Uses semantic HTML, keyboard-focusable controls, ARIA-friendly dialog components, and WCAG 2.1 AA colour contrast.
- Supports plain language messaging by default, with a technical toggle for advanced users.
- Decision flows limit choices to five prompts before recommendations (per acceptance criteria).

## Feedback & Improvements

The `/feedback` endpoint feeds a lightweight learning system. The `/dashboard/usage` route (restricted to facilitator/admin) aggregates mode usage, tool/package frequency, and feedback sentiment, enabling continuous calibration.

## Sample workflow

1. Register as a facilitator to unlock all features.
2. Toggle plain language labels as desired.
3. Try Fast Track with goal “Incident → Near Miss” and `<2h` resources.
4. Review the Good Catch + Quick 5 Whys package with sustainment prompts.
5. Export the auto-generated 9-box A3 to share with your team.
6. Capture effectiveness feedback to improve recommendations.

## License

This project is released for evaluation purposes. Tailor authentication, persistence, and deployment practices before production use.
