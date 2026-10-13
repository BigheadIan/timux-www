import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v58-mobile-solution-carousel';
fs.mkdirSync(output, {recursive: true});
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
    await page.locator('#solutions').scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);

    const initial = await page.locator('#solutions').evaluate(section => {
      const grid = section.querySelector('.solution-grid');
      const cards = [...grid.querySelectorAll(':scope > article')];
      const gridRect = grid.getBoundingClientRect();
      const cardRects = cards.map(card => card.getBoundingClientRect());
      const shell = section.querySelector(':scope > .shell');
      const dots = [...section.querySelectorAll('.mobile-solution-dots i')];
      return {
        marker: document.querySelector('meta[name="timux-build"]')?.content,
        overflow: document.documentElement.scrollWidth - innerWidth,
        sectionHeight: section.offsetHeight,
        shellHeight: shell.offsetHeight,
        shellPosition: getComputedStyle(shell).position,
        gridDisplay: getComputedStyle(grid).display,
        overflowX: getComputedStyle(grid).overflowX,
        snap: getComputedStyle(grid).scrollSnapType,
        visibleCards: cards.filter(card => card.getBoundingClientRect().height > 0 && getComputedStyle(card).display !== 'none').length,
        cardWidths: cardRects.map(rect => Math.round(rect.width)),
        nextPeek: Math.round(gridRect.right - cardRects[1].left),
        active: section.querySelector('.mobile-solution-tabs')?.dataset.active,
        selected: [...section.querySelectorAll('.mobile-solution-tabs button')].findIndex(button => button.getAttribute('aria-selected') === 'true'),
        hiddenCards: cards.filter(card => card.getAttribute('aria-hidden') === 'true' || card.inert).length,
        hint: section.querySelector('.mobile-solution-swipe-label')?.textContent.replace(/\s+/g, ' ').trim(),
        dotCount: dots.length,
        activeDots: dots.filter(dot => dot.classList.contains('is-active')).length,
        progressDisplay: getComputedStyle(section.querySelector('.mobile-solution-progress')).display,
        scrollLeft: grid.scrollLeft
      };
    });

    const expectedHint = path ? 'Swipe to explore' : '左右滑動查看';
    if (!initial.marker?.includes('mobile-solution-carousel') || initial.overflow > 1 || initial.shellPosition === 'sticky' || initial.gridDisplay !== 'flex' || initial.overflowX !== 'auto' || !initial.snap.includes('x') || initial.visibleCards !== 4 || initial.cardWidths.some(width => width >= viewport.width - 18) || initial.nextPeek < 24 || initial.nextPeek > 70 || initial.active !== '0' || initial.selected !== 0 || initial.hiddenCards !== 0 || !initial.hint?.includes(expectedHint) || initial.dotCount !== 4 || initial.activeDots !== 1 || initial.progressDisplay === 'none' || initial.scrollLeft !== 0 || Math.abs(initial.sectionHeight - initial.shellHeight) > 2) {
      throw Error(`initial solution carousel regression ${path} ${JSON.stringify({viewport, initial})}`);
    }

    const solutionTop = await page.locator('#solutions').evaluate(section => section.getBoundingClientRect().top + scrollY);
    await page.evaluate(top => scrollTo({top: top + 240, behavior: 'instant'}), solutionTop);
    await page.waitForTimeout(80);
    const afterVerticalScroll = await page.locator('#solutions').evaluate(section => ({
      active: section.querySelector('.mobile-solution-tabs')?.dataset.active,
      scrollLeft: section.querySelector('.solution-grid').scrollLeft
    }));
    if (afterVerticalScroll.active !== '0' || afterVerticalScroll.scrollLeft !== 0) throw Error(`vertical scroll changed solution ${path} ${JSON.stringify({viewport, afterVerticalScroll})}`);

    await page.locator('#solutions').scrollIntoViewIfNeeded();
    await page.locator('.mobile-solution-tabs button').nth(2).click();
    await page.waitForFunction(() => document.querySelector('.mobile-solution-tabs')?.dataset.active === '2');
    await page.waitForTimeout(500);
    const afterTab = await page.locator('#solutions').evaluate(section => {
      const grid = section.querySelector('.solution-grid');
      const cards = [...grid.querySelectorAll(':scope > article')];
      const target = cards[2].offsetLeft - cards[0].offsetLeft;
      return {
        active: section.querySelector('.mobile-solution-tabs')?.dataset.active,
        selected: [...section.querySelectorAll('.mobile-solution-tabs button')].findIndex(button => button.getAttribute('aria-selected') === 'true'),
        activeDot: [...section.querySelectorAll('.mobile-solution-dots i')].findIndex(dot => dot.classList.contains('is-active')),
        scrollLeft: grid.scrollLeft,
        target
      };
    });
    if (afterTab.active !== '2' || afterTab.selected !== 2 || afterTab.activeDot !== 2 || Math.abs(afterTab.scrollLeft - afterTab.target) > 4) throw Error(`tab selection regression ${path} ${JSON.stringify({viewport, afterTab})}`);

    await page.locator('.mobile-solution-tabs button').first().click();
    await page.waitForTimeout(500);
    const gridBox = await page.locator('.solution-grid').boundingBox();
    const cdp = await context.newCDPSession(page);
    const y = gridBox.y + Math.min(gridBox.height - 30, 150);
    const startX = gridBox.x + gridBox.width - 28;
    const endX = gridBox.x + 42;
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: startX, y}]});
    for (let step = 1; step <= 6; step += 1) {
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: startX + ((endX - startX) * step / 6), y}]});
    }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await page.waitForFunction(() => document.querySelector('.mobile-solution-tabs')?.dataset.active === '1');
    await page.waitForTimeout(180);
    const afterSwipe = await page.locator('#solutions').evaluate(section => ({
      active: section.querySelector('.mobile-solution-tabs')?.dataset.active,
      selected: [...section.querySelectorAll('.mobile-solution-tabs button')].findIndex(button => button.getAttribute('aria-selected') === 'true'),
      activeDot: [...section.querySelectorAll('.mobile-solution-dots i')].findIndex(dot => dot.classList.contains('is-active')),
      scrollLeft: section.querySelector('.solution-grid').scrollLeft
    }));
    if (afterSwipe.active !== '1' || afterSwipe.selected !== 1 || afterSwipe.activeDot !== 1 || afterSwipe.scrollLeft < 250) throw Error(`touch swipe regression ${path} ${JSON.stringify({viewport, afterSwipe})}`);

    await page.screenshot({path: `${output}/${path ? 'en-' : 'zh-'}${viewport.width}-solutions.png`});
    if (errors.length) throw Error(`runtime regression ${path} ${JSON.stringify(errors)}`);
    results.push({path: path || '/', viewport, initial, afterTab, afterSwipe});
    await context.close();
  }
}

const desktop = await browser.newPage({viewport: {width: 1920, height: 1080}});
await desktop.goto(base, {waitUntil: 'networkidle'});
const desktopState = await desktop.locator('#solutions').evaluate(section => ({
  overflow: document.documentElement.scrollWidth - innerWidth,
  tabs: getComputedStyle(section.querySelector('.mobile-solution-tabs')).display,
  progress: getComputedStyle(section.querySelector('.mobile-solution-progress')).display,
  visibleCards: [...section.querySelectorAll('.solution-card')].filter(card => getComputedStyle(card).display !== 'none').length,
  columns: getComputedStyle(section.querySelector('.solution-grid')).gridTemplateColumns.split(' ').length
}));
if (desktopState.overflow > 1 || desktopState.tabs !== 'none' || desktopState.progress !== 'none' || desktopState.visibleCards !== 4 || desktopState.columns !== 2) throw Error(`desktop regression ${JSON.stringify(desktopState)}`);
await desktop.close();

await browser.close();
fs.writeFileSync(`${output}/results.json`, `${JSON.stringify({results, desktopState}, null, 2)}\n`);
console.log(JSON.stringify({results: results.map(result => ({path: result.path, viewport: result.viewport, swipe: result.afterSwipe})), desktopState}, null, 2));
