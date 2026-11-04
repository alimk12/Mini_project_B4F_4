const B = 'http://localhost:3000/api';
let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) { pass++; } else { fail++; console.log('FAIL:', m, extra !== undefined ? JSON.stringify(extra).slice(0, 300) : ''); } };
async function call(method, path, { token, body, session } = {}) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  if (session) h['X-Attempt-Session'] = session;
  const r = await fetch(B + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null; try { data = await r.json(); } catch {}
  return { s: r.status, d: data };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const email = `stu${Date.now()}@test.local`;

// Auth
let r = await call('POST', '/auth/register', { body: { fullName: '  Test Student ', email, password: 'secret123' } });
ok(r.s === 201 && r.d.user.role === 'STUDENT' && r.d.accessToken, 'register', r);
const stu = r.d.accessToken;
r = await call('POST', '/auth/register', { body: { fullName: 'X', email, password: 'secret123' } });
ok(r.s === 409 && r.d.message === 'An account with this email already exists.', 'dup email', r);
r = await call('POST', '/auth/register', { body: { fullName: 'X', email: 'a@b.co', password: 'short' } });
ok(r.s === 400 && r.d.message === 'Password must be at least 8 characters.', 'short pw', r);
r = await call('POST', '/auth/register', { body: { fullName: 'X', email: 'a@b.co', password: 'secret123', role: 'INSTRUCTOR' } });
ok(r.s === 400, 'unknown field rejected', r);
r = await call('POST', '/auth/login', { body: { email: 'instructor@b4f.local', password: 'wrong' } });
ok(r.s === 401 && r.d.message === 'Invalid email or password.', 'bad login', r);
r = await call('POST', '/auth/login', { body: { email: 'instructor@b4f.local', password: 'Instructor123' } });
const ins = r.d.accessToken; ok(r.s === 200 && r.d.user.role === 'INSTRUCTOR', 'instructor login', r);
r = await call('GET', '/auth/me'); ok(r.s === 401 && r.d.message === 'Please sign in to continue.', 'no token 401', r);
r = await call('GET', '/instructor/tests', { token: stu }); ok(r.s === 403, 'student on instructor route', r);
r = await call('GET', '/nope', { token: stu }); ok(r.s === 404 && r.d.message === 'Endpoint not found.', 'unknown route', r);

// Instructor view
r = await call('GET', '/instructor/tests', { token: ins });
ok(r.s === 200 && r.d.length === 3 && r.d[0].questionCount >= 10, 'instructor tests', r);
const [iq, html, js] = r.d;
r = await call('GET', `/instructor/tests/${iq.id}`, { token: ins });
const iqFull = r.d; ok(iqFull.questions[0].options.some((o) => o.isCorrect), 'instructor sees correct');

// Student list
r = await call('GET', '/student/tests', { token: stu });
ok(r.d.length === 2 && r.d[0].state === 'AVAILABLE' && r.d[1].state === 'LOCKED' && r.d[1].lockReason === 'Complete the IQ Test first.', 'student list', r);
r = await call('GET', `/student/tests/${js.id}`, { token: stu }); ok(r.s === 403 && r.d.message === 'This test is not available.', 'unpublished 403', r);
r = await call('POST', `/student/tests/${html.id}/attempts`, { token: stu, body: { acceptedRules: true } });
ok(r.s === 403 && r.d.message === 'Complete the IQ Test first.', 'order 403', r);
r = await call('POST', `/student/tests/${iq.id}/attempts`, { token: stu, body: {} });
ok(r.s === 400 && r.d.message === 'You must accept the exam rules to start.', 'pledge required', r);

// Start IQ
r = await call('POST', `/student/tests/${iq.id}/attempts`, { token: stu, body: { acceptedRules: true } });
ok(r.s === 201 && r.d.sessionKey && r.d.questions.length === iqFull.questions.length, 'start 201', r);
const att1 = r.d; let key = att1.sessionKey;
ok(!JSON.stringify(att1).includes('isCorrect'), 'no isCorrect in student view');
const orderSame = JSON.stringify(att1.questions.map((q) => q.id));
r = await call('POST', `/student/tests/${iq.id}/attempts`, { token: stu, body: { acceptedRules: true } });
ok(r.s === 200 && r.d.id === att1.id && r.d.deadline === att1.deadline && r.d.sessionKey !== key, 'resume same attempt new key', r);
ok(JSON.stringify(r.d.questions.map((q) => q.id)) === orderSame, 'order kept on resume');
const oldKey = key; key = r.d.sessionKey;
r = await call('GET', `/student/attempts/${att1.id}`, { token: stu, session: oldKey });
ok(r.s === 409 && r.d.message.startsWith('This attempt is open in another window'), 'old session rejected', r);
r = await call('GET', `/student/attempts/${att1.id}`, { token: stu, session: key }); ok(r.s === 200 && r.d.sessionKey === null, 'get attempt', r);

// Content locked + unpublish blocked
r = await call('PUT', `/instructor/questions/${iqFull.questions[0].id}`, { token: ins, body: { text: 'x', options: [{ text: 'a', isCorrect: true }, { text: 'b', isCorrect: false }] } });
ok(r.s === 409 && r.d.message === 'Questions and problems cannot be changed after a student has started this test.', 'content locked', r);
r = await call('PATCH', `/instructor/tests/${iq.id}/unpublish`, { token: ins });
ok(r.s === 409 && r.d.message === 'This test cannot be unpublished while a student is taking it.', 'unpublish blocked', r);

// Autosave + submit: answer 6 correct of 12
const correctOf = (qid) => iqFull.questions.find((q) => q.id === qid).options.find((o) => o.isCorrect).id;
const wrongOf = (qid) => iqFull.questions.find((q) => q.id === qid).options.find((o) => !o.isCorrect).id;
const qids = iqFull.questions.map((q) => q.id);
r = await call('PUT', `/student/attempts/${att1.id}/mcq-answers/${qids[0]}`, { token: stu, session: key, body: { optionId: correctOf(qids[0]) } });
ok(r.s === 200 && r.d.optionId === correctOf(qids[0]) && !('isCorrect' in r.d), 'autosave', r);
r = await call('PUT', `/student/attempts/${att1.id}/mcq-answers/${qids[0]}`, { token: stu, session: key, body: { optionId: 99999 } });
ok(r.s === 400 && r.d.message === 'An answer refers to an option that does not belong to its question.', 'autosave bad option', r);
r = await call('GET', `/student/attempts/${att1.id}`, { token: stu, session: key });
ok(r.d.questions.find((q) => q.id === qids[0]).selectedOptionId === correctOf(qids[0]), 'autosave restored');
const answers = qids.slice(0, 10).map((q, i) => ({ questionId: q, optionId: i < 6 ? correctOf(q) : wrongOf(q) }));
r = await call('POST', `/student/attempts/${att1.id}/mcq-submit`, { token: stu, session: key, body: { answers: [answers[0], answers[0]] } });
ok(r.s === 400 && r.d.message === 'Each question can be answered only once.', 'dup answer', r);
r = await call('POST', `/student/attempts/${att1.id}/mcq-submit`, { token: stu, session: key, body: { answers: 'x' } });
ok(r.s === 400 && r.d.message === 'Answers must be a list of { questionId, optionId }.', 'malformed answers', r);
r = await call('POST', `/student/attempts/${att1.id}/mcq-submit`, { token: stu, session: key, body: { answers } });
const expectScore = Math.round((6 / qids.length) * 1000) / 10;
ok(r.s === 200 && r.d.correctCount === 6 && r.d.score === expectScore && r.d.label === `6 / ${qids.length} correct (${expectScore}%)`, 'mcq score', r);
r = await call('POST', `/student/attempts/${att1.id}/mcq-submit`, { token: stu, session: key, body: { answers } });
ok(r.s === 409 && r.d.message === 'This test has already been submitted.', 'submit twice', r);
r = await call('POST', `/student/tests/${iq.id}/attempts`, { token: stu, body: { acceptedRules: true } });
ok(r.s === 409 && r.d.message === 'You have already finished this test.', 'start finished', r);

// HTML: integrity termination
r = await call('GET', '/student/tests', { token: stu }); ok(r.d[1].state === 'AVAILABLE', 'html unlocked', r);
r = await call('POST', `/student/tests/${html.id}/attempts`, { token: stu, body: { acceptedRules: true } });
const att2 = r.d; const k2 = att2.sessionKey;
const htmlFull = (await call('GET', `/instructor/tests/${html.id}`, { token: ins })).d;
for (const q of htmlFull.questions.slice(0, 3)) {
  await call('PUT', `/student/attempts/${att2.id}/mcq-answers/${q.id}`, { token: stu, session: k2, body: { optionId: q.options.find((o) => o.isCorrect).id } });
}
r = await call('POST', `/student/attempts/${att2.id}/violations`, { token: stu, session: k2, body: { type: 'NEW_SESSION' } });
ok(r.s === 400 && r.d.message === 'Unknown violation type.', 'client NEW_SESSION rejected', r);
r = await call('POST', `/student/attempts/${att2.id}/violations`, { token: stu, session: k2, body: { type: 'FULLSCREEN_EXIT' } });
ok(r.s === 200 && r.d.counted && r.d.focusViolations === 1 && r.d.warning.startsWith('You left full screen') && !r.d.terminated, 'focus warning', r);
r = await call('POST', `/student/attempts/${att2.id}/violations`, { token: stu, session: k2, body: { type: 'TAB_HIDDEN' } });
ok(r.s === 200 && !r.d.counted && r.d.focusViolations === 1 && r.d.warning === null, 'dedupe', r);
r = await call('POST', `/student/attempts/${att2.id}/violations`, { token: stu, session: k2, body: { type: 'COPY' } });
ok(r.d.clipboardViolations === 1 && r.d.warning.includes('Warning 1 of 2'), 'clipboard warning 1', r);
await sleep(2100);
r = await call('POST', `/student/attempts/${att2.id}/violations`, { token: stu, session: k2, body: { type: 'TAB_HIDDEN' } });
const htmlScore = Math.round((3 / htmlFull.questions.length) * 1000) / 10;
ok(r.d.terminated && r.d.result.score === htmlScore && r.d.result.terminationReason === 'Left full screen or switched away from the exam 2 times.', 'terminated with saved score', r);
r = await call('PUT', `/student/attempts/${att2.id}/mcq-answers/${htmlFull.questions[4].id}`, { token: stu, session: k2, body: { optionId: null } });
ok(r.s === 409 && r.d.message === 'This attempt was ended because the exam rules were broken.', 'terminated frozen', r);
r = await call('GET', `/student/attempts/${att2.id}`, { token: stu });
ok(r.d.status === 'TERMINATED' && r.d.result.label === `Terminated — exam rules violated (${htmlScore}%)`, 'terminated view', r);

// Publish coding; student coding (mock)
r = await call('PATCH', `/instructor/tests/${js.id}/publish`, { token: ins }); ok(r.s === 200 && r.d.status === 'PUBLISHED', 'publish coding', r);
r = await call('GET', '/student/tests', { token: stu }); ok(r.d[2].state === 'AVAILABLE', 'coding unlocked after terminated', r);
r = await call('POST', `/student/tests/${js.id}/attempts`, { token: stu, body: { acceptedRules: true } });
const att3 = r.d; const k3 = att3.sessionKey;
ok(att3.problems.length === 2 && att3.problems[0].sample && att3.executionMode, 'coding attempt', r);
ok(!JSON.stringify(att3).includes('HIDDEN'), 'no hidden in student view');
const [p1, p2] = att3.problems;
globalThis.ctx = { stu, ins, att3, k3, p1, p2 };
r = await call('POST', `/student/attempts/${att3.id}/problems/${p1.id}/run`, { token: stu, session: k3, body: { code: '   ' } });
ok(r.s === 400 && r.d.message === 'Code cannot be empty.', 'empty code', r);
r = await call('POST', `/student/attempts/${att3.id}/problems/${p1.id}/run`, { token: stu, session: k3, body: { code: 'x'.repeat(10001) } });
ok(r.s === 400 && r.d.message === 'Code cannot be longer than 10,000 characters.', 'long code', r);

const MODE = att3.executionMode;
console.log('Execution mode:', MODE);
const good1 = 'function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];\n    seen.set(nums[i], i);\n  }\n}';
r = await call('POST', `/student/attempts/${att3.id}/problems/${p1.id}/run`, { token: stu, session: k3, body: { code: good1 } });
if (MODE === 'MOCK') ok(r.s === 200 && r.d.status === 'MOCK' && r.d.message === '[MOCK] Code received: 7 lines. Real execution is not enabled.' && r.d.runsRemaining === 19, 'mock run', r);
else ok(r.s === 200 && r.d.status === 'PASSED' && JSON.stringify(r.d.actualOutput) === '[0,1]', 'judge0 run passed', r);

if (MODE === 'JUDGE0') {
  const cases = [
    ['function twoSum(nums, t) {\n  return [1, 0];\n}', 'WRONG_ANSWER', null],
    ['function twoSum(nums, t) {\n  const x = ;\n}', 'SYNTAX_ERROR', 2],
    ['function twoSum(nums, t) {\n  console.log("checking", nums.length);\n  return nums.foo.bar;\n}', 'RUNTIME_ERROR', 3],
    ['function sum(a) { return a; }', 'FUNCTION_NOT_FOUND', null],
    ['function twoSum() {\n  while (true) {}\n}', 'TIME_LIMIT_EXCEEDED', null],
    ['function twoSum() {\n  return () => 1;\n}', 'RUNTIME_ERROR', null],
    ['const twoSum = (n, t) => {\n  return [0, 1 + 0.1 + 0.2 - 0.3];\n};', 'PASSED', null],
  ];
  for (const [code, want, line] of cases) {
    r = await call('POST', `/student/attempts/${att3.id}/problems/${p1.id}/run`, { token: stu, session: k3, body: { code } });
    ok(r.d.status === want && (line === null || r.d.error?.line === line), `run ${want}`, r.d);
    if (want === 'RUNTIME_ERROR' && line) ok(r.d.logs[0] === 'checking 4' && r.d.error.type === 'TypeError' && !r.d.error.message.includes('/'), 'runtime error clean + logs', r.d);
  }
}
r = await call('POST', `/student/attempts/${att3.id}/problems/${p1.id}/submit`, { token: stu, session: k3, body: { code: good1 } });
ok(r.s === 200 && r.d.passedCount === 4 && r.d.totalCount === 4 && r.d.points === 50 && r.d.label === '4 of 4 tests passed' && !JSON.stringify(r.d).includes('expected'), 'submit p1', r);
r = await call('POST', `/student/attempts/${att3.id}/problems/${p1.id}/submit`, { token: stu, session: k3, body: { code: good1 } });
ok(r.s === 409 && r.d.message === 'This problem has already been submitted.', 'submit twice', r);
// p2 partial (judge0): wrong for extra spaces
const half2 = 'function reverseWords(s) {\n  return s.split(" ").reverse().join(" ");\n}';
let used = (await call('GET', `/student/attempts/${att3.id}`, { token: stu, session: k3 })).d.problems[1].runCount;
for (let i = used; i < 20; i++) await call('POST', `/student/attempts/${att3.id}/problems/${p2.id}/run`, { token: stu, session: k3, body: { code: half2 } });
r = await call('POST', `/student/attempts/${att3.id}/problems/${p2.id}/run`, { token: stu, session: k3, body: { code: half2 } });
ok(r.s === 409 && r.d.message === 'You have used all 20 runs for this problem.', '21st run', r);
r = await call('POST', `/student/attempts/${att3.id}/finish`, { token: stu, session: k3 });
ok(r.s === 200 && r.d.score === 50 && r.d.problems[1].points === 0 && r.d.label === 'Coding score: 50%', 'finish', r);
r = await call('POST', `/student/attempts/${att3.id}/problems/${p2.id}/run`, { token: stu, session: k3, body: { code: half2 } });
ok(r.s === 409 && r.d.message === 'This test has already been submitted.', 'run after finish', r);

// Results
r = await call('GET', '/student/results', { token: stu });
ok(r.d.length === 3 && r.d[1].status === 'TERMINATED' && r.d[2].label === '50%', 'student results', r);
r = await call('GET', `/instructor/attempts?status=TERMINATED&search=test stud`, { token: ins });
ok(r.s === 200 && r.d.length >= 1 && r.d[0].violationCount === 3 && r.d[0].terminationReason, 'instructor filter', r);
r = await call('GET', `/instructor/attempts/${att2.id}`, { token: ins });
ok(r.d.violations.length >= 4 && r.d.violations.some((v) => v.type === 'TAB_HIDDEN' && !v.counted) && r.d.mcq.correctCount === 3, 'instructor detail', r);
r = await call('GET', `/instructor/attempts?status=BAD`, { token: ins });
ok(r.s === 400 && r.d.message === 'status must be IN_PROGRESS, SUBMITTED, EXPIRED or TERMINATED.', 'bad status filter', r);

console.log(JSON.stringify({ email, iq: iq.id, html: html.id, js: js.id }));
console.log(`PASS ${pass}  FAIL ${fail}`);
