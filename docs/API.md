# Bytes for Futures Assessment Platform — API

## 1. Overview

The API is the **source of truth** for the whole application. The frontend only shows what the API returns.

The backend decides:

- who can see, start, and submit each test (publication and order)
- when an attempt started, its deadline, and when it expired
- every MCQ score and every coding score
- what a Run returns and how many runs are left
- how many hidden tests a Submit passed
- what the student is allowed to see (never correct options, never hidden test cases)
- how many exam-rule violations an attempt has, and when the attempt is terminated (section 19)

Stack: NestJS, PostgreSQL through Prisma, JWT, Swagger. Every route under `/student/attempts/:attemptId` also needs the attempt session header (section 19.4). Student code is **never executed on our server**. It goes through one `CodeExecutionService`, which uses an external execution service (Judge0) or the mock mode (section 13).

## 2. Base URL

```text
http://localhost:3000/api
```

```text
Swagger UI:   http://localhost:3000/api/docs
```

Frontend environment variable:

```text
VITE_API_URL=http://localhost:3000/api
```

All routes below start with `/api`.

## 3. Authentication

- Sign in returns a JWT. Every protected request sends it in the header:

```text
Authorization: Bearer <accessToken>
```

- The token payload is `{ sub: userId, email, role }`.
- Two roles: `INSTRUCTOR` and `STUDENT`. Instructor accounts are seeded. Students sign up.
- `/instructor/*` routes need `INSTRUCTOR`. `/student/*` routes need `STUDENT`.

| Situation | Status | Message |
| --- | --- | --- |
| No token, bad token, expired token | 401 | `Please sign in to continue.` |
| Wrong role for the route | 403 | `You do not have permission to do this.` |

## 4. Endpoint Summary

| Method | Endpoint | Purpose | Role | Backend owner |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Student sign-up | public | Esmaeel |
| POST | `/auth/login` | Sign in (both roles) | public | Esmaeel |
| GET | `/auth/me` | Current user | any | Esmaeel |
| GET | `/instructor/tests` | The three tests with counts | INSTRUCTOR | Majed |
| GET | `/instructor/tests/:testId` | One test with its questions or problems | INSTRUCTOR | Majed |
| PATCH | `/instructor/tests/:testId/publish` | Publish a test | INSTRUCTOR | Majed |
| PATCH | `/instructor/tests/:testId/unpublish` | Unpublish a test | INSTRUCTOR | Majed |
| POST | `/instructor/tests/:testId/questions` | Add an MCQ question | INSTRUCTOR | Majed |
| PUT | `/instructor/questions/:questionId` | Replace an MCQ question | INSTRUCTOR | Majed |
| DELETE | `/instructor/questions/:questionId` | Delete an MCQ question | INSTRUCTOR | Majed |
| POST | `/instructor/tests/:testId/problems` | Add a coding problem | INSTRUCTOR | Majed |
| PUT | `/instructor/problems/:problemId` | Replace a coding problem | INSTRUCTOR | Majed |
| DELETE | `/instructor/problems/:problemId` | Delete a coding problem | INSTRUCTOR | Majed |
| GET | `/instructor/attempts?testId=&status=&search=` | All attempts, filtered | INSTRUCTOR | Esmaeel |
| GET | `/instructor/attempts/:attemptId` | One attempt in detail | INSTRUCTOR | Esmaeel |
| GET | `/student/tests` | Published tests with their state | STUDENT | Rami |
| GET | `/student/tests/:testId` | One published test with its state | STUDENT | Rami |
| POST | `/student/tests/:testId/attempts` | Start (or resume) an attempt | STUDENT | Rami |
| GET | `/student/attempts/:attemptId` | The attempt screen data | STUDENT | Rami |
| POST | `/student/attempts/:attemptId/mcq-submit` | Submit MCQ answers | STUDENT | Rami |
| POST | `/student/attempts/:attemptId/problems/:problemId/run` | Run code on the sample case | STUDENT | Rami (+ Majed's execution service) |
| POST | `/student/attempts/:attemptId/problems/:problemId/submit` | Submit code for hidden tests | STUDENT | Rami (+ Majed's execution service) |
| POST | `/student/attempts/:attemptId/finish` | Finish the coding test | STUDENT | Rami |
| PUT | `/student/attempts/:attemptId/mcq-answers/:questionId` | Autosave one MCQ answer | STUDENT | Rami |
| POST | `/student/attempts/:attemptId/violations` | Report an exam-rule violation | STUDENT | Esmaeel |
| GET | `/student/results` | The student's own results | STUDENT | Esmaeel |

## 5. Data Shapes

All JSON fields use `camelCase`. All times are ISO 8601 strings in UTC, for example `2026-11-03T10:00:00.000Z`.

### 5.1 Enums

```text
Role                INSTRUCTOR | STUDENT
TestType            MCQ | CODING
TestStatus          DRAFT | PUBLISHED
AttemptStatus       IN_PROGRESS | SUBMITTED | EXPIRED | TERMINATED
StudentTestState    LOCKED | AVAILABLE | IN_PROGRESS | SUBMITTED | EXPIRED | TERMINATED
TestCaseVisibility  SAMPLE | HIDDEN
ExecutionMode       MOCK | JUDGE0
ViolationType       FULLSCREEN_EXIT | TAB_HIDDEN | COPY | CUT | PASTE_EXTERNAL | DROP_EXTERNAL | NEW_SESSION
ViolationGroup      FOCUS | CLIPBOARD | SESSION
```

"Finished" in this document always means `SUBMITTED`, `EXPIRED` or `TERMINATED`.

### 5.2 User and AuthResponse

```json
{
  "accessToken": "eyJhbGciOi...",
  "user": { "id": 3, "fullName": "Lina Saleh", "email": "lina@example.com", "role": "STUDENT" }
}
```

`passwordHash` is never returned.

### 5.3 InstructorTestSummary

```json
{
  "id": 1,
  "title": "IQ Test",
  "type": "MCQ",
  "order": 1,
  "durationMinutes": 20,
  "status": "PUBLISHED",
  "questionCount": 12,
  "problemCount": 0,
  "attemptCount": 4,
  "inProgressCount": 1,
  "isContentLocked": true
}
```

`isContentLocked` is `true` when any student has an attempt for this test (R-4). The editor uses it to disable editing.

### 5.4 InstructorQuestion (instructor only)

```json
{
  "id": 7,
  "text": "Which number comes next: 2, 4, 8, 16, ?",
  "options": [
    { "id": 21, "text": "24", "isCorrect": false },
    { "id": 22, "text": "32", "isCorrect": true }
  ]
}
```

### 5.5 InstructorProblem (instructor only)

```json
{
  "id": 2,
  "title": "Two Sum",
  "description": "Return the indexes of the two numbers that add up to target.",
  "functionName": "twoSum",
  "points": 50,
  "testCases": [
    { "id": 10, "visibility": "SAMPLE", "args": [[2, 7, 11, 15], 9], "expected": [0, 1] },
    { "id": 11, "visibility": "HIDDEN", "args": [[3, 2, 4], 6], "expected": [1, 2] }
  ]
}
```

- `args` is always a JSON **array**: the arguments passed to the function, in order.
- `expected` is any JSON value: the value the function must **return**.

### 5.6 InstructorTestDetail

`InstructorTestSummary` plus one of:

```json
{ "questions": [ /* InstructorQuestion */ ] }
{ "problems":  [ /* InstructorProblem */ ] }
```

### 5.7 StudentTestCard

```json
{
  "id": 2,
  "title": "HTML & CSS Test",
  "type": "MCQ",
  "order": 2,
  "durationMinutes": 20,
  "itemCount": 10,
  "state": "LOCKED",
  "lockReason": "Complete the IQ Test first.",
  "attemptId": null,
  "score": null
}
```

- `itemCount` is the number of questions (MCQ) or problems (coding).
- `lockReason` is set only when `state` is `LOCKED`.
- `score` is set when `state` is `SUBMITTED` or `TERMINATED`. It is `null` when `EXPIRED` (R-13).
- A `TERMINATED` card always shows the label `Terminated — exam rules violated`, next to its score.

### 5.8 StudentAttempt (the attempt screen)

```json
{
  "id": 15,
  "testId": 1,
  "testTitle": "IQ Test",
  "type": "MCQ",
  "status": "IN_PROGRESS",
  "startedAt": "2026-11-03T10:00:00.000Z",
  "deadline": "2026-11-03T10:20:00.000Z",
  "serverNow": "2026-11-03T10:05:12.400Z",
  "submittedAt": null,
  "sessionKey": "9f2c...e81a",
  "questions": [
    { "id": 7, "text": "Which number comes next: 2, 4, 8, 16, ?", "options": [ { "id": 22, "text": "32" }, { "id": 21, "text": "24" } ], "selectedOptionId": null }
  ],
  "problems": null,
  "executionMode": null,
  "integrity": { "focusViolations": 0, "focusLimit": 2, "clipboardViolations": 0, "clipboardLimit": 3 },
  "result": null
}
```

For a coding attempt, `questions` is `null` and `problems` is:

```json
[
  {
    "id": 2,
    "title": "Two Sum",
    "description": "Return the indexes of the two numbers that add up to target.",
    "functionName": "twoSum",
    "points": 50,
    "sample": { "args": [[2, 7, 11, 15], 9], "expected": [0, 1] },
    "runCount": 3,
    "runsRemaining": 17,
    "submission": null
  }
]
```

`submission` after a Submit: `{ "passedCount": 4, "totalCount": 5, "points": 40, "submittedAt": "..." }`.

`executionMode` is `MOCK` or `JUDGE0` for coding attempts, so the screen can show the right notice (R-24).

Rules for this shape:

- **Options never have `isCorrect`. Problems never have hidden test cases.** Only the sample case is sent.
- Questions and options come in **this attempt's own shuffled order** (section 19.5). The same attempt always gets the same order.
- `selectedOptionId` is the autosaved choice (section 10), so a refresh never loses the student's choices.
- `sessionKey` is set **only** in the response of `POST /student/tests/:testId/attempts`. Every other response has `null` (section 19.4).
- `integrity` holds the current violation counts and limits (section 19).
- `serverNow` lets the frontend correct the difference between the student's clock and the server clock (section 12).
- When the attempt is finished (`SUBMITTED`, `EXPIRED` or `TERMINATED`), `questions` and `problems` are `null` and `result` is set:

```json
{ "result": { "correctCount": 16, "totalCount": 20, "score": 80, "label": "16 / 20 correct (80%)" } }
{ "result": { "score": null, "label": "Expired — not submitted" } }
{ "result": { "score": 72.5, "label": "Coding score: 72.5%" } }
{ "result": { "score": 45, "label": "Terminated — exam rules violated (45%)", "terminationReason": "Left full screen or switched away from the exam 2 times." } }
```

### 5.9 RunResult

```json
{
  "mode": "JUDGE0",
  "status": "WRONG_ANSWER",
  "message": "Your function returned a different value than expected.",
  "input": [[2, 7, 11, 15], 9],
  "expectedOutput": [0, 1],
  "actualOutput": [1, 0],
  "logs": ["checking index 0", "checking index 1"],
  "error": null,
  "timeMs": 38,
  "runCount": 4,
  "runsRemaining": 16
}
```

With an error:

```json
{
  "mode": "JUDGE0",
  "status": "RUNTIME_ERROR",
  "message": "Your code threw an error while running.",
  "input": [[2, 7, 11, 15], 9],
  "expectedOutput": [0, 1],
  "actualOutput": null,
  "logs": [],
  "error": { "type": "TypeError", "message": "Cannot read properties of undefined (reading 'length')", "line": 3 },
  "timeMs": 21,
  "runCount": 5,
  "runsRemaining": 15
}
```

`status` values and their fixed messages are in section 13.6.

### 5.10 SubmitResult

```json
{
  "problemId": 2,
  "mode": "JUDGE0",
  "passedCount": 4,
  "totalCount": 5,
  "points": 40,
  "submittedAt": "2026-11-03T11:12:40.000Z",
  "label": "4 of 5 tests passed"
}
```

**No inputs, no expected outputs, no actual outputs, no logs.** Only counts (R-19).

### 5.11 InstructorAttemptRow

```json
{
  "id": 15,
  "student": { "id": 3, "fullName": "Lina Saleh", "email": "lina@example.com" },
  "test": { "id": 1, "title": "IQ Test", "type": "MCQ" },
  "status": "SUBMITTED",
  "startedAt": "2026-11-03T10:00:00.000Z",
  "deadline": "2026-11-03T10:20:00.000Z",
  "submittedAt": "2026-11-03T10:17:00.000Z",
  "terminatedAt": null,
  "timeUsedSeconds": 1020,
  "score": 80,
  "violationCount": 1,
  "terminationReason": null
}
```

`timeUsedSeconds` is `submittedAt - startedAt`. For an `EXPIRED` attempt it is the full duration and `score` is `null`. For a `TERMINATED` attempt it is `terminatedAt - startedAt`. For `IN_PROGRESS` it is `null`.

`violationCount` counts **counted** violations of every group (section 19.1).

### 5.12 StudentResult

```json
{
  "testId": 1,
  "testTitle": "IQ Test",
  "type": "MCQ",
  "status": "SUBMITTED",
  "score": 80,
  "label": "80%",
  "startedAt": "2026-11-03T10:00:00.000Z",
  "submittedAt": "2026-11-03T10:17:00.000Z"
}
```

For `EXPIRED`: `"score": null`, `"label": "Expired — not submitted"`, `"submittedAt": null`.

For `TERMINATED`: `"score": 45`, `"label": "Terminated — exam rules violated (45%)"`, `"submittedAt": null`, plus `"terminatedAt"` and `"terminationReason"`.

## 6. Auth Endpoints (Esmaeel)

### POST /auth/register

```json
{ "fullName": "Lina Saleh", "email": "lina@example.com", "password": "secret123" }
```

```text
201 Created   → AuthResponse (role is always STUDENT)
```

| Problem | Status | Message |
| --- | --- | --- |
| Full name missing or only spaces | 400 | `Full name is required.` |
| Email not valid | 400 | `A valid email address is required.` |
| Password shorter than 8 characters | 400 | `Password must be at least 8 characters.` |
| Email already used | 409 | `An account with this email already exists.` |

The email is trimmed and lower-cased. The password is hashed with bcrypt. A client cannot choose the role.

### POST /auth/login

```json
{ "email": "lina@example.com", "password": "secret123" }
```

```text
200 OK   → AuthResponse
```

| Problem | Status | Message |
| --- | --- | --- |
| Wrong email or wrong password | 401 | `Invalid email or password.` |

Same message for both cases.

### GET /auth/me

```text
200 OK   → User
```

## 7. Instructor Test Endpoints (Majed)

### GET /instructor/tests

```text
200 OK   → InstructorTestSummary[]   (always 3, ordered by order)
```

### GET /instructor/tests/:testId

```text
200 OK   → InstructorTestDetail
404      → Test not found.
```

### PATCH /instructor/tests/:testId/publish

```text
200 OK   → InstructorTestSummary (status PUBLISHED)
```

Publishing an already published test returns it unchanged.

| Problem | Status | Message |
| --- | --- | --- |
| Unknown test | 404 | `Test not found.` |
| MCQ test with fewer than 5 questions | 409 | `An MCQ test needs at least 5 questions before it can be published.` |
| Coding test with no problem | 409 | `A coding test needs at least 1 problem before it can be published.` |

### PATCH /instructor/tests/:testId/unpublish

```text
200 OK   → InstructorTestSummary (status DRAFT)
```

| Problem | Status | Message |
| --- | --- | --- |
| Unknown test | 404 | `Test not found.` |
| An attempt is IN_PROGRESS | 409 | `This test cannot be unpublished while a student is taking it.` |

Before checking, overdue attempts are expired first (`AttemptStateService.expireOverdue()`), so a forgotten attempt never blocks unpublishing forever.

### POST /instructor/tests/:testId/questions

```json
{
  "text": "Which number comes next: 2, 4, 8, 16, ?",
  "options": [
    { "text": "24", "isCorrect": false },
    { "text": "32", "isCorrect": true },
    { "text": "18", "isCorrect": false }
  ]
}
```

```text
201 Created   → InstructorQuestion
```

### PUT /instructor/questions/:questionId

Same body. Replaces the text **and all options** (options get new ids). Returns `200` with `InstructorQuestion`.

### DELETE /instructor/questions/:questionId

```text
200 OK   → { "message": "Question deleted." }
```

### POST /instructor/tests/:testId/problems

```json
{
  "title": "Two Sum",
  "description": "Return the indexes of the two numbers that add up to target.",
  "functionName": "twoSum",
  "points": 50,
  "testCases": [
    { "visibility": "SAMPLE", "args": [[2, 7, 11, 15], 9], "expected": [0, 1] },
    { "visibility": "HIDDEN", "args": [[3, 2, 4], 6], "expected": [1, 2] },
    { "visibility": "HIDDEN", "args": [[3, 3], 6], "expected": [0, 1] },
    { "visibility": "HIDDEN", "args": [[1, 5, 9], 14], "expected": [1, 2] }
  ]
}
```

```text
201 Created   → InstructorProblem
```

### PUT /instructor/problems/:problemId

Same body. Replaces the problem and **all its test cases**. Returns `200` with `InstructorProblem`.

### DELETE /instructor/problems/:problemId

```text
200 OK   → { "message": "Problem deleted." }
```

### Content errors (questions and problems)

| Problem | Status | Message |
| --- | --- | --- |
| Unknown test / question / problem | 404 | `Test not found.` / `Question not found.` / `Problem not found.` |
| Question added to a coding test | 400 | `Questions can only be added to an MCQ test.` |
| Problem added to an MCQ test | 400 | `Problems can only be added to a coding test.` |
| Question text missing | 400 | `Question text is required.` |
| Fewer than 2 or more than 6 options | 400 | `A question needs between 2 and 6 options.` |
| An option text is empty | 400 | `Every option needs text.` |
| Not exactly one correct option | 400 | `A question needs exactly one correct option.` |
| Title or description missing | 400 | `Problem title is required.` / `Problem description is required.` |
| Function name not a valid JavaScript name | 400 | `Function name must be a valid JavaScript name, for example twoSum.` |
| Points not a whole number from 1 to 100 | 400 | `Points must be a whole number from 1 to 100.` |
| `args` is not an array | 400 | `Test case arguments must be a JSON array.` |
| No sample case | 400 | `A problem needs at least 1 sample test case.` |
| Fewer than 3 hidden cases | 400 | `A problem needs at least 3 hidden test cases.` |
| Any student has an attempt for this test | 409 | `Questions and problems cannot be changed after a student has started this test.` |

The R-4 check (last row) runs before saving, on add, replace, and delete.

## 8. Instructor Attempts Endpoints (Esmaeel)

### GET /instructor/attempts

```http
GET /api/instructor/attempts?testId=1&status=SUBMITTED&search=lina
```

All query values are optional.

| Query | Rule |
| --- | --- |
| `testId` | positive whole number |
| `status` | `IN_PROGRESS`, `SUBMITTED`, `EXPIRED` or `TERMINATED` |
| `search` | part of the student's full name, not case-sensitive |

```text
200 OK   → InstructorAttemptRow[]   (newest startedAt first)
```

Overdue attempts are expired first, so the list never shows an old attempt as in progress.

| Problem | Status | Message |
| --- | --- | --- |
| Bad `testId` | 400 | `testId must be a positive whole number.` |
| Bad `status` | 400 | `status must be IN_PROGRESS, SUBMITTED, EXPIRED or TERMINATED.` |

### GET /instructor/attempts/:attemptId

```text
200 OK   → InstructorAttemptRow plus details
```

MCQ details: `{ "mcq": { "correctCount": 16, "totalCount": 20 } }`.

Every detail also has the violation log, oldest first:

```json
{
  "terminationReason": null,
  "violations": [
    { "type": "TAB_HIDDEN", "group": "FOCUS", "counted": true, "occurredAt": "2026-11-03T10:06:40.000Z" },
    { "type": "FULLSCREEN_EXIT", "group": "FOCUS", "counted": false, "occurredAt": "2026-11-03T10:06:41.000Z" },
    { "type": "NEW_SESSION", "group": "SESSION", "counted": false, "occurredAt": "2026-11-03T10:09:02.000Z" }
  ]
}
```

Coding details (results kept even for EXPIRED and TERMINATED attempts, R-13):

```json
{
  "problems": [
    { "problemId": 2, "title": "Two Sum", "runCount": 6, "submitted": true, "passedCount": 4, "totalCount": 5, "points": 40 }
  ]
}
```

`404` → `Attempt not found.`

## 9. Student Test Endpoints (Rami)

### GET /student/tests

```text
200 OK   → StudentTestCard[]   (published tests only, ordered by order)
```

How `state` is decided (first match wins):

```text
the student has an attempt:
   IN_PROGRESS (and not overdue)   → IN_PROGRESS
   SUBMITTED                       → SUBMITTED
   EXPIRED (or overdue)            → EXPIRED
   TERMINATED                      → TERMINATED
no attempt:
   test order is 1                 → AVAILABLE
   previous test is finished       → AVAILABLE
   otherwise                       → LOCKED, lockReason "Complete the <previous title> first."
```

"Finished" means `SUBMITTED`, `EXPIRED` or `TERMINATED` (R-2): a terminated student is never blocked from the next test. "Previous" means the test with `order - 1`, published or not.

### GET /student/tests/:testId

```text
200 OK   → StudentTestCard
```

| Problem | Status | Message |
| --- | --- | --- |
| Test does not exist | 404 | `Test not found.` |
| Test is not published | 403 | `This test is not available.` |

### POST /student/tests/:testId/attempts

```json
{ "acceptedRules": true }
```

The student must tick the exam-rules pledge (section 19.6).

```text
201 Created   → StudentAttempt   (new attempt)
200 OK        → StudentAttempt   (an IN_PROGRESS attempt already exists: same attempt, same startedAt and deadline)
```

Checks, in order:

| # | Problem | Status | Message |
| --- | --- | --- | --- |
| 0 | `acceptedRules` is not `true` | 400 | `You must accept the exam rules to start.` |
| 1 | Test does not exist | 404 | `Test not found.` |
| 2 | Test not published | 403 | `This test is not available.` |
| 3 | An IN_PROGRESS, not overdue attempt exists | 200 | (returns it with a **new** `sessionKey`, section 19.4) |
| 4 | The student already finished this test | 409 | `You have already finished this test.` |
| 5 | Previous test not finished | 403 | `Complete the <previous title> first.` |

On success: `startedAt = ClockService.now()`, `deadline = startedAt + durationMinutes`, the shuffled question and option order (section 19.5), and a new `sessionKey`. For a coding test, one `ProblemResult` row (run count 0) is created per problem in the same transaction. Two fast clicks never create two attempts: `@@unique([userId, testId])` blocks the second insert, and the service then returns the existing attempt.

### GET /student/attempts/:attemptId

```text
200 OK   → StudentAttempt
```

| Problem | Status | Message |
| --- | --- | --- |
| Attempt does not exist or belongs to another student | 404 | `Attempt not found.` |

An overdue attempt is marked `EXPIRED` before it is returned (R-9).

## 10. MCQ Autosave and Submit (Rami)

### PUT /student/attempts/:attemptId/mcq-answers/:questionId

Saves one choice as soon as the student picks it. `optionId: null` clears the choice.

```json
{ "optionId": 22 }
```

```text
200 OK
```

```json
{ "questionId": 7, "optionId": 22, "savedAt": "2026-11-03T10:04:10.000Z" }
```

| # | Problem | Status | Message |
| --- | --- | --- | --- |
| 1 | `optionId` is not a positive whole number or `null` | 400 | `optionId must be a positive whole number or null.` |
| 2 | Attempt not found / not own | 404 | `Attempt not found.` |
| 3 | Wrong or missing attempt session | 409 | (section 19.4) |
| 4 | Attempt is not an MCQ attempt | 400 | `This action is only for MCQ tests.` |
| 5 | Attempt finished, or now > deadline + 10 s | 409 | (same messages as submit) |
| 6 | Question not in this test | 400 | `An answer refers to a question that is not part of this test.` |
| 7 | Option not in this question | 400 | `An answer refers to an option that does not belong to its question.` |

- Stored with `upsert` on `(attemptId, questionId)`. `isCorrect` is calculated on the server and **never returned**.
- On **submit**, the submitted list replaces every saved answer (R-11 stays true: the submit is the final answer set).
- On **EXPIRED**, saved answers are kept for the instructor, but the score stays `null` (R-13).
- On **TERMINATED**, the saved answers make the score (section 19.3).

### POST /student/attempts/:attemptId/mcq-submit

```json
{
  "answers": [
    { "questionId": 7, "optionId": 22 },
    { "questionId": 8, "optionId": 30 }
  ]
}
```

Questions that are not in `answers` count as wrong (R-11).

```text
200 OK
```

```json
{
  "attemptId": 15,
  "status": "SUBMITTED",
  "correctCount": 16,
  "totalCount": 20,
  "score": 80,
  "label": "16 / 20 correct (80%)",
  "submittedAt": "2026-11-03T10:17:00.000Z"
}
```

Checks, in order:

| # | Problem | Status | Message |
| --- | --- | --- | --- |
| 1 | `answers` is not an array, or an item is malformed | 400 | `Answers must be a list of { questionId, optionId }.` |
| 2 | Attempt not found / not own | 404 | `Attempt not found.` |
| 3 | Attempt is not an MCQ attempt | 400 | `This action is only for MCQ tests.` |
| 4 | Attempt is SUBMITTED | 409 | `This test has already been submitted.` |
| 5 | Attempt is EXPIRED, or now > deadline + 10 s | 409 | `Time is over. This attempt expired and was not submitted.` |
| 6 | Same question twice | 400 | `Each question can be answered only once.` |
| 7 | Question not in this test | 400 | `An answer refers to a question that is not part of this test.` |
| 8 | Option not in its question | 400 | `An answer refers to an option that does not belong to its question.` |

Row 5 also **stores** `EXPIRED` (score `null`) and logs the late request (R-8).

After row 2, the attempt session is checked (section 19.4). A `TERMINATED` attempt is rejected like a submitted one, with the message in section 19.2.

Score: `round1(correctCount / totalCount × 100)` (R-12). Answers, score, status and `submittedAt` are saved in **one transaction**. The status change uses `updateMany({ where: { id, status: 'IN_PROGRESS' } })` and checks that one row changed, so two parallel submits never both succeed.

## 11. Coding Endpoints (Rami, using Majed's `CodeExecutionService`)

Common checks for Run, Submit and Finish, in order:

| # | Problem | Status | Message |
| --- | --- | --- | --- |
| 1 | `code` missing or only spaces (Run, Submit) | 400 | `Code cannot be empty.` |
| 2 | `code` longer than 10,000 characters (Run, Submit) | 400 | `Code cannot be longer than 10,000 characters.` |
| 3 | Attempt not found / not own | 404 | `Attempt not found.` |
| 4 | Attempt is not a coding attempt | 400 | `This action is only for the coding test.` |
| 5 | Problem not part of this test (Run, Submit) | 404 | `Problem not found in this test.` |
| 6 | Attempt is SUBMITTED | 409 | `This test has already been submitted.` |
| 7 | Attempt is EXPIRED, or now > deadline + 10 s | 409 | `Time is over. This attempt expired and was not submitted.` |

After row 3, the attempt session is checked (section 19.4). A `TERMINATED` attempt is rejected with the message in section 19.2.

### POST /student/attempts/:attemptId/problems/:problemId/run

```json
{ "code": "function twoSum(nums, target) {\n  ...\n}" }
```

```text
200 OK   → RunResult
```

| Problem | Status | Message |
| --- | --- | --- |
| 20 runs already used for this problem | 409 | `You have used all 20 runs for this problem.` |
| Execution service unreachable or timed out | 503 | `The code execution service is not reachable right now. Your run was not counted. Please try again.` |

- A run is **reserved** with `updateMany({ where: { attemptId, problemId, runCount: { lt: 20 } }, data: { runCount: { increment: 1 } } })`. If no row changed, the limit was reached.
- If the execution service fails (503), the reserved run is given back (`decrement: 1`).
- Run never calculates or stores a score (R-15).

### POST /student/attempts/:attemptId/problems/:problemId/submit

```json
{ "code": "function twoSum(nums, target) {\n  ...\n}" }
```

```text
200 OK   → SubmitResult
```

| Problem | Status | Message |
| --- | --- | --- |
| Problem already submitted | 409 | `This problem has already been submitted.` |
| Execution service unreachable or timed out | 503 | `The code execution service is not reachable right now. Your submission was not saved. Please try again.` |

- Points: `round1(problem.points × passedCount / totalCount)` (R-18).
- The result is saved with `updateMany({ where: { attemptId, problemId, submittedAt: null } })`. If no row changed, another request submitted first → `409`.
- The code, counts, points and `submittedAt` are stored. They never change again.

### POST /student/attempts/:attemptId/finish

No body.

```text
200 OK
```

```json
{
  "attemptId": 22,
  "status": "SUBMITTED",
  "score": 72.5,
  "label": "Coding score: 72.5%",
  "submittedAt": "2026-11-03T11:30:00.000Z",
  "problems": [
    { "problemId": 2, "title": "Two Sum", "submitted": true, "points": 40 },
    { "problemId": 3, "title": "Reverse Words", "submitted": false, "points": 0 }
  ]
}
```

In **one transaction** (section 12 of the specification): unsubmitted problems get `points = 0`, the score is `round1(sum of points / sum of problem.points × 100)` (R-20), and the attempt becomes `SUBMITTED` with `submittedAt`.

## 12. Time and Attempt State

```text
GRACE_SECONDS = 10
startedAt     = server time when the attempt is created
deadline      = startedAt + durationMinutes
overdue       = status is IN_PROGRESS AND now > deadline + GRACE_SECONDS
```

- Requests up to `deadline + 10 s` are accepted (R-8). Later requests are rejected and the attempt is stored as `EXPIRED`.
- **Overdue means EXPIRED on every read** (R-9). `AttemptStateService.expireOverdue()` runs one `updateMany` that sets every overdue attempt to `EXPIRED` with `score: null`. It is called at the start of every read that shows attempt status (student tests, student attempt, results, instructor attempts, unpublish check).
- Between `deadline` and `deadline + 10 s` the attempt is still `IN_PROGRESS`. The frontend already shows "Time is over" and stops input, but a request that was sent just before the deadline is still accepted.
- `EXPIRED` always has `score: null`. It is shown as `Expired — not submitted`, never as `0` (R-13).
- `SUBMITTED`, `EXPIRED` and `TERMINATED` attempts never change (R-10).
- `expireOverdue()` touches only `IN_PROGRESS` attempts. A `TERMINATED` attempt keeps its score.
- "Now" always comes from `ClockService.now()`.

**Countdown on the frontend:** when an attempt response arrives, the frontend saves `offset = serverNow - Date.now()`. Remaining time is `deadline - (Date.now() + offset)`. A refresh loads the attempt again and gets the same `deadline`, so the countdown never restarts.

## 13. Code Execution

### 13.1 One service, two modes

All Run and Submit execution goes through `CodeExecutionService` (owner: Majed). No other file runs, evaluates, or sends student code (R-22).

```text
EXECUTION_MODE=mock      → MockExecutionProvider   (CORE, always available)
EXECUTION_MODE=judge0    → Judge0ExecutionProvider (CHALLENGE, external service)
```

Never `eval`, `new Function`, `vm`, or child processes anywhere in the backend.

### 13.2 Mock mode (R-23)

- Run: `status: "MOCK"`, message `[MOCK] Code received: 14 lines. Real execution is not enabled.` (the real line count). `actualOutput` is `null`.
- Submit: every hidden test passes when the code contains `function <functionName>(` (spaces allowed before `(`), otherwise every hidden test fails.
- `mode` is `MOCK` in every result.

### 13.3 Judge0 mode — environment

```text
EXECUTION_MODE=judge0
JUDGE0_URL=<base URL chosen in the Phase 0 spike>
JUDGE0_AUTH_HEADER=<header name, empty if none>
JUDGE0_AUTH_TOKEN=<key, empty if none>
JUDGE0_EXTRA_HEADER=<second header name, empty if none (e.g. X-RapidAPI-Host)>
JUDGE0_EXTRA_VALUE=<second header value>
JUDGE0_LANGUAGE_ID=<JavaScript Node.js id from GET /languages, prefer Node 18 or newer>
EXECUTION_TIMEOUT_MS=10000
```

- Keys live only in `api/.env`, never in Git and never in the frontend.
- The browser **never** talks to Judge0. Only our backend does.
- Pick the newest Node.js language from `GET /languages` on the chosen instance. **Old Node versions (for example 12) do not support `?.` and `??`.** Students would get a syntax error for valid modern code.
- The Phase 0 spike (TASKS.md, Task 4) checks which instance answers **from Syria without a VPN**.

### 13.4 How one Run or Submit is executed

One Run (sample case) or one Submit (all hidden cases) is **one** request to Judge0:

1. The service builds one JavaScript file: **the student code first**, then our harness. Because the student code starts at line 1, error line numbers are the student's real line numbers.
2. The harness receives **only the arguments** of each case. **Expected outputs are never sent to Judge0.** They stay in our backend.
3. The file is sent Base64-encoded (`base64_encoded=true`), so any character in the code is safe.
4. Limits: `cpu_time_limit=2`, `wall_time_limit=5`.
5. If `wait=true` is not allowed on the chosen instance, the service creates the submission and polls `GET /submissions/:token` every 500 ms until the status is no longer 1 (In Queue) or 2 (Processing), or until `EXECUTION_TIMEOUT_MS`.

The harness (simplified; `twoSum` stands for the problem's `functionName`):

```js
// ===== student code above (starts at line 1) =====
;(function __b4fHarness() {
  const __cases = /* JSON array of args arrays */;
  const __logs = [];
  const __origLog = console.log;
  const __origError = console.error;
  console.log = (...a) => __logs.push(a.map(String).join(' '));
  console.error = console.log;
  const __out = { found: typeof twoSum === 'function', results: [] };
  if (__out.found) {
    for (const args of __cases) {
      try {
        const value = twoSum(...args);
        __out.results.push({ ok: true, value: value === undefined ? { __undefined: true } : value });
      } catch (e) {
        __out.results.push({ ok: false, error: { type: e && e.name, message: e && e.message, stack: e && e.stack } });
      }
    }
  }
  __out.logs = __logs.slice(0, 50);
  console.log = __origLog;
  console.error = __origError;
  __origLog('__B4F_RESULT__' + JSON.stringify(__out));
})();
```

- The student's own `console.log` lines are collected in `logs`, so they never break our result line.
- The result is the **last** line that starts with `__B4F_RESULT__`.
- If a return value cannot be turned into JSON (a function, a circular object), that case is an error: `Your function returned a value that cannot be compared (for example a function or a circular object).`

### 13.5 Comparing outputs (on our backend)

`OutputComparer.isEqual(actual, expected)`:

- Arrays: same length, same order, every item equal.
- Objects: same keys (key order does not matter), every value equal.
- Numbers: equal when `Math.abs(a - b) < 1e-9` (so `0.1 + 0.2` equals `0.3`).
- Strings, booleans, `null`: strict equality.
- `undefined` (`{ __undefined: true }`) is equal only to an expected value that is also missing.

Run reports `actualOutput` and `expectedOutput` of the sample. Submit counts how many hidden cases are equal.

### 13.6 Run status values and fixed messages

| `status` | When | `message` |
| --- | --- | --- |
| `PASSED` | Sample output equals expected | `Your function returned the expected output.` |
| `WRONG_ANSWER` | Ran fine, output different | `Your function returned a different value than expected.` |
| `SYNTAX_ERROR` | The code cannot be parsed | `Your code has a syntax error.` |
| `RUNTIME_ERROR` | The function threw an error | `Your code threw an error while running.` |
| `FUNCTION_NOT_FOUND` | No function with the required name | `No function named <functionName> was found. Declare it like this: function <functionName>(...) { }` |
| `TIME_LIMIT_EXCEEDED` | Judge0 status 5 | `Your code took too long. Check for an infinite loop.` |
| `MOCK` | Mock mode | `[MOCK] Code received: <n> lines. Real execution is not enabled.` |

### 13.7 Making errors readable (`ErrorNormalizer`)

The goal: the student sees **the error type, a short message, and their own line number**. Never a raw stack trace, never `/box/script.js`, never our harness.

| Source | How it is read |
| --- | --- |
| Error thrown inside the student function | From the harness: `error.type`, `error.message`, and the first `:<line>:<col>` in `error.stack` |
| Syntax error (the harness never ran) | No `__B4F_RESULT__` line. Read `stderr`: the first `:<line>` after the file name, and the line matching `^(\w*Error): (.+)$` |
| Judge0 status 6 | Same as syntax error, from `compile_output` |
| Judge0 status 7–12 with a result line | Use the result line |
| Judge0 status 7–12 without a result line | Read `stderr`; `SyntaxError` → `SYNTAX_ERROR`, otherwise `RUNTIME_ERROR` |
| Judge0 status 13, 14, HTTP error, timeout | `503` (13.8) |

Rules:

- A line number larger than the number of lines in the student code is dropped (`line: null`), because it points into the harness.
- File paths and `node:internal` frames are removed from every message.
- `message` is cut to 300 characters.
- Majed keeps one sample `stderr` for each case above in `api/src/execution/__fixtures__/` and tests the normalizer against them.

### 13.8 When the execution service fails

- Run: `503`, the run is not counted.
- Submit: `503`, nothing is saved, the student can submit again.
- Finish does not call the execution service, so it always works.
- The service never switches to mock mode on its own. Changing mode is a decision in `.env`.
- Every failure is logged with the Judge0 status or the HTTP error. The student code is not logged.

### 13.9 Submit and hidden tests

- Submit result: only `passedCount`, `totalCount`, `points` (R-19).
- A syntax error, a missing function, or a timeout means `passedCount: 0`.
- The submitted code is stored in `ProblemResult.code` for the instructor.

## 14. Validation Rules

- Every body, param and query is a DTO. Unknown fields are rejected (`whitelist` + `forbidNonWhitelisted`).
- Route ids (`:testId`, `:attemptId`, `:questionId`, `:problemId`) must be positive whole numbers → `400` `<name> must be a positive whole number.`
- Strings are trimmed with `@Transform` before validation.
- Format rules live in DTOs. Business rules live in services.

## 15. Errors

Every error from every endpoint has this shape:

```json
{ "statusCode": 409, "message": "Human-readable reason." }
```

`message` is always **one string**, never an array.

| Status | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 400 | Invalid input or a broken content rule |
| 401 | Not signed in |
| 403 | Not allowed (role, unpublished test, locked test) |
| 404 | Not found |
| 409 | Conflicts with the current state (already submitted, expired, terminated, locked content, run limit, attempt open in another session) |
| 503 | The code execution service is not reachable |
| 500 | Unexpected error |

Other fixed messages:

```text
404   Endpoint not found.
400   Invalid request body.
500   Something went wrong. Please try again.
```

The frontend turns a network failure into: `Cannot reach the server. Please check your connection and try again.`

The messages in this document are fixed. The frontend shows them as they are.

## 16. Logger

Each service logs its own events with Nest `Logger`:

| Event | Owner |
| --- | --- |
| user registered, login failed | Esmaeel |
| test published / unpublished, content change rejected (R-4) | Majed |
| execution provider error, execution timeout | Majed |
| attempt started, MCQ submitted, problem submitted, coding finished | Rami |
| attempt expired, late request rejected | Rami |
| forbidden access to an unpublished or locked test | Rami |
| violation recorded (type, counted, counts), attempt terminated (reason), session replaced | Esmaeel |

Never log passwords, tokens, correct options, hidden test cases, or student code.

## 17. Testing Checklist

Esmaeel keeps one request for each item in `api/requests/api.http`.

**Auth:** register ok, duplicate email, short password, login ok, wrong password, `/auth/me` without token (`401`), student calls an instructor route (`403`).

**Instructor content:** add question ok, 1 option, 7 options, zero correct, two correct, question on coding test, add problem ok, 2 hidden cases, bad function name, args not array, edit after a student started (`409`).

**Publish:** MCQ with 4 questions (`409`), MCQ with 5 (ok), coding with 0 problems (`409`), unpublish with an attempt in progress (`409`), unpublish after it expired (ok).

**Student access:** list shows only published tests, open unpublished test by id (`403`), start test 2 before test 1 (`403` with reason), start again while in progress (same attempt, `200`), start finished test (`409`).

**MCQ:** submit ok (check the score by hand), submit twice (`409`), unknown question, option of another question, duplicate question, empty answers (score 0, SUBMITTED), submit after deadline + 10 s (`409`, then the attempt shows EXPIRED with `score: null`), next test is AVAILABLE after EXPIRED.

**Coding:** run passes, run wrong answer, run syntax error (correct line), run runtime error (correct line), run missing function, run infinite loop (time limit), 21st run (`409`), empty code, 10,001 characters, submit ok, submit twice (`409`), finish (unsubmitted problems give 0), run after finish (`409`), mock mode run and submit.

**Shaping:** no student response contains `isCorrect`, `HIDDEN`, or a hidden `expected` value.

**Instructor attempts:** filter by test, by status (including `TERMINATED`), search by name, an expired attempt shows `score: null`, a terminated attempt shows its score, reason and violation log.

**Integrity:** start without `acceptedRules` (`400`), two students get different question orders, refresh keeps the same order, autosave then refresh keeps the choice, first FOCUS violation (warning), second (TERMINATED with score from saved answers), two violations 1 s apart (second not counted), CLIPBOARD 1, 2 (warnings), 3 (TERMINATED), coding terminated (score from submitted problems only), request with a wrong session key (`409`), resume from a second browser (old one gets `409`, `NEW_SESSION` logged), next test AVAILABLE after TERMINATED, `NEW_SESSION` sent by the client (`400`).

## 18. Changing the Contract

When an endpoint or response changes:

1. Update the backend.
2. Update this `docs/API.md`.
3. Update `client/src/services/` and `client/src/types/`.
4. Update `docs/PROJECT-STRUCTURE.md` if the structure changes.
5. Tell the affected owners (`docs/TASKS.md`, section 4).

Do not change a response shape, a field name, or an error message silently.

## 19. Exam Integrity (instructor-approved addition)

> This section is **not** in the original specification (its section 17 lists anti-cheat as out of scope). It was added after the instructor approved it. The written approval is linked in `PROJECT-STRUCTURE.md`, section 3.

The browser can only **report** what happened. The backend counts, decides the warning or the termination, and stores everything. Browser checks deter cheating, but they can never make it impossible. The strong protections are on the server: server time, one attempt, a shuffled order per student, one active session, and no correct answers or hidden tests ever sent.

### 19.1 Rules

| Group | Violation types | Limit | What happens |
| --- | --- | --- | --- |
| `FOCUS` | `FULLSCREEN_EXIT`, `TAB_HIDDEN` | 2 | 1st → warning. 2nd → attempt `TERMINATED`. |
| `CLIPBOARD` | `COPY`, `CUT`, `PASTE_EXTERNAL`, `DROP_EXTERNAL` | 3 | 1st and 2nd → warning. 3rd → attempt `TERMINATED`. |
| `SESSION` | `NEW_SESSION` | — | Logged for the instructor. Never counted. Sent only by the server. |

- The two groups are counted **separately**.
- **No double counting:** a violation of the same group less than 2 seconds after the previous **counted** one is stored with `counted: false`. (Leaving full screen with Alt+Tab fires two events. It counts once.)
- Violations count only while the attempt is `IN_PROGRESS` and the deadline + 10 s has not passed.

| Type | When the browser reports it | What the browser does |
| --- | --- | --- |
| `FULLSCREEN_EXIT` | The page leaves full screen while the attempt is open | Hides the content (section 19.7) |
| `TAB_HIDDEN` | `document.visibilityState` becomes `hidden` (another tab, minimised window, another app) | — |
| `COPY` / `CUT` | Copy or cut on the attempt page **outside** the code editor (question text, options, problem description) | Blocks the action |
| `PASTE_EXTERNAL` | A paste into the code editor of text that was **not** copied from the same editor in this attempt | Blocks the paste |
| `DROP_EXTERNAL` | Text dropped into the code editor from outside | Blocks the drop |

Not counted, on purpose (too many false alarms):

- copy and paste **inside** the code editor (moving your own code is normal)
- right-click on the question area (it is only blocked)
- the window losing focus without the page being hidden
- a page refresh: full screen ends on reload, the content stays hidden until the student returns to full screen. Switching tabs while the content is hidden still counts as `TAB_HIDDEN`.

### 19.2 POST /student/attempts/:attemptId/violations

```json
{ "type": "FULLSCREEN_EXIT" }
```

```text
200 OK
```

```json
{
  "type": "FULLSCREEN_EXIT",
  "group": "FOCUS",
  "counted": true,
  "focusViolations": 1,
  "focusLimit": 2,
  "clipboardViolations": 0,
  "clipboardLimit": 3,
  "terminated": false,
  "warning": "You left full screen or switched away from the exam. If it happens again, your exam will end.",
  "result": null
}
```

When this violation ends the attempt:

```json
{
  "type": "TAB_HIDDEN",
  "group": "FOCUS",
  "counted": true,
  "focusViolations": 2,
  "focusLimit": 2,
  "clipboardViolations": 0,
  "clipboardLimit": 3,
  "terminated": true,
  "warning": null,
  "result": { "score": 45, "label": "Terminated — exam rules violated (45%)", "terminationReason": "Left full screen or switched away from the exam 2 times." }
}
```

Fixed warnings:

| Situation | `warning` |
| --- | --- |
| FOCUS, 1st | `You left full screen or switched away from the exam. If it happens again, your exam will end.` |
| CLIPBOARD, 1st | `Copy and paste are not allowed during the exam. Warning 1 of 2. A third attempt ends your exam.` |
| CLIPBOARD, 2nd | `Copy and paste are not allowed during the exam. Warning 2 of 2. The next attempt ends your exam.` |
| Not counted, or terminated | `null` |

Fixed termination reasons:

| Group | `terminationReason` |
| --- | --- |
| FOCUS | `Left full screen or switched away from the exam 2 times.` |
| CLIPBOARD | `Tried to copy or paste 3 times.` |

Errors, in order:

| # | Problem | Status | Message |
| --- | --- | --- | --- |
| 1 | `type` is not one of the six client types (`NEW_SESSION` included) | 400 | `Unknown violation type.` |
| 2 | Attempt not found / not own | 404 | `Attempt not found.` |
| 3 | Wrong or missing attempt session | 409 | (section 19.4) |
| 4 | Attempt is SUBMITTED | 409 | `This test has already been submitted.` |
| 5 | Attempt is TERMINATED | 409 | `This attempt was ended because the exam rules were broken.` |
| 6 | Attempt is EXPIRED, or now > deadline + 10 s | 409 | `Time is over. This attempt expired and was not submitted.` |

### 19.3 Termination

When a counted violation reaches its group limit, in **one transaction**:

1. Conditional `updateMany` on `status: IN_PROGRESS` (0 rows → another request finished the attempt first; return its current state).
2. `status: TERMINATED`, `terminatedAt: now`, `terminationReason`.
3. The score from **what was saved before the termination**:
   - **MCQ:** `round1(correct autosaved answers / number of questions × 100)`. Unanswered questions are wrong.
   - **Coding:** unsubmitted problems get `points: 0`. `round1(sum of points / sum of problem points × 100)`, the same formula as Finish.
4. The violation row is stored in the same transaction.

Rules:

- `TERMINATED` always has a real score (it can be `0`). It is **always** shown with the label `Terminated — exam rules violated`, so it is never mistaken for a normal submission.
- `TERMINATED` is a finished state: the next test unlocks (R-2), and the attempt never changes again (R-10).
- Runs, submitted problem results, saved answers and the violation log are kept for the instructor.

### 19.4 One active session per attempt

- `POST /student/tests/:testId/attempts` (new **or** resumed attempt) creates a new random `sessionKey` (32 random bytes, hex) and returns it **only** in that response.
- The frontend keeps it in `sessionStorage` under `b4f.attemptSession.<attemptId>` and sends it on every request under `/student/attempts/:attemptId`:

```text
X-Attempt-Session: <sessionKey>
```

- While the attempt is `IN_PROGRESS`, a missing or wrong key →

```text
409   This attempt is open in another window or device. Open it again from My Tests to continue here.
```

- Resuming creates a **new** key, so the older window is rejected from then on. The server logs a `NEW_SESSION` violation (not counted) for the instructor.
- A refresh in the same tab keeps `sessionStorage`, so it keeps working.
- A finished attempt does not check the key (its result can be opened again).
- The key is stored on the attempt and never logged.

### 19.5 Shuffled order

- On start, the server shuffles the question order and the option order of every question (Fisher–Yates with `crypto.randomInt`) and stores both on the attempt.
- Every read of that attempt uses the same order, so a refresh never changes it.
- Coding problems keep the instructor's order.
- Scoring always uses ids, never positions. Instructor screens always show the original order.

### 19.6 Exam-rules pledge

The Test Intro screen shows the rules and a checkbox:

```text
I will take this exam alone, stay in full screen, and not copy or paste.
I understand that breaking these rules ends my exam.
```

Start sends `acceptedRules: true`. Without it the backend answers `400` (section 9).

### 19.7 Full screen (frontend rules)

- **Start test** asks the browser for full screen (the browser only allows this after a click).
- If the browser does not support full screen (`document.fullscreenEnabled` is `false`, for example Safari on iPhone), Test Intro shows `This exam needs full screen. Please use a computer with Chrome, Edge or Firefox.` and Start is disabled.
- Questions, options and the code editor are visible **only** in full screen. Otherwise a gate shows `Return to full screen to continue.` with a button. The countdown keeps running behind it.
- After a warning, a dialog shows the backend `warning` and a **Return to full screen** button.
- After termination or finishing, the page leaves full screen and shows the result.
