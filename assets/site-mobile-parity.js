/* V50: mobile-native layout controls with compact scroll-driven story carousels. */
(() => {
  const phone = matchMedia('(max-width: 820px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const english = root.lang === 'en';

  root.classList.add('mobile-parity');

  function makeTabs(items, labels, className = '') {
    const tabs = document.createElement('div');
    tabs.className = `mobile-choice-tabs ${className}`.trim();
    tabs.style.setProperty('--mobile-choice-count', String(items.length));
    tabs.setAttribute('role', 'tablist');
    const buttons = items.map((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.textContent = labels[index] || `${english ? 'Step' : '步驟'} ${index + 1}`;
      button.addEventListener('click', () => select(index, true));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
        buttons[next].focus();
        select(next, true);
      });
      tabs.append(button);
      return button;
    });

    function select(activeIndex, userInitiated = false) {
      items.forEach((item, index) => {
        const active = index === activeIndex;
        item.classList.toggle('is-mobile-current', active);
        if (phone.matches) {
          item.setAttribute('aria-hidden', active ? 'false' : 'true');
          if ('inert' in item) item.inert = !active;
        } else {
          item.removeAttribute('aria-hidden');
          if ('inert' in item) item.inert = false;
        }
      });
      buttons.forEach((button, index) => button.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false'));
      tabs.dataset.active = String(activeIndex);
      if (userInitiated) tabs.dispatchEvent(new CustomEvent('mobile-choice-change', {detail: {index: activeIndex}}));
    }
    tabs._selectMobileChoice = select;
    select(0);
    return tabs;
  }

  const heroTrack = document.querySelector('.engine-track');
  const heroScene = document.querySelector('.outcome-hero');
  const heroStage = heroScene?.querySelector('.engine-stage');
  const heroLayers = heroStage ? [...heroStage.querySelectorAll('.engine-layer')] : [];
  const heroLayerNames = english
    ? ['Signal received', 'Knowledge checked', 'Rules applied', 'Human decision', 'Action recorded']
    : ['訊號進來', '知識核對', '規則判斷', '人的決策', '行動與紀錄'];
  const heroLayerDetails = english
    ? ['Customer request · Field report · Work task', 'Approved documents · Available data · Sources', 'Permission scope · Exceptions · Priorities', 'Approval for critical actions · Human handoff', 'Execute · Preserve evidence · Improve']
    : ['客戶詢問 · 現場回報 · 工作任務', '核准文件 · 可用資料 · 引用依據', '權限範圍 · 例外條件 · 處理順序', '重要操作先批准 · 異常有人接手', '執行任務 · 留下證據 · 持續改進'];
  const heroTabs = heroLayers.length ? makeTabs(
    heroLayers,
    heroLayers.map((_, index) => String(index + 1).padStart(2, '0')),
    'mobile-engine-tabs'
  ) : null;

  if (heroTabs && heroStage) {
    heroTabs.setAttribute('aria-label', english ? 'Execution engine stages' : '執行引擎階段');
    [...heroTabs.querySelectorAll('button')].forEach((button, index) => {
      button.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')} ${heroLayerNames[index]}`);
    });
    heroStage.prepend(heroTabs);
    const result = document.createElement('div');
    result.className = 'mobile-engine-result';
    result.innerHTML = english
      ? '<div><span>Execute</span><i>→</i><span>Write back</span><i>→</i><span>Record</span></div><small>Grounded · Human oversight · Traceable</small>'
      : '<div><span>執行任務</span><i>→</i><span>回寫系統</span><i>→</i><span>留下紀錄</span></div><small>資料有依據 · 人保有決策 · 結果可追蹤</small>';
    heroLayers.at(-1)?.append(result);
  }

  const heroStageOffset = 70;
  let heroTrackMetric = null;

  function restoreHeroLayerCopy() {
    heroLayers.forEach((layer, index) => {
      const title = layer.querySelector('.engine-layer-head b');
      const detail = layer.querySelector(':scope > p');
      if (title) title.textContent = heroLayerNames[index];
      if (detail) detail.textContent = heroLayerDetails[index];
      layer.classList.remove('is-assembled');
      layer.style.removeProperty('opacity');
      layer.style.removeProperty('transform');
    });
  }

  function measureHeroTrack() {
    if (!heroTrack || !heroScene) return;
    if (!phone.matches) {
      heroTrack.style.removeProperty('--mobile-hero-track-height');
      heroStage?.setAttribute('aria-hidden', 'true');
      heroTrackMetric = null;
      return;
    }
    restoreHeroLayerCopy();
    heroStage?.removeAttribute('aria-hidden');
    // Keep each of the five story beats on screen long enough to read after a
    // natural mobile flick. The previous 500/560px runway made one gesture
    // cross multiple beats on iOS and embedded WebViews.
    const travel = innerWidth <= 370 ? 900 : 980;
    heroTrack.style.setProperty('--mobile-hero-track-height', `${Math.ceil(heroScene.offsetHeight + travel)}px`);
    heroTrackMetric = {
      top: heroTrack.getBoundingClientRect().top + scrollY - heroStageOffset,
      range: Math.max(1, heroTrack.offsetHeight - heroScene.offsetHeight)
    };
  }

  function getHeroTrack() {
    return heroTrackMetric;
  }

  function selectHeroFromScroll() {
    if (!phone.matches || !heroTabs || !heroScene) return;
    const track = getHeroTrack();
    if (!track || scrollY < track.top - innerHeight || scrollY > track.top + track.range + innerHeight) return;
    const progress = Math.max(0, Math.min(1, (scrollY - track.top) / track.range));
    const index = Math.min(heroLayers.length - 1, Math.floor(progress * heroLayers.length));
    if (heroTabs.dataset.active !== String(index)) heroTabs._selectMobileChoice(index);
    heroScene.style.setProperty('--mobile-engine-progress', String(progress));
  }

  function scrollToHero(index) {
    if (!phone.matches || !heroTabs) return;
    const track = getHeroTrack();
    if (!track) return;
    // Land tab/swipe navigation in the middle of the selected beat, leaving
    // useful scroll room before the following beat becomes active.
    const progress = heroLayers.length ? (index + 0.5) / heroLayers.length : 0;
    scrollTo({top: track.top + (track.range * progress), behavior: reduced.matches ? 'instant' : 'smooth'});
  }

  const busScene = document.querySelector('.a-bus');
  const stations = busScene ? [...busScene.querySelectorAll('.station')] : [];
  const busTabs = stations.length ? makeTabs(
    stations,
    stations.map((station, index) => `${String(index + 1).padStart(2, '0')} ${station.querySelector('em')?.textContent?.split('/').pop().trim() || ''}`),
    'mobile-case-tabs'
  ) : null;
  if (busTabs) busScene.querySelector('.route-key')?.after(busTabs);

  const fieldScene = document.querySelector('.a-mj');
  const devices = fieldScene ? [...fieldScene.querySelectorAll('.device')] : [];
  const fieldSteps = fieldScene ? [...fieldScene.querySelectorAll('.editorial-steps > div')] : [];
  const fieldTabs = devices.length ? makeTabs(
    devices,
    devices.map((_, index) => `${String(index + 1).padStart(2, '0')} ${fieldSteps[index]?.querySelector('b')?.textContent || ''}`),
    'mobile-field-tabs'
  ) : null;
  if (fieldTabs) fieldScene.querySelector('.runway')?.before(fieldTabs);

  const caseStageOffset = 70;
  const caseCarousels = [
    {scene: busScene, tabs: busTabs, items: stations, surface: busScene?.querySelector('.scene-inner')},
    {scene: fieldScene, tabs: fieldTabs, items: devices, surface: fieldScene?.querySelector('.scene-inner')}
  ].filter(carousel => carousel.scene && carousel.tabs && carousel.items.length).map(carousel => ({
    ...carousel,
    track: carousel.scene.closest('.case-journey-track')
  }));

  function measureCaseTracks() {
    caseCarousels.forEach(carousel => {
      if (!phone.matches) {
        carousel.track.style.removeProperty('--mobile-case-track-height');
        carousel.metric = null;
        return;
      }
      const travel = innerWidth <= 370 ? 330 : 360;
      carousel.track.style.setProperty('--mobile-case-track-height', `${Math.ceil(carousel.scene.offsetHeight + travel)}px`);
    });
    if (!phone.matches) return;
    caseCarousels.forEach(carousel => {
      carousel.metric = {
        top: carousel.track.getBoundingClientRect().top + scrollY - caseStageOffset,
        range: Math.max(1, carousel.track.offsetHeight - carousel.scene.offsetHeight)
      };
    });
  }

  function getCaseTrack(carousel) {
    return carousel.metric;
  }

  function selectCasesFromScroll() {
    if (!phone.matches) return;
    caseCarousels.forEach(carousel => {
      const track = getCaseTrack(carousel);
      if (!track || scrollY < track.top - innerHeight || scrollY > track.top + track.range + innerHeight) return;
      const progress = Math.max(0, Math.min(1, (scrollY - track.top) / track.range));
      const index = Math.min(carousel.items.length - 1, Math.floor(progress * carousel.items.length));
      if (carousel.tabs.dataset.active !== String(index)) carousel.tabs._selectMobileChoice(index);
      carousel.scene.style.setProperty('--mobile-case-progress', String(progress));
    });
  }

  function scrollToCase(carousel, index) {
    if (!phone.matches) return;
    const track = getCaseTrack(carousel);
    if (!track) return;
    const progress = carousel.items.length > 1 ? index / (carousel.items.length - 1) : 0;
    scrollTo({top: track.top + (track.range * progress), behavior: reduced.matches ? 'instant' : 'smooth'});
  }

  function addHorizontalSwipe(surface, tabs, items, selectByIndex) {
    if (!surface || !tabs) return;
    let swipeStart = null;
    surface.addEventListener('touchstart', event => {
      const touch = event.touches[0];
      swipeStart = touch ? {x: touch.clientX, y: touch.clientY} : null;
    }, {passive: true});
    surface.addEventListener('touchend', event => {
      const touch = event.changedTouches[0];
      if (!swipeStart || !touch) return;
      const dx = touch.clientX - swipeStart.x;
      const dy = touch.clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      const active = Number(tabs.dataset.active || 0);
      selectByIndex(Math.max(0, Math.min(items.length - 1, active + (dx < 0 ? 1 : -1))));
    }, {passive: true});
  }

  if (heroTabs && heroStage) {
    heroTabs.addEventListener('mobile-choice-change', event => scrollToHero(event.detail.index));
    addHorizontalSwipe(heroStage, heroTabs, heroLayers, scrollToHero);
  }

  caseCarousels.forEach(carousel => {
    carousel.tabs.addEventListener('mobile-choice-change', event => scrollToCase(carousel, event.detail.index));
    addHorizontalSwipe(carousel.surface, carousel.tabs, carousel.items, index => scrollToCase(carousel, index));
  });

  const modelGrid = document.querySelector('.model-pie-grid');
  const modelCards = modelGrid ? [...modelGrid.querySelectorAll(':scope > article')] : [];
  const modelTabs = modelCards.length ? makeTabs(
    modelCards,
    modelCards.map(card => card.querySelector('.model-code')?.textContent || ''),
    'mobile-model-tabs'
  ) : null;
  if (modelTabs) modelGrid.before(modelTabs);

  const methodSection = document.querySelector('#method');
  const modelStageOffset = 70;
  let modelTrackMetric = null;

  function measureModelTrack() {
    if (!phone.matches || !methodSection) {
      modelTrackMetric = null;
      return;
    }
    const shell = methodSection.querySelector(':scope > .shell');
    modelTrackMetric = {
      top: methodSection.getBoundingClientRect().top + scrollY - modelStageOffset,
      range: Math.max(1, methodSection.offsetHeight - (shell?.offsetHeight || innerHeight))
    };
  }

  function getModelTrack() {
    return modelTrackMetric;
  }

  function selectModelFromScroll() {
    if (!phone.matches || !modelTabs || !methodSection) return;
    const track = getModelTrack();
    if (!track || scrollY < track.top - innerHeight || scrollY > track.top + track.range + innerHeight) return;
    const progress = Math.max(0, Math.min(1, (scrollY - track.top) / track.range));
    const index = Math.min(modelCards.length - 1, Math.floor(progress * modelCards.length));
    if (modelTabs.dataset.active !== String(index)) modelTabs._selectMobileChoice(index);
    methodSection.style.setProperty('--mobile-model-progress', String(progress));
  }

  function scrollToModel(index) {
    if (!phone.matches || !modelTabs) return;
    const track = getModelTrack();
    if (!track) return;
    const progress = modelCards.length > 1 ? index / (modelCards.length - 1) : 0;
    scrollTo({top: track.top + (track.range * progress), behavior: reduced.matches ? 'instant' : 'smooth'});
  }

  if (modelTabs && modelGrid) {
    modelTabs.addEventListener('mobile-choice-change', event => scrollToModel(event.detail.index));
    addHorizontalSwipe(modelGrid, modelTabs, modelCards, scrollToModel);
  }

  const revealTargets = [
    ...document.querySelectorAll('.partner-orbit .logo-card'),
    ...document.querySelectorAll('.solution-card'),
    ...document.querySelectorAll('.adoption-path > article'),
    ...document.querySelectorAll('.case-scene'),
    ...document.querySelectorAll('.phase-card')
  ];
  revealTargets.forEach(target => target.setAttribute('data-mobile-reveal', ''));
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting || !phone.matches) return;
    entry.target.classList.add('is-mobile-visible');
    revealObserver.unobserve(entry.target);
  }), {threshold: .08, rootMargin: '0px 0px -4%'});
  revealTargets.forEach(target => revealObserver.observe(target));

  function configure() {
    root.classList.toggle('mobile-layout-v43', phone.matches);
    [heroTabs, busTabs, fieldTabs, modelTabs].filter(Boolean).forEach(tabs => {
      const active = Number(tabs.dataset.active || 0);
      tabs._selectMobileChoice(active);
    });
    if (!phone.matches) {
      document.body.classList.remove('mobile-controls-hidden');
      revealTargets.forEach(target => target.classList.remove('is-mobile-visible'));
    }
    measureHeroTrack();
    measureCaseTracks();
    measureModelTrack();
    requestAnimationFrame(() => {
      selectHeroFromScroll();
      selectCasesFromScroll();
      selectModelFromScroll();
    });
  }

  let mobileStoryFrame = 0;
  addEventListener('scroll', () => {
    if (!phone.matches) return;
    if (!mobileStoryFrame) mobileStoryFrame = requestAnimationFrame(() => {
      mobileStoryFrame = 0;
      selectHeroFromScroll();
      selectCasesFromScroll();
      selectModelFromScroll();
    });
  }, {passive: true});

  let configureTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(configureTimer);
    configureTimer = setTimeout(configure, 140);
  }, {passive: true});
  phone.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  addEventListener('load', configure, {once: true});
  document.fonts?.ready.then(configure);
  configure();
})();
