/* V59: every staged mobile story is a user-controlled native carousel. */
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
        item.classList.toggle('is-mobile-current', index === activeIndex);
        item.removeAttribute('aria-hidden');
        if ('inert' in item) item.inert = false;
      });
      buttons.forEach((button, index) => button.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false'));
      tabs.dataset.active = String(activeIndex);
      if (userInitiated) tabs.dispatchEvent(new CustomEvent('mobile-choice-change', {detail: {index: activeIndex}}));
    }

    tabs._selectMobileChoice = select;
    select(0);
    return tabs;
  }

  function wrapItems(items, className) {
    if (!items.length || !items[0].parentElement) return null;
    const wrapper = document.createElement('div');
    wrapper.className = `mobile-carousel-track ${className}`;
    items[0].before(wrapper);
    items.forEach(item => wrapper.append(item));
    return wrapper;
  }

  function makeProgress(count, theme = 'dark') {
    const progress = document.createElement('div');
    progress.className = `mobile-carousel-progress is-${theme}`;
    progress.innerHTML = `
      <span class="mobile-carousel-swipe-label"><b>←</b> ${english ? 'Swipe to explore' : '左右滑動查看'} <b>→</b></span>
      <span class="mobile-carousel-dots" aria-hidden="true">${'<i></i>'.repeat(count)}</span>`;
    return progress;
  }

  const carousels = [];

  function setupCarousel({name, surface, tabs, items, theme = 'dark'}) {
    if (!surface || !tabs || !items.length) return null;
    surface.classList.add('mobile-swipe-surface');
    surface.dataset.mobileCarousel = name;
    items.forEach(item => item.classList.add('mobile-swipe-card'));
    const progress = makeProgress(items.length, theme);
    surface.after(progress);

    function targetLeft(index) {
      const first = items[0];
      const item = items[index];
      return first && item ? item.offsetLeft - first.offsetLeft : 0;
    }

    function select(index) {
      if (tabs.dataset.active !== String(index)) tabs._selectMobileChoice(index);
      [...progress.querySelectorAll('i')].forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
    }

    function scrollToIndex(index, behavior = reduced.matches ? 'instant' : 'smooth') {
      if (!phone.matches) return;
      select(index);
      surface.scrollTo({left: targetLeft(index), behavior});
    }

    tabs.addEventListener('mobile-choice-change', event => scrollToIndex(event.detail.index));
    let scrollFrame = 0;
    surface.addEventListener('scroll', () => {
      if (!phone.matches || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const left = surface.scrollLeft;
        const index = items.reduce((closest, item, itemIndex) => (
          Math.abs(targetLeft(itemIndex) - left) < Math.abs(targetLeft(closest) - left) ? itemIndex : closest
        ), 0);
        select(index);
      });
    }, {passive: true});

    select(0);
    const carousel = {name, surface, tabs, items, progress, scrollToIndex};
    carousels.push(carousel);
    return carousel;
  }

  const heroTrack = document.querySelector('.engine-track');
  const heroScene = document.querySelector('.outcome-hero');
  const heroStage = heroScene?.querySelector('.engine-stage');
  const heroStack = heroStage?.querySelector('.engine-stack');
  const heroLayers = heroStack ? [...heroStack.querySelectorAll('.engine-layer')] : [];
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

  if (heroTabs && heroStage && heroStack) {
    heroTabs.setAttribute('aria-label', english ? 'Execution engine stages' : '執行引擎階段');
    [...heroTabs.querySelectorAll('button')].forEach((button, index) => {
      button.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')} ${heroLayerNames[index]}`);
    });
    heroStage.prepend(heroTabs);
    heroLayers.forEach((layer, index) => {
      const title = layer.querySelector('.engine-layer-head b');
      const detail = layer.querySelector(':scope > p');
      if (title) title.textContent = heroLayerNames[index];
      if (detail) detail.textContent = heroLayerDetails[index];
      layer.classList.remove('is-assembled');
      layer.style.removeProperty('opacity');
      layer.style.removeProperty('transform');
    });
    const result = document.createElement('div');
    result.className = 'mobile-engine-result';
    result.innerHTML = english
      ? '<div><span>Execute</span><i>→</i><span>Write back</span><i>→</i><span>Record</span></div><small>Grounded · Human oversight · Traceable</small>'
      : '<div><span>執行任務</span><i>→</i><span>回寫系統</span><i>→</i><span>留下紀錄</span></div><small>資料有依據 · 人保有決策 · 結果可追蹤</small>';
    heroLayers.at(-1)?.append(result);
    setupCarousel({name: 'engine', surface: heroStack, tabs: heroTabs, items: heroLayers, theme: 'dark'});
  }

  const solutionGrid = document.querySelector('#solutions .solution-grid');
  const solutionCards = solutionGrid ? [...solutionGrid.querySelectorAll(':scope > article')] : [];
  const solutionTabs = solutionCards.length ? makeTabs(
    solutionCards,
    solutionCards.map((_, index) => String(index + 1).padStart(2, '0')),
    'mobile-solution-tabs'
  ) : null;
  if (solutionTabs && solutionGrid) {
    solutionTabs.setAttribute('aria-label', english ? 'Solution categories' : '解決方案類別');
    [...solutionTabs.querySelectorAll('button')].forEach((button, index) => {
      button.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')} ${solutionCards[index].querySelector('h3')?.textContent || ''}`);
    });
    solutionGrid.before(solutionTabs);
    setupCarousel({name: 'solutions', surface: solutionGrid, tabs: solutionTabs, items: solutionCards, theme: 'light'});
  }

  const adoptionSection = document.querySelector('#adoption');
  const adoptionPath = adoptionSection?.querySelector('.adoption-path');
  const adoptionCards = adoptionPath ? [...adoptionPath.querySelectorAll(':scope > article')] : [];
  const adoptionTabs = adoptionCards.length ? makeTabs(
    adoptionCards,
    adoptionCards.map((card, index) => `${String(index + 1).padStart(2, '0')} ${card.querySelector('small')?.textContent || ''}`),
    'mobile-adoption-tabs'
  ) : null;
  if (adoptionTabs && adoptionPath) {
    adoptionTabs.setAttribute('aria-label', english ? 'Adoption steps' : '導入步驟');
    adoptionPath.before(adoptionTabs);
    setupCarousel({name: 'adoption', surface: adoptionPath, tabs: adoptionTabs, items: adoptionCards, theme: 'light'});
  }

  const busScene = document.querySelector('.a-bus');
  const stations = busScene ? [...busScene.querySelectorAll('.station')] : [];
  const busTabs = stations.length ? makeTabs(
    stations,
    stations.map((station, index) => `${String(index + 1).padStart(2, '0')} ${station.querySelector('em')?.textContent?.split('/').pop().trim() || ''}`),
    'mobile-case-tabs'
  ) : null;
  if (busTabs && busScene) {
    const busTrack = wrapItems(stations, 'mobile-bus-track');
    busTabs.setAttribute('aria-label', english ? 'Southeast Bus story steps' : '東南客運案例步驟');
    busScene.querySelector('.route-key')?.after(busTabs);
    setupCarousel({name: 'southeast', surface: busTrack, tabs: busTabs, items: stations, theme: 'dark'});
  }

  const fieldScene = document.querySelector('.a-mj');
  const devices = fieldScene ? [...fieldScene.querySelectorAll('.device')] : [];
  const fieldSteps = fieldScene ? [...fieldScene.querySelectorAll('.editorial-steps > div')] : [];
  const fieldTabs = devices.length ? makeTabs(
    devices,
    devices.map((_, index) => `${String(index + 1).padStart(2, '0')} ${fieldSteps[index]?.querySelector('b')?.textContent || ''}`),
    'mobile-field-tabs'
  ) : null;
  if (fieldTabs && fieldScene) {
    const fieldTrack = wrapItems(devices, 'mobile-field-track');
    fieldTabs.setAttribute('aria-label', english ? 'MJ Security story steps' : '銘將保全案例步驟');
    fieldScene.querySelector('.runway')?.before(fieldTabs);
    setupCarousel({name: 'mj', surface: fieldTrack, tabs: fieldTabs, items: devices, theme: 'light'});
  }

  const modelGrid = document.querySelector('.model-pie-grid');
  const modelCards = modelGrid ? [...modelGrid.querySelectorAll(':scope > article')] : [];
  const modelTabs = modelCards.length ? makeTabs(
    modelCards,
    modelCards.map(card => card.querySelector('.model-code')?.textContent || ''),
    'mobile-model-tabs'
  ) : null;
  if (modelTabs && modelGrid) {
    modelTabs.setAttribute('aria-label', english ? 'Operating principles' : '營運原則');
    modelGrid.before(modelTabs);
    setupCarousel({name: 'principles', surface: modelGrid, tabs: modelTabs, items: modelCards, theme: 'dark'});
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
    heroTrack?.style.removeProperty('--mobile-hero-track-height');
    adoptionSection?.style.removeProperty('--mobile-flow-track-height');
    document.querySelector('#method')?.style.removeProperty('--mobile-model-track-height');
    document.querySelectorAll('.case-journey-track').forEach(track => track.style.removeProperty('--mobile-case-track-height'));
    heroScene?.style.removeProperty('--mobile-engine-progress');
    adoptionSection?.style.removeProperty('--mobile-flow-progress');
    document.querySelector('#method')?.style.removeProperty('--mobile-model-progress');
    document.querySelectorAll('.case-scene').forEach(scene => scene.style.removeProperty('--mobile-case-progress'));
    if (heroStage) {
      if (phone.matches) heroStage.removeAttribute('aria-hidden');
      else heroStage.setAttribute('aria-hidden', 'true');
    }
    carousels.forEach(carousel => {
      const active = Number(carousel.tabs.dataset.active || 0);
      carousel.tabs._selectMobileChoice(active);
      if (phone.matches) carousel.scrollToIndex(active, 'instant');
    });
    if (!phone.matches) {
      document.body.classList.remove('mobile-controls-hidden');
      revealTargets.forEach(target => target.classList.remove('is-mobile-visible'));
    }
  }

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
