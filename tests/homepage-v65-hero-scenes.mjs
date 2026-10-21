import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v65-hero-scenes';
fs.mkdirSync(output, {recursive: true});

const browser = await playwright.chromium.launch({headless: true});
const matrix = [
  {path: '', viewport: {width: 1600, height: 900}},
  {path: '', viewport: {width: 1366, height: 768}},
  {path: '', viewport: {width: 390, height: 844}},
  {path: '', viewport: {width: 360, height: 740}},
  {path: 'en/', viewport: {width: 1600, height: 900}},
  {path: 'en/', viewport: {width: 390, height: 844}}
];
const results = [];

for (const entry of matrix) {
  const mobile = entry.viewport.width <= 820;
  const context = await browser.newContext({viewport: entry.viewport, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`page: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  await page.route('https://www.googletagmanager.com/**', route => route.fulfill({status: 200, contentType: 'application/javascript', body: ''}));
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({status: 200, contentType: 'text/css', body: ''}));
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.route('https://ai-customer-service.timux.site/api/widget.js*', route => route.fulfill({status: 200, contentType: 'application/javascript', body: ''}));

  await page.goto(`${base}${entry.path}`, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => [...document.querySelectorAll('.hero-case-switcher img')].every(image => image.complete && image.naturalWidth > 0));

  const initial = await page.locator('.hero-case-switcher').evaluate((switcher, isMobile) => {
    const hero = switcher.closest('.hero');
    const stage = switcher.querySelector('.case-switcher-stage');
    const panels = [...switcher.querySelectorAll('.case-switcher-panel')];
    const tabs = [...switcher.querySelectorAll('.case-switcher-tab')];
    const stageRect = stage.getBoundingClientRect();
    const secondRect = panels[1].getBoundingClientRect();
    return {
      marker: document.querySelector('meta[name="timux-build"]')?.content,
      overflow: document.documentElement.scrollWidth - innerWidth,
      inHero: Boolean(hero),
      switcherInSolutions: Boolean(document.querySelector('#solutions [data-case-switcher]')),
      solutionCards: document.querySelectorAll('#solutions .solution-card').length,
      tabs: tabs.length,
      panels: panels.length,
      capabilities: switcher.querySelectorAll('.hero-case-capabilities span').length,
      selected: tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true'),
      visiblePanel: panels.findIndex(panel => panel.getAttribute('aria-hidden') === 'false'),
      count: switcher.querySelector('[data-case-count]')?.textContent,
      imageWidths: panels.map(panel => panel.querySelector('img').naturalWidth),
      engineDisplay: getComputedStyle(hero.querySelector('.engine-stage')).display,
      heroTrackHeight: Math.round(document.querySelector('.engine-track').getBoundingClientRect().height),
      stageScrollLeft: stage.scrollLeft,
      snap: getComputedStyle(stage).scrollSnapType,
      nextPeek: Math.round(stageRect.right - secondRect.left),
      mobile: isMobile
    };
  }, mobile);

  if (initial.marker !== 'homepage-v65-hero-scenes-20261021' || initial.overflow > 1 || !initial.inHero || initial.switcherInSolutions || initial.solutionCards !== 4 || initial.tabs !== 2 || initial.panels !== 2 || initial.capabilities !== 4 || initial.selected !== 0 || initial.visiblePanel !== 0 || initial.count !== '01' || initial.imageWidths.some(width => width < 1500) || initial.engineDisplay !== 'none' || initial.heroTrackHeight > entry.viewport.height * 1.8) {
    throw new Error(`initial hero-scene regression ${entry.path} ${JSON.stringify({viewport: entry.viewport, initial})}`);
  }
  if (mobile && (!initial.snap.includes('x') || initial.nextPeek < 18 || initial.nextPeek > 70)) {
    throw new Error(`mobile scene peek regression ${entry.path} ${JSON.stringify({viewport: entry.viewport, initial})}`);
  }

  await page.locator('.hero-case-switcher .case-switcher-tab').nth(1).click();
  await page.waitForTimeout(mobile ? 520 : 120);
  const switched = await page.locator('.hero-case-switcher').evaluate(switcher => ({
    selected: [...switcher.querySelectorAll('.case-switcher-tab')].findIndex(tab => tab.getAttribute('aria-selected') === 'true'),
    visiblePanel: [...switcher.querySelectorAll('.case-switcher-panel')].findIndex(panel => panel.getAttribute('aria-hidden') === 'false'),
    count: switcher.querySelector('[data-case-count]')?.textContent,
    scrollLeft: switcher.querySelector('.case-switcher-stage').scrollLeft
  }));
  if (switched.selected !== 1 || switched.visiblePanel !== 1 || switched.count !== '02' || (mobile && switched.scrollLeft < 200)) {
    throw new Error(`hero scene switch regression ${entry.path} ${JSON.stringify({viewport: entry.viewport, switched})}`);
  }

  await page.waitForTimeout(900);
  const stable = await page.locator('.hero-case-switcher').evaluate(switcher => ({
    selected: [...switcher.querySelectorAll('.case-switcher-tab')].findIndex(tab => tab.getAttribute('aria-selected') === 'true'),
    count: switcher.querySelector('[data-case-count]')?.textContent
  }));
  if (stable.selected !== 1 || stable.count !== '02') throw new Error(`unexpected autoplay ${entry.path} ${JSON.stringify({viewport: entry.viewport, stable})}`);

  if (!mobile) {
    await page.locator('.hero-case-switcher .case-switcher-tab').nth(1).focus();
    await page.keyboard.press('ArrowLeft');
    const keyboard = await page.locator('.hero-case-switcher').evaluate(switcher => ({
      selected: [...switcher.querySelectorAll('.case-switcher-tab')].findIndex(tab => tab.getAttribute('aria-selected') === 'true'),
      focused: [...switcher.querySelectorAll('.case-switcher-tab')].findIndex(tab => tab === document.activeElement)
    }));
    if (keyboard.selected !== 0 || keyboard.focused !== 0) throw new Error(`keyboard scene switch regression ${entry.path} ${JSON.stringify({viewport: entry.viewport, keyboard})}`);
  }

  const screenshotName = `${entry.path ? 'en' : 'zh'}-${entry.viewport.width}x${entry.viewport.height}.png`;
  await page.screenshot({path: `${output}/${screenshotName}`});
  if (errors.length) throw new Error(`runtime regression ${entry.path} ${JSON.stringify({viewport: entry.viewport, errors})}`);
  results.push({path: entry.path || '/', viewport: entry.viewport, initial, switched, stable});
  await context.close();
}

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results.map(result => ({path: result.path, viewport: result.viewport, selected: result.switched.selected})), null, 2));
