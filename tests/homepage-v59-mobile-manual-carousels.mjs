import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v59-mobile-manual-carousels';
fs.mkdirSync(output, {recursive: true});

const modules = [
  {name: 'engine', section: '.engine-track', surface: '[data-mobile-carousel="engine"]', count: 5},
  {name: 'solutions', section: '#solutions', surface: '[data-mobile-carousel="solutions"]', count: 4},
  {name: 'adoption', section: '#adoption', surface: '[data-mobile-carousel="adoption"]', count: 3},
  {name: 'southeast', section: '#case-southeast', surface: '[data-mobile-carousel="southeast"]', count: 3},
  {name: 'mj', section: '#case-mj', surface: '[data-mobile-carousel="mj"]', count: 3},
  {name: 'principles', section: '#method', surface: '[data-mobile-carousel="principles"]', count: 3}
];

const browser = await playwright.chromium.launch({headless: true});
const results = [];

for (const path of ['', 'en/']) {
  for (const viewport of [{width: 390, height: 844}, {width: 360, height: 740}]) {
    const context = await browser.newContext({viewport, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    await page.goto(`${base}${path}`, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => document.documentElement.classList.contains('mobile-layout-v43'));

    const audit = await page.evaluate(specs => ({
      marker: document.querySelector('meta[name="timux-build"]')?.content,
      pageOverflow: document.documentElement.scrollWidth - innerWidth,
      modules: specs.map(spec => {
        const section = document.querySelector(spec.section);
        const surface = document.querySelector(spec.surface);
        const items = [...surface.querySelectorAll(':scope > .mobile-swipe-card')];
        const firstRect = items[0].getBoundingClientRect();
        const secondRect = items[1].getBoundingClientRect();
        const surfaceRect = surface.getBoundingClientRect();
        const progress = surface.nextElementSibling;
        const sticky = [section, section.querySelector(':scope > .shell'), section.querySelector('.case-scene')]
          .filter(Boolean).some(element => getComputedStyle(element).position === 'sticky');
        return {
          name: spec.name,
          expected: spec.count,
          display: getComputedStyle(surface).display,
          overflowX: getComputedStyle(surface).overflowX,
          snap: getComputedStyle(surface).scrollSnapType,
          itemCount: items.length,
          visibleCount: items.filter(item => getComputedStyle(item).display !== 'none' && item.getBoundingClientRect().height > 0).length,
          cardWidth: Math.round(firstRect.width),
          surfaceWidth: Math.round(surfaceRect.width),
          nextPeek: Math.round(surfaceRect.right - secondRect.left),
          scrollLeft: surface.scrollLeft,
          sticky,
          progressDisplay: getComputedStyle(progress).display,
          dotCount: progress.querySelectorAll('.mobile-carousel-dots i').length,
          activeDot: [...progress.querySelectorAll('.mobile-carousel-dots i')].findIndex(dot => dot.classList.contains('is-active')),
          selected: Number(section.querySelector('.mobile-choice-tabs')?.dataset.active ?? -1)
        };
      })
    }), modules);

    const expectedMarker = 'homepage-v62-scroll-performance-20261015';
    if (audit.marker !== expectedMarker || audit.pageOverflow > 1) throw Error(`page shell regression ${path} ${JSON.stringify({viewport, audit})}`);
    for (const state of audit.modules) {
      if (state.display !== 'flex' || state.overflowX !== 'auto' || !state.snap.includes('x') || state.itemCount !== state.expected || state.visibleCount !== state.expected || state.cardWidth >= state.surfaceWidth - 18 || state.nextPeek < 20 || state.sticky || state.progressDisplay === 'none' || state.dotCount !== state.expected || state.activeDot !== 0 || state.selected !== 0 || state.scrollLeft !== 0) {
        throw Error(`initial carousel regression ${path} ${JSON.stringify({viewport, state})}`);
      }
      if (state.name === 'mj' && (state.cardWidth / state.surfaceWidth < .68 || state.cardWidth / state.surfaceWidth > .8)) {
        throw Error(`MJ card proportion regression ${path} ${JSON.stringify({viewport, state})}`);
      }
    }

    for (const spec of modules) {
      const surface = page.locator(spec.surface);
      await surface.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
      const beforeVertical = await surface.evaluate((element, sectionSelector) => ({left: element.scrollLeft, active: document.querySelector(sectionSelector)?.querySelector('.mobile-choice-tabs')?.dataset.active}), spec.section);
      await page.evaluate(() => scrollBy({top: 110, behavior: 'instant'}));
      await page.waitForTimeout(80);
      const afterVertical = await surface.evaluate((element, sectionSelector) => ({left: element.scrollLeft, active: document.querySelector(sectionSelector)?.querySelector('.mobile-choice-tabs')?.dataset.active}), spec.section);
      if (beforeVertical.left !== afterVertical.left || beforeVertical.active !== afterVertical.active) throw Error(`vertical scroll changed ${spec.name} ${path} ${JSON.stringify({viewport, beforeVertical, afterVertical})}`);

      const tabs = page.locator(`${spec.section} .mobile-choice-tabs`).first();
      await tabs.locator('button').nth(1).click();
      await page.waitForTimeout(450);
      const afterTab = await surface.evaluate(element => {
        const items = [...element.querySelectorAll(':scope > .mobile-swipe-card')];
        const target = items[1].offsetLeft - items[0].offsetLeft;
        const progress = element.nextElementSibling;
        return {
          left: element.scrollLeft,
          target,
          activeDot: [...progress.querySelectorAll('i')].findIndex(dot => dot.classList.contains('is-active'))
        };
      });
      const selected = await tabs.evaluate(element => ({active: element.dataset.active, selected: [...element.querySelectorAll('button')].findIndex(button => button.getAttribute('aria-selected') === 'true')}));
      if (selected.active !== '1' || selected.selected !== 1 || afterTab.activeDot !== 1 || Math.abs(afterTab.left - afterTab.target) > 5) throw Error(`tab selection regression ${spec.name} ${path} ${JSON.stringify({viewport, selected, afterTab})}`);
      if (spec.name === 'mj') {
        await tabs.locator('button').last().click();
        await page.waitForTimeout(450);
        const last = await surface.evaluate((element, sectionSelector) => {
          const items = [...element.querySelectorAll(':scope > .mobile-swipe-card')];
          const progress = element.nextElementSibling;
          return {
            left: element.scrollLeft,
            target: items.at(-1).offsetLeft - items[0].offsetLeft,
            max: element.scrollWidth - element.clientWidth,
            active: document.querySelector(sectionSelector)?.querySelector('.mobile-choice-tabs')?.dataset.active,
            activeDot: [...progress.querySelectorAll('i')].findIndex(dot => dot.classList.contains('is-active'))
          };
        }, spec.section);
        if (last.active !== '2' || last.activeDot !== 2 || Math.abs(last.left - last.max) > 5 || last.target - last.left > 24) throw Error(`MJ last-card tab regression ${path} ${JSON.stringify({viewport, last})}`);
      }
      await tabs.locator('button').first().click();
      await page.waitForTimeout(350);
    }

    if (!path && viewport.width === 390) {
      const cdp = await context.newCDPSession(page);
      for (const spec of modules) {
        const surface = page.locator(spec.surface);
        await surface.scrollIntoViewIfNeeded();
        await page.screenshot({path: `${output}/zh-390-${spec.name}.png`});
        const box = await surface.boundingBox();
        const y = box.y + Math.min(box.height - 20, Math.max(30, box.height / 2));
        const startX = box.x + box.width - 28;
        const endX = startX - Math.min(180, box.width * .55);
        let previousLeft = 0;
        for (let expectedIndex = 1; expectedIndex < spec.count; expectedIndex += 1) {
          await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: startX, y}]});
          for (let step = 1; step <= 7; step += 1) {
            await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: startX + ((endX - startX) * step / 7), y}]});
          }
          await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
          await page.waitForTimeout(500);
          const swipe = await surface.evaluate((element, sectionSelector) => ({left: element.scrollLeft, active: document.querySelector(sectionSelector)?.querySelector('.mobile-choice-tabs')?.dataset.active}), spec.section);
          if (swipe.active !== String(expectedIndex) || swipe.left < previousLeft + 60) throw Error(`touch swipe regression ${spec.name} step ${expectedIndex} ${JSON.stringify({swipe, previousLeft})}`);
          results.push({path: '/', viewport, module: spec.name, step: expectedIndex, swipe});
          previousLeft = swipe.left;
          if (spec.name === 'mj' && expectedIndex === spec.count - 1) {
            await page.waitForFunction(() => [...document.querySelectorAll('[data-mobile-carousel="mj"] img')].every(image => image.complete && image.naturalWidth > 0));
            await page.screenshot({path: `${output}/zh-390-mj-last.png`});
          }
        }
        await page.locator(`${spec.section} .mobile-choice-tabs button`).first().click();
        await page.waitForTimeout(350);
      }
      await cdp.detach();
    }

    await page.locator('#method').scrollIntoViewIfNeeded();
    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-principles.png`});
    if (errors.length) throw Error(`runtime regression ${path} ${JSON.stringify(errors)}`);
    await context.close();
  }
}

const desktop = await browser.newPage({viewport: {width: 1920, height: 1080}});
await desktop.goto(base, {waitUntil: 'networkidle'});
const desktopState = await desktop.evaluate(specs => ({
  overflow: document.documentElement.scrollWidth - innerWidth,
  modules: specs.map(spec => {
    const section = document.querySelector(spec.section);
    const surface = document.querySelector(spec.surface);
    return {
      name: spec.name,
      tabs: getComputedStyle(section.querySelector('.mobile-choice-tabs')).display,
      progress: getComputedStyle(surface.nextElementSibling).display,
      visibleCount: [...surface.querySelectorAll(':scope > .mobile-swipe-card')].filter(item => getComputedStyle(item).display !== 'none').length,
      expected: spec.count
    };
  })
}), modules);
if (desktopState.overflow > 1 || desktopState.modules.some(state => state.tabs !== 'none' || state.progress !== 'none' || state.visibleCount !== state.expected)) throw Error(`desktop regression ${JSON.stringify(desktopState)}`);
await desktop.close();

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify({results, desktopState}, null, 2)}\n`);
console.log(JSON.stringify({results, desktopState}, null, 2));
