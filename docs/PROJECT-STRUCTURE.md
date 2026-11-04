# Weekly Mini Project 04 — Bytes for Futures Assessment Platform

## 1. Purpose

This document explains how the project is organized.

React + TypeScript (with Context for state) on the frontend. NestJS (with DTO validation, JWT, Swagger) on the backend. PostgreSQL through Prisma for data.

The backend decides everything important: access, order, timing, scores, Run and Submit results. The frontend only shows what the backend says.

**Every name in this document is fixed.** Need a new shared name or a change? Ask the team lead first.

## 2. Root Structure

```text
b4f-assessment-platform/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   └── seed-data/
│   ├── src/
│   ├── requests/
│   ├── .env.example
│   ├── package.json
│   └── nest-cli.json
├── client/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── API.md
│   ├── PROJECT-STRUCTURE.md
│   └── TASKS.md
├── .github/
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── .editorconfig
├── .prettierrc
├── .gitignore
└── README.md
```

| Item | Value |
| --- | --- |
| Backend folder | `api/` |
| Frontend folder | `client/` |
| API prefix | `/api` |
| API URL (local) | `http://localhost:3000/api` |
| Swagger (local) | `http://localhost:3000/api/docs` |
| Client URL (local) | `http://localhost:5173` |
| Client env variable | `VITE_API_URL` |
| Database | PostgreSQL, database name `b4f_assessment` |

## 3. Technology

### Frontend

- React, TypeScript, Vite, React Router
- **React Context** for state (one context per feature)
- Hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`, `useRef`
- Plain CSS, one file per page or component
- API service layer in `client/src/services/`
- **Monaco Editor**, bundled locally (section 5)
- `localStorage` only for the JWT (section 4.5)

### Backend

- Node.js, NestJS 10, TypeScript
- PostgreSQL through **Prisma 6.7.0** (`schema.prisma` + migrations, classic CLI as in the course)
- `@nestjs/jwt` + `bcrypt`, guards for roles
- DTO classes with `class-validator` and `class-transformer`
- `@nestjs/swagger`
- Nest `Logger`
- Global `ValidationPipe` and `AllExceptionsFilter`

### Not allowed

- running student code on our server: `eval`, `new Function`, `vm`, `child_process`, local containers
- another database, MongoDB, Redis
- Redux, React Query, Zustand, or any other state library
- Tailwind or any CSS framework
- video or webcam proctoring, plagiarism detection, screen recording (exam integrity is limited to section 16)
- external AI services, cloud deployment, emails, WebSockets, certificates
- anything loaded from a CDN at runtime (section 6)

Only the package owners install packages: **Ali** in `client/`, **Esmaeel** in `api/`. Need a package? Ask first. This avoids `package-lock.json` conflicts.

### Decisions that need the instructor's approval

| Decision | Why it needs approval | If refused |
| --- | --- | --- |
| Real execution through Judge0 | Specification section 16 (CHALLENGE) | `EXECUTION_MODE=mock`. Nothing else changes. |
| Monaco Editor instead of a text area | Specification section 15 asks editor improvements "with plain React" | `CodeEditor` falls back to a `<textarea>`. Same props. |
| Exam integrity: full screen, tab switching, copy/paste, termination (section 16) | Specification section 17 lists anti-cheat as out of scope | **Approved by the instructor.** Written approval: `<paste the link or message here>` |

Mock mode is CORE and stays available in every case (R-23).

## 4. Frontend Structure

```text
client/src/
├── components/
│   ├── common/
│   │   ├── Loading.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Button.tsx
│   │   ├── StateBadge.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── PageContainer.tsx
│   │   └── Countdown.tsx
│   └── layout/
│       ├── Layout.tsx
│       └── Navbar.tsx
├── context/
│   ├── AuthContext.tsx
│   ├── InstructorTestsContext.tsx
│   ├── InstructorAttemptsContext.tsx
│   ├── StudentTestsContext.tsx
│   └── AttemptContext.tsx
├── editor/
│   ├── monacoSetup.ts
│   ├── CodeEditor.tsx
│   └── CodeEditor.css
├── pages/
│   ├── Auth/
│   │   ├── SignInPage.tsx
│   │   ├── SignUpPage.tsx
│   │   └── AuthPages.css
│   ├── instructor/
│   │   ├── TestManagement/
│   │   │   ├── TestManagementPage.tsx
│   │   │   ├── TestManagementPage.css
│   │   │   └── TestRow.tsx
│   │   ├── TestEditor/
│   │   │   ├── TestEditorPage.tsx
│   │   │   ├── TestEditorPage.css
│   │   │   ├── QuestionForm.tsx
│   │   │   ├── QuestionList.tsx
│   │   │   ├── ProblemForm.tsx
│   │   │   ├── ProblemList.tsx
│   │   │   └── TestCaseFields.tsx
│   │   └── Attempts/
│   │       ├── AttemptsPage.tsx
│   │       ├── AttemptsPage.css
│   │       ├── AttemptsFilters.tsx
│   │       └── AttemptDetails.tsx
│   ├── student/
│   │   ├── MyTests/
│   │   │   ├── MyTestsPage.tsx
│   │   │   ├── MyTestsPage.css
│   │   │   └── TestCard.tsx
│   │   ├── TestIntro/
│   │   │   ├── TestIntroPage.tsx
│   │   │   └── TestIntroPage.css
│   │   ├── Attempt/
│   │   │   ├── AttemptPage.tsx
│   │   │   ├── AttemptPage.css
│   │   │   ├── McqTestView.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── CodingTestView.tsx
│   │   │   ├── ProblemSidebar.tsx
│   │   │   ├── ProblemPanel.tsx
│   │   │   ├── RunOutput.tsx
│   │   │   ├── SubmitResultBox.tsx
│   │   │   ├── ExecutionModeNotice.tsx
│   │   │   ├── IntegrityStatus.tsx
│   │   │   └── AttemptResult.tsx
│   │   └── MyResults/
│   │       ├── MyResultsPage.tsx
│   │       └── MyResultsPage.css
│   └── NotFound/
│       ├── NotFoundPage.tsx
│       └── NotFoundPage.css
├── exam-guard/
│   ├── useFullscreen.ts
│   ├── useExamGuard.ts
│   ├── editorPasteGuard.ts
│   ├── FullscreenGate.tsx
│   ├── ViolationWarningDialog.tsx
│   └── ExamGuard.css
├── routes/
│   ├── AppRouter.tsx
│   └── RequireRole.tsx
├── services/
│   ├── http.ts
│   ├── auth.api.ts
│   ├── instructor.api.ts
│   └── student.api.ts
├── types/
│   ├── common.types.ts
│   ├── auth.types.ts
│   ├── instructor.types.ts
│   ├── student.types.ts
│   └── execution.types.ts
├── utils/
│   ├── format.ts
│   ├── tokenStorage.ts
│   ├── serverClock.ts
│   └── attemptSession.ts
├── styles/
│   ├── fonts.css
│   ├── theme.css
│   └── global.css
├── assets/fonts/
├── constants.ts
├── App.tsx
└── main.tsx
```

### 4.1 Routes

All routes are created in Phase 0 and point to placeholder pages. Only Ali edits `AppRouter.tsx`.

| Route | Page | Role | Owner |
| --- | --- | --- | --- |
| `/` | redirect: instructor → `/instructor/tests`, student → `/student/tests`, signed out → `/sign-in` | any | Ali |
| `/sign-in` | `SignInPage` | public | Ali |
| `/sign-up` | `SignUpPage` | public | Ali |
| `/instructor/tests` | `TestManagementPage` | INSTRUCTOR | Ali |
| `/instructor/tests/:testId` | `TestEditorPage` | INSTRUCTOR | Ali |
| `/instructor/attempts` | `AttemptsPage` | INSTRUCTOR | Ali |
| `/student/tests` | `MyTestsPage` | STUDENT | Maya |
| `/student/tests/:testId` | `TestIntroPage` | STUDENT | Maya |
| `/student/attempts/:attemptId` | `AttemptPage` (MCQ or coding view) | STUDENT | Maya |
| `/student/results` | `MyResultsPage` | STUDENT | Maya |
| `*` | `NotFoundPage` | any | Ali |

`RequireRole` (Ali) wraps protected routes. No valid sign-in → a sign-in prompt with a link to `/sign-in` (not the page content). Wrong role → a short "not allowed" message.

Navbar links: instructor → **Tests**, **Attempts**. Student → **My Tests**, **My Results**. Both → user name and **Sign out** (clears the token, then navigates to `/sign-in`).

### 4.2 State with Context

Server data (with its loading and error state) lives in five contexts:

```text
client/src/context/
├── AuthContext.tsx                 owner: Ali
├── InstructorTestsContext.tsx      owner: Ali
├── InstructorAttemptsContext.tsx   owner: Ali
├── StudentTestsContext.tsx         owner: Maya
└── AttemptContext.tsx              owner: Maya
```

Each file exports a **Provider** and a **hook**. `App.tsx` wraps the router with all five providers (`AuthProvider` outermost).

#### The pattern (all contexts use it)

```tsx
const StudentTestsContext = createContext<StudentTestsContextValue | undefined>(undefined);

export function StudentTestsProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<StudentTestCard[]>([]);
  const [isTestsLoading, setIsTestsLoading] = useState(false);
  const [testsError, setTestsError] = useState<string | null>(null);

  const loadTests = useCallback(async () => {
    setIsTestsLoading(true);
    setTestsError(null);
    try {
      setTests(await getStudentTests());
    } catch (err) {
      setTestsError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsTestsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ tests, isTestsLoading, testsError, loadTests }),
    [tests, isTestsLoading, testsError, loadTests],
  );

  return <StudentTestsContext.Provider value={value}>{children}</StudentTestsContext.Provider>;
}

export function useStudentTests() {
  const context = useContext(StudentTestsContext);
  if (!context) throw new Error('useStudentTests must be used inside StudentTestsProvider');
  return context;
}
```

#### Rules

- Every action that can fail catches the error and saves a readable message. A page is never left loading forever.
- Pages and components never call `services/` or `fetch`. Only contexts do.
- A page reloads its data every time it opens.
- After a successful action, the context reloads or updates the affected data, so states and counters change **without a manual page reload**.
- A context only holds what the API returned. It never decides business rules (no scores, no lock logic, no time limits).

#### Fixed context shapes

**`AuthContext`** (Ali)

```ts
user: User | null;
isAuthReady: boolean;               // false until the saved token was checked with /auth/me
authError: string | null;
isAuthLoading: boolean;
signIn(payload: LoginPayload): Promise<boolean>;
signUp(payload: RegisterPayload): Promise<boolean>;
signOut(): void;
```

On start, if a token is saved, it calls `getMe()`. A `401` clears the token. `http.ts` calls `onUnauthorized()` (registered by `AuthContext`) on every `401`, so an expired token signs the user out everywhere.

**`InstructorTestsContext`** (Ali)

```ts
tests: InstructorTestSummary[];
isTestsLoading: boolean;
testsError: string | null;
loadTests(): Promise<void>;

currentTest: InstructorTestDetail | null;
isTestLoading: boolean;
testError: string | null;
loadTest(testId: number): Promise<void>;

isSaving: boolean;
actionError: string | null;
publishTest(testId: number): Promise<boolean>;
unpublishTest(testId: number): Promise<boolean>;
saveQuestion(testId: number, payload: QuestionPayload, questionId?: number): Promise<boolean>;
deleteQuestion(questionId: number): Promise<boolean>;
saveProblem(testId: number, payload: ProblemPayload, problemId?: number): Promise<boolean>;
deleteProblem(problemId: number): Promise<boolean>;
clearActionError(): void;
```

**`InstructorAttemptsContext`** (Ali)

```ts
attempts: InstructorAttemptRow[];
isAttemptsLoading: boolean;
attemptsError: string | null;
loadAttempts(filters: AttemptFilters): Promise<void>;

selectedAttempt: InstructorAttemptDetail | null;
isDetailLoading: boolean;
detailError: string | null;
loadAttemptDetail(attemptId: number): Promise<void>;
```

**`StudentTestsContext`** (Maya)

```ts
tests: StudentTestCard[];
isTestsLoading: boolean;
testsError: string | null;
loadTests(): Promise<void>;

currentTest: StudentTestCard | null;
isTestLoading: boolean;
testError: string | null;           // includes the 403 message for an unpublished test
loadTest(testId: number): Promise<void>;

results: StudentResult[];
isResultsLoading: boolean;
resultsError: string | null;
loadResults(): Promise<void>;
```

**`AttemptContext`** (Maya)

```ts
attempt: StudentAttempt | null;
isAttemptLoading: boolean;
attemptError: string | null;
startAttempt(testId: number, acceptedRules: boolean): Promise<number | null>;  // new or resume; saves sessionKey; null if it failed
loadAttempt(attemptId: number): Promise<void>;

serverOffsetMs: number;             // serverNow - Date.now(), updated on every attempt response

isSubmitting: boolean;
actionError: string | null;
submitMcq(answers: McqAnswerPayload[]): Promise<boolean>;
saveMcqAnswer(questionId: number, optionId: number | null): Promise<boolean>;   // autosave, quiet on success
savingQuestionIds: number[];        // shows "Saving…" next to a question

runResults: Record<number, RunResult>;          // by problemId, last run only
submitResults: Record<number, SubmitResult>;    // by problemId
runningProblemId: number | null;
runCode(problemId: number, code: string): Promise<boolean>;
submitCode(problemId: number, code: string): Promise<boolean>;
finishCoding(): Promise<boolean>;
clearActionError(): void;

integrity: AttemptIntegrity | null;              // counts and limits from the backend
lastWarning: string | null;                      // backend warning text, shown in ViolationWarningDialog
reportViolation(type: ClientViolationType): Promise<void>;
clearWarning(): void;
isSessionReplaced: boolean;                      // true after the "open in another window" 409
```

When any action returns `409` with the time-over or terminated message, `AttemptContext` reloads the attempt, so the screen shows the stored `EXPIRED` or `TERMINATED` state. When `reportViolation` returns `terminated: true`, it sets `attempt` to the returned result at once.

### 4.3 Shared components (`components/common/`)

Props are fixed:

| Component | Props | Owner |
| --- | --- | --- |
| `Loading` | `message?: string` | Ali |
| `ErrorMessage` | `message: string`, `onRetry?: () => void` | Ali |
| `EmptyState` | `title: string`, `description?: string` | Ali |
| `Button` | `variant?: 'primary' \| 'secondary' \| 'danger' \| 'ghost'`, `isLoading?: boolean`, plus normal button props | Ali |
| `StateBadge` | `state: StudentTestState \| AttemptStatus \| TestStatus` | Ali |
| `ConfirmDialog` | `isOpen: boolean`, `title: string`, `message: string`, `confirmLabel: string`, `onConfirm: () => void`, `onCancel: () => void`, `isLoading?: boolean` | Ali |
| `PageContainer` | `title?: string`, `actions?: ReactNode`, `children` | Ali |
| `Countdown` | `deadline: string`, `serverOffsetMs: number`, `onTimeUp: () => void` | Maya |

`StateBadge` colors: `AVAILABLE` and `PUBLISHED` → primary, `IN_PROGRESS` → warning, `SUBMITTED` → success, `EXPIRED` → error, `TERMINATED` → terminated, `LOCKED` and `DRAFT` → muted. The text label is always shown (`TERMINATED` shows `Terminated`).

In Phase 0, Ali creates placeholder versions with these exact props, so every page can import them from day one.

### 4.4 Pages

**Sign in / Sign up** (Ali). Email + password (+ full name for sign-up). Field checks only for empty values. Backend messages shown as they are. Buttons disabled while loading. After success → `/`.

**Test Management** (Ali). The three tests in order: title, type, duration, `StateBadge` for status, question/problem count, attempt count, **Publish** / **Unpublish**, and **Edit content**. The publish error (`409`) shows next to the row.

**Test Editor** (Ali). MCQ test → question list + `QuestionForm` (text, 2–6 options, one radio for the correct option, add/remove option). Coding test → problem list + `ProblemForm` (title, description, function name, points, test cases with `TestCaseFields`: visibility, args as JSON text, expected as JSON text). JSON text that does not parse shows `Please enter valid JSON.` before sending. When `isContentLocked` is `true`, all edit controls are disabled and this note shows: `Content is locked because a student has started this test.`

**Attempts** (Ali). Table: student, test, status badge, started, submitted, time used, score (`Expired — not submitted` instead of a score; terminated rows show the score with `Terminated`), violations count. Filters: test, status (including `TERMINATED`), search by name. Clicking a row opens `AttemptDetails`, which also shows the termination reason and the violation log (type, time, counted or not).

**My Tests** (Maya). Cards in order with `StateBadge`. `LOCKED` shows `lockReason`. `AVAILABLE` → **Open**. `IN_PROGRESS` → **Continue** (`await enter()` for full screen, then `startAttempt(testId, true)` to resume and get a new session key, then opens the attempt; the backend needs `acceptedRules: true` on resume too). `SUBMITTED` → score. `EXPIRED` → `Expired — not submitted`. `TERMINATED` → `Terminated — exam rules violated` and the score.

**Test Intro** (Maya). Title, type, duration, item count, the rules (one attempt, the timer starts on Start, it does not stop on refresh, full screen is required, leaving full screen or switching tabs twice ends the exam, copy or paste three times ends the exam), the pledge checkbox (API.md 19.6), and **Start test** (disabled until the pledge is ticked, and disabled when full screen is not supported). Start first asks for full screen, then calls `startAttempt`. A `403` shows the backend message (`This test is not available.` or the lock reason) and a link to My Tests. After start → `/student/attempts/:attemptId`.

**Attempt** (Maya). Loads the attempt. While `IN_PROGRESS`, the whole view is wrapped in `FullscreenGate` and guarded by `useExamGuard` (section 16). Shows `McqTestView` or `CodingTestView` by `type`, with `IntegrityStatus` (`Warnings: focus 1/2 · copy/paste 0/3`). `SUBMITTED` / `EXPIRED` / `TERMINATED` → `AttemptResult` (terminated shows the reason and the score, then leaves full screen). A session `409` shows `This attempt is open in another window or device.` and a **Continue here** button (resume).

- `McqTestView`: `Countdown`, every `QuestionCard` with radio options (choices start from `selectedOptionId` and are autosaved on every change with `saveMcqAnswer`, with a small `Saved` / `Saving…` / `Not saved, retrying` note), an answered counter, **Submit answers** with `ConfirmDialog` (warns about unanswered questions). After submit: the result (`16 / 20 correct (80%)`) and a link to My Tests.
- `CodingTestView`: `Countdown`, `ExecutionModeNotice`, `ProblemSidebar` (problems with submitted / not submitted), `ProblemPanel` (description, function name, sample input and expected output, `CodeEditor`, **Run** with runs remaining, `RunOutput`, **Submit** with `ConfirmDialog`, `SubmitResultBox`), and **Finish test** with `ConfirmDialog`.
- When time is up (`onTimeUp`): inputs and buttons are disabled, the message `Time is over.` shows, and after `GRACE_SECONDS` the page reloads the attempt to show the backend state.
- The code of each problem and the MCQ choices are kept in state **in `AttemptPage`** (outside `FullscreenGate`) and passed down as props. `FullscreenGate` unmounts its children when the student leaves full screen, so state kept inside `McqTestView` / `CodingTestView` would be lost.

**My Results** (Maya). One row per finished test: title, status badge, score or `Expired — not submitted` (terminated: the score and `Terminated — exam rules violated`), submit or termination time.

### 4.5 Services and helpers

| File | Exports | Used by | Owner |
| --- | --- | --- | --- |
| `services/http.ts` | `request<T>(path, options?)` (`options.headers` are merged in), `ApiError`, `setUnauthorizedHandler(fn)` | the other service files | Ali |
| `services/auth.api.ts` | `register`, `login`, `getMe` | `AuthContext` | Ali |
| `services/instructor.api.ts` | `getInstructorTests`, `getInstructorTest`, `publishTest`, `unpublishTest`, `createQuestion`, `replaceQuestion`, `deleteQuestion`, `createProblem`, `replaceProblem`, `deleteProblem`, `getInstructorAttempts`, `getInstructorAttempt` | instructor contexts | Ali |
| `services/student.api.ts` | `getStudentTests`, `getStudentTest`, `startAttempt`, `getAttempt`, `saveMcqAnswer`, `submitMcq`, `runCode`, `submitCode`, `finishCoding`, `reportViolation`, `getResults` (every attempt call adds `X-Attempt-Session` from `attemptSession.ts`) | student contexts | Maya |
| `utils/tokenStorage.ts` | `saveToken`, `getToken`, `clearToken` (key `b4f.token`, every call in `try/catch`) | `http.ts`, `AuthContext` | Ali |
| `utils/format.ts` | `formatDateTime(iso)`, `formatDuration(seconds)`, `formatScore(score)` (`null` → `Expired — not submitted`) | pages | Ali |
| `utils/serverClock.ts` | `getOffsetMs(serverNow)`, `getRemainingMs(deadline, offsetMs)`, `formatRemaining(ms)` (`mm:ss`) | `AttemptContext`, `Countdown` | Maya |
| `utils/attemptSession.ts` | `saveAttemptSession(attemptId, key)`, `getAttemptSession(attemptId)` (`sessionStorage`, key `b4f.attemptSession.<attemptId>`, every call in `try/catch`) | `student.api.ts`, `AttemptContext` | Maya |

`http.ts` adds `Authorization: Bearer <token>` when a token exists, sends JSON, and turns every error into `ApiError` with the backend `message` and `status`. A network failure gives `status: 0` and `Cannot reach the server. Please check your connection and try again.`

### 4.6 TypeScript types

`client/src/types/` copies `docs/API.md` section 5. Ali creates all files in Phase 0. After Phase 0, each file has one owner:

| File | Contains | Owner |
| --- | --- | --- |
| `common.types.ts` | `Role`, `TestType`, `TestStatus`, `AttemptStatus`, `StudentTestState`, `ViolationType`, `ClientViolationType`, `ViolationGroup` | Ali |
| `auth.types.ts` | `User`, `AuthResponse`, `LoginPayload`, `RegisterPayload` | Ali |
| `instructor.types.ts` | `InstructorTestSummary`, `InstructorTestDetail`, `InstructorQuestion`, `InstructorProblem`, `QuestionPayload`, `ProblemPayload`, `InstructorAttemptRow`, `InstructorAttemptDetail`, `AttemptFilters` | Ali |
| `student.types.ts` | `StudentTestCard`, `StudentAttempt`, `StudentQuestion`, `StudentProblem`, `McqAnswerPayload`, `McqSubmitResult`, `FinishResult`, `StudentResult`, `AttemptIntegrity`, `ViolationResult` | Maya |
| `execution.types.ts` | `ExecutionMode`, `RunStatus`, `RunResult`, `SubmitResult` | Maya |

## 5. Code Editor (Monaco, bundled locally)

Owner: Ali installs and writes `monacoSetup.ts` in Phase 0. Maya owns `CodeEditor.tsx` after that.

Packages (Ali installs): `monaco-editor`, `@monaco-editor/react`.

**`@monaco-editor/react` loads Monaco from a CDN by default. We switch that off,** so the editor works without internet access to any CDN:

```ts
// client/src/editor/monacoSetup.ts
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });   // use the bundled copy, never the CDN

monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2020,
  allowJs: true,
  checkJs: true,
  lib: ['es2020'],             // no DOM: students write plain functions, no `document`
  allowNonTsExtensions: true,
});
// lib is es2020 only, so `console` is unknown and would be underlined red. Declare it for students' debug logs.
monaco.languages.typescript.javascriptDefaults.addExtraLib(
  'declare const console: { log(...data: any[]): void; error(...data: any[]): void; warn(...data: any[]): void; info(...data: any[]): void };',
  'ts:b4f-console.d.ts',
);
```

`main.tsx` imports `./editor/monacoSetup` once.

`CodeEditor` props (fixed):

```ts
value: string;
onChange: (value: string) => void;
isReadOnly?: boolean;
errorLine?: number | null;     // from RunResult.error.line
height?: string;
onViolation?: (type: 'PASTE_EXTERNAL' | 'DROP_EXTERNAL') => void;   // set while the attempt is IN_PROGRESS
```

What the student gets:

- autocomplete and suggestions for JavaScript (built into Monaco)
- red underlines for syntax errors and unknown names **while typing**, before any Run
- line numbers, bracket matching, auto-closing brackets
- after a Run with an error, the error line is marked with `monaco.editor.setModelMarkers` (red underline + message on hover)
- copy and paste **inside** the editor works as normal; a paste or drop of text from outside the editor is blocked and reported (`attachEditorPasteGuard`, section 16)

Starter code for each problem: `function <functionName>(/* parameters */) {\n  \n}\n`.

## 6. Works in Syria Without a VPN

Every feature must work on a normal Syrian connection **with no VPN**, for the developers and for the demo.

### Runtime rules

| Rule | How |
| --- | --- |
| No CDN in the browser | Monaco bundled (section 5). No `<script src="https://...">`, no CDN stylesheets. |
| No Google Fonts | Fonts are files in `client/src/assets/fonts/` loaded by `styles/fonts.css`, or the system font stack. |
| No icon CDNs | Icons are small inline SVG components or text. |
| The browser talks only to our backend | Only `VITE_API_URL`. Never Judge0, never any other host. |
| The backend talks to one outside host only | The execution service, and only in `judge0` mode. |
| Swagger works offline | `@nestjs/swagger` serves its UI from `node_modules`. |
| A failed outside call is clear | Execution unreachable → `503` with a readable message (API.md 13.8). |
| The demo never depends on luck | If the execution host is down on demo day, switch to `EXECUTION_MODE=mock` and restart. |

### Setup rules (Phase 0, checked once)

| Step | Check | If it fails |
| --- | --- | --- |
| `npm install` in `api/` and `client/` | Finishes without errors | `npm config set registry https://registry.npmmirror.com` and retry |
| `npx prisma generate` / `migrate dev` | Engines download | Ask Esmaeel: the engines can be downloaded once and shared, or set `PRISMA_ENGINES_MIRROR` |
| Execution host | `GET <JUDGE0_URL>/languages` answers from Syria without a VPN | Try the next candidate in the spike list (TASKS.md, Task 4). None works → mock mode, and tell the instructor |

### Final check (before the demo)

Turn off any VPN, then: sign up, sign in, open every screen, type in the editor and see suggestions, Run, Submit, open Swagger. Open the browser **Network** tab: every request goes to `localhost` only.

## 7. Backend Structure

```text
api/src/
├── common/
│   ├── constants.ts
│   ├── clock.service.ts
│   ├── common.module.ts
│   ├── validation.pipe.ts
│   ├── all-exceptions.filter.ts
│   ├── round.util.ts
│   └── dto/id-param.dto.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/
│   ├── dto/register.dto.ts
│   ├── dto/login.dto.ts
│   ├── guards/jwt-auth.guard.ts
│   ├── guards/roles.guard.ts
│   ├── decorators/roles.decorator.ts
│   ├── decorators/current-user.decorator.ts
│   ├── jwt-payload.interface.ts
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   └── auth.service.ts
├── attempt-state/
│   ├── attempt-state.module.ts
│   ├── attempt-state.service.ts
│   └── scoring.service.ts
├── integrity/
│   ├── dto/violation.dto.ts
│   ├── guards/attempt-session.guard.ts
│   ├── integrity.module.ts
│   ├── integrity.controller.ts
│   └── integrity.service.ts
├── tests/
│   ├── dto/question.dto.ts
│   ├── dto/problem.dto.ts
│   ├── dto/test-case.dto.ts
│   ├── mappers/instructor-test.mapper.ts
│   ├── tests.module.ts
│   ├── instructor-tests.controller.ts
│   ├── instructor-tests.service.ts
│   ├── questions.controller.ts
│   ├── questions.service.ts
│   ├── problems.controller.ts
│   ├── problems.service.ts
│   └── attempt-order.util.ts
├── execution/
│   ├── providers/execution-provider.interface.ts
│   ├── providers/mock.provider.ts
│   ├── providers/judge0.provider.ts
│   ├── harness/harness.builder.ts
│   ├── harness/harness-result.parser.ts
│   ├── error-normalizer.ts
│   ├── output-comparer.ts
│   ├── execution.types.ts
│   ├── __fixtures__/
│   ├── execution.module.ts
│   └── code-execution.service.ts
├── student/
│   ├── dto/start-attempt.dto.ts
│   ├── dto/mcq-answer.dto.ts
│   ├── dto/mcq-submit.dto.ts
│   ├── dto/code.dto.ts
│   ├── mappers/student-view.mapper.ts
│   ├── student.module.ts
│   ├── student-tests.controller.ts
│   ├── student-tests.service.ts
│   ├── student-attempts.controller.ts
│   ├── attempts.service.ts
│   ├── mcq.service.ts
│   └── coding.service.ts
├── results/
│   ├── dto/attempts-query.dto.ts
│   ├── results.module.ts
│   ├── instructor-attempts.controller.ts
│   ├── student-results.controller.ts
│   └── results.service.ts
├── app.module.ts
└── main.ts

api/prisma/
├── schema.prisma
├── migrations/
├── seed.ts
└── seed-data/
    ├── users.ts
    ├── mcq-questions.ts
    └── coding-problems.ts

api/requests/
└── api.http
```

### 7.1 `common/` (Esmaeel)

| File | What it does |
| --- | --- |
| `constants.ts` | Business constants (below) |
| `clock.service.ts` | `ClockService.now()`, the only source of the current time |
| `common.module.ts` | Global module that exports `ClockService` |
| `validation.pipe.ts` | `createValidationPipe()`: `transform`, `whitelist`, `forbidNonWhitelisted`, `stopAtFirstError`, ONE message |
| `all-exceptions.filter.ts` | Every error → `{ statusCode, message }`; 500 logged with stack, never sent |
| `round.util.ts` | `round1(value)` → one decimal (`Math.round(value * 10) / 10`) |
| `dto/id-param.dto.ts` | Reusable positive-int param DTOs: `TestIdParamDto`, `AttemptIdParamDto`, `QuestionIdParamDto`, `ProblemIdParamDto`, `AttemptProblemParamDto` |

Business constants live **only** in `constants.ts`:

```ts
export const GRACE_SECONDS = 10;
export const MAX_RUNS_PER_PROBLEM = 20;
export const MAX_CODE_LENGTH = 10_000;
export const MIN_MCQ_QUESTIONS_TO_PUBLISH = 5;
export const MIN_CODING_PROBLEMS_TO_PUBLISH = 1;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
export const MIN_SAMPLE_CASES = 1;
export const MIN_HIDDEN_CASES = 3;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_POINTS = 100;
export const FOCUS_VIOLATION_LIMIT = 2;
export const CLIPBOARD_VIOLATION_LIMIT = 3;
export const VIOLATION_DEDUPE_SECONDS = 2;
export const ATTEMPT_SESSION_HEADER = 'x-attempt-session';
```

### 7.2 Prisma schema (Esmaeel)

`schema.prisma` has **one owner: Esmaeel**. It is complete after Phase 0. Need a change? Ask Esmaeel. He changes it in his own branch with a new migration.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  INSTRUCTOR
  STUDENT
}

enum TestType {
  MCQ
  CODING
}

enum TestStatus {
  DRAFT
  PUBLISHED
}

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  EXPIRED
  TERMINATED
}

enum ViolationType {
  FULLSCREEN_EXIT
  TAB_HIDDEN
  COPY
  CUT
  PASTE_EXTERNAL
  DROP_EXTERNAL
  NEW_SESSION
}

enum TestCaseVisibility {
  SAMPLE
  HIDDEN
}

model User {
  id           Int       @id @default(autoincrement())
  fullName     String    @map("full_name")
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         Role
  createdAt    DateTime  @default(now()) @map("created_at")
  attempts     Attempt[]

  @@map("users")
}

model Test {
  id              Int        @id @default(autoincrement())
  title           String
  type            TestType
  order           Int        @unique
  durationMinutes Int        @map("duration_minutes")
  status          TestStatus @default(DRAFT)
  questions       Question[]
  problems        Problem[]
  attempts        Attempt[]

  @@map("tests")
}

model Question {
  id        Int         @id @default(autoincrement())
  testId    Int         @map("test_id")
  text      String
  position  Int
  test      Test        @relation(fields: [testId], references: [id], onDelete: Cascade)
  options   Option[]
  answers   McqAnswer[]

  @@map("questions")
}

model Option {
  id         Int         @id @default(autoincrement())
  questionId Int         @map("question_id")
  text       String
  isCorrect  Boolean     @map("is_correct")
  position   Int
  question   Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  answers    McqAnswer[]

  @@map("options")
}

model Problem {
  id           Int             @id @default(autoincrement())
  testId       Int             @map("test_id")
  title        String
  description  String
  functionName String          @map("function_name")
  points       Int
  position     Int
  test         Test            @relation(fields: [testId], references: [id], onDelete: Cascade)
  testCases    TestCase[]
  results      ProblemResult[]

  @@map("problems")
}

model TestCase {
  id         Int                @id @default(autoincrement())
  problemId  Int                @map("problem_id")
  visibility TestCaseVisibility
  args       Json
  expected   Json
  position   Int
  problem    Problem            @relation(fields: [problemId], references: [id], onDelete: Cascade)

  @@map("test_cases")
}

model Attempt {
  id             Int             @id @default(autoincrement())
  userId         Int             @map("user_id")
  testId         Int             @map("test_id")
  status         AttemptStatus   @default(IN_PROGRESS)
  startedAt      DateTime        @map("started_at")
  deadline       DateTime
  submittedAt       DateTime?          @map("submitted_at")
  terminatedAt      DateTime?          @map("terminated_at")
  terminationReason String?            @map("termination_reason")
  score             Float?
  sessionKey        String?            @map("session_key")
  questionOrder     Json?              @map("question_order")   // [questionId, ...]
  optionOrder       Json?              @map("option_order")     // { "<questionId>": [optionId, ...] }
  user              User               @relation(fields: [userId], references: [id])
  test              Test               @relation(fields: [testId], references: [id])
  mcqAnswers        McqAnswer[]
  problemResults    ProblemResult[]
  violations        AttemptViolation[]

  @@unique([userId, testId])
  @@index([testId, status])
  @@map("attempts")
}

model AttemptViolation {
  id         Int           @id @default(autoincrement())
  attemptId  Int           @map("attempt_id")
  type       ViolationType
  counted    Boolean
  occurredAt DateTime      @default(now()) @map("occurred_at")
  attempt    Attempt       @relation(fields: [attemptId], references: [id], onDelete: Cascade)

  @@index([attemptId, occurredAt])
  @@map("attempt_violations")
}

model McqAnswer {
  id         Int      @id @default(autoincrement())
  attemptId  Int      @map("attempt_id")
  questionId Int      @map("question_id")
  optionId   Int?     @map("option_id")
  isCorrect  Boolean  @map("is_correct")
  attempt    Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question   Question @relation(fields: [questionId], references: [id])
  option     Option?  @relation(fields: [optionId], references: [id])

  @@unique([attemptId, questionId])
  @@map("mcq_answers")
}

model ProblemResult {
  id          Int       @id @default(autoincrement())
  attemptId   Int       @map("attempt_id")
  problemId   Int       @map("problem_id")
  runCount    Int       @default(0) @map("run_count")
  code        String?
  passedCount Int?      @map("passed_count")
  totalCount  Int?      @map("total_count")
  points      Float?
  submittedAt DateTime? @map("submitted_at")
  attempt     Attempt   @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  problem     Problem   @relation(fields: [problemId], references: [id])

  @@unique([attemptId, problemId])
  @@map("problem_results")
}
```

Notes:

- `Question`, `Option`, `Problem` and `TestCase` are deleted only while no attempt exists (R-4), so the `Restrict` default on `McqAnswer` and `ProblemResult` is never hit in normal use.
- `Attempt.user` keeps the default `Restrict`: a user with attempts cannot be deleted.
- `score` is `null` for `IN_PROGRESS` and `EXPIRED`. `TERMINATED` has a real score (API.md 19.3).
- The integrity fields (`terminatedAt`, `terminationReason`, `sessionKey`, `questionOrder`, `optionOrder`, `AttemptViolation`) are in the `init` migration from Phase 0, so nobody needs a second migration for them.

### 7.3 Seed (Esmaeel, with content from Majed)

`npx prisma db seed` runs `prisma/seed.ts`. It is safe to run again (`upsert` by email and by test `order`; questions and problems are created only when the test has none).

| File | Content | Owner |
| --- | --- | --- |
| `seed.ts` | Runs everything in order | Esmaeel |
| `seed-data/users.ts` | 1 instructor, 2 students (passwords hashed in `seed.ts`) | Esmaeel |
| `seed-data/mcq-questions.ts` | At least 10 IQ questions and 10 HTML & CSS questions | Majed |
| `seed-data/coding-problems.ts` | 2 problems, each with 1 sample and at least 4 hidden cases | Majed |

Seeded tests:

| order | title | type | duration | status |
| --- | --- | --- | --- | --- |
| 1 | IQ Test | MCQ | 20 min | PUBLISHED |
| 2 | HTML & CSS Test | MCQ | 20 min | PUBLISHED |
| 3 | JavaScript Problem Solving | CODING | 45 min | DRAFT |

Seed accounts are listed in the README (local development only).

### 7.4 Fixed method names

| Service | Public methods | Owner |
| --- | --- | --- |
| `ClockService` | `now()` | Esmaeel |
| `AuthService` | `register(dto)`, `login(dto)`, `getMe(userId)` | Esmaeel |
| `AttemptStateService` | `expireOverdue()`, `isOverdue(attempt, now)`, `assertAcceptingRequests(attempt)` (`409` for SUBMITTED / TERMINATED; stores EXPIRED and throws `409` when late), `hasAttempts(testId)`, `hasActiveAttempts(testId)` | Rami |
| `ScoringService` | `scoreMcqFromSaved(tx, attemptId)` → `{ correctCount, totalCount, score }`, `scoreCoding(tx, attemptId)` → `{ score, problems }` (sets unsubmitted points to 0) | Rami |
| `IntegrityService` | `recordViolation(userId, attemptId, type)` → `ViolationResult`, `issueSessionKey(tx, attemptId, isResume)` → `string` (logs `NEW_SESSION` on resume), `getIntegrity(attemptId)` → `AttemptIntegrity`, `listViolations(attemptId)` | Esmaeel |
| `attempt-order.util.ts` | `buildAttemptOrder(questions)` → `{ questionOrder, optionOrder }`, `applyQuestionOrder(questions, order)`, `applyOptionOrder(options, order)` (pure functions) | Majed |
| `InstructorTestsService` | `findAll()`, `findOne(testId)`, `publish(testId)`, `unpublish(testId)`, `assertContentEditable(testId)` | Majed |
| `QuestionsService` | `create(testId, dto)`, `replace(questionId, dto)`, `remove(questionId)` | Majed |
| `ProblemsService` | `create(testId, dto)`, `replace(problemId, dto)`, `remove(problemId)` | Majed |
| `CodeExecutionService` | `getMode()`, `run(problem, code)` → `ExecutionRunOutcome`, `submit(problem, code)` → `ExecutionSubmitOutcome` | Majed |
| `StudentTestsService` | `listForStudent(userId)`, `getForStudent(userId, testId)`, `assertCanStart(userId, test)` | Rami |
| `AttemptsService` | `start(userId, testId)`, `getForStudent(userId, attemptId)` | Rami |
| `McqService` | `saveAnswer(userId, attemptId, questionId, dto)`, `submit(userId, attemptId, dto)` | Rami |
| `CodingService` | `run(userId, attemptId, problemId, code)`, `submit(userId, attemptId, problemId, code)`, `finish(userId, attemptId)` | Rami |
| `ResultsService` | `listAttempts(query)`, `getAttemptDetail(attemptId)`, `listStudentResults(userId)` | Esmaeel |

`ExecutionRunOutcome` and `ExecutionSubmitOutcome` live in `execution/execution.types.ts`:

```ts
type ExecutionRunOutcome = {
  mode: 'MOCK' | 'JUDGE0';
  status: 'PASSED' | 'WRONG_ANSWER' | 'SYNTAX_ERROR' | 'RUNTIME_ERROR' | 'FUNCTION_NOT_FOUND' | 'TIME_LIMIT_EXCEEDED' | 'MOCK';
  message: string;
  input: unknown[];
  expectedOutput: unknown;
  actualOutput: unknown | null;
  logs: string[];
  error: { type: string; message: string; line: number | null } | null;
  timeMs: number | null;
};

type ExecutionSubmitOutcome = {
  mode: 'MOCK' | 'JUDGE0';
  passedCount: number;
  totalCount: number;
};
```

`CodeExecutionService` throws `ServiceUnavailableException` (503) when the provider fails. `CodingService` adds `runCount` / `runsRemaining` / `points` and saves.

`functionName` is inserted into the harness only after it passed the identifier check (`^[A-Za-z_$][A-Za-z0-9_$]*$`), and test-case arguments are inserted with `JSON.stringify`, so nothing from the database can change the harness code.

Controller methods:

| Controller | Methods |
| --- | --- |
| `AuthController` | `register`, `login`, `me` |
| `InstructorTestsController` | `getTests`, `getTest`, `publish`, `unpublish` |
| `QuestionsController` | `createQuestion`, `replaceQuestion`, `deleteQuestion` |
| `ProblemsController` | `createProblem`, `replaceProblem`, `deleteProblem` |
| `InstructorAttemptsController` | `getAttempts`, `getAttempt` |
| `StudentTestsController` | `getTests`, `getTest`, `startAttempt` |
| `StudentAttemptsController` | `getAttempt`, `saveMcqAnswer`, `submitMcq`, `runCode`, `submitCode`, `finish` |
| `IntegrityController` | `reportViolation` |
| `StudentResultsController` | `getResults` |

### 7.5 Who calls whom

```text
AuthController                -> AuthService
InstructorTestsController     -> InstructorTestsService -> AttemptStateService
QuestionsController           -> QuestionsService       -> InstructorTestsService.assertContentEditable
ProblemsController            -> ProblemsService        -> InstructorTestsService.assertContentEditable
InstructorAttemptsController  -> ResultsService         -> AttemptStateService
StudentResultsController      -> ResultsService         -> AttemptStateService
StudentTestsController        -> StudentTestsService, AttemptsService -> AttemptStateService
StudentAttemptsController     -> AttemptsService, McqService, CodingService
CodingService                 -> AttemptStateService, ScoringService, CodeExecutionService
McqService                    -> AttemptStateService, ScoringService
AttemptsService.start         -> IntegrityService.issueSessionKey, buildAttemptOrder
IntegrityController           -> IntegrityService -> AttemptStateService, ScoringService
ResultsService                -> IntegrityService.listViolations
```

`AttemptSessionGuard` (Esmaeel) is applied with `@UseGuards` on `StudentAttemptsController` and `IntegrityController`, after `JwtAuthGuard` and `RolesGuard`. It loads the attempt by `:attemptId`, and when the attempt is `IN_PROGRESS` and owned by the user it compares the `X-Attempt-Session` header with `attempt.sessionKey` (`409` on mismatch). It does nothing for a missing or other user's attempt, so the service still returns the normal `404`.

Every service uses `PrismaService` (global) and `ClockService` (global) directly.

Module imports:

```text
PrismaModule (global)     exports PrismaService
CommonModule (global)     exports ClockService
AuthModule                exports JwtAuthGuard, RolesGuard (JwtModule registered here)
AttemptStateModule        exports AttemptStateService, ScoringService   (no other imports)
ExecutionModule           exports CodeExecutionService              (no other imports)
TestsModule               imports AttemptStateModule
IntegrityModule           imports AttemptStateModule; exports IntegrityService, AttemptSessionGuard
StudentModule             imports AttemptStateModule, ExecutionModule, IntegrityModule
ResultsModule             imports AttemptStateModule, IntegrityModule
```

There are no circular imports.

### 7.6 Guards and decorators (Esmaeel)

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
@Controller('instructor/tests')
export class InstructorTestsController { ... }
```

- `JwtAuthGuard` verifies the token and sets `request.user` (`JwtPayload`). Failure → `401 Please sign in to continue.`
- `RolesGuard` reads `@Roles(...)`. Wrong role → `403 You do not have permission to do this.`
- `@CurrentUser()` returns `JwtPayload` (`sub`, `email`, `role`).

### 7.7 Response shaping (Rami)

`student/mappers/student-view.mapper.ts` is the **only** place that builds student responses for attempts:

```text
toStudentQuestion(question, savedOptionId) → { id, text, options: [{ id, text }], selectedOptionId }   // never isCorrect
                                // questions and options are put in the attempt's stored order first
toStudentProblem(problem, result) → { id, title, description, functionName, points,
                                      sample: { args, expected }, runCount, runsRemaining, submission }
                                      // only the SAMPLE case, never HIDDEN
```

Prisma queries for student routes use `select` (not `include`) for options and test cases, so `isCorrect` and hidden cases are never even loaded into a student response object.

### 7.8 Application start (`main.ts`, Esmaeel)

- global prefix `api`
- CORS for `http://localhost:5173`
- global `createValidationPipe()`
- global `AllExceptionsFilter`
- Swagger at `/api/docs`, with Bearer auth, tags: `auth`, `instructor-tests`, `instructor-content`, `instructor-attempts`, `student-tests`, `student-attempts`, `student-integrity`, `student-results`. The `X-Attempt-Session` header is documented with `@ApiHeader` on every attempt route.
- port `3000`

### 7.9 Environment (`api/.env.example`, Esmaeel)

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/b4f_assessment
JWT_SECRET=change-me
JWT_EXPIRES_IN=8h
EXECUTION_MODE=mock
JUDGE0_URL=
JUDGE0_AUTH_HEADER=
JUDGE0_AUTH_TOKEN=
JUDGE0_EXTRA_HEADER=
JUDGE0_EXTRA_VALUE=
JUDGE0_LANGUAGE_ID=
EXECUTION_TIMEOUT_MS=10000
CLIENT_ORIGIN=http://localhost:5173
SEED_INSTRUCTOR_PASSWORD=
```

- `JUDGE0_EXTRA_HEADER` / `JUDGE0_EXTRA_VALUE`: a second header for hosted Judge0 services that need two (for example RapidAPI: `X-RapidAPI-Key` in the auth pair, `X-RapidAPI-Host` here). Empty → not sent.
- `CLIENT_ORIGIN`: allowed CORS origins, comma-separated (the real frontend URL when hosted).
- `SEED_INSTRUCTOR_PASSWORD`: the instructor password the seed uses. Empty → `Instructor123` (local development only). **Always set it on a hosted server.**

### 7.10 Hosting checklist (Esmaeel, Ali)

The code runs on any host that runs Node.js and PostgreSQL. Before hosting:

| Item | Where | Why |
| --- | --- | --- |
| `prisma` and `@prisma/client` in `dependencies` (not `devDependencies`), and `"postinstall": "prisma generate"` | `api/package.json` (Esmaeel) | Hosts drop dev packages in production, then `prisma migrate deploy` fails at start |
| Build: `npm install && npm run build`. Start: `npx prisma migrate deploy && node dist/main` | host settings | Tables are created before the API starts |
| Seed once by hand with `SEED_INSTRUCTOR_PASSWORD` set | host shell | No public default instructor password |
| `DATABASE_URL` with `?sslmode=require` when the host's database needs SSL | host settings | Managed databases often refuse plain connections |
| `VITE_API_URL` = the real `https://` API URL **at build time** | client build (Ali) | Vite bakes it into the bundle; an `http` API from an `https` page is blocked by the browser |
| Rewrite every path to `index.html` | client host settings (Ali) | Otherwise a refresh on `/student/tests` gives 404 |
| Free plans that sleep | — | Open the site 15 minutes before the exam; the timer is on the server |
| Every host checked from Syria **without a VPN** (site, dashboard, payment) | team | Section 6 |

## 8. Where Each Rule Is Enforced

The backend enforces every rule. The frontend only guides the user.

| Rule | Backend (decides) | Frontend (guides) |
| --- | --- | --- |
| R-1 published only | `StudentTestsService`, `AttemptsService.start` (403) | Only published tests listed; 403 message shown |
| R-2 order | `StudentTestsService.assertCanStart` (403 + reason) | `LOCKED` badge and `lockReason` |
| R-3 publish needs content | `InstructorTestsService.publish` (409) | Message next to the row |
| R-4 content lock | `InstructorTestsService.assertContentEditable` (409) | Editor disabled when `isContentLocked` |
| R-5 unpublish lock | `InstructorTestsService.unpublish` (409) | Message next to the row |
| R-6 one attempt | `@@unique([userId, testId])`, `AttemptsService.start` | Continue button for IN_PROGRESS |
| R-7 server time | `ClockService.now()` | Countdown from `deadline` + `serverNow` |
| R-8 grace | `AttemptStateService.assertAcceptingRequests` | Input stops at the deadline |
| R-9 lazy expiry | `AttemptStateService.expireOverdue` | Shows the returned status |
| R-10 frozen attempts | Conditional `updateMany` on `IN_PROGRESS` | No actions on finished attempts |
| R-11, R-12 MCQ scoring | `McqService.submit` | Shows the returned result |
| R-13 expired = null | `score: null` on expiry; mappers add the label | `formatScore(null)` |
| R-14 no correct options | `student-view.mapper`, `select` | — |
| R-15, R-16 Run | `CodingService.run` (reserve run, 409 at limit) | Runs remaining shown, Run disabled at 0 |
| R-17, R-18 Submit | `CodingService.submit` | Submit disabled after a submission |
| R-19 hidden cases | Harness gets args only; mapper sends counts only | — |
| R-20 finish | `CodingService.finish` (transaction) | Finish with confirm |
| R-21 code length | `CodeDto` (400) | Character counter |
| R-22 one execution service | `CodeExecutionService` only | — |
| R-23, R-24 mock + mode label | `MockExecutionProvider`, `mode` in every result | `ExecutionModeNotice` |
| I-1 violations counted on the server | `IntegrityService.recordViolation` (groups, limits, 2 s dedupe) | `useExamGuard` reports, never counts |
| I-2 termination with the saved score | `IntegrityService` + `ScoringService` (one transaction) | Shows the returned result |
| I-3 one active session | `AttemptSessionGuard`, `issueSessionKey` | `attemptSession.ts`, Continue here |
| I-4 shuffled order | `buildAttemptOrder` at start, stored; mapper applies it | Shows the order it gets |
| I-5 pledge | `StartAttemptDto.acceptedRules` (400) | Checkbox on Test Intro |
| I-6 autosave | `McqService.saveAnswer` | `saveMcqAnswer` on every change |
| I-7 full screen | — (cannot be enforced by a server) | `FullscreenGate`, `useFullscreen` |

## 9. Naming

### Data

- JSON fields `camelCase`. Database columns `snake_case` with `@map`.
- Enum values `UPPER_SNAKE_CASE`.
- Times are ISO 8601 UTC strings.

### Backend

- Files: `<name>.controller.ts`, `.service.ts`, `.module.ts`, `.mapper.ts`, `.util.ts`, `.types.ts`, and `<name>.dto.ts` inside `dto/`.
- Classes `PascalCase` (DTOs end with `Dto`). Methods and variables `camelCase`. Constants `UPPER_SNAKE_CASE`.
- Use `ClockService.now()`. Never `new Date()` for "now" in a service.
- Every controller method has `@ApiOperation({ summary })`. Every protected controller has `@ApiBearerAuth()`.

### Frontend

- Components and pages `PascalCase`. Each page has `<Name>Page.tsx` and `<Name>Page.css`.
- Contexts: `<Feature>Context.tsx`, exporting `<Feature>Provider` and `use<Feature>()`.
- Hooks start with `use`. Event handlers start with `handle`. Booleans start with `is`, `has`, or `can`.

### Git

- Branches: `be/<module>-<description>` or `fe/<page>-<description>`.
- Commits: `type(scope): message` (types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`).

## 10. Base Colors

All colors are CSS variables in `client/src/styles/theme.css` (Ali). **Never write a color directly in a page or component.** In `main.tsx`, import `fonts.css`, then `theme.css`, then `global.css`.

| Variable | Value | Use |
| --- | --- | --- |
| `--color-primary` | `#4338ca` | Main buttons, links, AVAILABLE, PUBLISHED |
| `--color-primary-dark` | `#3730a3` | Hover |
| `--color-primary-light` | `#e0e7ff` | Light backgrounds |
| `--color-dark` | `#0f172a` | Navbar, editor frame |
| `--color-bg` | `#f8fafc` | Page background |
| `--color-surface` | `#ffffff` | Cards |
| `--color-border` | `#e2e8f0` | Borders |
| `--color-text` | `#0f172a` | Text |
| `--color-text-muted` | `#64748b` | Secondary text, LOCKED, DRAFT |
| `--color-success` | `#16a34a` | SUBMITTED, PASSED |
| `--color-warning` | `#d97706` | IN_PROGRESS, countdown under 5 minutes, MOCK notice |
| `--color-error` | `#dc2626` | EXPIRED, errors, countdown under 1 minute |
| `--color-code-bg` | `#1e1e1e` | Run output panel |
| `--color-terminated` | `#7f1d1d` | TERMINATED badge, termination screen |

Color is never the only signal. Every state also shows a text label.

## 11. CSS Rules

Plain CSS is global, so class names must never clash.

1. Colors come only from `theme.css`.
2. Every class starts with its owner prefix (BEM style: `prefix__element--modifier`).
3. No bare element selectors (`button`, `h1`, `a`) outside `global.css`.
4. A page's CSS file is imported only by that page.
5. Never style another owner's classes.

| Area | Prefix | Owner |
| --- | --- | --- |
| Sign in / Sign up | `auth-` | Ali |
| Test Management | `test-mgmt-` | Ali |
| Test Editor | `test-editor-` | Ali |
| Instructor Attempts | `attempts-` | Ali |
| Not Found | `not-found-` | Ali |
| Shared UI | `ui-` | Ali |
| Layout | `layout-` | Ali |
| Exam guard (gate, warning dialog) | `exam-guard-` | Ali |
| My Tests | `my-tests-` | Maya |
| Test Intro | `test-intro-` | Maya |
| Attempt (MCQ + coding) | `attempt-` | Maya |
| My Results | `my-results-` | Maya |
| Code editor | `code-editor-` | Maya |
| Countdown | `countdown-` | Maya |

## 12. Ownership

One owner for every file. Edit only your own files.

### Frontend

| Owner | Files |
| --- | --- |
| Ali | `App.tsx`, `main.tsx`, `constants.ts`, `routes/`, `styles/`, `assets/`, `components/layout/`, `components/common/` (except `Countdown*`), `context/AuthContext.tsx`, `context/InstructorTestsContext.tsx`, `context/InstructorAttemptsContext.tsx`, `services/http.ts`, `services/auth.api.ts`, `services/instructor.api.ts`, `types/common.types.ts`, `types/auth.types.ts`, `types/instructor.types.ts`, `utils/format.ts`, `utils/tokenStorage.ts`, `editor/monacoSetup.ts`, `exam-guard/`, `pages/Auth/`, `pages/instructor/`, `pages/NotFound/` |
| Maya | `components/common/Countdown*`, `context/StudentTestsContext.tsx`, `context/AttemptContext.tsx`, `services/student.api.ts`, `types/student.types.ts`, `types/execution.types.ts`, `utils/serverClock.ts`, `utils/attemptSession.ts`, `editor/CodeEditor.tsx`, `editor/CodeEditor.css`, `pages/student/` |

### Backend

| Owner | Files |
| --- | --- |
| Esmaeel | `main.ts`, `app.module.ts`, `common/`, `prisma/` (module + service), `auth/`, `integrity/`, `results/`, `api/prisma/schema.prisma`, `api/prisma/migrations/`, `api/prisma/seed.ts`, `seed-data/users.ts`, `api/requests/api.http`, `api/.env.example` |
| Majed | `tests/` (with `attempt-order.util.ts`), `execution/`, `seed-data/mcq-questions.ts`, `seed-data/coding-problems.ts` |
| Rami | `attempt-state/`, `student/` |

### Docs and repository

| Owner | Files |
| --- | --- |
| Ali | `docs/`, `README.md`, `.github/`, `.editorconfig`, `.prettierrc`, `.gitignore`, `client/package.json` |
| Esmaeel | `api/package.json` |

Need a change in someone else's file? Ask the owner. Do not edit it.

## 13. Loading and Errors

Every page that loads data must have:

- a loading view (`Loading`)
- an error view with the backend message and a retry button (`ErrorMessage`)
- an empty view where it makes sense (`EmptyState`)
- a disabled button while a request runs

A failed request must never leave a blank or frozen page. Backend messages are shown as they are.

## 14. Architecture Rules

- Only contexts call `services/`. No `fetch` in pages or components.
- No score, lock, order, or time-limit logic in the frontend.
- The countdown is always calculated from the backend `deadline`.
- Database access only in services. Controllers only pass data.
- Student code goes only through `CodeExecutionService`.
- Student responses are built only by `student-view.mapper.ts`.
- Backend "now" always comes from `ClockService`.
- Business constants only in `common/constants.ts`.
- `schema.prisma` has one owner. Every schema change is a new generated migration. Never `prisma migrate reset` on shared data.
- No CDN, no outside fonts, no outside host in the browser.
- The browser only **reports** violations. Counting, warnings and termination are decided only by `IntegrityService`.
- Exam-guard code lives only in `exam-guard/`. Pages use it; they never add their own listeners for full screen, visibility, copy or paste.
- Update `docs/API.md` when the contract changes.

## 15. Checks Before Merging

- the backend starts (`npm run start:dev` in `api/`)
- the frontend builds (`npm run build` in `client/`)
- your feature works with the real API, not only the stubs
- loading, error, and empty states exist
- wrong input shows a clear message
- no console errors
- the page looks fine on a phone-sized screen
- the Network tab shows only `localhost` requests
- only your own files changed

Before the final demo, run the full test in `docs/TASKS.md`, section 12.

## 16. Exam Integrity (instructor-approved addition)

The rules, limits, messages and endpoints are in `API.md`, section 19. This section explains **where the code lives**.

### 16.1 Backend (Esmaeel, with Rami's scoring)

```text
api/src/integrity/
├── dto/violation.dto.ts             ViolationDto { type: ClientViolationType }   (@IsIn the six client types)
├── guards/attempt-session.guard.ts  AttemptSessionGuard
├── integrity.controller.ts          POST /student/attempts/:attemptId/violations → reportViolation
├── integrity.service.ts             recordViolation, issueSessionKey, getIntegrity, listViolations
└── integrity.module.ts
```

`recordViolation(userId, attemptId, type)`:

```text
1. load the attempt (own only, else 404)
2. attemptStateService.assertAcceptingRequests(attempt)
3. group = FOCUS or CLIPBOARD
4. counted = no counted violation of this group in the last VIOLATION_DEDUPE_SECONDS
5. in one transaction:
     create AttemptViolation { type, counted, occurredAt: now }
     if counted and the group count reached its limit:
        updateMany IN_PROGRESS → TERMINATED, terminatedAt, terminationReason
        score from scoringService (MCQ: saved answers; coding: submitted problems)
6. return ViolationResult (API.md 19.2) and log the event (never the session key)
```

### 16.2 Frontend toolkit (Ali)

`client/src/exam-guard/` knows nothing about the API. It only detects, blocks, and calls the callback it is given. Maya connects it to `AttemptContext.reportViolation`.

| File | Exports | What it does |
| --- | --- | --- |
| `useFullscreen.ts` | `useFullscreen()` → `{ isSupported, isFullscreen, enter(): Promise<boolean>, exit(): Promise<void> }` | Wraps the Fullscreen API (`requestFullscreen`, `fullscreenchange`). `enter()` must be called from a click. Some browsers never settle the `requestFullscreen()` promise when they refuse, so `enter()` waits at most 3 s (`Promise.race`) and then returns `!!document.fullscreenElement`. |
| `useExamGuard.ts` | `useExamGuard({ isActive, onViolation })` | While `isActive`: `fullscreenchange` (left) → `FULLSCREEN_EXIT`; `visibilitychange` (hidden) → `TAB_HIDDEN`; `copy` / `cut` outside `[data-exam-clipboard="allow"]` → blocked + `COPY` / `CUT`; `contextmenu` outside the editor → blocked, not reported. Events of the same group within 1 s are sent once. Removes every listener when `isActive` becomes false or on unmount. |
| `editorPasteGuard.ts` | `attachEditorPasteGuard(editor, onViolation, root)` → `dispose()` | Remembers text copied or cut **inside** this Monaco editor. A paste whose text was not copied inside the editor → blocked + `PASTE_EXTERNAL`. A drop from outside → blocked + `DROP_EXTERNAL`. Listens on `root` (the wrapper `div` of `CodeEditor`, passed through a `ref`) in the capture phase, before Monaco handles the event. **Not** on `editor.getDomNode()`: Monaco can re-create its node (React StrictMode), and then the listener is lost and external paste is never caught. |
| `FullscreenGate.tsx` | props: `isFullscreen: boolean`, `onEnter: () => void`, `children` | Shows `children` only in full screen. Otherwise: `Return to full screen to continue.` and a button. |
| `ViolationWarningDialog.tsx` | props: `warning: string \| null`, `onReturn: () => void` | Modal with the backend warning and **Return to full screen**. |
| `ExamGuard.css` | — | Classes with the `exam-guard-` prefix. |

The editor container in `CodeEditor` has `data-exam-clipboard="allow"`, so copy inside the editor is not reported by `useExamGuard`; `attachEditorPasteGuard` handles the editor.

### 16.3 Wiring (Maya)

```tsx
const { isSupported, isFullscreen, enter, exit } = useFullscreen();
const isActive = attempt?.status === 'IN_PROGRESS' && !isTimeUp;

useExamGuard({ isActive, onViolation: reportViolation });

<>
  <FullscreenGate isFullscreen={isFullscreen} onEnter={enter}>
    {/* McqTestView or CodingTestView — their state (code, choices) lives here in AttemptPage */}
  </FullscreenGate>
  {/* OUTSIDE the gate: leaving full screen is itself a violation, so the warning must stay visible then. */}
  <ViolationWarningDialog warning={lastWarning} onReturn={() => { clearWarning(); enter(); }} />
</>
```

- `ViolationWarningDialog` must stay **outside** `FullscreenGate`. Inside it, the warning disappears exactly when the student leaves full screen.
- `CodeEditor` calls `guardRef.current?.dispose()` and then `attachEditorPasteGuard(editor, onViolation, wrapperRef.current)` in `onMount`, and `dispose()` on unmount.
- After `SUBMITTED`, `EXPIRED` or `TERMINATED`: `isActive` is false, and the page calls `exit()`.

### 16.4 Honest limits (say them in the presentation)

- A browser can be told to leave full screen at any time (Esc), and a student can turn off JavaScript or use a second device. The browser checks **deter**; they cannot **prevent**.
- That is why the decisions are on the server, and why the strong protections are server-side: server time, one attempt, shuffled order, one active session, and no correct answers or hidden tests in any response.
- Every violation is logged with its time, so the instructor can review a case instead of trusting an automatic decision alone.
