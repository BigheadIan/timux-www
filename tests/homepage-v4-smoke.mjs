import playwright from "../../playtime/node_modules/playwright/index.js";
import fs from "node:fs";

const { chromium } = playwright;
const baseURL = process.env.HOMEPAGE_URL || "http://127.0.0.1:8787/";
const outputDir = process.env.HOMEPAGE_QA_OUTPUT || "../output/timux-homepage-v4-20260730";
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = {};

async function inspect(viewport, name) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });

  const marker = await page.locator('meta[name="timux-build"]').getAttribute("content");
  if (marker !== "homepage-v4-interactive-cases-20260730") {
    throw new Error(`${name}: unexpected build marker ${marker}`);
  }

  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    html: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  if (overflow.body > 1 || overflow.html > 1) {
    throw new Error(`${name}: horizontal overflow ${JSON.stringify(overflow)}`);
  }

  const fontAudit = await page.evaluate(() => {
    const failures = [];
    for (const element of document.querySelectorAll("body *")) {
      const directText = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent.trim())
        .join(" ");
      if (!directText) continue;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0) continue;
      const size = Number.parseFloat(style.fontSize);
      if (size < 14) failures.push({ tag: element.tagName, className: element.className, size, text: directText.slice(0, 60) });
    }
    return failures;
  });
  if (fontAudit.length) throw new Error(`${name}: text below 14px ${JSON.stringify(fontAudit.slice(0, 8))}`);

  const heroLines = await page.locator(".hero h1 .line").allTextContents();
  if (heroLines.join("|") !== "讓 AI 真正|進入工作。") {
    throw new Error(`${name}: hero line break regression ${heroLines.join("|")}`);
  }

  const agentSize = await page.locator(".bubble").first().evaluate((element) => getComputedStyle(element).fontSize);
  if (agentSize !== "18px") throw new Error(`${name}: agent font is ${agentSize}`);

  const starters = await page.locator("#starterQuestions .chip").allTextContents();
  if (starters.length !== 3 || new Set(starters).size !== 3) {
    throw new Error(`${name}: starter questions invalid ${JSON.stringify(starters)}`);
  }

  const images = await page.locator("#cases img").evaluateAll((elements) =>
    elements.map((image) => ({ src: image.getAttribute("src"), complete: image.complete, width: image.naturalWidth }))
  );
  if (images.some((image) => !image.complete || image.width < 1)) {
    throw new Error(`${name}: broken case image ${JSON.stringify(images)}`);
  }

  await page.screenshot({ path: `${outputDir}/${name}-hero.png`, fullPage: false });
  await page.locator("#cases").screenshot({ path: `${outputDir}/${name}-cases.png` });

  results[name] = { overflow, agentSize, starters, images: images.length, consoleErrors };
  await page.close();
}

await inspect({ width: 1440, height: 1100 }, "desktop");
await inspect({ width: 390, height: 844 }, "mobile");

const interactionPage = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const interactionErrors = [];
interactionPage.on("console", (message) => {
  if (message.type() === "error") interactionErrors.push(message.text());
});
await interactionPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
const firstStarter = interactionPage.locator("#starterQuestions .chip").first();
const firstQuestion = await firstStarter.textContent();
await firstStarter.click();
await interactionPage.locator(".message.user").filter({ hasText: firstQuestion }).waitFor({ timeout: 5000 });
await interactionPage.locator(".message.assistant .bubble:not(.typing)").nth(1).waitFor({ timeout: 30000 });
await interactionPage.locator("#agentInput").fill("我們想先做內部知識助手，文件很多，怎麼開始？");
await interactionPage.locator("#agentForm").evaluate((form) => form.requestSubmit());
await interactionPage.locator(".message.user").filter({ hasText: "我們想先做內部知識助手" }).waitFor({ timeout: 5000 });
await interactionPage.locator(".message.assistant .bubble:not(.typing)").nth(2).waitFor({ timeout: 30000 });

const interaction = {
  firstQuestion,
  assistantMessages: await interactionPage.locator(".message.assistant .bubble:not(.typing)").count(),
  userMessages: await interactionPage.locator(".message.user").count(),
  starterRemoved: (await interactionPage.locator("#starterArea").count()) === 0,
  consoleErrors: interactionErrors
};
if (interaction.assistantMessages < 3 || interaction.userMessages !== 2 || !interaction.starterRemoved) {
  throw new Error(`interaction flow failed ${JSON.stringify(interaction)}`);
}
await interactionPage.screenshot({ path: `${outputDir}/desktop-agent-conversation.png`, fullPage: false });
results.interaction = interaction;

await browser.close();
console.log(JSON.stringify(results, null, 2));
