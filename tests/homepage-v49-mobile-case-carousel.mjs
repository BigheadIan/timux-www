import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v49-mobile-case-carousel';
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
        visibleEngineLayers: [...document.querySelectorAll('.engine-layer')].filter(layer => layer.getBoundingClientRect().width > 0).length,
        engineAnimations: [...document.querySelectorAll('.engine-layer')].map(layer => getComputedStyle(layer).animationName),
        overview: {
          display: style('.mobile-engine-overview').display,
          width: rect('.mobile-engine-overview').width,
          height: rect('.mobile-engine-overview').height,
          text: document.querySelector('.mobile-engine-overview').textContent.replace(/\s+/g, ' ').trim(),
          svgWidth: rect('.mobile-overview-map').width
        },
        partnerColumns: style('.partner-orbit .logo-row').gridTemplateColumns.split(' ').length,
        partnerHeight: rect('.partner-orbit').height,
        solutionColumns: style('.solution-grid').gridTemplateColumns.split(' ').length,
        solutionHeights: solutionCards.map(card => Math.round(card.getBoundingClientRect().height)),
        solutionPositions: solutionCards.map(card => getComputedStyle(card).position),
        adoptionPositions: adoptionCards.map(card => getComputedStyle(card).position),
        phasePositions: phaseCards.map(card => getComputedStyle(card).position),
        sectionPositions: ['#solutions > .shell', '#adoption > .shell', '#roadmap > .shell'].map(selector => style(selector).position),
        methodShellPosition: style('#method > .shell').position,
        casesTouch: Math.round(firstCase.bottom - secondCase.top),
        caseTrackPositions: [...document.querySelectorAll('.case-journey-track')].map(track => getComputedStyle(track).position),
        caseScenePositions: [...document.querySelectorAll('.case-scene')].map(scene => getComputedStyle(scene).position),
        tabs: [...document.querySelectorAll('.mobile-choice-tabs')].map(tabs => ({display: getComputedStyle(tabs).display, count: tabs.querySelectorAll('button').length})),
        active: {
          stations: document.querySelectorAll('.a-bus .station.is-mobile-current').length,
          devices: document.querySelectorAll('.a-mj .device.is-mobile-current').length,
          models: document.querySelectorAll('.model-pie-grid > article.is-mobile-current').length
        },
        controls: controls.map(control => ({...control, display: getComputedStyle(document.querySelector(control.selector)).display}))
      };
    });

    const maxHeight = path ? 8900 : 8500;
    if (!state.marker?.includes('mobile-case-carousel') || state.overflow > 1 || state.scrollHeight > maxHeight) throw Error(`mobile frame regression ${path} ${JSON.stringify({viewport, state})}`);
    if (state.heroHeight > 620 || state.engineHeight < 275 || state.engineHeight > 295 || state.visibleEngineLayers !== 0 || state.engineAnimations.some(name => name !== 'none')) throw Error(`static hero regression ${path} ${JSON.stringify(state)}`);
    const overviewTerms = path ? ['UNDERSTAND', 'VERIFY', 'Human confirms', 'Write back'] : ['理解意圖', '核對資料', '人員確認', '回寫系統'];
    if (state.overview.display === 'none' || state.overview.width < viewport.width - 40 || state.overview.svgWidth < viewport.width - 70 || overviewTerms.some(term => !state.overview.text.includes(term))) throw Error(`overview regression ${path} ${JSON.stringify(state.overview)}`);
    if (state.partnerColumns !== 3 || state.partnerHeight > 260 || state.solutionColumns !== 2 || state.solutionHeights.some(height => height > 260)) throw Error(`phone grid regression ${path} ${JSON.stringify(state)}`);
    if ([...state.solutionPositions, ...state.adoptionPositions, ...state.phasePositions, ...state.caseTrackPositions].some(position => position === 'absolute' || position === 'sticky') || state.sectionPositions.some(position => position === 'sticky') || state.methodShellPosition !== 'sticky' || state.caseScenePositions.some(position => position !== 'sticky')) throw Error(`layered layout regression ${path} ${JSON.stringify(state)}`);
    if (Math.abs(state.casesTouch) > 2 || state.tabs.length !== 3 || state.tabs.some(tabs => tabs.display === 'none' || tabs.count !== 3) || Object.values(state.active).some(count => count !== 1)) throw Error(`mobile selector regression ${path} ${JSON.stringify(state)}`);
    if (state.controls.some(control => control.display !== 'none')) throw Error(`floating control regression ${path} ${JSON.stringify(state.controls)}`);

    for (const spec of [
      {track: '.case-journey-track:first-child', scene: '#case-southeast', tabs: '.mobile-case-tabs', item: '.station.is-mobile-current', name: 'bus'},
      {track: '.case-journey-track:last-child', scene: '#case-mj', tabs: '.mobile-field-tabs', item: '.device.is-mobile-current', name: 'mj'}
    ]) {
      const caseTrack = await page.locator(spec.track).evaluate((track) => {
        const scene = track.querySelector('.case-scene');
        return {
          top: track.getBoundingClientRect().top + scrollY - 70,
          range: track.offsetHeight - scene.offsetHeight,
          sceneHeight: scene.offsetHeight
        };
      });
      if (caseTrack.range < 325 || caseTrack.range > 365 || caseTrack.sceneHeight > viewport.height - 70) throw Error(`mobile case sizing regression ${path} ${JSON.stringify({viewport, spec, caseTrack})}`);
      for (const [index, progress] of [[0, 0], [1, .5], [2, 1]]) {
        await page.evaluate(({top, range, progress}) => scrollTo({top: top + (range * progress), behavior: 'instant'}), {...caseTrack, progress});
        await page.waitForFunction(({selector, expected}) => document.querySelector(selector)?.dataset.active === String(expected), {selector: spec.tabs, expected: index});
        const caseState = await page.locator(spec.scene).evaluate((scene, spec) => {
          const rect = scene.getBoundingClientRect();
          return {
            active: scene.querySelector(spec.tabs).dataset.active,
            current: scene.querySelectorAll(spec.item).length,
            top: rect.top,
            bottom: rect.bottom
          };
        }, spec);
        if (caseState.active !== String(index) || caseState.current !== 1 || Math.abs(caseState.top - 70) > 2 || caseState.bottom > viewport.height + 1) throw Error(`mobile case scroll regression ${path} ${JSON.stringify({viewport, spec, index, caseState})}`);
        await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-case-${spec.name}-${index + 1}.png`});
      }
      await page.locator(`${spec.tabs} button`).first().click();
      await page.waitForFunction(selector => document.querySelector(selector)?.dataset.active === '0', spec.tabs);
      await page.locator(`${spec.scene} .scene-inner`).evaluate(element => {
        const start = new Touch({identifier: 1, target: element, clientX: 300, clientY: 360});
        const end = new Touch({identifier: 1, target: element, clientX: 80, clientY: 360});
        element.dispatchEvent(new TouchEvent('touchstart', {touches: [start], bubbles: true}));
        element.dispatchEvent(new TouchEvent('touchend', {changedTouches: [end], bubbles: true}));
      });
      await page.waitForFunction(selector => document.querySelector(selector)?.dataset.active === '1', spec.tabs);
    }

    const fieldButtons = page.locator('.mobile-field-tabs button');
    for (let index = 0; index < await fieldButtons.count(); index += 1) {
      await fieldButtons.nth(index).click();
      const fit = await page.locator('#case-mj').evaluate((scene) => {
        const runway = scene.querySelector('.runway').getBoundingClientRect();
        const device = scene.querySelector('.device.is-mobile-current').getBoundingClientRect();
        const footer = scene.querySelector('.scene-foot').getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();
        return {
          active: scene.querySelectorAll('.device.is-mobile-current').length,
          selected: [...scene.querySelectorAll('.mobile-field-tabs button')].findIndex(button => button.getAttribute('aria-selected') === 'true'),
          runwayHeight: runway.height,
          deviceHeight: device.height,
          topClearance: device.top - runway.top,
          bottomClearance: runway.bottom - device.bottom,
          footerClearance: sceneRect.bottom - footer.bottom
        };
      });
      if (fit.active !== 1 || fit.selected !== index || fit.topClearance < 20 || fit.bottomClearance < 8 || fit.footerClearance < 8) throw Error(`mobile field fit regression ${path} ${JSON.stringify({viewport, index, fit})}`);
    }

    const methodTrack = await page.locator('#method').evaluate(section => {
      const shell = section.querySelector(':scope > .shell');
      return {
        top: section.getBoundingClientRect().top + scrollY - 70,
        range: section.offsetHeight - shell.offsetHeight
      };
    });
    for (const [index, progress] of [[0, 0], [1, .5], [2, 1]]) {
      await page.evaluate(({top, range, progress}) => scrollTo({top: top + (range * progress), behavior: 'instant'}), {...methodTrack, progress});
      await page.waitForFunction(expected => document.querySelector('.mobile-model-tabs')?.dataset.active === String(expected), index);
      const modelState = await page.locator('#method').evaluate(section => {
        const shell = section.querySelector(':scope > .shell').getBoundingClientRect();
        const card = section.querySelector('.model-pie-grid > article.is-mobile-current').getBoundingClientRect();
        const summary = section.querySelector('.model-pie-grid > article.is-mobile-current .model-summary').getBoundingClientRect();
        const tail = section.querySelector('.section-tail').getBoundingClientRect();
        return {
          active: section.querySelector('.mobile-model-tabs').dataset.active,
          current: section.querySelectorAll('.model-pie-grid > article.is-mobile-current').length,
          shell: {top: shell.top, bottom: shell.bottom},
          card: {top: card.top, bottom: card.bottom},
          tail: {top: tail.top, bottom: tail.bottom},
          cardBlank: card.bottom - summary.bottom,
          contentGap: tail.top - card.bottom
        };
      });
      if (modelState.active !== String(index) || modelState.current !== 1 || modelState.card.top < modelState.shell.top || modelState.tail.bottom > modelState.shell.bottom || modelState.cardBlank > 24 || modelState.contentGap < 8 || modelState.contentGap > 18) throw Error(`mobile model scroll regression ${path} ${JSON.stringify({viewport, index, modelState})}`);
      await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-model-${index + 1}.png`});
    }

    await page.locator('.mobile-model-tabs button').first().click();
    await page.waitForFunction(() => document.querySelector('.mobile-model-tabs')?.dataset.active === '0');
    await page.locator('.model-pie-grid').evaluate(element => {
      const start = new Touch({identifier: 1, target: element, clientX: 300, clientY: 360});
      const end = new Touch({identifier: 1, target: element, clientX: 80, clientY: 360});
      element.dispatchEvent(new TouchEvent('touchstart', {touches: [start], bubbles: true}));
      element.dispatchEvent(new TouchEvent('touchend', {changedTouches: [end], bubbles: true}));
    });
    await page.waitForFunction(() => document.querySelector('.mobile-model-tabs')?.dataset.active === '1');

    await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
    await page.waitForTimeout(80);
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-hero.png`});
    await page.locator('#solutions').scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-solutions.png`});
    await page.locator('#case-southeast').scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-case-bus.png`});
    await page.evaluate(() => { location.hash = 'case-mj'; });
    await page.waitForTimeout(80);
    const anchorFit = await page.locator('#case-mj').evaluate((scene) => {
      const nav = document.querySelector('.nav').getBoundingClientRect();
      const title = scene.querySelector('.case-headline').getBoundingClientRect();
      return {navBottom: nav.bottom, titleTop: title.top};
    });
    if (anchorFit.titleTop < anchorFit.navBottom + 20) throw Error(`mobile anchor overlap ${path} ${JSON.stringify({viewport, anchorFit})}`);
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
  visibleModels: [...document.querySelectorAll('.model-pie-grid > article')].filter(card => getComputedStyle(card).display !== 'none').length,
  visibleStations: [...document.querySelectorAll('.a-bus .station')].filter(card => getComputedStyle(card).display !== 'none').length,
  visibleDevices: [...document.querySelectorAll('.a-mj .device')].filter(card => getComputedStyle(card).display !== 'none').length,
  overviewHidden: getComputedStyle(document.querySelector('.mobile-engine-overview')).display === 'none',
  visibleEngineLayers: [...document.querySelectorAll('.engine-layer')].filter(layer => layer.getBoundingClientRect().width > 0).length
}));
if (desktopState.overflow > 1 || !desktopState.storyDesktop || desktopState.mobileLayout || !desktopState.tabsHidden || desktopState.solutionColumns !== 2 || desktopState.visibleModels !== 3 || desktopState.visibleStations !== 3 || desktopState.visibleDevices !== 3 || !desktopState.overviewHidden || desktopState.visibleEngineLayers !== 5) throw Error(`desktop regression ${JSON.stringify(desktopState)}`);
await desktop.screenshot({path: `${output}/desktop-1920-hero.png`});
await desktop.close();

const reducedPage = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
await reducedPage.goto(base, {waitUntil: 'networkidle'});
const reducedState = await reducedPage.evaluate(() => ({
  engineAnimation: getComputedStyle(document.querySelector('.engine-layer')).animationName,
  revealOpacity: getComputedStyle(document.querySelector('[data-mobile-reveal]')).opacity,
  stationAnimation: getComputedStyle(document.querySelector('.station.is-mobile-current')).animationName,
  deviceAnimation: getComputedStyle(document.querySelector('.device.is-mobile-current')).animationName
}));
if (reducedState.engineAnimation !== 'none' || reducedState.revealOpacity !== '1' || reducedState.stationAnimation !== 'none' || reducedState.deviceAnimation !== 'none') throw Error(`reduced motion regression ${JSON.stringify(reducedState)}`);
await reducedPage.close();

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify({results, desktopState}, null, 2)}\n`);
console.log(JSON.stringify({mobile: results.map(({path, viewport, scrollHeight, overflow, partnerHeight, solutionHeights}) => ({path, viewport, scrollHeight, overflow, partnerHeight, solutionHeights})), desktopState}, null, 2));
