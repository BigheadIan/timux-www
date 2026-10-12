import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v42-mobile-story';
fs.mkdirSync(output, {recursive: true});
const browser = await playwright.chromium.launch({headless: true});
const results = [];

const modules = [
  ['.partner-orbit', '.logo-card'],
  ['#solutions', '.solution-card'],
  ['#adoption', '.adoption-path > article'],
  ['#method', '.model-pie-grid > article'],
  ['#roadmap', '.phase-card']
];

for (const path of ['', 'en/']) {
  for (const viewport of [{width: 390, height: 844}, {width: 360, height: 740}]) {
    const page = await browser.newPage({viewport});
    const errors = [];
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('requestfailed', request => {
      if (request.url().startsWith(base)) errors.push(`request: ${request.url()} ${request.failure()?.errorText}`);
    });
    await page.goto(`${base}${path}`, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => document.documentElement.classList.contains('mobile-story-v42'));

    const state = await page.evaluate(() => {
      const hero = document.querySelector('.outcome-hero').getBoundingClientRect();
      const title = document.querySelector('h1').getBoundingClientRect();
      const engine = document.querySelector('.engine-stage');
      const controls = ['.back-to-top', '.timux-chat-bubble'].map(selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {selector, width: rect.width, height: rect.height, right: innerWidth - rect.right, bottom: innerHeight - rect.bottom};
      }).filter(Boolean);
      return {
        marker: document.querySelector('meta[name="timux-build"]')?.content,
        overflow: document.documentElement.scrollWidth - innerWidth,
        scrollHeight: document.documentElement.scrollHeight,
        hero: {bottom: hero.bottom, height: hero.height},
        title: {left: title.left, right: title.right},
        engineVisible: getComputedStyle(engine).display !== 'none' && engine.getBoundingClientRect().height >= 200,
        engineLayers: engine.querySelectorAll('.engine-layer').length,
        navCount: document.querySelectorAll('.mobile-story-nav').length,
        controls
      };
    });
    if (!state.marker?.includes('mobile-story') || state.overflow > 1 || state.scrollHeight > 9200) throw Error(`mobile frame regression ${path} ${JSON.stringify({viewport, state})}`);
    if (state.title.left < 14 || state.title.right > viewport.width - 14 || state.hero.bottom > viewport.height + 2) throw Error(`hero fit regression ${path} ${JSON.stringify({viewport, state})}`);
    if (!state.engineVisible || state.engineLayers !== 5 || state.navCount !== 7) throw Error(`story setup regression ${path} ${JSON.stringify(state)}`);
    if (state.controls.some(control => control.width > 52 || control.height > 52 || control.bottom < 8 || control.right < 8)) throw Error(`floating control regression ${path} ${JSON.stringify(state.controls)}`);

    const moduleStates = [];
    for (const [trackSelector, itemSelector] of modules) {
      const sample = await page.evaluate(({trackSelector, itemSelector}) => {
        const track = document.querySelector(trackSelector);
        const top = track.getBoundingClientRect().top + scrollY;
        const travel = Math.max(1, track.offsetHeight - Math.min(innerHeight - 70, 720));
        scrollTo({top: top + travel - 70, behavior: 'instant'});
        return {top, travel};
      }, {trackSelector, itemSelector});
      await page.waitForTimeout(80);
      const terminal = await page.evaluate(({trackSelector, itemSelector}) => {
        const track = document.querySelector(trackSelector);
        const items = [...track.querySelectorAll(itemSelector)];
        return {
          step: Number(track.dataset.mobileStep),
          count: items.length,
          active: items.filter(item => item.getAttribute('aria-hidden') === 'false').length,
          horizontalOverflow: track.scrollWidth > innerWidth + 1
        };
      }, {trackSelector, itemSelector});
      if (terminal.step !== terminal.count - 1 || terminal.active !== 1 || terminal.horizontalOverflow) throw Error(`module animation regression ${trackSelector} ${JSON.stringify({sample, terminal})}`);
      moduleStates.push({trackSelector, ...terminal});
    }

    await page.evaluate(() => {
      const cases = document.querySelector('.case-collection');
      const top = cases.getBoundingClientRect().top + scrollY;
      const travel = Math.max(1, cases.offsetHeight - Math.min(innerHeight - 70, 720));
      scrollTo({top: top + travel - 70, behavior: 'instant'});
    });
    await page.waitForTimeout(80);
    const caseTerminal = await page.evaluate(() => ({
      step: Number(document.querySelector('.case-collection').dataset.mobileStep),
      activeTracks: [...document.querySelectorAll('.case-collection > .case-journey-track')].filter(track => track.getAttribute('aria-hidden') === 'false').length,
      overflow: document.documentElement.scrollWidth - innerWidth
    }));
    if (caseTerminal.step !== 3 || caseTerminal.activeTracks !== 1 || caseTerminal.overflow > 1) throw Error(`case stage regression ${JSON.stringify(caseTerminal)}`);

    await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
    await page.waitForTimeout(80);
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-hero.png`});
    await page.locator('#solutions').scrollIntoViewIfNeeded();
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-solutions.png`});
    await page.locator('#cases').scrollIntoViewIfNeeded();
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-cases.png`});
    results.push({path: path || '/', viewport, state, moduleStates, caseTerminal, errors});
    if (errors.length) throw Error(`runtime regression ${path} ${JSON.stringify(errors)}`);
    await page.close();
  }
}

const desktop = await browser.newPage({viewport: {width: 1920, height: 1080}});
await desktop.goto(base, {waitUntil: 'networkidle'});
const desktopState = await desktop.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - innerWidth,
  storyDesktop: document.documentElement.classList.contains('story-desktop'),
  mobileStory: document.documentElement.classList.contains('mobile-story-v42'),
  engineVisible: getComputedStyle(document.querySelector('.engine-stage')).display !== 'none',
  mobileNavHidden: [...document.querySelectorAll('.mobile-story-nav')].every(element => getComputedStyle(element).display === 'none')
}));
if (desktopState.overflow > 1 || !desktopState.storyDesktop || desktopState.mobileStory || !desktopState.engineVisible || !desktopState.mobileNavHidden) throw Error(`desktop regression ${JSON.stringify(desktopState)}`);
await desktop.screenshot({path: `${output}/desktop-1920-hero.png`});
await desktop.close();

const reducedPage = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
await reducedPage.goto(base, {waitUntil: 'networkidle'});
const reducedState = await reducedPage.evaluate(() => ({
  engineAnimation: getComputedStyle(document.querySelector('.engine-layer')).animationName,
  solutionCards: [...document.querySelectorAll('.solution-card')].every(card => getComputedStyle(card).position === 'relative' && Number(getComputedStyle(card).opacity) === 1)
}));
if (reducedState.engineAnimation !== 'none' || !reducedState.solutionCards) throw Error(`reduced motion regression ${JSON.stringify(reducedState)}`);
await reducedPage.close();

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify({results, desktopState}, null, 2)}\n`);
console.log(JSON.stringify({mobile: results.map(result => ({path: result.path, viewport: result.viewport, scrollHeight: result.state.scrollHeight, overflow: result.state.overflow})), desktopState}, null, 2));
