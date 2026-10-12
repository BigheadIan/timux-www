import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v44-mobile-static';
fs.mkdirSync(output, {recursive: true});
const browser = await playwright.chromium.launch({headless: true});
const results = [];

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
    await page.waitForFunction(() => document.documentElement.classList.contains('mobile-layout-v43'));

    const state = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect();
      const style = selector => getComputedStyle(document.querySelector(selector));
      const firstCase = rect('.case-journey-track:first-child');
      const secondCase = rect('.case-journey-track:last-child');
      const solutionCards = [...document.querySelectorAll('.solution-card')];
      const adoptionCards = [...document.querySelectorAll('.adoption-path > article')];
      const phaseCards = [...document.querySelectorAll('.phase-card')];
      const controls = ['.back-to-top', '.timux-chat-bubble'].map(selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return {selector, width: box.width, height: box.height, right: innerWidth - box.right, bottom: innerHeight - box.bottom};
      }).filter(Boolean);
      return {
        marker: document.querySelector('meta[name="timux-build"]')?.content,
        overflow: document.documentElement.scrollWidth - innerWidth,
        scrollHeight: document.documentElement.scrollHeight,
        heroHeight: rect('.outcome-hero').height,
        engineHeight: rect('.engine-stage').height,
        visibleEngineLayers: [...document.querySelectorAll('.engine-layer')].filter(layer => getComputedStyle(layer).display !== 'none').length,
        engineAnimations: [...document.querySelectorAll('.engine-layer')].map(layer => getComputedStyle(layer).animationName),
        partnerColumns: style('.partner-orbit .logo-row').gridTemplateColumns.split(' ').length,
        partnerHeight: rect('.partner-orbit').height,
        solutionColumns: style('.solution-grid').gridTemplateColumns.split(' ').length,
        solutionHeights: solutionCards.map(card => Math.round(card.getBoundingClientRect().height)),
        solutionPositions: solutionCards.map(card => getComputedStyle(card).position),
        adoptionPositions: adoptionCards.map(card => getComputedStyle(card).position),
        phasePositions: phaseCards.map(card => getComputedStyle(card).position),
        sectionPositions: ['#solutions > .shell', '#adoption > .shell', '#method > .shell', '#roadmap > .shell'].map(selector => style(selector).position),
        casesTouch: Math.round(firstCase.bottom - secondCase.top),
        caseTrackPositions: [...document.querySelectorAll('.case-journey-track')].map(track => getComputedStyle(track).position),
        tabs: [...document.querySelectorAll('.mobile-choice-tabs')].map(tabs => ({display: getComputedStyle(tabs).display, count: tabs.querySelectorAll('button').length})),
        active: {
          stations: document.querySelectorAll('.a-bus .station.is-mobile-current').length,
          devices: document.querySelectorAll('.a-mj .device.is-mobile-current').length,
          models: document.querySelectorAll('.model-pie-grid > article.is-mobile-current').length
        },
        controls: controls.map(control => ({...control, display: getComputedStyle(document.querySelector(control.selector)).display}))
      };
    });

    const maxHeight = path ? 7800 : 7350;
    if (!state.marker?.includes('mobile-static') || state.overflow > 1 || state.scrollHeight > maxHeight) throw Error(`mobile frame regression ${path} ${JSON.stringify({viewport, state})}`);
    if (state.heroHeight > 500 || state.engineHeight < 170 || state.engineHeight > 190 || state.visibleEngineLayers !== 1 || state.engineAnimations.some(name => name !== 'none')) throw Error(`static hero regression ${path} ${JSON.stringify(state)}`);
    if (state.partnerColumns !== 3 || state.partnerHeight > 260 || state.solutionColumns !== 2 || state.solutionHeights.some(height => height > 260)) throw Error(`phone grid regression ${path} ${JSON.stringify(state)}`);
    if ([...state.solutionPositions, ...state.adoptionPositions, ...state.phasePositions, ...state.caseTrackPositions].some(position => position === 'absolute' || position === 'sticky') || state.sectionPositions.some(position => position === 'sticky')) throw Error(`layered layout regression ${path} ${JSON.stringify(state)}`);
    if (Math.abs(state.casesTouch) > 2 || state.tabs.length !== 3 || state.tabs.some(tabs => tabs.display === 'none' || tabs.count !== 3) || Object.values(state.active).some(count => count !== 1)) throw Error(`mobile selector regression ${path} ${JSON.stringify(state)}`);
    if (state.controls.some(control => control.display !== 'none')) throw Error(`floating control regression ${path} ${JSON.stringify(state.controls)}`);

    for (const selector of ['.mobile-case-tabs', '.mobile-field-tabs', '.mobile-model-tabs']) {
      const buttons = page.locator(`${selector} button`);
      await buttons.last().click();
      const tabState = await page.locator(selector).evaluate(tabs => ({
        selected: [...tabs.querySelectorAll('button')].findIndex(button => button.getAttribute('aria-selected') === 'true'),
        active: tabs.dataset.active
      }));
      if (tabState.selected !== 2 || tabState.active !== '2') throw Error(`selector interaction regression ${selector} ${JSON.stringify(tabState)}`);
    }

    await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
    await page.waitForTimeout(80);
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-hero.png`});
    await page.locator('#solutions').scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-solutions.png`});
    await page.locator('#case-southeast').scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-case-bus.png`});
    await page.locator('#case-mj').scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-case-mj.png`});

    if (errors.length) throw Error(`runtime regression ${path} ${JSON.stringify(errors)}`);
    results.push({path: path || '/', viewport, ...state, errors});
    await page.close();
  }
}

const desktop = await browser.newPage({viewport: {width: 1920, height: 1080}});
await desktop.goto(base, {waitUntil: 'networkidle'});
const desktopState = await desktop.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - innerWidth,
  storyDesktop: document.documentElement.classList.contains('story-desktop'),
  mobileLayout: document.documentElement.classList.contains('mobile-layout-v43'),
  tabsHidden: [...document.querySelectorAll('.mobile-choice-tabs')].every(tabs => getComputedStyle(tabs).display === 'none'),
  solutionColumns: getComputedStyle(document.querySelector('.solution-grid')).gridTemplateColumns.split(' ').length,
  visibleModels: [...document.querySelectorAll('.model-pie-grid > article')].filter(card => getComputedStyle(card).display !== 'none').length
}));
if (desktopState.overflow > 1 || !desktopState.storyDesktop || desktopState.mobileLayout || !desktopState.tabsHidden || desktopState.solutionColumns !== 2 || desktopState.visibleModels !== 3) throw Error(`desktop regression ${JSON.stringify(desktopState)}`);
await desktop.screenshot({path: `${output}/desktop-1920-hero.png`});
await desktop.close();

const reducedPage = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
await reducedPage.goto(base, {waitUntil: 'networkidle'});
const reducedState = await reducedPage.evaluate(() => ({
  engineAnimation: getComputedStyle(document.querySelector('.engine-layer')).animationName,
  revealOpacity: getComputedStyle(document.querySelector('[data-mobile-reveal]')).opacity
}));
if (reducedState.engineAnimation !== 'none' || reducedState.revealOpacity !== '1') throw Error(`reduced motion regression ${JSON.stringify(reducedState)}`);
await reducedPage.close();

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify({results, desktopState}, null, 2)}\n`);
console.log(JSON.stringify({mobile: results.map(({path, viewport, scrollHeight, overflow, partnerHeight, solutionHeights}) => ({path, viewport, scrollHeight, overflow, partnerHeight, solutionHeights})), desktopState}, null, 2));
