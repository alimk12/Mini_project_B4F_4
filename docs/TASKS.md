# Weekly Mini Project 04 — Tasks & Team Workflow

## 1. Team

| Member | Main Task | Area |
| --- | --- | --- |
| Ali Mikdad (Team Lead) | Frontend foundation + Auth screens + Instructor screens + Exam-guard toolkit + Review & Integration | Frontend |
| Maya Al Hamwi | Student screens: My Tests, Test Intro, MCQ test (with autosave), Coding test (editor, Run, Submit), My Results + exam-guard wiring | Frontend |
| Esmaeel Mahfoud | Backend foundation + Prisma schema + Seed + Auth & Roles + Exam integrity (violations, termination, session lock) + Attempts list & Results + Endpoint testing | Backend |
| Majed Hmoud | Test content (publish, questions, problems, MCQ seed, shuffled order) + Code Execution Service (mock + Judge0, harness, readable errors) | Backend |
| Rami Al Shaar | Attempt state & timing + Scoring + Student tests + Start (pledge, order, session) + MCQ autosave & submit + Coding Run / Submit / Finish | Backend |

Nawar Hasan is not part of this split.

### Working pairs

Each frontend member works with the backend members of their screens. The endpoints are fixed in `docs/API.md`, so you only agree on small details.

| Feature | Backend | Frontend |
| --- | --- | --- |
| Sign in / Sign up | Esmaeel | Ali |
| Test management + editor | Majed | Ali |
| Instructor attempts | Esmaeel | Ali |
| My Tests + Test Intro + start | Rami | Maya |
| MCQ test | Rami | Maya |
| Coding test (Run, Submit, Finish) | Rami + Majed (execution) | Maya |
| My Results | Esmaeel | Maya |
| Exam integrity (full screen, tab switch, copy/paste, termination, session) | Esmaeel (+ Rami's scoring) | Ali (toolkit) + Maya (wiring) |

### Reviews

- Ali approves the Pull Requests of everyone else.
- Maya approves Ali's frontend Pull Requests. Esmaeel approves Ali's PRs that touch `docs/` only.
- Backend PRs also get a quick look from one other backend member before Ali approves.

### Fair split (estimated hours)

| Member | Phase 0 | Main work | Shared work | Total |
| --- | --- | --- | --- | --- |
| Ali | 3 h (repo + client skeleton) | 12 h (auth 2, test management 1.5, test editor 4, attempts + violation log 2, exam-guard toolkit 2.5) | 3 h (reviews, integration, README) | ~18 h |
| Maya | 1 h (wireframes) | 15.5 h (my tests 1.5, intro + pledge + full screen 1.5, MCQ + autosave 3.5, coding 5.5, results 1, countdown 1, guard wiring + warnings 1.5) | 1 h | ~17.5 h |
| Esmaeel | 4.5 h (api skeleton, full schema, migration, stubs) | 10 h (auth 2.5, users seed 1, integrity module 3.5, attempts list + results 2, Swagger 1) | 3 h (`api.http` testing) | ~17.5 h |
| Majed | 2 h (execution spike) | 14.5 h (content 5, MCQ seed 1.5, shuffled order 1, execution 7) | 1 h | ~17.5 h |
| Rami | 1 h (state design) | 16 h (attempt state 3, scoring service 1, student tests + start with pledge/order/session 3.5, MCQ autosave + submit 3.5, coding 5) | 1 h | ~18 h |

The hours are targets, not promises. If one member finishes early, they help **by testing and reviewing**, not by editing someone else's files.

---

# 2. Team Rules

### Everyone must understand the whole project

Each member builds one area, but everyone must be able to explain:

- the user flow: instructor prepares and publishes → student takes the tests in order → scores
- the roles and what each one can and cannot do
- why the backend owns the clock, the order, and every score
- how an attempt becomes IN_PROGRESS, SUBMITTED, EXPIRED, or TERMINATED (and the 10-second grace)
- why EXPIRED is `null`, never `0`
- how the MCQ score is calculated
- Run vs. Submit: sample case vs. hidden cases, the 20-run limit, one submit per problem
- how code execution works (mock and Judge0) and why student code never runs on our server
- how hidden test cases and correct options are kept out of student responses
- the frontend routes and the five contexts
- the backend modules, guards, DTOs, and the finish transaction
- why every feature works in Syria without a VPN
- exam integrity: what counts as a violation, the limits (2 focus, 3 copy/paste), why the server decides, how a terminated attempt is scored from what was saved, and what the browser checks can and cannot prevent

Every member speaks in the final English presentation.

### Work alone, join through the contract

- Your work depends on `docs/API.md` and `docs/PROJECT-STRUCTURE.md`, not on someone's unfinished code.
- In Phase 0, stubs are added: every endpoint already answers with example data from `API.md`.
- Replace stubs only inside your own module.

### Stay in your lane

- Edit only the files you own (section 4).
- Never push to `main`.
- Check your branch before every commit.
- Never change a fixed name, field, endpoint, or message without the team lead.

---

# 3. Technology

See `PROJECT-STRUCTURE.md`, section 3. In short:

- **Frontend:** React, TypeScript, Vite, React Router, Context, plain CSS, Monaco (bundled locally)
- **Backend:** NestJS 10, Prisma 6.7.0 + PostgreSQL, JWT + bcrypt, class-validator, Swagger, Logger
- **Execution:** `CodeExecutionService` with mock mode (CORE) and Judge0 mode (CHALLENGE, external)

### Not allowed

- running student code on our server (`eval`, `new Function`, `vm`, `child_process`, local containers)
- Redux, React Query, Zustand, Tailwind, any CSS framework
- webcam or video proctoring, screen recording, plagiarism detection, WebSockets, emails, cloud deployment
- exam-integrity checks outside the approved design (`API.md` section 19, `PROJECT-STRUCTURE.md` section 16)
- any CDN, Google Fonts, or outside host in the browser
- new npm packages without asking (Ali for `client/`, Esmaeel for `api/`)

---

# 4. File Ownership

Every file has exactly one owner. The full list is in `PROJECT-STRUCTURE.md`, section 12.

## Frontend

### Ali

```text
client/src/
├── App.tsx   main.tsx   constants.ts
├── routes/                       (AppRouter.tsx, RequireRole.tsx)
├── styles/   assets/
├── components/layout/
├── components/common/            (everything except Countdown*)
├── context/AuthContext.tsx
├── context/InstructorTestsContext.tsx
├── context/InstructorAttemptsContext.tsx
├── services/http.ts   services/auth.api.ts   services/instructor.api.ts
├── types/common.types.ts   types/auth.types.ts   types/instructor.types.ts
├── utils/format.ts   utils/tokenStorage.ts
├── editor/monacoSetup.ts
├── exam-guard/                   (useFullscreen, useExamGuard, editorPasteGuard, FullscreenGate, ViolationWarningDialog)
├── pages/Auth/
├── pages/instructor/
└── pages/NotFound/
```

### Maya

```text
client/src/
├── components/common/Countdown.tsx (+ css)
├── context/StudentTestsContext.tsx
├── context/AttemptContext.tsx
├── services/student.api.ts
├── types/student.types.ts   types/execution.types.ts
├── utils/serverClock.ts   utils/attemptSession.ts
├── editor/CodeEditor.tsx   editor/CodeEditor.css
└── pages/student/
```

## Backend

### Esmaeel

```text
api/
├── prisma/schema.prisma   prisma/migrations/   prisma/seed.ts
├── prisma/seed-data/users.ts
├── requests/api.http
├── .env.example   package.json
└── src/
    ├── main.ts   app.module.ts
    ├── common/
    ├── prisma/
    ├── auth/
    ├── integrity/
    └── results/
```

### Majed

```text
api/
├── prisma/seed-data/mcq-questions.ts   prisma/seed-data/coding-problems.ts
└── src/
    ├── tests/                    (with attempt-order.util.ts)
    └── execution/
```

### Rami

```text
api/src/
├── attempt-state/                (with scoring.service.ts)
└── student/
```

## Repository and docs

| Owner | Files |
| --- | --- |
| Ali | `docs/`, `README.md`, `.github/`, `.editorconfig`, `.prettierrc`, `.gitignore`, `client/package.json` |
| Esmaeel | `api/package.json` |

### Important

Do not edit another member's files. Need a change? Message the owner or open a GitHub issue. The owner makes the change in their own branch.

---

# 5. Phase 0 — Foundation

Phase 0 is done **before** the main work starts. Target: about half a day. The goal: everyone can branch from `main` and work in their own folder without touching shared files.

## 5.1 Ali — repository and frontend skeleton (~3 h)

1. Create the GitHub repository and add everyone.
2. Create the folders from `PROJECT-STRUCTURE.md`.
3. Add `.gitignore` (`node_modules`, `dist`, `.env`), `.editorconfig`, `.prettierrc`, a README stub, and the three docs.
4. Add `.github/CODEOWNERS` and `.github/pull_request_template.md` (section 15).
5. First commit directly on `main` (one-time exception), push, then **turn on branch protection right away**.
6. Create the Vite + React + TypeScript project in `client/`. Install `react-router-dom`, `monaco-editor`, `@monaco-editor/react`.
7. `styles/fonts.css` (local font files or system fonts), `styles/theme.css`, `styles/global.css`.
8. `editor/monacoSetup.ts` exactly as in `PROJECT-STRUCTURE.md`, section 5 (including the `addExtraLib` for `console`, or `console.log` is underlined red). Check: the editor opens with **no request to any CDN** in the Network tab.
9. `services/http.ts` (`request<T>()`, `ApiError`, token header, `setUnauthorizedHandler`) and the three `*.api.ts` files with every function from `PROJECT-STRUCTURE.md`, section 4.5.
10. All `types/*.types.ts` files from `API.md`, section 5.
11. `AuthContext.tsx` fully written. The other four contexts as **skeletons**: Provider, hook, fixed value shape, empty default actions.
12. `App.tsx` with the five providers. `routes/AppRouter.tsx` with **all routes** pointing to placeholder pages. `RequireRole.tsx`.
13. `components/layout/` (Layout, Navbar) and placeholder `components/common/` with the exact props (including a placeholder `Countdown`).
14. Placeholder `exam-guard/` files with the exact exports from `PROJECT-STRUCTURE.md`, section 16.2 (hooks that do nothing, components that render their children), so Maya can wire them from day one.
15. `client/.env.example` with `VITE_API_URL=http://localhost:3000/api`.
16. Check: `npm run dev` starts and every route shows its placeholder.

## 5.2 Esmaeel — backend skeleton (~4 h)

1. Create the NestJS project in `api/`. Install `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`, `@nestjs/mapped-types`, `class-validator`, `class-transformer`, `bcrypt`, `prisma@6.7.0`, `@prisma/client@6.7.0`, and for the seed `ts-node`.
2. Write the full `schema.prisma` from `PROJECT-STRUCTURE.md`, section 7.2, **including the integrity fields and `AttemptViolation`**. Run `npx prisma migrate dev --name init`. Read the generated SQL before committing.
3. `PrismaModule` (global), `CommonModule` (global, `ClockService`), `constants.ts`, `round.util.ts`, `dto/id-param.dto.ts`.
4. `validation.pipe.ts` and `all-exceptions.filter.ts` (full, not placeholders: everyone needs the error shape).
5. `main.ts`: prefix `api`, CORS, pipe, filter, Swagger at `/api/docs`, port 3000.
6. Module skeletons with the **fixed class and method names**: `AuthModule`, `AttemptStateModule` (with `ScoringService`), `IntegrityModule` (with `AttemptSessionGuard` as a stub that lets everything through), `TestsModule`, `ExecutionModule`, `StudentModule`, `ResultsModule`, with all controllers and routes from `API.md`, section 4.
7. **Stubs:** every stubbed method returns the example JSON from `API.md`. Mark each one `// STUB: replace with real implementation`. `JwtAuthGuard` and `RolesGuard` exist as stubs that let everything through.
8. `seed.ts` creates the three tests and the users (questions and problems can come later).
   Put `prisma` and `@prisma/client` in `dependencies` (not `devDependencies`) and add `"postinstall": "prisma generate"`, so the API also builds on a host (`PROJECT-STRUCTURE.md`, section 7.10).
9. `api/.env.example` from `PROJECT-STRUCTURE.md`, section 7.9.
10. Check: `npm run start:dev` starts, `/api/docs` opens, and every route answers with stub data.

## 5.3 Majed — execution spike (~2 h, in parallel)

Goal: know **which execution host works from Syria without a VPN**, before anyone writes the Judge0 provider.

1. Turn off any VPN.
2. For each candidate, in this order, record: reachable? needs an account/key? can the account be created from Syria? `GET /languages` works? newest Node.js language id? does `wait=true` work? one test submission works?

| # | Candidate | Notes |
| --- | --- | --- |
| 1 | A public Judge0 CE instance (for example the one linked from the official Judge0 site) | No key if open. Check rate limits. |
| 2 | Judge0 CE on RapidAPI (free Basic plan) | Needs a RapidAPI account and key (`X-RapidAPI-Key`, `X-RapidAPI-Host`). Check that sign-up works from Syria. |
| 3 | Another Judge0 host the instructor approves | — |
| 4 | Piston public API | Different API shape: only if 1–3 all fail. A `piston.provider.ts` would implement the same provider interface. |

3. Write the results in `api/src/execution/SPIKE.md` (Majed's folder) and post the chosen `JUDGE0_URL`, auth header and language id in the team chat (**not** the key).
4. If nothing works without a VPN: we stay in mock mode, and Ali tells the instructor.

## 5.4 Maya and Rami (~1 h)

- **Maya:** read the specification and docs. Sketch the five student screens (paper is fine), especially the coding screen layout. Share the sketch with Ali.
- **Rami:** read the specification and docs. Write the attempt state table (every state, every request, every result) as a comment at the top of `attempt-state.service.ts` in his first PR.

## 5.5 Hand-off

Phase 0 is done when:

- `main` has both skeletons
- `api` and `client` both start from a clean checkout
- every endpoint answers with stub data and Swagger opens
- every route shows a placeholder
- the Monaco editor opens without any CDN request
- the execution spike result is posted
- branch protection is on
- the team is told: "branch from `main` now"

---

# 6. Task 1 — Ali Mikdad

## Team Lead: Auth screens + Instructor screens + Review & Integration

### Main responsibility

After Phase 0: build the sign-in/sign-up screens and the three instructor screens with their contexts, review every Pull Request, and own integration, the README, and the presentation plan.

## Files

```text
client/src/pages/Auth/
client/src/pages/instructor/TestManagement/
client/src/pages/instructor/TestEditor/
client/src/pages/instructor/Attempts/
client/src/pages/NotFound/
client/src/context/AuthContext.tsx
client/src/context/InstructorTestsContext.tsx
client/src/context/InstructorAttemptsContext.tsx
```

Plus the shared files listed under Ali in section 4.

## Endpoints (used through the contexts)

```text
POST  /api/auth/register      POST /api/auth/login      GET /api/auth/me
GET   /api/instructor/tests   GET  /api/instructor/tests/:testId
PATCH /api/instructor/tests/:testId/publish | unpublish
POST  /api/instructor/tests/:testId/questions   PUT/DELETE /api/instructor/questions/:questionId
POST  /api/instructor/tests/:testId/problems    PUT/DELETE /api/instructor/problems/:problemId
GET   /api/instructor/attempts                  GET /api/instructor/attempts/:attemptId
```

---

## Part A — Shared UI (first small PR, right after Phase 0)

Replace the placeholders with the real `Loading`, `ErrorMessage`, `EmptyState`, `Button`, `StateBadge`, `ConfirmDialog`, `PageContainer`, and `utils/format.ts`. Props are fixed (`PROJECT-STRUCTURE.md`, section 4.3). Merge this first: Maya imports them.

| Function | Example |
| --- | --- |
| `formatDateTime(iso)` | `2026-11-03T10:00:00Z` → `3 Nov 2026, 13:00` (local time) |
| `formatDuration(seconds)` | `1020` → `17 min 0 s` |
| `formatScore(score)` | `80` → `80%`, `72.5` → `72.5%`, `0` → `0%`, `null` → `Expired — not submitted` |

## Part B — Sign in / Sign up

1. `SignInPage`: email, password, **Sign in**. `SignUpPage`: full name, email, password, **Create account**.
2. Check only empty fields before sending (`Please enter your email.` etc.). Every other rule comes from the backend message.
3. Buttons disabled while loading. Errors shown inside the form.
4. After success, go to `/` (redirect by role).
5. Signed-in users who open `/sign-in` are sent to `/`.
6. **Sign out** in the Navbar clears the token and navigates to `/sign-in`.

## Part C — Test Management (`/instructor/tests`)

1. `loadTests()` when the page opens.
2. One `TestRow` per test, in order: title, type, duration, status badge, question/problem count, attempt count, **Publish** or **Unpublish**, **Edit content**.
3. Publish/unpublish: button loading while the request runs. A `409` shows the backend message next to that row. The row updates without a page reload.

## Part D — Test Editor (`/instructor/tests/:testId`)

1. `loadTest(testId)` when the page opens.
2. MCQ test: `QuestionList` (each question with its options, the correct one marked) + `QuestionForm` for add and edit.
   - Text, 2–6 options, a radio for the correct option, **Add option** / remove option.
   - Front-end guidance only: Add option disabled at 6, remove disabled at 2.
3. Coding test: `ProblemList` + `ProblemForm`: title, description, function name, points, and test cases (`TestCaseFields`: visibility select, args JSON, expected JSON, remove).
   - Args and expected are typed as JSON. Invalid JSON shows `Please enter valid JSON.` and is not sent.
   - Helper text: `Arguments are a JSON array, for example [[2, 7, 11, 15], 9].`
4. Delete asks for confirmation (`ConfirmDialog`).
5. `isContentLocked` → every edit control disabled and the note `Content is locked because a student has started this test.`
6. Backend `400` / `409` messages show inside the form. What the instructor typed is kept.

## Part E — Attempts (`/instructor/attempts`)

1. `AttemptsFilters`: test select, status select, search box (search sends after the user stops typing for 400 ms, or on Enter).
2. Filters live in the URL query (`?testId=&status=&search=`), so a refresh keeps them.
3. Table: student, test, status badge, started, submitted, time used, score (`formatScore`).
4. Clicking a row opens `AttemptDetails` (MCQ correct count, or per-problem runs / submitted / passed / points).
5. Loading, empty (`No attempts match these filters.`), error with retry.

## Part F — Team Lead Work

**Review**

- Review every PR, normally within **2 hours**.
- Check: only owned files changed, names and CSS prefixes follow the docs, the PR template is filled, the build works.
- Ask for a split when a PR is too big.

**Integration**

- Merge in dependency order (section 17).
- After every merge, `main` must still start and build.
- Run the full test (section 12) at the end of Phase 2 and again before the demo.

**Team**

- 15-minute daily sync: done, next, blockers.
- One GitHub issue per Definition-of-Done item.
- Decide contract changes and update `docs/` in the same PR.
- Ask the instructor about Judge0 and Monaco (`PROJECT-STRUCTURE.md`, section 3) on Day 1.

**Final**

- README (section 13).
- Presentation plan and rehearsal (section 14).
- Freeze `main` two hours before the demo.

## Part G — Exam-guard toolkit (`client/src/exam-guard/`)

Build the hooks and components from `PROJECT-STRUCTURE.md`, section 16.2. They know nothing about the API: they detect, block, and call `onViolation(type)`.

1. `useFullscreen()`: `isSupported` (`document.fullscreenEnabled`), `isFullscreen` (from `fullscreenchange`), `enter()` (returns `false` if the browser refused; waits at most 3 s with `Promise.race`, then returns `!!document.fullscreenElement`, because some browsers never settle the promise), `exit()`.
2. `useExamGuard({ isActive, onViolation })`:
   - leaving full screen → `FULLSCREEN_EXIT`; page hidden → `TAB_HIDDEN`
   - `copy` / `cut` outside `[data-exam-clipboard="allow"]` → `preventDefault()` + `COPY` / `CUT`
   - `contextmenu` outside the editor → `preventDefault()` only (not reported)
   - events of the same group within 1 s → sent once
   - every listener removed when `isActive` becomes `false` and on unmount
3. `attachEditorPasteGuard(editor, onViolation, root)`: remember text copied or cut inside the editor (`editor.getModel().getValueInRange(selection)`); on `paste` (capture phase on `root`, the wrapper `div` that `CodeEditor` passes with a `ref` — **not** `editor.getDomNode()`, which Monaco can re-create so the listener is lost), if `clipboardData.getData('text/plain')` is not the remembered text → `preventDefault()`, `stopPropagation()`, `PASTE_EXTERNAL`; on `drop` from outside → block + `DROP_EXTERNAL`. Returns `dispose()`.
4. `FullscreenGate` and `ViolationWarningDialog` with the fixed props and the `exam-guard-` CSS prefix. In your test route, put the dialog **outside** the gate (the gate hides its children when full screen is left).
5. Check every event by hand in Chrome, Edge and Firefox with a temporary test route on your own branch. Remove the route before opening the PR.

Also, in the instructor screens: `TERMINATED` in the status filter, a violations column, and in `AttemptDetails` the termination reason and the violation log (type, time, counted or not).

## Ali must NOT

- build student screens
- write backend code
- decide scores, locks, or time on the frontend
- merge a PR that nobody reviewed
- change a fixed name silently

## Definition of Done

- Phase 0 is complete and `main` is protected.
- Shared UI is merged and used by Maya.
- Sign in, sign up, and sign out work for both roles. An expired token signs the user out.
- Protected routes show a sign-in prompt without a valid token.
- Test Management shows the three tests and publishes/unpublishes with backend messages for rejections.
- The editor adds, edits, and deletes questions and problems, and is locked when `isContentLocked` is true.
- The Attempts page filters, searches, and shows details. Expired attempts show `Expired — not submitted`. Terminated attempts show their score, the reason, and the violation log.
- Sign out goes to `/sign-in`. A refresh on any route works (dev server and the hosted build, `PROJECT-STRUCTURE.md` 7.10).
- The exam-guard toolkit reports every type in `API.md` 19.1, blocks copy, cut, external paste and external drop, allows copy and paste inside the editor, and removes its listeners when inactive.
- Loading, empty, and error states exist on every page.
- CSS uses the `auth-`, `test-mgmt-`, `test-editor-`, `attempts-`, `not-found-`, `ui-`, `layout-`, `exam-guard-` prefixes and theme colors only.
- All PRs are reviewed. README is complete.
- Ali can explain the whole project.

---

# 7. Task 2 — Maya Al Hamwi

## Student screens: My Tests + Test Intro + MCQ test + Coding test + My Results

### Main responsibility

Build every screen a student uses, from the list of tests to the result. The coding screen is the most interactive screen of the project: the editor, Run, Submit, Finish, and the countdown.

Every screen shows **only what the backend returns**. No score, lock, or time logic on the frontend.

## Files

```text
client/src/pages/student/MyTests/
client/src/pages/student/TestIntro/
client/src/pages/student/Attempt/
client/src/pages/student/MyResults/
client/src/context/StudentTestsContext.tsx
client/src/context/AttemptContext.tsx
client/src/services/student.api.ts
client/src/types/student.types.ts
client/src/types/execution.types.ts
client/src/utils/serverClock.ts
client/src/utils/attemptSession.ts
client/src/components/common/Countdown.tsx (+ css)
client/src/editor/CodeEditor.tsx (+ css)
```

## Endpoints (used through the contexts)

```text
GET  /api/student/tests                 GET /api/student/tests/:testId
POST /api/student/tests/:testId/attempts
GET  /api/student/attempts/:attemptId
PUT  /api/student/attempts/:attemptId/mcq-answers/:questionId
POST /api/student/attempts/:attemptId/mcq-submit
POST /api/student/attempts/:attemptId/problems/:problemId/run
POST /api/student/attempts/:attemptId/problems/:problemId/submit
POST /api/student/attempts/:attemptId/finish
POST /api/student/attempts/:attemptId/violations
GET  /api/student/results
```

---

## Part A — Clock and countdown (first small PR)

`utils/serverClock.ts`:

| Function | What it does |
| --- | --- |
| `getOffsetMs(serverNow)` | `Date.parse(serverNow) - Date.now()` |
| `getRemainingMs(deadline, offsetMs)` | `max(0, Date.parse(deadline) - (Date.now() + offsetMs))` |
| `formatRemaining(ms)` | `754000` → `12:34` |

`Countdown({ deadline, serverOffsetMs, onTimeUp })`:

- updates every second with `setInterval` (cleared on unmount)
- color: normal, `--color-warning` under 5 minutes, `--color-error` under 1 minute
- calls `onTimeUp` **once** when it reaches `00:00`
- never stores its own start time: it always calculates from `deadline`

Test by hand: start a test, refresh at any moment → the countdown continues from the same deadline.

## Part B — Contexts

Copy the pattern from `AuthContext`. Fixed shapes are in `PROJECT-STRUCTURE.md`, section 4.2.

- `StudentTestsContext`: `loadTests`, `loadTest`, `loadResults`.
- `AttemptContext`: `startAttempt`, `loadAttempt`, `submitMcq`, `runCode`, `submitCode`, `finishCoding`.
  - Every attempt response updates `serverOffsetMs`.
  - `runCode` saves the result in `runResults[problemId]` and updates that problem's `runCount` / `runsRemaining` in `attempt`.
  - `submitCode` saves `submitResults[problemId]` and sets the problem's `submission`.
  - Any `409` with the time-over message → reload the attempt.
  - A new action clears the old `actionError`.

## Part C — My Tests (`/student/tests`) and Test Intro (`/student/tests/:testId`)

1. My Tests: `TestCard` per test, in order: title, type, duration, item count, `StateBadge`.
   - `LOCKED`: `lockReason`, no button.
   - `AVAILABLE`: **Open** → Test Intro.
   - `IN_PROGRESS`: **Continue** → `await enter()`, then `startAttempt(testId, true)` (resume, new session key), then `/student/attempts/:attemptId`.
   - `SUBMITTED`: the score. `EXPIRED`: `Expired — not submitted`.
2. Empty view: `No tests are available yet.`
3. Test Intro: title, duration, item count, rules (one attempt; the timer starts when you press Start; refreshing does not stop it), **Start test** (loading while it runs).
4. Direct address of an unpublished or locked test → the backend `403` message and a link back to My Tests. Never a blank page.

## Part D — MCQ test (`McqTestView`)

1. `Countdown` at the top (sticky).
2. Every `QuestionCard`: text and radio options. Choices are kept in `AttemptPage` state (outside `FullscreenGate`) and passed to `McqTestView` as props, so leaving full screen does not clear them.
3. Counter: `12 of 20 answered`.
4. **Submit answers** → `ConfirmDialog` (`You have 3 unanswered questions. Unanswered questions count as wrong. Submit anyway?`) → `submitMcq`.
5. After submit: `AttemptResult` with `16 / 20 correct (80%)` and a link to My Tests. Submit again is impossible (the view is gone).
6. `onTimeUp`: all radios and the button disabled, message `Time is over.`, then after `GRACE_SECONDS` reload the attempt and show `Expired — not submitted`.

## Part E — Coding test (`CodingTestView`)

### Layout

```text
┌──────────────────────────── Countdown · ExecutionModeNotice · Finish test ┐
│ ProblemSidebar │ ProblemPanel                                             │
│  1. Two Sum ✓  │  title · points · description                            │
│  2. Reverse    │  function name · sample input → expected output          │
│                │  ┌ CodeEditor (Monaco) ───────────────────────────────┐  │
│                │  └────────────────────────────────────────────────────┘  │
│                │  [Run (17 left)]  [Submit]                               │
│                │  RunOutput / SubmitResultBox                             │
└────────────────┴──────────────────────────────────────────────────────────┘
```

On a phone the sidebar becomes a select above the panel.

### `CodeEditor` (props fixed in `PROJECT-STRUCTURE.md`, section 5)

- Uses the bundled Monaco from `monacoSetup.ts`. Language `javascript`, a dark theme, line numbers, no minimap.
- `errorLine` → `monaco.editor.setModelMarkers` on that line with the error message. Markers are cleared on the next change.
- `isReadOnly` after the problem is submitted or the time is over.
- Starter code: `function <functionName>(/* parameters */) {\n  \n}\n`.
- If the instructor refuses Monaco: the same component renders a `<textarea>` with the same props.

### Run

1. **Run (N left)** calls `runCode(problemId, code)`. Disabled while running, when `runsRemaining` is 0, after submit, and after time is up.
2. `RunOutput` shows, by `status`:

| Status | Shows |
| --- | --- |
| `PASSED` | green title + message, input, expected output, your output |
| `WRONG_ANSWER` | orange title + message, input, expected, your output (side by side) |
| `SYNTAX_ERROR` / `RUNTIME_ERROR` | red title, `error.type: error.message`, `Line <n>` (when not null), and the line marked in the editor |
| `FUNCTION_NOT_FOUND` | red title + message (it tells the exact name to use) |
| `TIME_LIMIT_EXCEEDED` | red title + message |
| `MOCK` | the `[MOCK]` message |

3. `logs` (the student's `console.log`) show in a separate **Console** box under the result, never mixed with the error.
4. Values are shown with `JSON.stringify(value)` so `"1"` and `1` look different.
5. `503` → the backend message (`...Your run was not counted...`) and the Run button stays enabled.

### Submit

1. **Submit** → `ConfirmDialog` (`You can submit this problem only once. Submit now?`) → `submitCode`.
2. `SubmitResultBox`: `4 of 5 tests passed` and the points. The editor becomes read-only. The sidebar shows ✓.
3. `409` (already submitted) → message, and reload the attempt.

### Finish

1. **Finish test** → `ConfirmDialog` that lists unsubmitted problems (`Unsubmitted problems score 0.`).
2. After finish: `AttemptResult` with the coding score and the per-problem points.

### Other rules

- `ExecutionModeNotice` is always visible: `MOCK` → `Mock execution: your code is not really executed. Run shows a simulated result.` `JUDGE0` → `Your code runs on an external execution service.`
- The code of each problem is kept in state **in `AttemptPage`** and passed to `CodingTestView` as props (`codeMap`, `onCodeChange`), so switching problems **and leaving full screen** never lose it. `FullscreenGate` unmounts its children, so state inside `CodingTestView` would be lost.
- `onTimeUp`: everything read-only, `Time is over.`, reload after `GRACE_SECONDS`.

## Part F — My Results (`/student/results`)

1. `loadResults()` when the page opens.
2. One row per finished test: title, `StateBadge`, score with `formatScore`, submit time.
3. Empty view: `You have not finished any test yet.`

## Part G — Exam integrity on the student screens

Rules, limits and messages: `API.md`, section 19. Toolkit: Ali's `exam-guard/`.

1. **Session key:** `utils/attemptSession.ts` (`sessionStorage`, key `b4f.attemptSession.<attemptId>`). `startAttempt` saves the returned `sessionKey`. Every attempt call in `student.api.ts` sends `X-Attempt-Session`. My Tests **Continue** calls `await enter()`, then `startAttempt(testId, true)` (resume; the backend needs `acceptedRules: true` here too) before opening the attempt.
2. **Session 409:** set `isSessionReplaced`, hide the questions, show `This attempt is open in another window or device.` and **Continue here** (resume).
3. **Test Intro:** the rules text, the pledge checkbox, Start disabled until it is ticked. If `useFullscreen().isSupported` is false, show `This exam needs full screen. Please use a computer with Chrome, Edge or Firefox.` and keep Start disabled. Start: `await enter()` first, then `startAttempt(testId, true)`.
4. **Attempt page:** wiring from `PROJECT-STRUCTURE.md`, section 16.3: `useExamGuard`, `FullscreenGate`, `ViolationWarningDialog`, `IntegrityStatus` (`Warnings: focus 1/2 · copy/paste 0/3`). `ViolationWarningDialog` goes **outside** `FullscreenGate`, or the warning disappears when the student leaves full screen. MCQ choices and code live in `AttemptPage` state (see Part E).
5. **`reportViolation(type)`:** calls the endpoint, updates `integrity`, sets `lastWarning`. If `terminated: true`: set the attempt to the returned result, call `exit()`, show `AttemptResult`. A failed report is retried once and never blocks the page.
6. **`CodeEditor`:** `data-exam-clipboard="allow"` and a `ref` (`wrapperRef`) on the container; in `onMount`: `guardRef.current?.dispose()`, then `attachEditorPasteGuard(editor, onViolation, wrapperRef.current)`; `dispose()` on unmount.
7. **MCQ autosave:** every choice calls `saveMcqAnswer(questionId, optionId)`. Show `Saved` / `Saving…` / `Not saved, retrying` per question. Choices start from `selectedOptionId`, so a refresh keeps them. A failed save is retried after 2 s (max 3 times); the final **Submit** still sends every choice.
8. **TERMINATED everywhere:** `AttemptResult`, My Tests card and My Results row show `Terminated — exam rules violated`, the reason (on the result screen) and the score.

## Maya must NOT

- count violations, decide warnings, or decide termination (the backend does)
- add her own full-screen, visibility, copy or paste listeners (use `exam-guard/`)
- calculate scores, points, remaining runs, or locks
- start a timer from the click time (always from `deadline`)
- show anything about hidden tests except the counts
- call `fetch` or services inside pages or components
- write backend code
- change routes (ask Ali)
- use hardcoded colors

## Definition of Done

- `serverClock` and `Countdown` work, and a refresh never resets the countdown.
- My Tests shows every state, with the lock reason for locked tests.
- An unpublished test opened by address shows the `403` message, not a blank page.
- Start creates or resumes the attempt; Continue returns to it.
- The MCQ test submits once and shows the backend result.
- The coding editor gives suggestions and live syntax errors, with no CDN request.
- Run shows a readable result for every status, with the error line marked in the editor and `console.log` in its own box.
- The 21st run is impossible from the UI, and the backend message shows if it happens anyway.
- Submit works once per problem and shows `X of Y tests passed`.
- Finish shows the coding score. Expired attempts show `Expired — not submitted`.
- The test starts only in full screen, after the pledge. The content is hidden outside full screen.
- Every warning from the backend is shown; a termination ends the screen at once and shows the reason and the score.
- MCQ choices are autosaved and come back after a refresh.
- Opening the same attempt in a second window makes the first one show the session message.
- When time is up, every input stops and the backend state is shown.
- After every action, states and counters update without a page reload.
- Loading, empty, and error states exist. Pages work on desktop and phone.
- CSS uses the `my-tests-`, `test-intro-`, `attempt-`, `my-results-`, `code-editor-`, `countdown-` prefixes and theme colors only.
- Maya can explain the whole project.

---

# 8. Task 3 — Esmaeel Mahfoud

## Backend foundation + Prisma schema + Seed + Auth & Roles + Attempts list & Results + Endpoint testing

### Main responsibility

Own the backend base everyone builds on (schema, migrations, error shape, clock, Swagger), the accounts and roles, the instructor's attempts list, the student's results, and independent testing of every endpoint.

## Files

```text
api/src/main.ts   api/src/app.module.ts
api/src/common/
api/src/prisma/
api/src/auth/
api/src/integrity/
api/src/results/
api/prisma/schema.prisma   api/prisma/migrations/   api/prisma/seed.ts
api/prisma/seed-data/users.ts
api/requests/api.http
api/.env.example   api/package.json
```

---

## Part A — Foundation (Phase 0, section 5.2)

The pipe and the filter must be **real** from Phase 0:

| Situation | Status | Message |
| --- | --- | --- |
| `HttpException` from our code or the pipe | its status | its message (one string) |
| Unknown route | 404 | `Endpoint not found.` |
| Broken JSON body | 400 | `Invalid request body.` |
| Any other error | 500 | `Something went wrong. Please try again.` (stack logged, never sent) |

Prisma errors: `P2002` (unique) that reaches the filter → `409` with `This record already exists.` (services should catch their own expected cases first).

## Part B — Auth and roles

1. `RegisterDto` (`fullName` trimmed, `email` trimmed + lower-cased + `@IsEmail`, `password` min 8), `LoginDto`. Messages from `API.md`, section 6.
2. `AuthService.register`: email taken → `409`. Hash with bcrypt (10 rounds). Role is always `STUDENT`. Return `AuthResponse`.
3. `AuthService.login`: same `401` for unknown email and wrong password.
4. JWT: `sub`, `email`, `role`. Secret and expiry from `.env`.
5. Replace the guard stubs: `JwtAuthGuard` (401 message), `RolesGuard` + `@Roles()` (403 message), `@CurrentUser()`.
6. Log `user registered` and `login failed` (never the password or token).

## Part C — Seed

1. `seed-data/users.ts`: 1 instructor, 2 students. `seed.ts` hashes the passwords. The instructor password comes from `SEED_INSTRUCTOR_PASSWORD` (empty → `Instructor123`, local only).
2. `seed.ts` imports `mcq-questions.ts` and `coding-problems.ts` from Majed (stub files until his PRs).
3. Safe to run twice (`upsert`; content only when a test has none).
4. Seeded tests from `PROJECT-STRUCTURE.md`, section 7.3.
5. `package.json` → `"prisma": { "seed": "ts-node prisma/seed.ts" }`.

## Part D — Instructor attempts and student results

1. `AttemptsQueryDto`: `testId` (`@Type(() => Number)`, positive int), `status` (`@IsIn`), `search` (trimmed string). All optional.
2. Every method starts with `attemptStateService.expireOverdue()`.
3. `listAttempts(query)`: filters, `fullName contains search, mode insensitive`, newest first, `InstructorAttemptRow` with `timeUsedSeconds`.
4. `getAttemptDetail(attemptId)`: row + MCQ correct count or per-problem results. `404` when missing.
5. `listStudentResults(userId)`: only finished (`SUBMITTED`, `EXPIRED`, `TERMINATED`) attempts of this student, with `label`.
6. Expired: `score: null` and `label: "Expired — not submitted"`. Never `0`.
7. Terminated: the stored score, `label: "Terminated — exam rules violated (<score>%)"`, `terminatedAt`, `terminationReason`.
8. Rows have `violationCount`; details have the violation log (`integrityService.listViolations`).

## Part E — Swagger and endpoint testing

1. Check every controller has `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth` where protected, and that DTO properties have `@ApiProperty`. Tell the owner what is missing.
2. `api/requests/api.http` (VS Code REST Client format): one request for each item in `API.md`, section 17. Use variables for the tokens (`@instructorToken`, `@studentToken`).
3. Run the whole file after every merge to `main` and tell the owner about failures.
4. At the end of Phase 2, post a pass/fail list in the team chat.

## Part F — Exam integrity module (`api/src/integrity/`)

Everything in `API.md`, section 19, and `PROJECT-STRUCTURE.md`, section 16.1.

1. `ViolationDto`: `type` must be one of the six client types (`NEW_SESSION` is rejected) → `400 Unknown violation type.`
2. `IntegrityService.recordViolation`: own attempt (`404`), `assertAcceptingRequests` (Rami), group, 2-second dedupe, and in **one transaction**: the violation row, and when the limit is reached the termination with the score from `ScoringService` (Rami). Use a conditional `updateMany` on `IN_PROGRESS`, so a parallel Finish or Submit and a termination never both win.
3. Fixed warnings and termination reasons exactly as in `API.md` 19.2.
4. `issueSessionKey(tx, attemptId, isResume)`: `crypto.randomBytes(32).toString('hex')`, stored on the attempt; on resume also a `NEW_SESSION` row (`counted: false`). Rami calls it inside his start transaction.
5. `AttemptSessionGuard`: only for an `IN_PROGRESS` attempt of this user; compares the `X-Attempt-Session` header with `attempt.sessionKey` → `409` message from `API.md` 19.4. Rami adds it to `StudentAttemptsController`; you add it to `IntegrityController`.
6. `getIntegrity(attemptId)` for the student attempt shape, `listViolations(attemptId)` for the instructor detail.
7. Log `violation recorded`, `attempt terminated`, `session replaced`. Never log the session key.
8. Tests in `api.http`: every row of the Integrity checklist in `API.md` 17.

## Esmaeel must NOT

- write test content rules, publish rules, or execution code (Majed)
- write attempt start, submit, run, timing, or scoring logic (Rami) — use `ScoringService`
- write frontend code
- run `prisma migrate reset` on shared data
- change another module's DTOs

## Definition of Done

- Schema and the `init` migration are merged in Phase 0; every later change is a new migration.
- Every error leaves the API as `{ statusCode, message }` with one string.
- Register, login, and `/auth/me` work with the exact messages.
- Students get `403` on instructor routes; no token gets `401`.
- The seed creates the instructor, two students, three tests (two published), and runs Majed's question and problem seed files.
- Violations are counted per group with the 2-second dedupe; the 2nd FOCUS and the 3rd CLIPBOARD violation terminate the attempt in one transaction with the saved score.
- A request with a wrong session key gets `409`; resuming logs `NEW_SESSION`.
- The attempts list filters by test and status, searches by name, and shows expired attempts with `score: null`.
- Student results show only the student's own finished tests.
- Swagger documents every endpoint with its auth.
- `api.http` covers the checklist and was run on the full backend.
- Esmaeel can explain the whole backend.

---

# 9. Task 4 — Majed Hmoud

## Test content (publish, questions, problems) + Code Execution Service

### Main responsibility

Own what the instructor manages (the questions, the problems, publishing) and the **only** part of the backend that touches student code: the `CodeExecutionService`, with mock mode and Judge0 mode, readable errors, and correct output comparison.

## Files

```text
api/src/tests/
api/src/execution/
api/prisma/seed-data/mcq-questions.ts
api/prisma/seed-data/coding-problems.ts
```

---

## Part A — Execution spike (Phase 0, section 5.3)

## Part B — Test content

1. DTOs (`question.dto.ts`, `problem.dto.ts`, `test-case.dto.ts`) with nested validation (`@ValidateNested`, `@Type`, `@ArrayMinSize`, `@ArrayMaxSize`). Messages from `API.md`, section 7.
2. Rules that need more than one field (exactly one correct option, at least 1 sample and 3 hidden) are checked in the service, before saving.
3. `InstructorTestsService`:
   - `findAll()` with counts and `isContentLocked` (`attemptStateService.hasAttempts`).
   - `publish()`: R-3 (`409`). Already published → return unchanged.
   - `unpublish()`: `expireOverdue()` first, then R-5 (`409`).
   - `assertContentEditable(testId)`: R-4 (`409`). Called by add, replace, and delete.
4. `QuestionsService` / `ProblemsService`: create, replace (delete old options or test cases and create new ones **in one transaction**), remove. Wrong test type → `400`.
5. `instructor-test.mapper.ts`: instructor shapes from `API.md` 5.3–5.6.
6. Log: `test published`, `test unpublished`, `content change rejected`.

## Part C — Code Execution Service

Build it in this order. Each step is one small PR.

**C1. Types, interface, mock provider**

```ts
interface ExecutionProvider {
  readonly mode: 'MOCK' | 'JUDGE0';
  execute(input: { code: string; functionName: string; cases: unknown[][] }): Promise<ProviderRawResult>;
}
```

- `MockExecutionProvider` follows R-23 exactly (`API.md` 13.2).
- `CodeExecutionService.getMode()` reads `EXECUTION_MODE` once at startup.

**C2. Harness builder and result parser**

- `harness.builder.ts`: student code first, then the harness (`API.md` 13.4). `functionName` only after the identifier check; cases with `JSON.stringify`.
- `harness-result.parser.ts`: finds the last `__B4F_RESULT__` line and parses it.

**C3. Output comparer** (`API.md` 13.5)

Unit-test it with: equal arrays, different order, nested objects with different key order, `0.1 + 0.2` vs `0.3`, `"1"` vs `1`, `null` vs missing, empty array vs empty object.

**C4. Error normalizer** (`API.md` 13.7)

- Collect one real `stderr` / result sample for each case into `__fixtures__/` during the spike: syntax error, `TypeError`, `ReferenceError`, thrown string, missing function, infinite loop.
- Unit-test that each gives the right `status`, `error.type`, `error.message`, and the **student's** line number (and `null` when the line points into the harness).

**C5. Judge0 provider**

- `POST /submissions?base64_encoded=true` with `language_id`, `source_code`, `cpu_time_limit: 2`, `wall_time_limit: 5`. Then `wait=true` if the spike showed it works, otherwise poll `GET /submissions/:token?base64_encoded=true` every 500 ms.
- Auth header and token only from `.env`, plus the optional second header `JUDGE0_EXTRA_HEADER` / `JUDGE0_EXTRA_VALUE` (hosted services such as RapidAPI need two). Timeout `EXECUTION_TIMEOUT_MS` with `AbortController`.
- Judge0 status mapping from `API.md` 13.7. Status 13/14, HTTP error, or timeout → `ServiceUnavailableException` with the message from `API.md` 11.
- Use Node's built-in `fetch` (Node 18+). No new package.

**C6. `run()` and `submit()`**

- `run(problem, code)`: sample case only → `ExecutionRunOutcome` with input, expected, actual, logs, error.
- `submit(problem, code)`: hidden cases only → `{ mode, passedCount, totalCount }`. Syntax error, missing function, or timeout → `passedCount: 0`.
- **Hidden expected values never leave this service** (not to Judge0, not in the outcome).
- Log provider errors and timeouts (never the code, never hidden data).

## Part D — Coding problems seed

`seed-data/coding-problems.ts`: 2 problems (for example **Two Sum** and **Reverse Words**), each with 1 sample and at least 4 hidden cases. Run every case through the Judge0 provider once to make sure the expected values are right.

## Part E — MCQ seed and shuffled order

1. `seed-data/mcq-questions.ts`: at least 10 IQ questions and 10 HTML & CSS questions, each with 4 options and exactly one correct. Check every answer twice.
2. `tests/attempt-order.util.ts` (pure functions, no Prisma):
   - `buildAttemptOrder(questions)` → `{ questionOrder: number[], optionOrder: Record<string, number[]> }`, Fisher–Yates with `crypto.randomInt`.
   - `applyQuestionOrder(questions, order)` and `applyOptionOrder(options, order)`: return a new array in the stored order; items missing from the order go last (safety).
3. Unit-test: every id appears exactly once; two calls give different orders (most of the time); applying an order is stable.

## Dependencies

- `AttemptStateService.hasAttempts`, `hasActiveAttempts`, `expireOverdue` — Rami (stubs from Phase 0).
- Guards, pipe, filter, Prisma — Esmaeel (Phase 0).

## Majed must NOT

- run student code on the server (`eval`, `new Function`, `vm`, `child_process`)
- send expected outputs to Judge0 or to the student
- switch to mock mode automatically when Judge0 fails
- write attempt, run-count, or scoring logic (Rami)
- put a key in Git or in the frontend
- write frontend code

## Definition of Done

- The spike result is written in `SPIKE.md` and posted.
- Questions and problems are added, replaced, and deleted with every rule and message from `API.md`.
- Publish and unpublish follow R-3 and R-5. Content is locked after the first attempt (R-4).
- Mock mode follows R-23 and every result carries `mode`.
- In Judge0 mode, a correct solution passes, a wrong one fails, and every error type gives a readable message with the student's line number.
- Output comparison passes all the unit tests in C3.
- An unreachable execution host gives `503` with the fixed message.
- The two seeded problems pass with a reference solution and fail with an empty function.
- The MCQ seed has 10+ correct questions per test, and `attempt-order.util.ts` passes its unit tests.
- No `eval`, `new Function`, `vm`, or `child_process` anywhere (`grep` shows nothing).
- Majed can explain the whole execution flow.

---

# 10. Task 5 — Rami Al Shaar

## Attempt state & timing + Student tests + Start + MCQ submit + Coding Run / Submit / Finish

### Main responsibility

Own everything that happens while a student takes a test: who can start what, the server clock and the grace period, expiry, MCQ scoring, and the Run / Submit / Finish flow. This is the part the project is graded on most.

## Files

```text
api/src/attempt-state/
api/src/student/
```

---

## Part A — Attempt state (first PR, others depend on it)

`AttemptStateService` (`PROJECT-STRUCTURE.md`, section 7.4):

| Method | What it does |
| --- | --- |
| `isOverdue(attempt, now)` | `status === IN_PROGRESS && now > deadline + GRACE_SECONDS` |
| `expireOverdue()` | one `updateMany`: every overdue attempt → `EXPIRED`, `score: null`. Logs how many. |
| `assertAcceptingRequests(attempt)` | `SUBMITTED` → `409 This test has already been submitted.`; `TERMINATED` → `409 This attempt was ended because the exam rules were broken.`; `EXPIRED` or overdue → store `EXPIRED`, log `late request rejected`, `409 Time is over...` |
| `hasAttempts(testId)` | any attempt for this test |
| `hasActiveAttempts(testId)` | any `IN_PROGRESS` attempt (after `expireOverdue()`) |

Test with a fake `ClockService` (or a short test duration): 1 second before deadline, exactly the deadline, deadline + 9 s, deadline + 11 s.

## Part B — Student tests and start

1. `StudentTestsService.listForStudent(userId)`: `expireOverdue()`, then published tests in order with `state`, `lockReason`, `attemptId`, `score` (rules in `API.md`, section 9).
2. `getForStudent(userId, testId)`: `404` / `403 This test is not available.`. Log forbidden access.
3. `assertCanStart(userId, test)`: R-2 with the reason. Log forbidden access.
4. `AttemptsService.start(userId, testId)`: checks in the order of `API.md` section 9. Creates the attempt (and the `ProblemResult` rows for coding) in **one transaction**. Catch `P2002` (two clicks) and return the existing attempt. `201` new / `200` existing.
5. `getForStudent(userId, attemptId)`: own attempts only (`404` otherwise), `expireOverdue()` first, shaped by the mapper.
6. `student-view.mapper.ts`: the only place that builds student attempt shapes (`PROJECT-STRUCTURE.md`, section 7.7). Use Prisma `select` so `isCorrect` and hidden cases are never loaded.

## Part C — MCQ submit

`McqService.submit(userId, attemptId, dto)`, checks in the order of `API.md` section 10:

1. Load the attempt with its questions and options.
2. `assertAcceptingRequests(attempt)`.
3. Validate answers (duplicate, unknown question, option of another question).
4. In **one transaction**: conditional `updateMany` on `status: IN_PROGRESS` (0 rows → `409`), create the `McqAnswer` rows (unanswered questions too, `optionId: null`, `isCorrect: false`), save `score = round1(correct / total × 100)`, `status: SUBMITTED`, `submittedAt: now`.
5. Log `MCQ submitted`.

Check by hand: 16 of 20 → `80`; 1 of 3 → `33.3`; 0 answers → `0` (a real 0, status SUBMITTED).

## Part D — Coding Run / Submit / Finish

Common checks for all three: `API.md` section 11 (code empty / too long in `CodeDto`; the rest in the service).

**Run** — `CodingService.run(userId, attemptId, problemId, code)`

1. `assertAcceptingRequests`.
2. Reserve a run: conditional `updateMany` with `runCount < MAX_RUNS_PER_PROBLEM`. 0 rows → `409 You have used all 20 runs for this problem.`
3. `codeExecutionService.run(problem, code)`.
4. If it throws `503`: give the run back (`decrement: 1`) and rethrow.
5. Return `RunResult` = outcome + `runCount` + `runsRemaining`. No score, nothing else stored.

**Submit** — `CodingService.submit(...)`

1. `assertAcceptingRequests`. Already submitted → `409`.
2. `codeExecutionService.submit(problem, code)`. `503` → rethrow, nothing saved.
3. `points = round1(problem.points × passedCount / totalCount)`.
4. Conditional `updateMany` where `submittedAt: null` (0 rows → `409`). Save code, counts, points, `submittedAt`.
5. Log `problem submitted`. Return `SubmitResult`.

**Finish** — `CodingService.finish(userId, attemptId)`

1. `assertAcceptingRequests`.
2. In **one transaction**: conditional `updateMany` on `IN_PROGRESS`; set `points: 0` on unsubmitted problems; `score = round1(sum points / sum problem.points × 100)`; `status: SUBMITTED`; `submittedAt: now`.
3. Log `coding finished`. Return the finish result.

## Part E — Scoring service, start changes, and MCQ autosave

**`ScoringService`** (`attempt-state/scoring.service.ts`), used by MCQ submit, Finish, and Esmaeel's termination:

- `scoreMcqFromSaved(tx, attemptId)`: correct saved answers ÷ all questions × 100, `round1`.
- `scoreCoding(tx, attemptId)`: unsubmitted problems → `points: 0`; sum of points ÷ sum of problem points × 100, `round1`.
- `CodingService.finish` uses `scoreCoding`, so Finish and termination always give the same number.

**Start** (`API.md` section 9 and 19):

1. `StartAttemptDto { acceptedRules }` with `@Equals(true)` → `400 You must accept the exam rules to start.`
2. New attempt: `buildAttemptOrder` (Majed) for MCQ tests, stored in `questionOrder` / `optionOrder`; `integrityService.issueSessionKey(tx, attemptId, false)` (Esmaeel) in the same transaction.
3. Resume (IN_PROGRESS): same attempt and deadline, `issueSessionKey(tx, attemptId, true)`.
4. The mapper applies the stored order (`applyQuestionOrder`, `applyOptionOrder`) and sets `selectedOptionId` and `integrity`. `sessionKey` only in the start response.
5. `@UseGuards(JwtAuthGuard, RolesGuard, AttemptSessionGuard)` on `StudentAttemptsController`.

**MCQ autosave** — `McqService.saveAnswer(userId, attemptId, questionId, dto)`, checks in the order of `API.md` section 10: `upsert` on `(attemptId, questionId)` with `isCorrect` calculated on the server. On submit, delete the saved answers and write the submitted set in the same transaction.

**States:** `TERMINATED` is finished for R-2 (unlocks the next test) and R-10 (never changes). `StudentTestCard` gets `TERMINATED` with its score.

## Dependencies

- `CodeExecutionService.run` / `submit` — Majed (stub from Phase 0 returns the example RunResult / SubmitResult).
- `IntegrityService.issueSessionKey`, `getIntegrity`, `AttemptSessionGuard` — Esmaeel (stubs from Phase 0).
- `buildAttemptOrder`, `applyQuestionOrder`, `applyOptionOrder` — Majed.
- Guards, `ClockService`, `round1`, pipe, filter — Esmaeel (Phase 0).

## Rami must NOT

- run, evaluate, or inspect student code himself (only through `CodeExecutionService`)
- send `isCorrect` or hidden cases in any student response
- store `0` for an expired attempt
- use `new Date()` for "now" (use `ClockService`)
- use `10`, `20`, or `10000` outside `constants.ts`
- write instructor content, results, or auth code
- write frontend code

## Definition of Done

- The state table is written at the top of `attempt-state.service.ts`.
- Students see only published tests, in order, with the right state and lock reason.
- Unpublished → `403`. Test 2 before test 1 → `403` with the reason. EXPIRED and TERMINATED unlock the next test.
- Start needs the pledge; every student gets a shuffled order that stays the same after a refresh; autosaved choices come back after a refresh.
- `ScoringService` gives the same score for Finish and for a termination of the same data.
- Starting again returns the same attempt with the same deadline. Two fast clicks create one attempt.
- Requests up to deadline + 10 s are accepted; later ones are rejected and the attempt is stored as `EXPIRED` with `score: null`.
- An overdue attempt shows `EXPIRED` on the next read, even with no new request.
- MCQ scores match a hand calculation. Double submit → `409`.
- Run uses the sample case, never stores a score, and the 21st run is rejected. A `503` does not use a run.
- Submit works once per problem and stores counts and points.
- Finish runs in one transaction; unsubmitted problems score 0.
- No student response contains `isCorrect` or hidden cases (checked in Swagger and the Network tab).
- Rami can explain the whole attempt flow.

---

# 11. Interfaces Between Members (to avoid conflicts)

These names are fixed from Phase 0. Code against them even before the owner's PR is merged.

| Used by | Provided by | Name |
| --- | --- | --- |
| Majed, Esmaeel, Rami | Rami | `AttemptStateService.expireOverdue()`, `hasAttempts(testId)`, `hasActiveAttempts(testId)`, `assertAcceptingRequests(attempt)` |
| Rami | Majed | `CodeExecutionService.run(problem, code)`, `submit(problem, code)`, `getMode()` |
| Rami | Majed | `buildAttemptOrder(questions)`, `applyQuestionOrder()`, `applyOptionOrder()` |
| Esmaeel | Rami | `ScoringService.scoreMcqFromSaved(tx, attemptId)`, `scoreCoding(tx, attemptId)` |
| Rami | Esmaeel | `IntegrityService.issueSessionKey(tx, attemptId, isResume)`, `getIntegrity(attemptId)`, `AttemptSessionGuard` |
| Maya | Ali | `useFullscreen()`, `useExamGuard()`, `attachEditorPasteGuard()`, `FullscreenGate`, `ViolationWarningDialog` |
| Everyone (backend) | Esmaeel | `ClockService.now()`, `round1()`, constants, `JwtAuthGuard`, `RolesGuard`, `@Roles()`, `@CurrentUser()`, id param DTOs |
| Maya | Ali | `components/common/*` props, `http.ts` `request<T>()`, `ApiError`, `useAuth()`, `formatScore()` |
| Ali, Maya | Backend | Every shape and message in `API.md` |

---

# 12. Shared Task — Final Integration Test

When all five tasks are merged, the whole team runs one full test on a clean checkout (`git clone`, `npm install`, `migrate deploy`, `db seed`).

```text
Instructor signs in
 ↓
Test Management: IQ and HTML published, coding DRAFT
 ↓
Student signs up → My Tests: IQ AVAILABLE, HTML LOCKED, coding not listed
 ↓
Open the coding test by address → 403
 ↓
Start IQ → refresh at minute 2 → same countdown
 ↓
Submit IQ → score matches a hand calculation → HTML AVAILABLE
 ↓
Instructor tries to edit an IQ question → 409 (content locked)
 ↓
Instructor publishes the coding test
 ↓
Student finishes HTML → coding AVAILABLE → Start
 ↓
Run (wrong answer, syntax error with line, passed) → Submit problem 1 → Finish
 ↓
My Results → three scores
 ↓
Instructor Attempts → filter, search, details
```

Also test:

- **Expiry:** a test with a short duration (change it in the seed or the database for the test), wait past deadline + 10 s, submit → `409`, attempt `EXPIRED`, `Expired — not submitted`, next test AVAILABLE.
- **Grace:** submit at deadline + 5 s → accepted.
- **Expiry without a request:** let an attempt pass its deadline, open My Tests → `EXPIRED`.
- **Unpublish:** with an attempt in progress → `409`; after it expired → works.
- **Run limit:** the 21st run → rejected.
- **Double actions:** double-click Start, Submit, Finish → one result each.
- **Shaping:** in the Network tab and Swagger, no student response contains `isCorrect`, `HIDDEN`, or a hidden expected value.
- **Mock mode:** `EXECUTION_MODE=mock`, restart → Run shows `[MOCK]`, Submit follows the function-name rule, the notice says MOCK.
- **Execution down:** wrong `JUDGE0_URL` → Run and Submit show the `503` message; the run is not counted.
- **Without VPN:** `PROJECT-STRUCTURE.md`, section 6, final check.
- **Failures:** stop the backend → every page shows a message and a retry button; start it again → retry works.
- **Restart:** restart the backend → all data is still there.
- **Integrity — focus:** Esc out of full screen → warning and the content hides; return; switch tab → `TERMINATED`, the score equals the autosaved correct answers, next test AVAILABLE.
- **Integrity — clipboard:** copy a question (warning 1), paste text from Notepad into the editor (warning 2), copy again (`TERMINATED`, coding score from submitted problems only). Copy and paste inside the editor → nothing happens.
- **Integrity — Alt+Tab:** one Alt+Tab out of full screen counts **once**.
- **Integrity — session:** open the attempt in a second browser with Continue → the first one shows the session message; the instructor sees `NEW_SESSION`.
- **Integrity — order:** two students see different question orders; a refresh keeps the order.
- **Integrity — pledge:** Start is disabled until the box is ticked; the API rejects `acceptedRules: false`.
- **Instructor view:** the terminated attempt shows the score, the reason, and the violation log with times.
- **Search for forbidden code:** `grep -rn "eval(\|new Function\|from 'vm'\|child_process" api/src` → nothing.

Every bug goes to the owner of that file.

---

# 13. Shared Task — README

Owner: Ali. Everyone reviews it.

A clean checkout must run by following the README only. It explains:

- what the project is and the three tests
- the technologies
- the folder structure
- requirements (Node 18+, PostgreSQL)
- how to set up the database (`.env`, `npx prisma migrate deploy`, `npx prisma db seed`)
- how to run the backend and open Swagger
- how to run the frontend
- the environment variables (`VITE_API_URL`, `DATABASE_URL`, `JWT_SECRET`, `EXECUTION_MODE`, Judge0 variables)
- execution modes (mock and Judge0) and how to switch
- seed accounts (local development only)
- the business rules in short (order, timing and grace, expiry, scoring, Run vs. Submit)
- a note that everything works without a VPN, and what to do if the execution host is down
- the team and who built what

---

# 14. Shared Task — Final Presentation (English)

The presentation is in **English** and every member speaks. It must cover the 10 points of the specification, section 18.

| Part | Speaker |
| --- | --- |
| The problem and the product idea | Ali |
| Main flow demo: instructor publishes → student takes tests in order → scores (frontend states: loading, empty, error, expired) | Maya |
| Backend in Swagger: auth, roles, **403 for an unpublished test**, a rejected validation case | Esmaeel |
| Business rule: backend-owned timing, grace, expiry, `null` vs `0`; the finish transaction | Rami |
| Business rule: Run vs. Submit, hidden tests, the execution service, readable errors, mock mode | Majed |
| Exam integrity live: leave full screen (warning), switch tab (terminated, score kept), the violation log; why the server decides and what a browser cannot prevent | Esmaeel + Maya |
| Data in PostgreSQL (Prisma Studio), architecture (controller → service → persistence, execution service) | Esmaeel |
| A decision we made and why (Judge0 behind the backend, no CDN for Syria) and one limitation / next step | Ali |

### Preparation

- Each member prepares their part **and** one rule from another member's area.
- Practice the full demo at least twice, with a timer.
- Prepare the wrong actions ahead of time (open an unpublished test, start test 2 first, submit twice, the 21st run).
- Keep a short-duration test ready to show EXPIRED live.
- Keep a second student account ready to show a termination live (it ends that student's attempt).
- If the execution host is unstable on the day, present in mock mode and explain the Judge0 mode with the recorded spike.
- Both servers must start cleanly before presenting.

---

# 15. Git Workflow

Every member works on a separate branch for each task.

## Before you start (every time)

```bash
git switch main
git pull origin main
git switch -c be/student-mcq-submit
git branch --show-current
```

The last command must **not** print `main`.

## Branch names

Format: `be/<module>-<description>` or `fe/<page>-<description>`.

| Member | Branches |
| --- | --- |
| Ali | `fe/foundation-setup`, `fe/shared-ui`, `fe/auth-pages`, `fe/test-management`, `fe/test-editor-questions`, `fe/test-editor-problems`, `fe/instructor-attempts`, `fe/exam-guard-toolkit` |
| Maya | `fe/server-clock-countdown`, `fe/student-contexts`, `fe/my-tests`, `fe/test-intro`, `fe/mcq-test`, `fe/code-editor`, `fe/coding-run`, `fe/coding-submit-finish`, `fe/my-results`, `fe/attempt-session`, `fe/exam-guard-wiring`, `fe/mcq-autosave` |
| Esmaeel | `be/foundation-setup`, `be/prisma-schema`, `be/auth`, `be/roles-guard`, `be/seed`, `be/instructor-attempts`, `be/student-results`, `be/integrity-violations`, `be/integrity-session-guard`, `be/endpoint-tests` |
| Majed | `be/execution-spike`, `be/tests-publish`, `be/tests-questions`, `be/tests-problems`, `be/execution-mock`, `be/execution-harness`, `be/execution-comparer`, `be/execution-errors`, `be/execution-judge0`, `be/mcq-seed`, `be/attempt-order` |
| Rami | `be/attempt-state`, `be/scoring-service`, `be/student-tests`, `be/student-start`, `be/mcq-autosave`, `be/student-mcq-submit`, `be/coding-run`, `be/coding-submit`, `be/coding-finish` |

## After your work

```bash
git status
git add <your files>
git commit -m "feat(student): reject MCQ submit after the grace period"
git push -u origin be/student-mcq-submit
```

Then open a Pull Request into `main`.

## Commit messages

Format: `type(scope): message`

```text
feat(execution): map Judge0 syntax errors to the student's line
fix(student): count unanswered questions as wrong
style(attempt): use theme colors for the countdown
docs(api): add run status messages
test(execution): add fixtures for runtime errors
chore: add editorconfig
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.

## Update your branch

Before you open a PR, bring in the latest `main`:

```bash
git fetch origin
git merge origin/main
```

Fix conflicts only in your own files. A conflict in a file you do not own? Stop and tell the team lead.

## Pull Request template

File `.github/pull_request_template.md`:

```markdown
## What does this PR do?

## Area
- [ ] Frontend
- [ ] Backend

## How did you test it?

## Screenshots (frontend)

## Checklist
- [ ] I am not on `main`
- [ ] I changed only files I own
- [ ] Names follow docs/PROJECT-STRUCTURE.md
- [ ] Messages follow docs/API.md
- [ ] No hardcoded colors; CSS classes use my prefix
- [ ] Loading, empty, and error states are handled
- [ ] No CDN or outside host in the browser
- [ ] No secrets or keys committed
- [ ] The app starts and builds
- [ ] I updated docs/API.md if the contract changed
```

## CODEOWNERS

File `.github/CODEOWNERS` (use the real GitHub usernames):

```text
*            @ali-username
/client/     @ali-username @maya-username
/docs/       @ali-username @esmaeel-username
```

## Branch protection on `main` (team lead, once)

In GitHub: **Settings → Branches** (or **Rulesets**) → add a rule for `main`:

- Require a pull request before merging
- Require 1 approval
- Dismiss old approvals when new commits are pushed
- Block force pushes
- Restrict deletions
- **Do not allow bypassing** these settings (also for admins)

---

# 16. Git Rules

- **Never push directly to `main`.**
- Run `git branch --show-current` before every commit.
- One task = one branch. Do not mix tasks.
- Pull the latest `main` before you start and before you open a PR.
- Keep PRs small (ideally under 300 changed lines). One or two PRs a day, not one huge PR at the end.
- Every PR is reviewed before it is merged.
- Change only files you own (section 4).
- Never commit `node_modules`, `dist`, `.env`, keys, or tokens.
- Never run `npm install <package>` yourself. Ask Ali (`client/`) or Esmaeel (`api/`).
- Never edit `schema.prisma` yourself. Ask Esmaeel.
- Never use `git push --force` on a shared branch.
- Format your code with Prettier before you commit.
- Blocked by someone? Say it in the team chat right away.

### Code freeze

Two hours before the final demo, only bug-fix PRs approved by the team lead are allowed. No new features.

---

# 17. Order of Work

The project is built in phases. The hours are targets, not promises. Ask the instructor for the submission date on Day 1 and adjust.

### Phase 0 — Foundation — Day 1 morning (about half a day)

- Ali: repository + frontend skeleton.
- Esmaeel: backend skeleton + schema + migration + stubs.
- Majed: execution spike.
- Maya: student screen sketches. Rami: attempt state table.

Result: both skeletons on `main`, stubs answering, branch protection on, execution host chosen.

### Phase 1 — Parallel work — rest of Day 1 and Day 2

**First small PRs (merge first, others depend on them):**

1. Rami — `AttemptStateService` + `ScoringService`
2. Esmaeel — real auth + guards
3. Majed — execution types, interface, mock provider + `attempt-order.util.ts`
4. Ali — shared UI + `format.ts`
5. Maya — `serverClock` + `Countdown` + `attemptSession.ts`

Then:

- Esmaeel — seed, integrity module (violations, termination, session guard), instructor attempts, student results, Swagger check
- Majed — publish, questions, problems, MCQ seed, then harness → comparer → error normalizer → Judge0 provider
- Rami — student tests, start (pledge, order, session), MCQ autosave + submit, then run → submit → finish
- Ali — auth pages, Test Management, Test Editor, exam-guard toolkit, Attempts (with the violation log)
- Maya — contexts, My Tests, Test Intro, MCQ test with autosave, code editor, coding Run, Submit, Finish, My Results, then the exam-guard wiring

Merge order that avoids blocking:

```text
Phase 0 foundation
 ↓
attempt-state + auth/guards + execution interface/mock + shared UI + countdown   (the "base" PRs)
 ↓
content (Majed), student tests/start/MCQ (Rami), attempts/results (Esmaeel)
 ↓
integrity module (Esmaeel) + exam-guard toolkit (Ali)
 ↓
harness → comparer → error normalizer → Judge0 provider (Majed)
 ↓
coding run → submit → finish (Rami)
 ↓
pages replace the stub assumptions (Ali, Maya)
```

### Phase 2 — Real integration — end of Day 2

Everyone:

- replaces every stub with the real code
- connects each context to the real endpoints
- checks every error message against `API.md`
- checks refresh behavior and the countdown
- Esmaeel runs `api.http` on the full backend and reports failures
- Ali runs the full test (section 12)

### Phase 3 — Fix and strengthen — Day 3 morning

- owners fix bugs in their own files
- check every rule and every error case from the specification
- check the execution errors with real code (syntax, runtime, infinite loop, missing function)
- check desktop and phone layout
- the no-VPN check and the stop-the-backend test

### Phase 4 — Polish and documents — Day 3 afternoon

- polish the UI with the base colors
- README
- check the seed data
- start rehearsing the presentation

### Phase 5 — Final test and presentation — Day 4 (or the demo day)

- code freeze, then the final full test on a clean clone
- two full rehearsals
- both servers start cleanly before presenting

### Optional STRETCH (only after every CORE item works)

- MCQ answer review after finishing (correct options only after the attempt is finished)
- statistics per test (average score, most-missed questions)

A STRETCH item never replaces a missing CORE requirement.

### Daily sync (15 minutes)

- What did I finish?
- What will I do next?
- What blocks me?

---

# 18. Final Definition of Done

The project is complete only when:

### Frontend

- React + TypeScript, React Router, React Context (five contexts)
- all screens of the specification, section 10, reachable through navigation
- the API service layer is used only by the contexts
- loading, empty, error, and expired states everywhere
- the countdown always comes from the backend deadline and survives a refresh
- business-rule rejections are shown clearly
- states and counters update without a page reload
- a sign-in prompt instead of protected content when signed out
- the code editor works with no CDN request
- the exam runs only in full screen, warnings and termination are shown, MCQ choices are autosaved
- responsive UI with the base colors

### Backend

- NestJS, controller → service → Prisma
- PostgreSQL with migrations and the seed
- JWT, bcrypt, role guards
- DTO validation on every body, param, and query; unknown fields rejected
- student responses shaped without correct options or hidden cases
- one transaction for finishing an attempt
- Logger for the required events, no secrets in logs
- Swagger for every endpoint with auth
- one `CodeExecutionService`, mock mode always available
- violations counted and terminations decided only on the server, in one transaction with the saved score
- one active session per attempt, shuffled order per student
- independent endpoint testing (`api.http`)

### Business Rules

- R-1 to R-25 from the specification (see `PROJECT-STRUCTURE.md`, section 8)
- the acceptance checklist of the specification, section 19, passes item by item
- I-1 to I-7 exam integrity (see `PROJECT-STRUCTURE.md`, section 8), with the instructor's written approval linked

### Project Quality

- clean folders and consistent names
- no forbidden technologies, no local code execution
- everything works in Syria without a VPN
- meaningful Git history, no direct pushes to `main`
- a README that works on a clean checkout
- the full test passed and the demo works without manual fixes
- every member understands the whole project and speaks in the English presentation
