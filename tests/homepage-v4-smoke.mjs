import playwright from "../../playtime/node_modules/playwright/index.js";
import fs from "node:fs";

const { chromium } = playwright;
const baseURL = process.env.HOMEPAGE_URL || "http://127.0.0.1:8787/";
const outputDir = process.env.HOMEPAGE_QA_OUTPUT || "output/playwright/homepage-v13";
const widgetSource = process.env.WIDGET_SOURCE_PATH
  ? fs.readFileSync(process.env.WIDGET_SOURCE_PATH, "utf8")
  : null;
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = {};

async function installCallMocks(page) {
  if (widgetSource) {
    await page.route("https://ai-customer-service.timux.site/api/widget.js*", (route) => route.fulfill({
      status: 200,
      contentType: "application/javascript; charset=utf-8",
      body: widgetSource
    }));
  }
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
    window.SpeechRecognition = class MockSpeechRecognition {
      constructor() { this.lang = "zh-TW"; this.continuous = true; this.interimResults = true; }
      start() { queueMicrotask(() => this.onstart?.()); }
      stop() { queueMicrotask(() => this.onend?.()); }
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
  if (marker !== "homepage-v14-motion-system-20261006") {
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
  if (heroLines.join("|") !== "AI 進入工作現場，|真正把事做完。") {
    throw new Error(`${name}: hero line break regression ${heroLines.join("|")}`);
  }

  const homepageStory = await page.evaluate(() => {
    const ids = ["solutions", "adoption", "cases", "method", "roadmap"];
    return {
      order: ids.map((id) => document.querySelector(`#${id}`)?.getBoundingClientRect().top + scrollY),
      solutionCards: document.querySelectorAll(".solution-grid .solution-card").length,
      adoptionSteps: document.querySelectorAll(".adoption-path article").length,
      workflowSteps: document.querySelectorAll(".workflow-rail > div").length,
      models: [...document.querySelectorAll(".model-code")].map((element) => element.textContent.trim()),
      modelPies: document.querySelectorAll(".model-pie").length,
      pieLabels: [...document.querySelectorAll(".model-pie")].map((element) => element.querySelectorAll(".pie-label").length),
      scaleLoopArrows: document.querySelectorAll(".scale-loop-arrow").length,
      legends: document.querySelectorAll(".model-legend").length
    };
  });
  if (homepageStory.order.some((position) => !Number.isFinite(position)) ||
      homepageStory.order.some((position, index) => index && position <= homepageStory.order[index - 1])) {
    throw new Error(`${name}: homepage story order invalid ${JSON.stringify(homepageStory.order)}`);
  }
  if (homepageStory.solutionCards !== 4 || homepageStory.adoptionSteps !== 3 || homepageStory.workflowSteps !== 3 ||
      homepageStory.models.join("|") !== "CORE|SCALE|TRUST" ||
      homepageStory.modelPies !== 3 || homepageStory.pieLabels.join("|") !== "4|5|5" ||
      homepageStory.scaleLoopArrows !== 1 || homepageStory.legends !== 0) {
    throw new Error(`${name}: capability/model sections invalid ${JSON.stringify(homepageStory)}`);
  }

  await page.locator('.workflow-demo').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.workflow-demo')?.classList.contains('is-visible') && Boolean(document.querySelector('.workflow-demo')?.dataset.flowStep));
  const motion = await page.evaluate(() => ({
    system: document.documentElement.dataset.motionSystem,
    ready: document.documentElement.classList.contains("motion-ready"),
    transitionLayers: document.querySelectorAll(".page-transition").length,
    progressBars: document.querySelectorAll(".scroll-progress").length,
    revealTargets: document.querySelectorAll("[data-reveal]").length,
    visibleTargets: document.querySelectorAll("[data-reveal].is-visible").length,
    flowStep: document.querySelector(".workflow-demo")?.dataset.flowStep || ""
  }));
  if (motion.system !== "v14" || !motion.ready || motion.transitionLayers !== 1 || motion.progressBars !== 1 || motion.revealTargets < 20 || motion.visibleTargets < 1 || !motion.flowStep) {
    throw new Error(`${name}: motion system unavailable ${JSON.stringify(motion)}`);
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

  await page.locator("#cases").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("#cases img")].every((image) => image.complete && image.naturalWidth > 0));
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
    voiceBadge: await page.locator(".timux-voice-badge").textContent(),
    replyReadingControlVisible: await page.locator(".timux-tts-toggle").isVisible()
  };
  if (widget.bubble !== 1 || widget.phoneButton !== 1 || widget.micButton !== 0 || !widget.voiceBadge.includes("一來一回語音") || widget.replyReadingControlVisible) {
    throw new Error(`${name}: phone chat widget unavailable ${JSON.stringify(widget)}`);
  }

  const heroURL = new URL(baseURL);
  heroURL.searchParams.set("qa", `hero-${name}`);
  await page.goto(heroURL.toString(), { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outputDir}/${name}-hero.png`, fullPage: false });
  if (consoleErrors.length) throw new Error(`${name}: console errors ${JSON.stringify(consoleErrors)}`);
  results[name] = { overflow, agentSize, starters, images: images.length, removedReplyReading, widget, motion, consoleErrors };
  await page.close();
}

await inspect({ width: 1920, height: 1080 }, "desktop");
await inspect({ width: 390, height: 844 }, "mobile");
await inspect({ width: 360, height: 740 }, "small-mobile");

const reducedPage = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
await installCallMocks(reducedPage);
await reducedPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
const reducedMotion = await reducedPage.evaluate(() => ({
  reduced: document.documentElement.classList.contains("motion-reduced"),
  ready: document.documentElement.classList.contains("motion-ready"),
  hiddenTargets: [...document.querySelectorAll("[data-reveal]")].filter(element => getComputedStyle(element).opacity !== "1").length,
  transitionDisplay: getComputedStyle(document.querySelector(".page-transition")).display,
  heroAnimation: getComputedStyle(document.querySelector(".outcome-hero h1")).animationName
}));
if (!reducedMotion.reduced || reducedMotion.ready || reducedMotion.hiddenTargets || reducedMotion.transitionDisplay !== "none" || reducedMotion.heroAnimation !== "none") {
  throw new Error(`reduced motion unavailable ${JSON.stringify(reducedMotion)}`);
}
results.reducedMotion = reducedMotion;
await reducedPage.close();

const transitionPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await installCallMocks(transitionPage);
await transitionPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
const methodLink = transitionPage.locator('.model-section a[href^="/method/"]');
await methodLink.click({ noWaitAfter: true });
await transitionPage.waitForFunction(() => document.querySelector('.page-transition')?.classList.contains('is-leaving'), null, { timeout: 400 });
await transitionPage.waitForURL(/\/method\//, { timeout: 5000 });
const enteredWithTransition = await transitionPage.evaluate(() => sessionStorage.getItem('timux-page-transition') === null && Boolean(document.querySelector('.page-transition.is-entering')));
if (!enteredWithTransition) throw new Error('cross-page transition did not complete');
results.pageTransition = { destination: transitionPage.url(), enteredWithTransition };
await transitionPage.close();

const interactionPage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await installCallMocks(interactionPage);
const interactionErrors = [];
const failedResponses = [];
const ttsRequests = [];
const liveRequests = [];
interactionPage.on("console", (message) => {
  if (message.type() === "error") interactionErrors.push(message.text());
});
interactionPage.on("response", (response) => {
  if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
});
interactionPage.on("request", (request) => {
  if (request.url().includes("/api/widget/tts")) ttsRequests.push(request.postDataJSON());
  if (request.url().includes("/api/widget/live-token") || request.url().includes("/widget-live")) liveRequests.push(request.url());
});
await interactionPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });

const firstSolution = interactionPage.locator("[data-solution]").first();
const selectedSolution = await firstSolution.getAttribute("data-solution");
await firstSolution.click();
await interactionPage.waitForFunction(
  (value) => document.querySelector("#workflow")?.value === value,
  selectedSolution
);

const configResponse = await interactionPage.request.get("https://ai-customer-service.timux.site/api/widget/config/cs_timux");
if (!configResponse.ok()) throw new Error("Cannot verify tenant greeting");
const tenantConfig = await configResponse.json();
const expectedGreeting = tenantConfig.config?.phoneGreeting || "您好，歡迎致電智慧客服，請問需要什麼協助？";
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

const callGreeting = ttsRequests.find((request) => request?.text === expectedGreeting);
const phoneCall = {
  connected: await interactionPage.locator(".timux-message.assistant").filter({ hasText: "通話已接通" }).count(),
  overlay: await interactionPage.locator(".phone-overlay").count(),
  greeting: callGreeting?.text || "",
  status: await interactionPage.locator(".phone-status-text").textContent()
};
if (phoneCall.connected !== 1 || phoneCall.overlay !== 1 || phoneCall.greeting !== expectedGreeting) {
  throw new Error(`phone call did not proactively greet ${JSON.stringify(phoneCall)}`);
}
if (liveRequests.length) throw new Error(`turn-based phone unexpectedly connected Gemini Live ${JSON.stringify(liveRequests)}`);

await interactionPage.screenshot({ path: `${outputDir}/desktop-phone-chat.png` });
const interaction = {
  selectedSolution,
  workflowPrefill: await interactionPage.locator("#workflow").inputValue(),
  firstQuestion,
  heroAssistantMessages: await interactionPage.locator(".message.assistant .bubble:not(.typing)").count(),
  heroUserMessages: await interactionPage.locator(".message.user").count(),
  widgetTextMessages: await interactionPage.locator(".timux-message.user").count(),
  textReplyReadingRequests: ttsRequests.filter((request) => request?.text !== expectedGreeting).length,
  phoneCall,
  liveRequests,
  failedResponses,
  consoleErrors: interactionErrors
};
if (interaction.workflowPrefill !== interaction.selectedSolution || interaction.heroAssistantMessages < 2 || interaction.heroUserMessages !== 1 || interaction.textReplyReadingRequests || interaction.failedResponses.length || interaction.consoleErrors.length) {
  throw new Error(`interaction flow failed ${JSON.stringify(interaction)}`);
}
results.interaction = interaction;

await browser.close();
console.log(JSON.stringify(results, null, 2));
