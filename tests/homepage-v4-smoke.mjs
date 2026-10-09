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
  if (marker !== "homepage-v34-compact-journeys-20261009") {
    throw new Error(`${name}: unexpected build marker ${marker}`);
  }

  const navStructure = await page.evaluate(() => ({
    triggers: document.querySelectorAll('.nav-trigger').length,
    panels: document.querySelectorAll('.mega-panel').length,
    desktopDisplay: getComputedStyle(document.querySelector('.nav-directory')).display,
    mobileDisplay: getComputedStyle(document.querySelector('.mobile-nav')).display,
    mobileGroups: document.querySelectorAll('.mobile-nav-panel > details').length
  }));
  if (navStructure.triggers !== 3 || navStructure.panels !== 3 || navStructure.mobileGroups !== 3) {
    throw new Error(`${name}: navigation structure invalid ${JSON.stringify(navStructure)}`);
  }
  const internationalLayer = await page.evaluate(() => ({
    navEnglish: [...document.querySelectorAll('.intl-nav-en')].map((element) => element.textContent.trim()),
    mobileEnglish: [...document.querySelectorAll('.intl-mobile-summary small')].map((element) => element.textContent.trim()),
    heroScopes: document.querySelectorAll('.intl-hero-scope span').length,
    heroProofSteps: document.querySelectorAll('.intl-hero-proof > div').length,
    sectionSubtitles: document.querySelectorAll('.intl-section-en').length,
    caseScenes: document.querySelectorAll('.case-scene').length,
    caseHeadings: document.querySelectorAll('.case-headline').length,
    heroIndex: document.querySelectorAll('.layout-hero-index>a').length
  }));
  if (internationalLayer.navEnglish.join('|') !== 'Solutions|Case Studies|AI Adoption|Talk to us' ||
      internationalLayer.mobileEnglish.join('|') !== 'Solutions|Case Studies|AI Adoption' ||
      internationalLayer.heroScopes !== 0 || internationalLayer.heroProofSteps !== 0 ||
      internationalLayer.sectionSubtitles !== 0 || internationalLayer.caseScenes !== 2 || internationalLayer.caseHeadings !== 2 || internationalLayer.heroIndex !== 3) {
    throw new Error(`${name}: international layer invalid ${JSON.stringify(internationalLayer)}`);
  }
  let navInteraction;
  if (viewport.width > 820) {
    const panels = [];
    for (let index = 0; index < 3; index += 1) {
      await page.locator('.nav-trigger').nth(index).hover();
      await page.waitForFunction((activeIndex) => document.querySelectorAll('.nav-entry')[activeIndex].classList.contains('is-open'), index);
      panels.push(await page.evaluate((activeIndex) => {
        const entries = [...document.querySelectorAll('.nav-entry')];
        const entry = entries[activeIndex];
        return {
          expanded: entry.querySelector('.nav-trigger').getAttribute('aria-expanded'),
          hidden: entry.querySelector('.mega-panel').getAttribute('aria-hidden'),
          visiblePanels: entries.filter((item) => getComputedStyle(item.querySelector('.mega-panel')).visibility === 'visible').length
        };
      }, index));
    }
    await page.mouse.move(viewport.width - 2, viewport.height - 2);
    await page.waitForTimeout(240);
    navInteraction = { panels, closed: await page.locator('.nav-entry.is-open').count() === 0 };
    if (panels.some((panel) => panel.expanded !== 'true' || panel.hidden !== 'false' || panel.visiblePanels !== 1) || !navInteraction.closed || navStructure.desktopDisplay === 'none' || navStructure.mobileDisplay !== 'none') {
      throw new Error(`${name}: desktop mega navigation invalid ${JSON.stringify({navStructure, navInteraction})}`);
    }
  } else {
    await page.locator('.mobile-nav > summary').click();
    await page.locator('.mobile-nav-panel > details > summary').first().click();
    navInteraction = await page.evaluate(() => ({
      menuOpen: document.querySelector('.mobile-nav').open,
      openGroups: document.querySelectorAll('.mobile-nav-panel > details[open]').length,
      panelWidth: document.querySelector('.mobile-nav-panel').getBoundingClientRect().width
    }));
    if (!navInteraction.menuOpen || navInteraction.openGroups !== 1 || navInteraction.panelWidth > viewport.width || navStructure.desktopDisplay !== 'none' || navStructure.mobileDisplay === 'none') {
      throw new Error(`${name}: mobile directory invalid ${JSON.stringify({navStructure, navInteraction})}`);
    }
    await page.locator('.mobile-nav > summary').click();
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
      const intentionalEnglishMicrocopy = element.matches('.intl-nav-en,.intl-lang,.intl-lang *,.intl-mobile-summary small,.intl-mobile-lang,.intl-mobile-lang *,.intl-hero-scope span,.intl-hero-proof b,.intl-hero-proof span,.intl-section-en,.intl-case-meta span,.nav-cta .intl-nav-zh');
      const compactLabel = element.matches('.eyebrow,.layout-hero-index b,.solution-card>a,.adoption-path b,.adoption-path small,.case-scene .chapter span,.case-scene .phone-caption,.case-scene .editorial-steps span,.case-scene .editorial-steps i,.contact-form>.fine');
      if (size < (intentionalEnglishMicrocopy ? 9 : compactLabel ? 10 : 14)) failures.push({ tag: element.tagName, className: element.className, size, text: directText.slice(0, 60) });
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
      ,partnerCards: document.querySelectorAll('.partner-orbit .logo-card').length,
      partnerAxis: document.querySelectorAll('.partner-orbit-axis').length,
      partnerCopyAnchors: document.querySelectorAll('.partner-orbit .trust-copy-anchor').length
    };
  });
  if (homepageStory.order.some((position) => !Number.isFinite(position)) ||
      homepageStory.order.some((position, index) => index && position <= homepageStory.order[index - 1])) {
    throw new Error(`${name}: homepage story order invalid ${JSON.stringify(homepageStory.order)}`);
  }
  if (homepageStory.solutionCards !== 4 || homepageStory.adoptionSteps !== 3 || homepageStory.workflowSteps !== 3 ||
      homepageStory.models.join("|") !== "CORE|SCALE|TRUST" ||
      homepageStory.modelPies !== 3 || homepageStory.pieLabels.join("|") !== "4|5|5" ||
      homepageStory.scaleLoopArrows !== 1 || homepageStory.legends !== 0 || homepageStory.partnerCards !== 6 || homepageStory.partnerAxis !== 1 || homepageStory.partnerCopyAnchors !== 1) {
    throw new Error(`${name}: capability/model sections invalid ${JSON.stringify(homepageStory)}`);
  }

  const partnerNavigations = [];
  for (const partner of [
    { selector: '.logo-southeast .logo-card-link', hash: '#case-southeast' },
    { selector: '.logo-mj .logo-card-link', hash: '#case-mj' }
  ]) {
    const partnerLink = page.locator(partner.selector);
    const audit = await partnerLink.evaluate((element) => ({
      href: element.getAttribute('href'),
      label: element.getAttribute('aria-label'),
      tabIndex: element.tabIndex
    }));
    if (audit.href !== partner.hash || !audit.label || audit.tabIndex < 0) {
      throw new Error(`${name}: partner case link invalid ${JSON.stringify({ partner, audit })}`);
    }
    await partnerLink.scrollIntoViewIfNeeded();
    await partnerLink.focus();
    await page.waitForFunction(() => document.querySelector('.partner-orbit')?.classList.contains('is-paused'));
    await partnerLink.click();
    await page.waitForFunction((hash) => {
      const target = document.querySelector(hash);
      if (location.hash !== hash || !target) return false;
      const top = target.getBoundingClientRect().top;
      return top >= 70 && top <= 140;
    }, partner.hash);
    partnerNavigations.push(await page.evaluate((hash) => ({
      hash: location.hash,
      targetTop: Math.round(document.querySelector(hash).getBoundingClientRect().top)
    }), partner.hash));
  }

  const scaleLoop = page.locator(".scale-loop-arrow");
  const scaleLoopMotion = await scaleLoop.evaluate((element) => ({
    animationName: getComputedStyle(element).animationName,
    animationDuration: getComputedStyle(element).animationDuration,
    transform: getComputedStyle(element).transform
  }));
  await page.waitForTimeout(250);
  scaleLoopMotion.laterTransform = await scaleLoop.evaluate((element) => getComputedStyle(element).transform);
  if (scaleLoopMotion.animationName !== "scale-loop-rotate" || scaleLoopMotion.animationDuration !== "16s" ||
      scaleLoopMotion.transform === scaleLoopMotion.laterTransform) {
    throw new Error(`${name}: SCALE loop is not rotating ${JSON.stringify(scaleLoopMotion)}`);
  }

  const expectsScenes = viewport.width >= 1100 && viewport.height >= 700;
  if (!expectsScenes) {
    await page.locator('.workflow-demo').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Boolean(document.querySelector('.workflow-demo')?.dataset.flowStep));
  }
  const motion = await page.evaluate(() => ({
    system: document.documentElement.dataset.motionSystem,
    ready: document.documentElement.classList.contains("motion-ready"),
    transitionLayers: document.querySelectorAll(".page-transition").length,
    progressBars: document.querySelectorAll(".scroll-progress").length,
    revealTargets: document.querySelectorAll("[data-reveal]").length,
    visibleTargets: document.querySelectorAll("[data-reveal].is-visible").length,
    flowStep: document.querySelector(".workflow-demo")?.dataset.flowStep || "",
    sceneMotion: document.documentElement.classList.contains("scene-motion"),
    sceneModules: document.querySelectorAll(".scene-module").length,
    sceneLayers: document.querySelectorAll(".scene-layer").length,
    sceneIndicators: document.querySelectorAll(".scene-indicator").length
    ,storyDesktop: document.documentElement.classList.contains('story-desktop'),
    engineLayers: document.querySelectorAll('.engine-layer').length,
    modelStages: document.querySelectorAll('.model-stage').length
  }));
  if (motion.system !== "v17" || !motion.ready || motion.transitionLayers !== 1 || motion.progressBars !== 1 || motion.revealTargets < 20 || motion.visibleTargets < 1 ||
      motion.storyDesktop !== expectsScenes || motion.engineLayers !== 5 || motion.modelStages !== 1 ||
      motion.sceneMotion || motion.sceneModules || motion.sceneLayers || motion.sceneIndicators ||
      (!expectsScenes && !motion.flowStep)) {
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
  results[name] = { overflow, navStructure, navInteraction, agentSize, starters, images: images.length, removedReplyReading, widget, motion, scaleLoopMotion, partnerNavigations, consoleErrors };
  await page.close();
}

await inspect({ width: 1920, height: 1080 }, "desktop");
await inspect({ width: 1440, height: 900 }, "laptop");
await inspect({ width: 390, height: 844 }, "mobile");
await inspect({ width: 360, height: 740 }, "small-mobile");

const reloadPage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await installCallMocks(reloadPage);
const contactURL = new URL("#contact", baseURL).href;
await reloadPage.goto(contactURL, { waitUntil: "networkidle", timeout: 30000 });
await reloadPage.waitForFunction(() => scrollY >= document.documentElement.scrollHeight - innerHeight - 2, null, { timeout: 5000 });
await reloadPage.waitForTimeout(500);
const directAnchor = await reloadPage.evaluate(() => ({
  y: scrollY,
  hash: location.hash,
  max: document.documentElement.scrollHeight - innerHeight
}));
await reloadPage.evaluate(() => {
  const root = document.documentElement;
  root.style.scrollBehavior = "auto";
  scrollTo(0, 0);
});
await reloadPage.waitForFunction(() => scrollY < 2, null, { timeout: 5000 });
const beforeAnchorReload = await reloadPage.evaluate(() => ({ y: scrollY, hash: location.hash }));
await reloadPage.reload({ waitUntil: "networkidle", timeout: 30000 });
await reloadPage.waitForTimeout(250);
const afterAnchorReload = await reloadPage.evaluate(() => ({
  y: scrollY,
  hash: location.hash,
  restoration: history.scrollRestoration,
  navigation: performance.getEntriesByType("navigation")[0]?.type
}));
if (directAnchor.hash !== "#contact" || directAnchor.y < directAnchor.max * .7 || beforeAnchorReload.y > 1 ||
    afterAnchorReload.y !== 0 || afterAnchorReload.hash || afterAnchorReload.restoration !== "manual" || afterAnchorReload.navigation !== "reload") {
  throw new Error(`anchor reload did not reset to top ${JSON.stringify({directAnchor, beforeAnchorReload, afterAnchorReload})}`);
}

await reloadPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
await reloadPage.evaluate(() => {
  const root = document.documentElement;
  root.style.scrollBehavior = "auto";
  scrollTo(0, 2400);
  root.style.removeProperty("scroll-behavior");
});
await reloadPage.waitForFunction(() => scrollY > 2000, null, { timeout: 5000 });
const beforePlainReload = await reloadPage.evaluate(() => ({ y: scrollY, hash: location.hash }));
await reloadPage.reload({ waitUntil: "networkidle", timeout: 30000 });
await reloadPage.waitForTimeout(250);
const afterPlainReload = await reloadPage.evaluate(() => ({ y: scrollY, hash: location.hash }));
if (beforePlainReload.y < 2000 || afterPlainReload.y !== 0 || afterPlainReload.hash) {
  throw new Error(`plain reload did not reset to top ${JSON.stringify({beforePlainReload, afterPlainReload})}`);
}
results.reloadPosition = { directAnchor, beforeAnchorReload, afterAnchorReload, beforePlainReload, afterPlainReload };
await reloadPage.close();

const scenePage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await installCallMocks(scenePage);
await scenePage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
const readScenes = () => scenePage.evaluate(() => {
  const hero = document.querySelector('.outcome-hero');
  return {
    scrollY,
    heroOpacity: Number.parseFloat(getComputedStyle(hero).opacity),
    heroTop: hero.getBoundingClientRect().top,
    layerTransform: getComputedStyle(document.querySelector('.engine-layer')).transform,
    step: hero.dataset.engineStep
  };
});
const sceneSamples = {before: await readScenes()};
await scenePage.mouse.wheel(0, 1000);
await scenePage.waitForTimeout(600);
sceneSamples.exploded = await readScenes();
await scenePage.screenshot({path:`${outputDir}/desktop-engine-exploded.png`});
await scenePage.mouse.wheel(0, 1200);
await scenePage.waitForTimeout(600);
sceneSamples.assembled = await readScenes();
await scenePage.screenshot({path:`${outputDir}/desktop-engine-assembled.png`});
await scenePage.mouse.wheel(0, -2200);
await scenePage.waitForTimeout(600);
sceneSamples.returned = await readScenes();
if (sceneSamples.before.heroOpacity !== 1 || sceneSamples.exploded.heroOpacity !== 1 ||
    sceneSamples.before.layerTransform === sceneSamples.exploded.layerTransform ||
    sceneSamples.assembled.step !== '2' || sceneSamples.exploded.step !== '1' ||
    Math.abs(sceneSamples.exploded.heroTop-78)>2 ||
    sceneSamples.returned.layerTransform !== sceneSamples.before.layerTransform) {
  throw new Error(`desktop scene transition unavailable ${JSON.stringify(sceneSamples)}`);
}
results.sceneTransition = sceneSamples;
const modelFrames = [];
const modelLoopFrames = [];
for (const fraction of [0, .5, 1]) {
  await scenePage.evaluate(f => {
    const el=document.querySelector('.model-track');
    scrollTo({top:el.getBoundingClientRect().top+scrollY-80+f*(el.offsetHeight-innerHeight+80),behavior:'instant'});
  }, fraction);
  await scenePage.waitForTimeout(180);
  modelFrames.push(await scenePage.locator('.model-stage').getAttribute('data-model'));
  modelLoopFrames.push(await scenePage.evaluate(() => {
    const loop=document.querySelector('.orb-loop'),flow=document.querySelector('.orb-flow');
    const loopStyle=getComputedStyle(loop);
    return {dashArray:loopStyle.strokeDasharray,dashOffset:loopStyle.strokeDashoffset,r:loop.getAttribute('r'),flowTransform:flow.getAttribute('transform'),marker:flow.getAttribute('marker-end')};
  }));
  await scenePage.screenshot({path:`${outputDir}/desktop-model-${fraction}.png`});
}
if (modelFrames.join('|') !== 'CORE|SCALE|TRUST') throw new Error(`ring chapters: ${modelFrames}`);
if(modelLoopFrames.some(frame=>frame.dashArray!=='none'||parseFloat(frame.dashOffset)!==0||frame.r!=='216'||frame.marker!=='url(#orb-flow-head)')||new Set(modelLoopFrames.map(frame=>frame.flowTransform)).size!==3)throw new Error(`model loop regression: ${JSON.stringify(modelLoopFrames)}`);
results.modelFrames=modelFrames;
results.modelLoopFrames=modelLoopFrames;
await scenePage.setViewportSize({width:390,height:844});
await scenePage.waitForFunction(()=>!document.documentElement.classList.contains('story-desktop'));
const resizeFallback=await scenePage.evaluate(()=>({desktop:document.documentElement.classList.contains('story-desktop'),panels:[...document.querySelectorAll('.ai-decision,.audit-panel')].every(p=>getComputedStyle(p).clipPath==='none')}));
if(resizeFallback.desktop||!resizeFallback.panels)throw new Error(`resize fallback ${JSON.stringify(resizeFallback)}`);
results.resizeFallback=resizeFallback;
await scenePage.close();

const reducedPage = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
await installCallMocks(reducedPage);
await reducedPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
const reducedMotion = await reducedPage.evaluate(() => ({
  reduced: document.documentElement.classList.contains("motion-reduced"),
  ready: document.documentElement.classList.contains("motion-ready"),
  hiddenTargets: [...document.querySelectorAll("[data-reveal]")].filter(element => getComputedStyle(element).opacity !== "1").length,
  transitionDisplay: getComputedStyle(document.querySelector(".page-transition")).display,
  heroAnimation: getComputedStyle(document.querySelector(".outcome-hero h1")).animationName,
  scaleLoopAnimation: getComputedStyle(document.querySelector(".scale-loop-arrow")).animationName,
  sceneMotion: document.documentElement.classList.contains("scene-motion"),
  sceneModules: document.querySelectorAll(".scene-module").length
}));
if (!reducedMotion.reduced || reducedMotion.ready || reducedMotion.hiddenTargets || reducedMotion.transitionDisplay !== "none" || reducedMotion.heroAnimation !== "none" || reducedMotion.scaleLoopAnimation !== "none" || reducedMotion.sceneMotion || reducedMotion.sceneModules) {
  throw new Error(`reduced motion unavailable ${JSON.stringify(reducedMotion)}`);
}
results.reducedMotion = reducedMotion;
await reducedPage.close();

const transitionPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await installCallMocks(transitionPage);
await transitionPage.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
const methodLink = transitionPage.locator('.model-section .section-tail a[href^="/method/"]');
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
