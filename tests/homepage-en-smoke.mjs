import playwright from '../../playtime/node_modules/playwright/index.js';
import fs from 'node:fs';

const rootURL = process.env.HOMEPAGE_ROOT_URL || 'http://127.0.0.1:8787/';
const englishURL = new URL('/en/', rootURL).href;
const output = process.env.HOMEPAGE_EN_QA_OUTPUT || 'output/playwright/homepage-en';
fs.mkdirSync(output, { recursive: true });

const browser = await playwright.chromium.launch({ headless: true });
const results = {};

async function createPage(viewport) {
  const page = await browser.newPage({ viewport });
  await page.route('https://ai-customer-service.timux.site/api/widget.js*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: ''
  }));
  return page;
}

for (const [name, viewport] of Object.entries({ desktop: { width: 1920, height: 1080 }, mobile: { width: 390, height: 844 } })) {
  const page = await createPage(viewport);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(englishURL, { waitUntil: 'networkidle', timeout: 30000 });

  const audit = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    marker: document.querySelector('meta[name="timux-build"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    alternates: [...document.querySelectorAll('link[rel="alternate"]')].map((link) => [link.hreflang, link.href]),
    title: document.title,
    h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim(),
    activeLanguage: document.querySelector('.intl-lang .is-active, .intl-mobile-lang .is-active')?.textContent.trim(),
    navPrimary: [...document.querySelectorAll('.nav-directory .intl-nav-zh')].map((element) => element.textContent.trim()),
    overflow: document.documentElement.scrollWidth - innerWidth,
    untranslatedVisible: [...document.querySelectorAll('body *')].filter((element) => {
      if (element.closest('.intl-nav-en,.intl-mobile-summary small,.intl-section-en,.intl-lang,.intl-mobile-lang')) return false;
      if (!/[\u3400-\u9fff]/.test(element.textContent || '')) return false;
      if ([...element.children].some((child) => /[\u3400-\u9fff]/.test(child.textContent || ''))) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }).map((element) => element.textContent.trim()).slice(0, 10)
  }));

  if (audit.lang !== 'en' || audit.marker !== 'homepage-en-v5-partner-case-links-20261009' ||
      audit.canonical !== 'https://www.timux.site/en/' || audit.title !== 'Timux Technology | Enterprise AI Adoption & Execution' ||
      audit.h1 !== 'Bring AI into real work,and get work done.' || audit.activeLanguage !== 'EN' ||
      audit.navPrimary.join('|') !== 'Solutions|Case Studies|AI Adoption' || audit.overflow > 1 ||
      audit.untranslatedVisible.length || !audit.alternates.some(([lang, href]) => lang === 'zh-Hant' && href === 'https://www.timux.site/')) {
    throw new Error(`${name}: English page audit failed ${JSON.stringify(audit)}`);
  }

  await page.screenshot({ path: `${output}/${name}-hero.png`, fullPage: false });

  await page.locator('#case-southeast').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const replay = await page.locator('[data-case-replay]').evaluate((element) => ({
    stage: element.dataset.replayStage,
    sequence: element.dataset.replaySequence,
    status: element.querySelector('[data-replay-status]')?.textContent.trim(),
    visibleMessages: [...element.querySelectorAll('.replay-message.is-visible')].length
  }));
  if (!replay.sequence || /[\u3400-\u9fff]/.test(replay.status || '')) throw new Error(`${name}: English replay invalid ${JSON.stringify(replay)}`);
  await page.screenshot({ path: `${output}/${name}-case-replay.png`, fullPage: false });

  if (name === 'desktop') {
    await page.locator('#workflow').fill('Customer-service handoff');
    await page.locator('#context').fill('Agents repeat questions after escalation.');
    await page.locator('#contactDraft button[type="submit"]').click();
    const summary = await page.locator('#summary').inputValue();
    if (!summary.startsWith('Hi Ian,') || !summary.includes('Customer-service handoff')) throw new Error(`English contact summary invalid: ${summary}`);
    await page.screenshot({ path: `${output}/${name}-contact.png`, fullPage: false });
  }

  if (errors.length) throw new Error(`${name}: page errors ${JSON.stringify(errors)}`);
  results[name] = audit;
  await page.close();
}

const switchPage = await createPage({ width: 1920, height: 1080 });
await switchPage.goto(new URL('/#cases', rootURL).href, { waitUntil: 'networkidle' });
await switchPage.locator('.intl-lang a[hreflang="en"]').click();
await switchPage.waitForURL(/\/en\/#cases$/);
const toEnglish = switchPage.url();
await switchPage.locator('.intl-lang a[hreflang="zh-Hant"]').click();
await switchPage.waitForURL(/\/#cases$/);
const toChinese = switchPage.url();
if (!toEnglish.endsWith('/en/#cases') || !toChinese.endsWith('/#cases')) throw new Error(`Language hash preservation failed: ${JSON.stringify({ toEnglish, toChinese })}`);
results.switch = { toEnglish, toChinese };
await switchPage.close();

await browser.close();
console.log(JSON.stringify(results, null, 2));
