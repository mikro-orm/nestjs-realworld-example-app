# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS + MikroORM RealWorld example app implementing the [RealWorld API spec](https://github.com/gothinkster/realworld/tree/master/api). Uses MySQL database with JWT authentication.

## Common Commands

```bash
yarn start           # Start application (port 3000)
yarn start:dev       # Start in watch mode
yarn start:prod      # Build and run production
yarn test            # Run vitest unit tests
yarn test:watch      # Run tests in watch mode
yarn test:coverage   # Run tests with coverage
yarn test:e2e        # Run RealWorld API E2E tests (requires running server + MySQL)
yarn lint            # Lint with oxlint (type-aware)
yarn format          # Format with oxfmt
```

Run a single test file: `yarn vitest run src/user/test/user.service.spec.ts`

## Setup

```bash
yarn install
cp src/config.ts.example src/config.ts           # JWT secret
cp src/mikro-orm.config.ts.example src/mikro-orm.config.ts  # DB connection
docker compose up -d                              # MySQL on port 3307
yarn start                                        # Auto-runs migrations on startup
```

## Architecture

**Domain modules** in `src/`: `user/`, `article/`, `profile/`, `tag/` — each follows the pattern:

- `*.module.ts` — NestJS module registering controllers, services, and MikroORM entities
- `*.controller.ts` — REST route handlers
- `*.service.ts` — Business logic, injected repositories
- `*.entity.ts` — MikroORM entity definitions (uses decorator-based metadata)
- `dto/` — Request validation classes using class-validator decorators
- `*.interface.ts` — Response shape interfaces (e.g., `IUserRO`, `IArticleRO`)

**Authentication flow**: `AuthMiddleware` (`src/user/auth.middleware.ts`) validates JWT from `Authorization` header and attaches user to request. Applied selectively to routes in each module's `configure()` method. The `@User()` decorator (`src/user/user.decorator.ts`) extracts user data from the request.

**Database**: MikroORM with MySQL. Config in `src/mikro-orm.config.ts`. Migrations in `src/migrations/` run automatically on app startup via `onModuleInit` in `AppModule`.

**Shared**: `src/shared/pipes/validation.pipe.ts` — custom ValidationPipe for DTO validation.

**API docs**: Swagger UI at `http://localhost:3000/docs`, global prefix `/api`.

## Tech Stack

- **Runtime**: NestJS 11, MikroORM 7, TypeScript (strict mode, ESNext target)
- **Linting/Formatting**: oxlint + oxfmt (no ESLint/Prettier)
- **Testing**: Vitest with SWC transpiler, supertest for HTTP tests
- **Package manager**: Yarn 4 (corepack)
