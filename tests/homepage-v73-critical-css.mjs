import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v73-critical-css';
const networkLatency = Number(process.env.HOMEPAGE_QA_LATENCY || 300);
const networkDownload = Number(process.env.HOMEPAGE_QA_DOWNLOAD || 50_000);
const fullLoadTimeout = Number(process.env.HOMEPAGE_QA_FULL_TIMEOUT || 30_000);
const maxFcp = Number(process.env.HOMEPAGE_QA_MAX_FCP || 3_000);
fs.mkdirSync(output, { recursive: true });

const profiles = [
  { name: 'zh-mobile', path: '', viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'en-mobile', path: 'en/', viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'zh-desktop', path: '', viewport: { width: 1600, height: 900 }, mobile: false },
  { name: 'en-desktop', path: 'en/', viewport: { width: 1600, height: 900 }, mobile: false }
].filter(profile => !process.env.HOMEPAGE_QA_PROFILE || profile.name === process.env.HOMEPAGE_QA_PROFILE);

const legacyCss = [
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

const results = [];

for (const profile of profiles) {
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: profile.viewport,
      isMobile: profile.mobile,
      hasTouch: profile.mobile,
      deviceScaleFactor: profile.mobile ? 2 : 1
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.clearBrowserCache');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: networkLatency,
      downloadThroughput: networkDownload,
      uploadThroughput: 25_000,
      connectionType: 'cellular3g'
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    const errors = [];
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await page.route('https://ai-customer-service.timux.site/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await page.addInitScript(() => {
      window.__timuxPerf = { cls: 0, lcp: 0, shifts: [] };
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__timuxPerf.cls += entry.value;
          window.__timuxPerf.shifts.push({
            value: entry.value,
            sources: entry.sources?.map(source => ({
              node: source.node?.id || source.node?.className || source.node?.nodeName,
              previousRect: source.previousRect,
              currentRect: source.currentRect
            })) || []
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.__timuxPerf.lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    const started = Date.now();
    await page.goto(new URL(profile.path, base).href, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForFunction(() => performance.getEntriesByName('first-contentful-paint').length > 0, null, { timeout: 15_000 });
    const firstPaintWallMs = Date.now() - started;
    await page.waitForFunction(() => document.documentElement.classList.contains('full-styles-ready'), null, { timeout: fullLoadTimeout });
    await page.waitForFunction(() => document.documentElement.classList.contains('full-scripts-ready'), null, { timeout: fullLoadTimeout });
    await page.waitForFunction(() => document.querySelector('.case-switcher-panel.is-active img')?.naturalWidth > 0, null, { timeout: fullLoadTimeout });
    await page.waitForTimeout(500);

    const metrics = await page.evaluate((legacyNames) => {
      const resources = performance.getEntriesByType('resource');
      const hero = document.querySelector('.case-switcher-panel.is-active img');
      const heroPath = hero?.currentSrc ? new URL(hero.currentSrc).pathname : '';
      const heroResource = resources.find(entry => heroPath && new URL(entry.name).pathname === heroPath);
      const fullCss = resources.find(entry => entry.name.includes('site-home-full-v73.css'));
      return {
        marker: document.querySelector('meta[name="timux-build"]')?.content,
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        lcp: window.__timuxPerf.lcp,
        cls: window.__timuxPerf.cls,
        shifts: window.__timuxPerf.shifts,
        overflow: document.documentElement.scrollWidth - innerWidth,
        fullCssResponseEnd: fullCss?.responseEnd || 0,
        fullCssRenderBlocking: fullCss?.renderBlockingStatus || '',
        heroResponseEnd: heroResource?.responseEnd || 0,
        heroWidth: hero?.naturalWidth || 0,
        legacyCssRequested: resources.some(entry => legacyNames.some(name => entry.name.includes(`/${name}`))),
        fullStylesReady: document.documentElement.classList.contains('full-styles-ready'),
        fullScriptsReady: document.documentElement.classList.contains('full-scripts-ready'),
        deferredScriptCount: document.querySelectorAll('script[data-timux-deferred]').length,
        googleFontsRequested: resources.some(entry => entry.name.includes('fonts.googleapis.com')),
        transitionLayerPresent: Boolean(document.querySelector('.page-transition'))
      };
    }, legacyCss);

    if (
      !['homepage-v73-critical-css-20261024', 'homepage-v74-scene-copy-alignment-20261024'].includes(metrics.marker) ||
      metrics.fcp > maxFcp || metrics.cls > 0.05 || metrics.overflow > 1 ||
      !metrics.fullStylesReady || !metrics.fullScriptsReady || metrics.deferredScriptCount !== 9 ||
      !metrics.fullCssResponseEnd || metrics.fullCssRenderBlocking !== 'non-blocking' ||
      !metrics.heroResponseEnd || !metrics.heroWidth || metrics.legacyCssRequested ||
      metrics.googleFontsRequested || metrics.transitionLayerPresent || errors.length
    ) {
      throw new Error(`${profile.name} V73 regression ${JSON.stringify({ metrics, errors })}`);
    }

    await page.screenshot({ path: `${output}/${profile.name}.png` });
    await page.locator('.case-switcher-tab[data-case-index="1"]').click();
    await page.waitForFunction(() => document.querySelector('.case-switcher-tab[data-case-index="1"]')?.classList.contains('is-active'));
    const caseTwoActive = await page.locator('.case-switcher-tab[data-case-index="1"]').getAttribute('aria-selected');
    if (caseTwoActive !== 'true') throw new Error(`${profile.name} case switcher did not activate case 02`);

    results.push({ ...profile, firstPaintWallMs, ...metrics, consoleErrors: errors });
    await context.close();
  } finally {
    await browser.close();
  }
}

fs.writeFileSync(`${output}/results.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
