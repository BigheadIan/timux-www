import playwright from "../../playtime/node_modules/playwright/index.js";
import fs from "node:fs";

const { chromium } = playwright;
const baseURL = process.env.HOMEPAGE_URL || "http://127.0.0.1:8787/";
const outputDir = process.env.HOMEPAGE_QA_OUTPUT || "../output/timux-homepage-v6-20260818";
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = {};

async function installCallMocks(page) {
  await page.addInitScript(() => {
    const track = { enabled: false, stop() {}, getSettings: () => ({ echoCancellation: true, noiseSuppression: true, autoGainControl: true }) };
    const stream = { getAudioTracks: () => [track], getTracks: () => [track] };
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: async () => stream }
    });
    class MockSource {
      connect() {}
      disconnect() {}
      stop() { this.stopped = true; }
      start() { if (this.buffer?.length > 1) queueMicrotask(() => this.onended?.()); }
    }
    class MockAudioContext {
      constructor() {
        this.state = "running";
        this.sampleRate = 48000;
        this.currentTime = 0;
        this.destination = {};
        this.audioWorklet = { addModule: async () => {} };
      }
      resume() { return Promise.resolve(); }
      close() { return Promise.resolve(); }
      createMediaStreamSource() { return new MockSource(); }
      createBufferSource() { return new MockSource(); }
      createBuffer(_channels, length, sampleRate) {
        const data = new Float32Array(length);
        return { length, sampleRate, duration: length / sampleRate, getChannelData: () => data };
      }
      createScriptProcessor() { return { connect() {}, disconnect() {}, onaudioprocess: null }; }
      createGain() { return { gain: { value: 0 }, connect() {}, disconnect() {} }; }
    }
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
    window.AudioWorkletNode = class {
      constructor() { this.port = { onmessage: null }; }
      connect() {}
      disconnect() {}
    };
    window.Audio = class MockAudio {
      play() { queueMicrotask(() => this.onended?.()); return Promise.resolve(); }
      pause() {}
    };
  });
}

async function inspect(viewport, name) {
  const page = await browser.newPage({ viewport });
  await installCallMocks(page);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });

  const marker = await page.locator('meta[name="timux-build"]').getAttribute("content");
  if (marker !== "homepage-v7-shared-gemini-live-20260818") {
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
    for (const element of document.querySelectorAll("body *:not(.timux-chat-widget):not(.timux-chat-widget *)")) {
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

  const removedReplyReading = await page.evaluate(() => ({
    inlineMic: Boolean(document.querySelector("#micButton")),
    inlineTts: Boolean(document.querySelector("#ttsButton")),
    inlineVoiceStatus: Boolean(document.querySelector("#voiceStatus")),
    inlineTtsEndpoint: document.documentElement.innerHTML.includes("/api/widget/tts")
  }));
  if (Object.values(removedReplyReading).some(Boolean)) {
    throw new Error(`${name}: inline reply-reading remnants ${JSON.stringify(removedReplyReading)}`);
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

  const widget = {
    bubble: await page.locator(".timux-chat-bubble").count(),
    phoneButton: await page.locator(".timux-phone-button").count(),
    micButton: await page.locator(".timux-mic-button").count(),
    geminiLiveBadge: await page.locator(".timux-voice-badge").textContent(),
    replyReadingControlVisible: await page.locator(".timux-tts-toggle").isVisible()
  };
  if (widget.bubble !== 1 || widget.phoneButton !== 1 || widget.micButton !== 0 || !widget.geminiLiveBadge.includes("Gemini Live") || widget.replyReadingControlVisible) {
    throw new Error(`${name}: phone chat widget unavailable ${JSON.stringify(widget)}`);
  }

  await page.screenshot({ path: `${outputDir}/${name}-hero.png`, fullPage: false });
  if (consoleErrors.length) throw new Error(`${name}: console errors ${JSON.stringify(consoleErrors)}`);
  results[name] = { overflow, agentSize, starters, images: images.length, removedReplyReading, widget, consoleErrors };
  await page.close();
}

await inspect({ width: 1440, height: 1100 }, "desktop");
await inspect({ width: 390, height: 844 }, "mobile");
await inspect({ width: 360, height: 740 }, "small-mobile");

const interactionPage = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await installCallMocks(interactionPage);
const interactionErrors = [];
const failedResponses = [];
const ttsRequests = [];
interactionPage.on("console", (message) => {
  if (message.type() === "error") interactionErrors.push(message.text());
});
interactionPage.on("response", (response) => {
  if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
});
interactionPage.on("request", (request) => {
  if (request.url().includes("/api/widget/tts")) ttsRequests.push(request.postDataJSON());
});
await interactionPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });

const firstStarter = interactionPage.locator("#starterQuestions .chip").first();
const firstQuestion = await firstStarter.textContent();
await firstStarter.click();
await interactionPage.locator(".message.user").filter({ hasText: firstQuestion }).waitFor({ timeout: 5000 });
await interactionPage.locator(".message.assistant .bubble:not(.typing)").nth(1).waitFor({ timeout: 30000 });
if (ttsRequests.length) throw new Error(`text Agent unexpectedly requested reply reading ${JSON.stringify(ttsRequests)}`);

await interactionPage.locator(".timux-chat-bubble").click();
await interactionPage.locator(".timux-chat-window.open").waitFor();
const initialWidgetReplies = await interactionPage.locator(".timux-message.assistant").count();
await interactionPage.locator(".timux-chat-input").fill("你們提供哪些 AI 導入服務？");
await interactionPage.locator(".timux-send-button").click();
await interactionPage.locator(".timux-message.user").filter({ hasText: "你們提供哪些 AI 導入服務" }).waitFor();
await interactionPage.waitForFunction(
  (initialCount) => document.querySelectorAll(".timux-message.assistant").length > initialCount,
  initialWidgetReplies,
  { timeout: 30000 }
);
if (ttsRequests.length) throw new Error(`widget text chat unexpectedly requested reply reading ${JSON.stringify(ttsRequests)}`);

await interactionPage.locator(".timux-phone-button").click();
await interactionPage.locator(".phone-overlay").waitFor();
await interactionPage.locator(".timux-message.assistant").filter({ hasText: "通話已接通" }).waitFor();
await interactionPage.waitForResponse(
  (response) => response.url().includes("/api/widget/tts") && response.status() === 200,
  { timeout: 30000 }
);

const callGreeting = ttsRequests.find((request) => request?.text === "您好，有什麼問題嗎？");
const phoneCall = {
  connected: await interactionPage.locator(".timux-message.assistant").filter({ hasText: "通話已接通" }).count(),
  overlay: await interactionPage.locator(".phone-overlay").count(),
  greeting: callGreeting?.text || "",
  status: await interactionPage.locator(".phone-status-text").textContent()
};
if (phoneCall.connected !== 1 || phoneCall.overlay !== 1 || phoneCall.greeting !== "您好，有什麼問題嗎？") {
  throw new Error(`phone call did not proactively greet ${JSON.stringify(phoneCall)}`);
}

await interactionPage.locator(".timux-chat-window").screenshot({ path: `${outputDir}/desktop-phone-chat.png` });
const interaction = {
  firstQuestion,
  heroAssistantMessages: await interactionPage.locator(".message.assistant .bubble:not(.typing)").count(),
  heroUserMessages: await interactionPage.locator(".message.user").count(),
  widgetTextMessages: await interactionPage.locator(".timux-message.user").count(),
  textReplyReadingRequests: ttsRequests.filter((request) => request?.text !== "您好，有什麼問題嗎？").length,
  phoneCall,
  failedResponses,
  consoleErrors: interactionErrors
};
if (interaction.heroAssistantMessages < 2 || interaction.heroUserMessages !== 1 || interaction.textReplyReadingRequests || interaction.failedResponses.length || interaction.consoleErrors.length) {
  throw new Error(`interaction flow failed ${JSON.stringify(interaction)}`);
}
results.interaction = interaction;

await browser.close();
console.log(JSON.stringify(results, null, 2));
