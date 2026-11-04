const { chromium } = require('playwright');
(async () => {
// Usage: node tools/e2e/ui-walkthrough.cjs ./shots   (API on :3000, client on :5173, fresh seed)
const SHOTS = process.argv[2] || './shots';
require('fs').mkdirSync(SHOTS, { recursive: true });
const B = 'http://localhost:5173';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

// Headless Chromium has no real window, so the Fullscreen API is stubbed for the test only.
await ctx.addInitScript(() => {
  let fs = null;
  Object.defineProperty(Document.prototype, 'fullscreenElement', { get() { return fs; }, configurable: true });
  Object.defineProperty(Document.prototype, 'fullscreenEnabled', { get() { return true; }, configurable: true });
  Element.prototype.requestFullscreen = function () { fs = this; setTimeout(() => document.dispatchEvent(new Event('fullscreenchange'))); return Promise.resolve(); };
  Document.prototype.exitFullscreen = function () { fs = null; setTimeout(() => document.dispatchEvent(new Event('fullscreenchange'))); return Promise.resolve(); };
});
const hosts = new Set();
const errors = [];
ctx.on('request', (r) => hosts.add(new URL(r.url()).host));
const page = await ctx.newPage(); globalThis.__page = page;
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
const shot = (n) => page.screenshot({ path: `${SHOTS}/${n}.png` });
const log = (...a) => console.log('•', ...a);
const wait = (ms) => page.waitForTimeout(ms);

async function signIn(email, pw) {
  await page.goto(B + '/sign-in');
  await page.fill('#email', email); await page.fill('#password', pw);
  await page.click('button[type=submit]');
  await page.waitForURL(/tests/);
}
async function signOut() { await page.click('text=Sign out'); await page.waitForURL(/sign-in/); }

// ---- Auth
await page.goto(B + '/');
await page.waitForURL(/sign-in/); await shot('01-sign-in');
await page.click('button[type=submit]'); log('empty sign in:', await page.textContent('.auth-card__field-error'));
await page.fill('#email', 'lina@b4f.local'); await page.fill('#password', 'wrong'); await page.click('button[type=submit]');
await page.waitForSelector('.ui-error'); log('wrong pw:', await page.textContent('.ui-error'));
await page.goto(B + '/sign-up'); await shot('02-sign-up');

// ---- Instructor
await signIn('instructor@b4f.local', 'Instructor123');
await page.waitForSelector('.test-mgmt-row'); await shot('03-instructor-tests');
await page.click('.test-mgmt-row:nth-child(3) >> text=Publish'); await wait(600);
log('coding published:', await page.textContent('.test-mgmt-row:nth-child(3)'));
await page.click('.test-mgmt-row:nth-child(1) >> text=Edit content');
await page.waitForSelector('.test-editor__item'); await page.click('.test-editor__item >> nth=0 >> text=Edit'); await wait(200);
await shot('04-test-editor-mcq');
await page.goto(B + '/instructor/tests/3'); await page.waitForSelector('.test-editor__item');
await page.click('.test-editor__item >> nth=0 >> text=Edit'); await wait(200);
await shot('05-test-editor-coding');
// invalid JSON check
await page.fill('.test-editor__case >> nth=0 >> input >> nth=0', '[1,2'); await page.click('text=Save changes');
log('bad json:', await page.textContent('.test-editor__error'));
await page.click('text=Cancel');
await signOut();

// ---- Student: IQ test
await signIn('lina@b4f.local', 'Student123');
await page.waitForSelector('.my-tests-card'); await shot('06-my-tests');
await page.click('text=Open'); await page.waitForSelector('.test-intro__pledge');
await shot('07-test-intro');
log('start disabled before pledge:', await page.isDisabled('button:has-text("Start test")'));
await page.check('.test-intro__pledge input'); await page.click('button:has-text("Start test")');
await page.waitForURL(/attempts/); await page.waitForSelector('.attempt__option');
log('fullscreen:', await page.evaluate(() => !!document.fullscreenElement));
const qs = await page.$$('.ui-card');
for (let i = 0; i < 8; i++) { await page.click(`.ui-card >> nth=${i} >> .attempt__option >> nth=${i % 3}`); }
await wait(800); await shot('08-mcq-attempt');
// copy violation
await page.evaluate(() => { const r = document.createRange(); r.selectNodeContents(document.querySelector('.attempt__question-text')); getSelection().removeAllRanges(); getSelection().addRange(r); });
await page.keyboard.press('Control+C'); await page.waitForSelector('.exam-guard-dialog'); await shot('09-warning-dialog');
log('warning:', await page.textContent('.exam-guard-dialog p'));
await page.click('text=Return to full screen'); await wait(300);
log('integrity:', await page.textContent('.attempt__integrity'));
// leave full screen → gate
await page.evaluate(() => document.exitFullscreen()); await wait(800);
await shot('10-fullscreen-gate-with-warning');
await page.click('.exam-guard-dialog >> text=Return to full screen'); await wait(500);
log('back in fullscreen:', await page.evaluate(() => !!document.fullscreenElement));
await page.click('button:has-text("Submit answers")'); await shot('11-submit-confirm');
await page.click('.ui-dialog button:has-text("Submit")'); await page.waitForSelector('.attempt__result'); await wait(300);
await shot('12-mcq-result'); log('IQ result:', (await page.textContent('.attempt__result')).replace(/\s+/g, ' '));

// ---- Student: HTML test → terminated by focus violations
await page.goto(B + '/student/tests/2'); await page.waitForSelector('.test-intro__pledge');
await page.check('.test-intro__pledge input'); await page.click('button:has-text("Start test")');
await page.waitForSelector('.attempt__option');
for (let i = 0; i < 5; i++) await page.click(`.ui-card >> nth=${i} >> .attempt__option >> nth=0`);
await wait(800);
await page.evaluate(() => document.exitFullscreen()); await page.waitForSelector('.exam-guard-dialog');
await page.click('.exam-guard-dialog >> text=Return to full screen'); await wait(2300);
await page.evaluate(() => document.exitFullscreen());
await page.waitForSelector('.attempt__result--terminated'); await wait(300);
await shot('13-terminated'); log('terminated:', (await page.textContent('.attempt__result')).replace(/\s+/g, ' '));

// ---- Student: coding test
await page.goto(B + '/student/tests/3'); await page.waitForSelector('.test-intro__pledge');
await page.check('.test-intro__pledge input'); await page.click('button:has-text("Start test")');
await page.waitForSelector('.monaco-editor', { timeout: 20000 }); await wait(1500);
await shot('14-coding-initial');
const GOOD = 'function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n';
const BAD = 'function twoSum(nums, target) {\n  console.log("checking", nums);\n  const total = nums.reduce((a, b) => a + b);\n  return total.toUpperCase();\n}\n';
const setCode = async (code) => {
  await page.click('.monaco-editor .view-lines'); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  // Monaco auto-closes brackets and auto-indents, so closing-brace lines are skipped (already there) and indentation is dropped.
  const lines = code.trimEnd().split('\n').map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '}') { await page.keyboard.press('ArrowDown'); await page.keyboard.press('End'); }
    else { if (i > 0 && lines[i - 1] !== '}' ) {} await page.keyboard.type(lines[i]); }
    if (i < lines.length - 1 && lines[i + 1] !== '}') await page.keyboard.press('Enter');
  }
  await wait(400);
};
const editorText = () => page.evaluate(() => [...document.querySelectorAll('.monaco-editor .view-line')].map((l) => l.textContent.replace(/ /g, ' ')).join('\n'));
await setCode(GOOD);
log('editor text:', JSON.stringify(await editorText()));
await page.keyboard.press('Control+End'); await page.keyboard.press('Enter'); await page.keyboard.type('Math.');
await page.waitForSelector('.suggest-widget.visible', { timeout: 10000 }).catch(() => null); await wait(700);
log('suggestions visible:', await page.isVisible('.suggest-widget.visible'));
await shot('15-suggestions');
await page.keyboard.press('Escape');
await setCode('function twoSum(nums, target) {\n  return nums.map(x => x * 2;\n}\n');
await wait(1500); await shot('15b-live-syntax-error');
await page.click('button:has-text("Run")'); await page.waitForSelector('.attempt__output-status', { timeout: 15000 }); await wait(500);
log('run syntax:', (await page.textContent('.attempt__output')).replace(/\s+/g, ' '));
await setCode(BAD);
await page.click('button:has-text("Run")'); await wait(300); await page.waitForSelector('.attempt__output-status--bad', { timeout: 15000 }); await wait(800);
await shot('16-run-runtime-error'); log('run runtime:', (await page.textContent('.attempt__output')).replace(/\s+/g, ' '));
await setCode(GOOD);
await page.click('button:has-text("Run")'); await wait(300); await page.waitForSelector('.attempt__output-status--ok', { timeout: 15000 }).catch(() => null); await wait(300);
await shot('17-run-passed'); log('run good:', (await page.textContent('.attempt__output')).replace(/\s+/g, ' '));
// external paste blocked
await page.click('.monaco-editor .view-lines');
log('paste dispatch:', await page.evaluate(() => {
  const dt = new DataTransfer(); dt.setData('text/plain', 'function stolen() { return 42 }');
  const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
  const t = document.querySelector('.monaco-editor textarea');
  t.dispatchEvent(ev);
  return { data: ev.clipboardData && ev.clipboardData.getData('text/plain'), prevented: ev.defaultPrevented, inEditor: !!t.closest('.monaco-editor') };
}));
await page.waitForSelector('.exam-guard-dialog'); log('paste warning:', await page.textContent('.exam-guard-dialog p'));
await page.click('.exam-guard-dialog >> text=Return to full screen'); await wait(300);
await page.click('.attempt__actions button:has-text("Submit")'); await page.click('.ui-dialog button:has-text("Submit")'); await page.waitForSelector('.attempt__submit-box');
await wait(300); await shot('18-submitted-problem'); log('submit:', await page.textContent('.attempt__submit-box'));
await page.click('.attempt__problem-btn >> nth=1'); await wait(1200); await shot('19-problem-2');
await page.click('button:has-text("Finish test")'); await page.click('.ui-dialog button:has-text("Finish test")'); await page.waitForSelector('.attempt__result');
await wait(300); await shot('20-coding-result'); log('coding result:', (await page.textContent('.attempt__result')).replace(/\s+/g, ' '));
await page.goto(B + '/student/results'); await page.waitForSelector('table'); await shot('21-my-results');
await page.goto(B + '/student/tests'); await page.waitForSelector('.my-tests-card'); await shot('22-my-tests-after');
await signOut();

// ---- Instructor attempts
await signIn('instructor@b4f.local', 'Instructor123');
await page.goto(B + '/instructor/attempts'); await page.waitForSelector('.attempts-table__row'); await shot('23-attempts');
await page.click('.attempts-table__row >> text=HTML & CSS Test'); await page.waitForSelector('.attempts-details h2'); await wait(300);
await shot('24-attempt-details');
await page.click('.attempts-details >> text=Close');
await page.selectOption('#f-status', 'TERMINATED'); await wait(700);
log('filter url:', page.url(), 'rows:', await page.locator('.attempts-table__row').count());
await page.goto(B + '/instructor/tests'); await page.waitForSelector('.test-mgmt-row'); await shot('25-tests-locked');

console.log('HOSTS:', [...hosts].join(', '));
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
})().catch(async e => { console.error('FAIL', e.message); try { await globalThis.__page.screenshot({ path: './shots/FAIL.png' }); console.log(await globalThis.__page.evaluate(() => document.body.innerText.slice(0, 800))); } catch {} process.exit(1); });
