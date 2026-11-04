import fs from 'node:fs';

const localPlaywright = new URL('../../playtime/node_modules/playwright/index.js', import.meta.url);
const worktreePlaywright = new URL('../../../playtime/node_modules/playwright/index.js', import.meta.url);
const playwright = (await import(fs.existsSync(localPlaywright) ? localPlaywright : worktreePlaywright)).default;

const base = process.env.HOMEPAGE_URL || 'http://127.0.0.1:8787/';
const output = process.env.HOMEPAGE_QA_OUTPUT || 'output/playwright/homepage-v76-outcomes';
fs.mkdirSync(output, { recursive: true });

const profiles = [
  { name: 'zh-desktop', path: '', viewport: { width: 1920, height: 1080 }, mobile: false, education: '職業學院' },
  { name: 'en-desktop', path: 'en/', viewport: { width: 1920, height: 1080 }, mobile: false, education: 'Vocational College' },
  { name: 'zh-mobile', path: '', viewport: { width: 390, height: 844 }, mobile: true, education: '職業學院' },
  { name: 'en-mobile', path: 'en/', viewport: { width: 390, height: 844 }, mobile: true, education: 'Vocational College' }
];

const results = [];
const browser = await playwright.chromium.launch({ headless: true });
try {
  for (const profile of profiles) {
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

    await page.goto(new URL(`${profile.path}#outcomes`, base).href, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForFunction(() => document.documentElement.classList.contains('full-styles-ready'), null, { timeout: 30_000 });
    await page.locator('#outcomes').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    const mapleVisible = await page.locator('.outcome-maplehome').isVisible();
    const educationInitiallyVisible = await page.locator('.outcome-education').isVisible();
    const marker = await page.locator('meta[name="timux-build"]').getAttribute('content');
    const mapleText = await page.locator('.outcome-maplehome').innerText();
    const educationText = await page.locator('.outcome-education').innerText();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (!mapleVisible || educationInitiallyVisible) throw new Error(`${profile.name}: default case is not MapleHome`);
    if (marker !== 'homepage-v76-real-outcomes-20261104') throw new Error(`${profile.name}: incorrect build marker ${marker}`);
    if (!mapleText.includes('30+') || !mapleText.includes('98%') || !educationText.includes('4,560')) throw new Error(`${profile.name}: required metrics are missing`);
    if (overflow > 1) throw new Error(`${profile.name}: horizontal overflow ${overflow}px`);
    await page.screenshot({ path: `${output}/${profile.name}-maplehome.png` });

    await page.locator('label[for="outcome-education"]').click();
    await page.waitForFunction(() => document.querySelector('#outcome-education')?.checked);
    const scrollXAfterSwitch = await page.evaluate(() => scrollX);
    const mapleAfter = await page.locator('.outcome-maplehome').isVisible();
    const educationAfter = await page.locator('.outcome-education').isVisible();
    if (mapleAfter || !educationAfter) throw new Error(`${profile.name}: education case did not activate`);
    await page.evaluate(() => scrollTo(0, scrollY));
    await page.locator('#outcomes').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${output}/${profile.name}-education.png` });

    if (errors.length) throw new Error(`${profile.name}: ${errors.join(' | ')}`);
    results.push({ profile: profile.name, marker, overflow, scrollXAfterSwitch, defaultCase: 'MapleHome', switchedCase: profile.education, consoleErrors: errors });
    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(`${output}/results.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
