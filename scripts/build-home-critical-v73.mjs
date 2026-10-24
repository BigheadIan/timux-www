import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const criticalPath = resolve(root, 'assets/site-home-critical-v73.css');
const fullPath = resolve(root, 'assets/site-home-full-v73.css');
const homepagePaths = [resolve(root, 'index.html'), resolve(root, 'en/index.html')];

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

const deferredScripts = [
  '/assets/site-story.js?v=20261023-v71',
  '/assets/site-case-journey.js?v=20261015-v62',
  '/assets/site-orbit.js?v=20261015-v62',
  '/assets/site-mega-nav.js?v=20261023-v72',
  '/assets/site-mobile-parity.js?v=20261013-v61',
  '/assets/site-case-switcher.js?v=20261023-v72',
  '/assets/site-back-to-top.js?v=20261009-v37',
  '/assets/site-conversion.js?v=20261023-v72',
  '/assets/site-about-ab.js?v=20261015-ab1'
];

const critical = (await readFile(criticalPath, 'utf8')).trim();
const fullCss = (await Promise.all(cssFiles.map(async (file) => {
  const source = await readFile(resolve(root, 'assets', file), 'utf8');
  return `/* ${file} */\n${source.trim()}\n`;
}))).join('\n');
await writeFile(fullPath, fullCss);

const runtime = `  <!-- V73_CRITICAL_START -->
  <style id="timux-home-critical-v73">${critical}</style>
  <script>
    (() => {
      const sources = ${JSON.stringify(deferredScripts)};
      let started = false;
      const loadScripts = () => {
        let settled = 0;
        const markSettled = () => {
          settled += 1;
          if (settled !== sources.length) return;
          document.documentElement.classList.add('full-scripts-ready');
          dispatchEvent(new CustomEvent('timux:full-scripts-ready'));
        };
        sources.forEach((source) => {
          const script = document.createElement('script');
          script.src = source;
          script.async = false;
          script.dataset.timuxDeferred = '';
          script.addEventListener('load', markSettled, { once: true });
          script.addEventListener('error', markSettled, { once: true });
          document.head.append(script);
        });
      };
      window.__timuxActivateFullStyles = (link) => {
        if (started) return;
        started = true;
        link.media = 'all';
        document.documentElement.classList.add('full-styles-ready');
        requestAnimationFrame(() => requestAnimationFrame(loadScripts));
      };
      window.__timuxFullStylesFailed = () => {
        if (started) return;
        started = true;
        document.documentElement.classList.add('full-styles-failed');
        loadScripts();
      };
    })();
  </script>
  <link id="timux-home-full-v73" rel="stylesheet" href="/assets/site-home-full-v73.css?v=20261024-v74" media="print" onload="window.__timuxActivateFullStyles(this)" onerror="window.__timuxFullStylesFailed()">
  <noscript><link rel="stylesheet" href="/assets/site-home-full-v73.css?v=20261024-v74"></noscript>
  <!-- V73_CRITICAL_END -->`;

const existingV73 = /  <!-- V73_CRITICAL_START -->[\s\S]*?  <!-- V73_CRITICAL_END -->/;
const legacyHead = /  <link rel="stylesheet" href="\/assets\/site-base\.css[^\n]*[\s\S]*?<script src="\/assets\/site-back-to-top\.js[^>]*><\/script>/;

for (const homepagePath of homepagePaths) {
  let html = await readFile(homepagePath, 'utf8');
  if (existingV73.test(html)) html = html.replace(existingV73, runtime);
  else if (legacyHead.test(html)) html = html.replace(legacyHead, runtime);
  else throw new Error(`Could not find the homepage stylesheet block in ${homepagePath}`);

  html = html
    .replace(/<script src="\/assets\/site-conversion\.js[^>]*><\/script><script src="\/assets\/site-about-ab\.js[^>]*><\/script>/, '')
    .replaceAll('homepage-v72-critical-path-20261023', 'homepage-v74-scene-copy-alignment-20261024')
    .replaceAll('homepage-v73-critical-css-20261024', 'homepage-v74-scene-copy-alignment-20261024');
  await writeFile(homepagePath, html);
  console.log(`Updated ${homepagePath}`);
}
console.log(`Generated ${fullPath}`);
