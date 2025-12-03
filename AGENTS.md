# AGENTS.md

Last updated: 2025-08-29 16:51 local

Purpose: This document gives AI coding agents (GitHub Copilot, OpenAI Codex, Junie, etc.) a concise, safe, and
actionable guide to work effectively in this repository. It outlines tasks you can automate, conventions to follow, and
guardrails to avoid breaking the app or release processes.

If you are a human contributor, you may also find this useful as a quick project guide.

## 1. Project summary

- Name: NetGrade (Ionic + React + Capacitor app)
- Platform targets: Web (SQL.js), iOS/Android (Capacitor SQLite)
- Language/stack: TypeScript, React, Vite, TypeORM, Capacitor
- Testing: Vitest (unit), Cypress (e2e)
- Lint/Formatting: ESLint, Prettier
- CI/Release: GitHub Actions (iOS build via Fastlane on release publish)

High-level goal: Manage and visualize grades/exams/schools/subjects with local persistence and smooth cross-platform UX.

## 2. Repository quick map

- src/
  - db/
    - data-source.ts — DataSource initialization, repositories, native vs web DB setup
    - entities/ — TypeORM entities (Exam, Grade, School, Subject)
  - pages/ — Ionic/React pages (e.g., home)
  - services/ — Domain services (e.g., GradeService, PreferencesService) Never interact with Ionic Plugins or the DB
    directly always implement it in a service and add tests for each API in the service.
  - hooks/queries/ - In React only call services using react-query hooks, and never directly.

## 3. Environment & prerequisites

- Node.js: 18+ (CI uses Node 20; Vite 5 requires Node >= 18)
- Package manager: npm (package-lock.json present)

Always make sure that the following commands work:

- Install dependencies: npm install
- Run dev server: npm run dev
- Build app: npm run build
- Run unit tests: npm run test
- Run e2e tests: npm run e2e
- Lint: npm run lint
- Format: npm run format

Do not interact with gradle or Xcode directly.

## 4. Coding conventions

- TypeScript: target strict patterns; keep types explicit for public APIs.
- Lint/format: run npm run lint and npm run format; keep zero warnings in CI-bound changes.
- React/Ionic:
  - Keep components pure, prefer hooks.
  - Maintain accessibility and mobile performance.
- Services: Encapsulate domain logic (e.g., GradeService). In React, access services only via react-query hooks; never
  call services directly from components. Avoid direct DB usage outside service/data layers.
- UI Components: Implement reusable components that have local styling, do not create inline styling, always have it in
  a separate CSS module.

Commit style:

- Conventional-style summaries encouraged (feat:, fix:, docs:, refactor:, test:, chore:).
- Keep PRs small and focused. Include rationale in description.

## 5. Agent operating instructions

This section is for AI agents (Copilot, Codex, Junie, etc.). Follow these steps to minimize errors and maximize utility.

- Read before you change:

  1. Identify the requested change and impacted files (search in src/ and config files).
  2. If DB entities are affected, check src/db/data-source.ts migration settings.
  3. Check scripts in package.json to know how to test and build.

- Make minimal, reversible changes:

  - Prefer small PRs touching the least number of files.
  - Update or add tests (Vitest/Cypress) as needed.
  - Run lint and format scripts.

- Validate locally:

  - Web: npm run dev, verify pages impacted.
  - Unit tests: npm run test; E2E: npm run e2e if relevant.

- Do/Don’t:

  - Do add/update TypeORM migrations for native DB schema changes.
  - Do not hardcode secrets or modify CI secrets usage.
  - Do align with existing patterns (services, repositories, hooks).
  - Do not downgrade TypeScript/Vite; ensure Node >= 18.
  - Do write code in English (including logging and comments), and a UI in German.

- Error reproduction:
  - Write a short script/test to reproduce a bug before fixing when feasible.

## 6. Security & privacy

- Do not commit secrets. CI expects secrets via GitHub Actions secrets.
- Never log sensitive data (tokens, personal user data).
- For data persistence, local storage is used (SQLite/SQL.js + localForage). Treat it as user-local only.

## 7. How to propose schema or API changes

- Create a migration for native.
- Provide data backfill steps when needed.
- Update services that use repositories (e.g., GradeService) and pages consuming them.
- Add/adjust tests.

## 8. Agent compatibility notes

- File is named AGENTS.md at repo root for maximum discoverability by common AI tools.
- GitHub Copilot reads .github/copilot-instructions.md in this repo; keep it in sync with AGENTS.md.
- All command examples use npm scripts declared in package.json.
- Avoid interactive tools in CI context (no vim, etc.).
- Prefer deterministic steps: edit, lint, test, build.

## 9. Minimal checklists

- Before commit:
  - [ ] Code compiles: npm run build
  - [ ] Lint clean: npm run lint
  - [ ] Formatted: npm run format:check
  - [ ] Tests pass: npm run test
- If DB schema changed:
  - [ ] Migration added and referenced in src/db/data-source.ts (native)
  - [ ] Web sync behavior considered

Thank you for contributing! Agents and humans alike should keep changes minimal, well-tested, and easy to review.
