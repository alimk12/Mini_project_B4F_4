# B4F Assessment Platform — Team 3

Weekly Mini Project 04, B4F Next/Nest Bootcamp (Cohort 8, Salamiyah).

The platform runs three ordered tests: **IQ** (multiple choice), **HTML & CSS** (multiple choice) and **JavaScript Problem Solving** (coding).

| Folder | What | Owners |
| --- | --- | --- |
| `docs/` | `API.md` (the contract), `PROJECT-STRUCTURE.md`, `TASKS.md`, and one PDF work package per person in `docs/work-packages/` | Ali |
| `api/` | NestJS 10 + Prisma 6 + PostgreSQL 16 | Esmaeel, Majed, Rami |
| `client/` | React 18 + TypeScript + Vite + Monaco (bundled, no CDN) | Ali, Maya |
| `tools/` | Local test tooling (see section 5) | — |

**Read your work package first:** `docs/work-packages/0X - <your name> - ....pdf`. The full details are in `docs/TASKS.md`.

---

## 1. Where we are: Phase 0 is on `main`

`main` contains the shared foundation from `TASKS.md` section 5. Every file you own already exists as a **placeholder or stub**, with its fixed name, props and method signatures, so nobody has to touch a shared file to start.

- **Backend:** the full Prisma schema and first migration, global modules, the validation pipe and error filter, Swagger, and **every route** from `API.md`. Each service method returns example JSON and is marked `// STUB: replace with real implementation`. The guards let every request through for now. DTOs use `@Allow()` until their owner adds the real validators.
- **Frontend:**
  - Done in full: the types, the services, `http.ts`, `AuthContext`, every route, `RequireRole`, the layout, and the Monaco setup (no CDN).
  - Placeholders and skeletons, with the fixed props and value shapes: the shared UI components, the other four contexts, the exam-guard toolkit, `CodeEditor`, and every page.

Search for `STUB` (backend) or `PLACEHOLDER` / `SKELETON` (frontend) to find your files.

## 2. Run it

Requirements: Node.js 20+ and PostgreSQL 16. If `npm install` is blocked, run `npm config set registry https://registry.npmmirror.com` first.

```bash
# Backend
cd api
cp .env.example .env          # set DATABASE_URL
npm install
npx prisma migrate deploy
npx prisma db seed            # 3 tests and the users (questions/problems: Majed's seed files, empty for now)
npm run start:dev             # http://localhost:3000/api   ·   Swagger: http://localhost:3000/api/docs

# Frontend (second terminal)
cd client
cp .env.example .env          # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev                   # http://localhost:5173
```

The placeholder Sign in page has two buttons, **Stub sign in as instructor** and **Stub sign in as student**. Use them to open every placeholder route against the stub backend. Open `/student/attempts/1` to check that the Monaco editor loads with no request to any CDN (Network tab).

## 3. How we work

1. **Before you start:** `git checkout main && git pull`, then create your own branch: `git checkout -b <name>/<task>`, for example `maya/my-tests` or `rami/attempt-state`.
2. Edit **only the files you own** (`docs/PROJECT-STRUCTURE.md` section 12, and your work package). If you need a change in someone else's file, ask them.
3. Small PRs into `main`, using the PR template. Each PR needs one approval (`TASKS.md` section 2). Pull `main` again before every new branch.
4. `docs/API.md` is the contract between the frontend and the backend. Any change to it goes through Ali.
5. Never commit `.env`, keys or passwords.

**First steps after Phase 0** (`TASKS.md` section 5):
- **Majed:** the execution spike. Find which Judge0 host works from Syria without a VPN, write it in `api/src/execution/SPIKE.md`, and post the URL in the chat (never the key).
- **Rami:** the attempt state table, as a comment at the top of `attempt-state.service.ts`, in your first PR.
- **Maya:** a sketch of the five student screens.
- **Ali and Esmaeel:** the first small PRs, the shared UI (Ali) and auth (Esmaeel), because everyone else uses them.

## 4. Environment (`api/.env`)

See `api/.env.example` and `docs/PROJECT-STRUCTURE.md` section 7.9. Execution runs in `mock` mode until Majed's Judge0 provider is ready. Before hosting, follow the checklist in section 7.10.

## 5. Tools

- `tools/fake-judge0/server.mjs` imitates the Judge0 API on port 2358 using your local Node.js. It is for **local testing only**: it runs code without a sandbox.
- `tools/e2e/api-flow.mjs`, `tools/e2e/expiry.mjs` and `tools/e2e/ui-walkthrough.cjs` are acceptance tests for the **finished** project. They fail on the stubs. Run them against a fresh seed when your parts are done.
