import { execFileSync } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// English has the longer above-the-fold labels, so its render safely covers
// both localized homepages while keeping a single shared critical stylesheet.
const homepagePath = resolve(root, 'en/index.html');
const temporaryPath = resolve(root, '.homepage-v73-critical-source.html');
const outputPath = resolve(root, 'assets/site-home-critical-v73.css');

const cssFiles = [
  'site-base.css',
  'site-conversion.css',
  'site-story.css',
  'site-home-refresh.css',
  'site-case-journey.css',
  'site-back-to-top.css',
  'site-mobile-parity.css',
  'site-case-switcher.css',
  'site-solutions-hub.css',
  'site-adoption-scene.css'
];

const blockingStyles = cssFiles
  .map(file => `  <link rel="stylesheet" href="/assets/${file}">`)
  .join('\n');
const source = (await readFile(homepagePath, 'utf8')).replace(
  /  <!-- V73_CRITICAL_START -->[\s\S]*?  <!-- V73_CRITICAL_END -->/,
  blockingStyles
);

if (source.includes('V73_CRITICAL_START')) {
  throw new Error('Could not prepare the clean V73 critical CSS source');
}

await writeFile(temporaryPath, source);
try {
  execFileSync('npx', [
    '--yes',
    '--package', 'critical@9.0.0',
    '--package', 'playwright@1.58.2',
    'critical', temporaryPath,
    '--engine', 'render',
    '--dimensions', '390x844,1600x900',
    '--out', outputPath
  ], { cwd: root, stdio: 'inherit' });
} finally {
  await unlink(temporaryPath).catch(() => {});
}

let critical = await readFile(outputPath, 'utf8');
if (critical.length < 10_000 || !critical.includes('.hero-case-switcher')) {
  throw new Error(`Critical CSS output looks incomplete (${critical.length} bytes)`);
}
// The browser coverage extractor drops the off-canvas skip link because it is
// not painted. Its positioning still has to exist before first paint, or the
// default inline link pushes the sticky navigation and hero down on slow CSS.
const structuralCss = '.skip-link{position:fixed;top:-100px;left:16px;z-index:100;background:#fff;color:#171923;padding:12px}.skip-link:focus{top:16px}.outcome-hero .engine-stage,.outcome-hero .engine-caption,.outcome-hero .engine-scroll,.outcome-hero .workflow-demo,.outcome-hero .layout-hero-index{display:none!important}';
critical = `${structuralCss}${critical}`;
await writeFile(outputPath, critical);
console.log(`Generated ${outputPath} (${critical.length} bytes)`);
