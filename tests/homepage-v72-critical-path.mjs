import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v72-critical-path';
fs.mkdirSync(output, { recursive: true });

const profiles = [
  { name: 'zh-mobile', path: '', viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'en-mobile', path: 'en/', viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'zh-desktop', path: '', viewport: { width: 1600, height: 900 }, mobile: false },
  { name: 'en-desktop', path: 'en/', viewport: { width: 1600, height: 900 }, mobile: false }
];

const browser = await playwright.chromium.launch({ headless: true });
const results = [];

for (const profile of profiles) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: profile.mobile,
    hasTouch: profile.mobile,
    deviceScaleFactor: profile.mobile ? 2 : 1
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 180,
    downloadThroughput: 200_000,
    uploadThroughput: 75_000,
    connectionType: 'cellular3g'
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const errors = [];
  page.on('pageerror', error => errors.push(`page: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.route('https://ai-customer-service.timux.site/api/widget.js*', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.addInitScript(() => {
    window.__timuxPerf = { cls: 0, lcp: 0 };
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__timuxPerf.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) window.__timuxPerf.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  const started = Date.now();
  await page.goto(`${base}${profile.path}`, { waitUntil: 'load', timeout: 45_000 });
  const loadWallMs = Date.now() - started;
  await page.waitForFunction(() => document.querySelector('.case-switcher-panel.is-active img')?.naturalWidth > 0);
  await page.waitForTimeout(350);

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource').map(entry => entry.name);
    return {
      marker: document.querySelector('meta[name="timux-build"]')?.content,
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      lcp: window.__timuxPerf.lcp,
      cls: window.__timuxPerf.cls,
      navLoad: performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0,
      overflow: document.documentElement.scrollWidth - innerWidth,
      earlyMobileClass: innerWidth > 820 || document.documentElement.classList.contains('mobile-layout-v43'),
      secondaryRequested: resources.some(name => name.includes('commercial-property-repair')),
      megaMenuRequested: resources.some(name => name.includes('southeast-ai-cs-normal.png')),
      googleFontsRequested: resources.some(name => name.includes('fonts.googleapis.com')),
      transitionLayerPresent: Boolean(document.querySelector('.page-transition'))
    };
  });

  if (
    metrics.marker !== 'homepage-v72-critical-path-20261023' ||
    !metrics.earlyMobileClass ||
    metrics.fcp > 4_500 || metrics.lcp > 5_000 || metrics.cls > 0.05 ||
    metrics.overflow > 1 || metrics.secondaryRequested || metrics.megaMenuRequested || metrics.googleFontsRequested || metrics.transitionLayerPresent ||
    errors.length
  ) {
    throw new Error(`${profile.name} critical path regression ${JSON.stringify({ metrics, errors })}`);
  }

  await page.screenshot({ path: `${output}/${profile.name}.png` });

  if (!profile.mobile) {
    await page.locator('.nav-entry').nth(1).hover();
    await page.waitForFunction(() => document.querySelector('.mega-case-preview img')?.naturalWidth > 1);
  }
  await page.locator('#adoption').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.adoption-scene-section')?.classList.contains('is-scene-image-ready'));
  await page.waitForFunction((mobile) => performance.getEntriesByType('resource').some(entry => entry.name.endsWith(mobile
    ? 'ai-customer-service-journey-900.webp'
    : 'ai-customer-service-journey-1600.webp')), profile.mobile);

  results.push({ ...profile, loadWallMs, ...metrics });
  await context.close();
}

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
