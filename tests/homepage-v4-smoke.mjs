import playwright from "../../playtime/node_modules/playwright/index.js";
import fs from "node:fs";

const { chromium } = playwright;
const baseURL = process.env.HOMEPAGE_URL || "http://127.0.0.1:8787/";
const outputDir = process.env.HOMEPAGE_QA_OUTPUT || "../output/timux-homepage-v4-20260730";
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = {};

async function installSpeechMock(page) {
  await page.addInitScript(() => {
    class MockSpeechRecognition {
      constructor() {
        this.lang = "zh-TW";
        this.continuous = false;
        this.interimResults = true;
      }

      start() {
        this.onstart?.();
        setTimeout(() => {
          const result = { 0: { transcript: "我們想用語音了解 AI 導入" }, isFinal: true, length: 1 };
          this.onresult?.({ resultIndex: 0, results: Object.assign([result], { length: 1 }) });
        }, 20);
      }

      stop() {
        setTimeout(() => this.onend?.(), 0);
      }
    }
    window.SpeechRecognition = MockSpeechRecognition;
  });
}

async function inspect(viewport, name) {
  const page = await browser.newPage({ viewport });
  await installSpeechMock(page);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });

  const marker = await page.locator('meta[name="timux-build"]').getAttribute("content");
  if (marker !== "homepage-v5-voice-agent-20260817") {
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

  const voiceControls = await page.evaluate(() => ({
    micDisabled: document.querySelector("#micButton").disabled,
    micSize: document.querySelector("#micButton").getBoundingClientRect().width,
    ttsPressed: document.querySelector("#ttsButton").getAttribute("aria-pressed"),
    status: document.querySelector("#voiceStatus").textContent.trim()
  }));
  if (voiceControls.micDisabled || voiceControls.micSize < 44 || voiceControls.ttsPressed !== "true") {
    throw new Error(`${name}: invalid voice controls ${JSON.stringify(voiceControls)}`);
  }

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
  await page.locator(".chat-compose").screenshot({ path: `${outputDir}/${name}-voice-controls.png` });
  await page.locator("#cases").screenshot({ path: `${outputDir}/${name}-cases.png` });
  if (consoleErrors.length) throw new Error(`${name}: console errors ${JSON.stringify(consoleErrors)}`);

  results[name] = { overflow, agentSize, starters, images: images.length, voiceControls, consoleErrors };
  await page.close();
}

await inspect({ width: 1440, height: 1100 }, "desktop");
await inspect({ width: 390, height: 844 }, "mobile");
await inspect({ width: 360, height: 740 }, "small-mobile");

const interactionPage = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await installSpeechMock(interactionPage);
const interactionErrors = [];
const ttsResponses = [];
const failedResponses = [];
interactionPage.on("console", (message) => {
  if (message.type() === "error") interactionErrors.push(message.text());
});
interactionPage.on("response", (response) => {
  if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
  if (response.url().includes("/api/widget/tts")) {
    ttsResponses.push({ status: response.status(), contentType: response.headers()["content-type"] || "" });
  }
});
await interactionPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
await interactionPage.locator("#ttsButton").click();
if (await interactionPage.locator("#ttsButton").getAttribute("aria-pressed") !== "false") {
  throw new Error("TTS toggle did not turn off");
}
const firstStarter = interactionPage.locator("#starterQuestions .chip").first();
const firstQuestion = await firstStarter.textContent();
await firstStarter.click();
await interactionPage.locator(".message.user").filter({ hasText: firstQuestion }).waitFor({ timeout: 5000 });
await interactionPage.locator(".message.assistant .bubble:not(.typing)").nth(1).waitFor({ timeout: 30000 });
await interactionPage.locator("#agentInput").fill("我們想先做內部知識助手，文件很多，怎麼開始？");
await interactionPage.locator("#agentForm").evaluate((form) => form.requestSubmit());
await interactionPage.locator(".message.user").filter({ hasText: "我們想先做內部知識助手" }).waitFor({ timeout: 5000 });
await interactionPage.locator(".message.assistant .bubble:not(.typing)").nth(2).waitFor({ timeout: 30000 });
await interactionPage.locator("#micButton").click();
await interactionPage.locator(".message.user").filter({ hasText: "我們想用語音了解 AI 導入" }).waitFor({ timeout: 5000 });
await interactionPage.locator(".message.assistant .bubble:not(.typing)").nth(3).waitFor({ timeout: 30000 });
await interactionPage.locator("#ttsButton").click();
await interactionPage.locator("#agentInput").fill("請用一句話介紹 Timux");
const ttsResponsePromise = interactionPage.waitForResponse((response) => response.url().includes("/api/widget/tts") && response.status() === 200, { timeout: 30000 });
await interactionPage.locator("#agentForm").evaluate((form) => form.requestSubmit());
await interactionPage.locator(".message.assistant .bubble:not(.typing)").nth(4).waitFor({ timeout: 30000 });
await ttsResponsePromise;

const interaction = {
  firstQuestion,
  assistantMessages: await interactionPage.locator(".message.assistant .bubble:not(.typing)").count(),
  userMessages: await interactionPage.locator(".message.user").count(),
  voiceQuestionSent: await interactionPage.locator(".message.user").filter({ hasText: "我們想用語音了解 AI 導入" }).count(),
  ttsEnabled: await interactionPage.locator("#ttsButton").getAttribute("aria-pressed") === "true",
  ttsResponses,
  failedResponses,
  starterRemoved: (await interactionPage.locator("#starterArea").count()) === 0,
  consoleErrors: interactionErrors
};
if (interaction.assistantMessages < 5 || interaction.userMessages !== 4 || interaction.voiceQuestionSent !== 1 || !interaction.ttsEnabled || interaction.ttsResponses.some((response) => response.status !== 200 || !response.contentType.includes("audio/")) || interaction.failedResponses.length || interaction.consoleErrors.length || !interaction.starterRemoved) {
  throw new Error(`interaction flow failed ${JSON.stringify(interaction)}`);
}
await interactionPage.screenshot({ path: `${outputDir}/desktop-agent-conversation.png`, fullPage: false });
results.interaction = interaction;

const fallbackPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await fallbackPage.addInitScript(() => {
  Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: undefined });
  Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: undefined });
});
await fallbackPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
const fallback = await fallbackPage.evaluate(() => ({
  micDisabled: document.querySelector("#micButton").disabled,
  ttsEnabled: document.querySelector("#ttsButton").getAttribute("aria-pressed") === "true",
  status: document.querySelector("#voiceStatus").textContent.trim()
}));
if (!fallback.micDisabled || !fallback.ttsEnabled || !fallback.status.includes("仍可打字")) {
  throw new Error(`unsupported browser fallback failed ${JSON.stringify(fallback)}`);
}
results.unsupportedBrowser = fallback;
await fallbackPage.close();

await browser.close();
console.log(JSON.stringify(results, null, 2));
