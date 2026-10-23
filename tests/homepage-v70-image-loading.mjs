import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v70-image-loading';
fs.mkdirSync(output, { recursive: true });

const matrix = [
  { path: '', viewport: { width: 1600, height: 900 } },
  { path: '', viewport: { width: 1366, height: 768 } },
  { path: '', viewport: { width: 390, height: 844 } },
  { path: '', viewport: { width: 360, height: 740 } },
  { path: 'en/', viewport: { width: 1600, height: 900 } },
  { path: 'en/', viewport: { width: 390, height: 844 } }
];

const browser = await playwright.chromium.launch({ headless: true });
const results = [];

for (const entry of matrix) {
  const mobile = entry.viewport.width <= 820;
  const context = await browser.newContext({
    viewport: entry.viewport,
    hasTouch: mobile,
    isMobile: mobile,
    deviceScaleFactor: mobile ? 2 : 1
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`page: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.route('https://ai-customer-service.timux.site/api/widget.js*', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));

  await page.goto(`${base}${entry.path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const image = document.querySelector('.case-switcher-panel.is-active img');
    return image?.complete && image.naturalWidth > 0;
  });

  const hero = await page.evaluate(() => {
    const image = document.querySelector('.case-switcher-panel.is-active img');
    const url = image.currentSrc;
    const resource = performance.getEntriesByName(url).at(-1);
    return {
      marker: document.querySelector('meta[name="timux-build"]')?.content,
      currentSrc: url,
      naturalWidth: image.naturalWidth,
      encodedBodySize: resource?.encodedBodySize || 0,
      matchedPreloads: [...document.querySelectorAll('link[rel="preload"][as="image"]')]
        .filter(link => matchMedia(link.media).matches)
        .map(link => link.href),
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  const expectedHeroSuffix = mobile
    ? 'manufacturing-order-delivery-mobile.webp'
    : 'manufacturing-order-delivery-1600.webp';
  const heroLimit = mobile ? 70_000 : 130_000;
  if (
    hero.marker !== 'homepage-v70-responsive-images-20261023' ||
    !hero.currentSrc.endsWith(expectedHeroSuffix) ||
    !hero.matchedPreloads.some(url => url.endsWith(expectedHeroSuffix)) ||
    hero.encodedBodySize <= 0 ||
    hero.encodedBodySize > heroLimit ||
    hero.overflow > 1
  ) {
    throw new Error(`hero image regression ${entry.path || '/'} ${JSON.stringify({ viewport: entry.viewport, hero })}`);
  }

  await page.locator('.case-switcher-tab').nth(1).click();
  await page.waitForFunction(() => {
    const image = document.querySelectorAll('.case-switcher-panel img')[1];
    return image?.complete && image.naturalWidth > 0;
  });
  const secondarySrc = await page.locator('.case-switcher-panel img').nth(1).evaluate(image => image.currentSrc);
  const expectedSecondarySuffix = mobile
    ? 'commercial-property-repair-mobile.webp'
    : 'commercial-property-repair-1600.webp';
  if (!secondarySrc.endsWith(expectedSecondarySuffix)) {
    throw new Error(`secondary image regression ${entry.path || '/'} ${JSON.stringify({ viewport: entry.viewport, secondarySrc })}`);
  }

  await page.locator('#solutions').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const image = document.querySelector('.solution-scene img');
    return image?.complete && image.naturalWidth > 0;
  });
  const solution = await page.locator('.solution-scene img').evaluate(image => {
    const resource = performance.getEntriesByName(image.currentSrc).at(-1);
    return {
      currentSrc: image.currentSrc,
      naturalWidth: image.naturalWidth,
      encodedBodySize: resource?.encodedBodySize || 0
    };
  });
  const expectedSolutionSuffix = mobile ? 'four-capabilities-hub-800.webp' : 'four-capabilities-hub-1400.webp';
  const solutionLimit = mobile ? 90_000 : 200_000;
  if (
    !solution.currentSrc.endsWith(expectedSolutionSuffix) ||
    solution.encodedBodySize <= 0 ||
    solution.encodedBodySize > solutionLimit
  ) {
    throw new Error(`solution image regression ${entry.path || '/'} ${JSON.stringify({ viewport: entry.viewport, solution })}`);
  }

  const legacyRequests = await page.evaluate(() => performance.getEntriesByType('resource')
    .map(entry => entry.name)
    .filter(name => name.endsWith('manufacturing-order-delivery.jpg') || name.endsWith('commercial-property-repair.jpg') || name.endsWith('four-capabilities-hub.webp')));
  if (legacyRequests.length) throw new Error(`legacy image requested ${JSON.stringify(legacyRequests)}`);
  if (errors.length) throw new Error(`runtime regression ${entry.path || '/'} ${JSON.stringify({ viewport: entry.viewport, errors })}`);

  const screenshotName = `${entry.path ? 'en' : 'zh'}-${entry.viewport.width}x${entry.viewport.height}-solutions.png`;
  await page.screenshot({ path: `${output}/${screenshotName}` });
  results.push({ path: entry.path || '/', viewport: entry.viewport, hero, secondarySrc, solution });
  await context.close();
}

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results.map(result => ({
  path: result.path,
  viewport: result.viewport,
  heroBytes: result.hero.encodedBodySize,
  solutionBytes: result.solution.encodedBodySize
})), null, 2));
