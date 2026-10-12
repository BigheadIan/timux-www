import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v41-mobile-parity';
fs.mkdirSync(output, { recursive: true });
const browser = await playwright.chromium.launch({ headless: true });
const results = [];

for (const path of ['', 'en/']) {
  for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 740 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('requestfailed', request => {
      if (request.url().startsWith(base)) errors.push(`request: ${request.url()} ${request.failure()?.errorText}`);
    });
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });

    const state = await page.evaluate(() => {
      const hero = document.querySelector('.outcome-hero').getBoundingClientRect();
      const title = document.querySelector('h1').getBoundingClientRect();
      const engine = document.querySelector('.engine-stage');
      const workflow = document.querySelector('.workflow-demo');
      const cases = document.querySelector('.case-collection');
      const rails = [...document.querySelectorAll('.partner-orbit .logo-row,.solution-grid,.adoption-path,.case-collection,.model-pie-grid,.phase-grid')];
      return {
        marker: document.querySelector('meta[name="timux-build"]')?.content,
        overflow: document.documentElement.scrollWidth - innerWidth,
        scrollHeight: document.documentElement.scrollHeight,
        hero: { top: hero.top, bottom: hero.bottom, height: hero.height },
        title: { left: title.left, right: title.right },
        engineVisible: getComputedStyle(engine).display !== 'none' && engine.getBoundingClientRect().height >= 220,
        engineLayers: engine.querySelectorAll('.engine-layer').length,
        workflowHidden: getComputedStyle(workflow).display === 'none',
        cases: { height: cases.getBoundingClientRect().height, overflow: cases.scrollWidth > cases.clientWidth * 1.8 },
        rails: rails.map(rail => ({ overflow: rail.scrollWidth > rail.clientWidth + 20, current: rail.nextElementSibling?.querySelectorAll?.('[aria-current="true"]').length || 0 })),
        images: [...document.images].filter(image => image.getBoundingClientRect().width > 0).map(image => ({ src: image.currentSrc, naturalWidth: image.naturalWidth }))
      };
    });
    const limit = path ? 6900 : 6500;
    if (!state.marker?.includes('mobile-parity') || state.overflow > 1 || state.scrollHeight > limit) throw Error(`mobile frame regression ${path} ${JSON.stringify({ viewport, state })}`);
    if (state.title.left < 14 || state.title.right > viewport.width - 14 || state.hero.bottom > viewport.height + 2) throw Error(`hero fit regression ${path} ${JSON.stringify({ viewport, state })}`);
    if (!state.engineVisible || state.engineLayers !== 5 || !state.workflowHidden) throw Error(`engine parity regression ${path} ${JSON.stringify(state)}`);
    if (state.cases.height > 615 || !state.cases.overflow || state.rails.some(rail => !rail.overflow || rail.current !== 1)) throw Error(`mobile rail regression ${path} ${JSON.stringify(state)}`);
    if (state.images.some(image => image.naturalWidth === 0) || errors.length) throw Error(`runtime regression ${path} ${JSON.stringify({ errors, images: state.images.filter(image => !image.naturalWidth) })}`);

    for (const selector of ['.solution-grid', '.adoption-path', '.case-collection', '.model-pie-grid', '.phase-grid']) {
      const rail = page.locator(selector);
      await rail.evaluate(element => element.scrollTo({ left: element.scrollWidth, behavior: 'instant' }));
      await page.waitForTimeout(80);
      const progress = await rail.evaluate(element => ({ left: element.scrollLeft, max: element.scrollWidth - element.clientWidth, last: element.nextElementSibling.querySelector('button:last-child')?.getAttribute('aria-current') }));
      if (progress.left < progress.max - 3 || progress.last !== 'true') throw Error(`rail did not reach last item: ${selector} ${JSON.stringify(progress)}`);
      await rail.evaluate(element => element.scrollTo({ left: 0, behavior: 'instant' }));
    }

    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-hero.png` });
    await page.locator('#cases').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-cases.png` });
    results.push({ path: path || '/', viewport, ...state, errors });
    await page.close();
  }
}

const desktop = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await desktop.goto(base, { waitUntil: 'networkidle' });
const desktopState = await desktop.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - innerWidth,
  storyDesktop: document.documentElement.classList.contains('story-desktop'),
  engineVisible: getComputedStyle(document.querySelector('.engine-stage')).display !== 'none',
  workflowHidden: getComputedStyle(document.querySelector('.workflow-demo')).display === 'none',
  mobileNavHidden: [...document.querySelectorAll('.mobile-rail-nav')].every(element => getComputedStyle(element).display === 'none')
}));
if (desktopState.overflow > 1 || !desktopState.storyDesktop || !desktopState.engineVisible || !desktopState.workflowHidden || !desktopState.mobileNavHidden) throw Error(`desktop regression ${JSON.stringify(desktopState)}`);
await desktop.screenshot({ path: `${output}/desktop-1920-hero.png` });
await desktop.close();

const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await reduced.goto(base, { waitUntil: 'networkidle' });
const reducedAnimation = await reduced.locator('.engine-layer').first().evaluate(element => getComputedStyle(element).animationName);
if (reducedAnimation !== 'none') throw Error(`reduced motion regression: ${reducedAnimation}`);
await reduced.close();

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify({ results, desktopState }, null, 2)}\n`);
console.log(JSON.stringify({ mobile: results.map(({ path, viewport, scrollHeight, overflow }) => ({ path, viewport, scrollHeight, overflow })), desktopState }, null, 2));
