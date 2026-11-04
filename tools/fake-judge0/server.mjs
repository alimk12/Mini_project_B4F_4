// LOCAL TEST TOOLING ONLY: imitates Judge0's HTTP API so the backend's
// harness, error normalizer and comparer can be tested without internet access.
import http from 'http'; import { spawnSync } from 'child_process'; import fs from 'fs'; import os from 'os'; import path from 'path';
const subs = new Map(); let n = 0;
const b64 = (s) => Buffer.from(s ?? '', 'utf8').toString('base64');
http.createServer((req, res) => {
  let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => {
    if (req.method === 'POST' && req.url.startsWith('/submissions')) {
      const { source_code } = JSON.parse(body);
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'box-')); const file = path.join(dir, 'script.js');
      fs.writeFileSync(file, Buffer.from(source_code, 'base64').toString('utf8'));
      const t0 = Date.now(); const r = spawnSync('node', [file], { timeout: 2000, encoding: 'utf8' });
      const timedOut = r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM';
      const id = timedOut ? 5 : r.status === 0 ? 3 : 11;
      const token = `t${++n}`; subs.set(token, { status: { id }, stdout: b64(r.stdout), stderr: b64(r.stderr), compile_output: null, time: String((Date.now() - t0) / 1000) });
      res.writeHead(201, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ token }));
    }
    const token = req.url.split('/')[2]?.split('?')[0];
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(subs.get(token) ?? { status: { id: 13 } }));
  });
}).listen(2358, () => console.log('fake judge0 on 2358'));
