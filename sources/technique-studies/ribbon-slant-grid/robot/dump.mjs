import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'; import fs from 'fs';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage(); await p.goto('http://127.0.0.1:8765/study/robot/reg.html'); await p.waitForFunction(() => window.done);
const d = await p.evaluate(() => window.png); fs.writeFileSync('masks.png', Buffer.from(d.split(',')[1], 'base64')); await b.close();
