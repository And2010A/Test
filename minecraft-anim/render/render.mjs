// Render a shot to PNG frames (and optionally an MP4) with headless Chromium.
//   node render/render.mjs shots/preview_turntable.mjs out/turntable
// A shot module exports: { width, height, style, fps, models: [{id, url, ...}], frameCount, frame(i, t) }
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

// CommonJS require honours NODE_PATH, so a globally installed Playwright is found too.
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [shotPath, outDir, ...flags] = process.argv.slice(2);
if (!shotPath || !outDir) {
  console.error('usage: node render/render.mjs <shot.mjs> <outDir> [--mp4 file.mp4]');
  process.exit(1);
}
const shot = (await import(pathToFileURL(path.resolve(shotPath)))).default;
fs.mkdirSync(outDir, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.bbmodel': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[page]', e.message));
await page.goto(`http://127.0.0.1:${port}/render/scene.html`);
await page.waitForFunction(() => window.sceneReady === true);
await page.evaluate((cfg) => window.setupScene(cfg), { width: shot.width, height: shot.height, style: shot.style, models: shot.models });

const t0 = Date.now();
for (let i = 0; i < shot.frameCount; i++) {
  const frame = shot.frame(i, i / shot.fps);
  const dataUrl = await page.evaluate((f) => window.renderFrame(f), frame);
  fs.writeFileSync(path.join(outDir, `f${String(i).padStart(5, '0')}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
  if (i % 30 === 0) process.stdout.write(`frame ${i}/${shot.frameCount}\r`);
}
console.log(`rendered ${shot.frameCount} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${outDir}`);
await browser.close();
server.close();

const mp4 = flags.indexOf('--mp4') >= 0 ? flags[flags.indexOf('--mp4') + 1] : null;
if (mp4) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(shot.fps), '-i', path.join(outDir, 'f%05d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', mp4], { stdio: 'inherit' });
  console.log('wrote', mp4);
}
