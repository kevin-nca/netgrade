# GitHub Copilot Repository Instructions

Purpose: Guide Copilot to make correct, minimal, and safe changes in this repo.

Project

- Ionic + React + Capacitor app (TypeScript, Vite, TypeORM)
- Platforms: Web (SQL.js), iOS/Android (Capacitor SQLite)

Key rules

- Use npm scripts only (no direct gradle/Xcode). Node >= 18.
- Services only: Implement logic in services; do not access DB or plugins from React components.
- Hooks only: In React, call services via react-query hooks; never call services directly from components.
- Migrations (native only): If entities change, add a TypeORM migration and reference it in src/db/data-source.ts. Do
  not rely on synchronize for native.
- Secrets: Do not hardcode or alter CI secrets. Do not change .github/workflows/release.yml or fastlane unless
  instructed.
- Keep changes minimal and reversible. Prefer small, focused PRs.

Common commands

- Install: npm install
- Build (type-check): npm run build
- Unit tests: npm run test
- Lint: npm run lint
- Format: npm run format (or format:check)

Standard workflow

1. Understand the requested change and locate impacted files in src/ and configs.
2. Make the smallest change consistent with existing patterns (services, repositories, hooks).
3. If schema affects native platforms, create a migration and update data-source.ts migrations.
4. Validate: npm run lint, npm run test, npm run build.

More details

- See AGENTS.md at repo root for the full guide and context.
