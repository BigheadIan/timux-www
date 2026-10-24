import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v74-scene-copy';
fs.mkdirSync(output, { recursive: true });

const profiles = [
  { name: 'zh-mobile', path: '', viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'en-mobile', path: 'en/', viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'zh-small-mobile', path: '', viewport: { width: 360, height: 740 }, mobile: true },
  { name: 'zh-desktop', path: '', viewport: { width: 1920, height: 1080 }, mobile: false }
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
    const errors = [];
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await page.route('https://ai-customer-service.timux.site/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));

    await page.goto(new URL(profile.path, base).href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForFunction(() => document.documentElement.classList.contains('full-scripts-ready'), null, { timeout: 30_000 });
    await page.waitForFunction(() => document.querySelector('.case-switcher-panel.is-active img')?.naturalWidth > 0);

    const heroOne = await page.evaluate(() => {
      const panel = document.querySelector('.case-switcher-panel.is-active');
      const picture = panel.querySelector('picture');
      const image = panel.querySelector('img');
      const pictureStyle = getComputedStyle(picture);
      return {
        src: image.currentSrc,
        picture: picture.getBoundingClientRect().toJSON(),
        objectFit: getComputedStyle(image).objectFit,
        objectPosition: getComputedStyle(image).objectPosition,
        picturePosition: pictureStyle.position
      };
    });

    await page.locator('.case-switcher-tab[data-case-index="1"]').click();
    await page.waitForFunction(() => document.querySelectorAll('.case-switcher-panel img')[1]?.naturalWidth > 0);
    const heroTwo = await page.locator('.case-switcher-panel img').nth(1).evaluate(image => image.currentSrc);

    await page.locator('#adoption').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#adoption')?.classList.contains('is-scene-image-ready'));
    const adoption = await page.locator('.adoption-scene-step').evaluateAll(steps => steps.map(step => {
      const style = getComputedStyle(step, '::before');
      return { backgroundSize: style.backgroundSize, backgroundPosition: style.backgroundPosition };
    }));

    if (profile.mobile) {
      const expectedHeroOne = 'manufacturing-order-delivery-mobile-wide.webp';
      const expectedHeroTwo = 'commercial-property-repair-mobile-wide.webp';
      if (!heroOne.src.endsWith(expectedHeroOne) || !heroTwo.endsWith(expectedHeroTwo)) {
        throw new Error(`${profile.name} mobile hero source mismatch ${JSON.stringify({ heroOne, heroTwo })}`);
      }
      if (heroOne.picturePosition !== 'absolute' || heroOne.picture.width < profile.viewport.width - 1 || heroOne.picture.height < 220 || heroOne.picture.height > 260) {
        throw new Error(`${profile.name} mobile hero scene window mismatch ${JSON.stringify(heroOne)}`);
      }
      const expectedPositions = ['0%', '50%', '100%'];
      adoption.forEach((step, index) => {
        if (!step.backgroundSize.includes('300% 100%') || !step.backgroundPosition.includes(expectedPositions[index])) {
          throw new Error(`${profile.name} adoption crop mismatch ${JSON.stringify({ index, step })}`);
        }
      });
    } else if (!heroOne.src.endsWith('manufacturing-order-delivery-1600.webp')) {
      throw new Error(`${profile.name} desktop hero source changed ${JSON.stringify(heroOne)}`);
    }

    const pageState = await page.evaluate(() => ({
      marker: document.querySelector('meta[name="timux-build"]')?.content,
      overflow: document.documentElement.scrollWidth - innerWidth
    }));
    if (pageState.marker !== 'homepage-v74-scene-copy-alignment-20261024' || pageState.overflow > 1 || errors.length) {
      throw new Error(`${profile.name} page regression ${JSON.stringify({ pageState, errors })}`);
    }

    await page.screenshot({ path: `${output}/${profile.name}-adoption.png` });
    results.push({ profile, heroOne, heroTwo, adoption, pageState, errors });
    await context.close();
  } finally {
    await browser.close();
  }
}

fs.writeFileSync(`${output}/results.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results.map(({ profile, heroOne, adoption, pageState }) => ({
  name: profile.name,
  hero: heroOne.src,
  sceneHeight: heroOne.picture.height,
  adoption,
  marker: pageState.marker
})), null, 2));
