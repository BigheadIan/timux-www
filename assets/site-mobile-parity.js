/* V49: mobile-native layout controls with compact scroll-driven story carousels. */
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
        return;
      }
      const travel = innerWidth <= 370 ? 330 : 360;
      carousel.track.style.setProperty('--mobile-case-track-height', `${Math.ceil(carousel.scene.offsetHeight + travel)}px`);
    });
  }

  function getCaseTrack(carousel) {
    const top = carousel.track.getBoundingClientRect().top + scrollY - caseStageOffset;
    return {top, range: Math.max(1, carousel.track.offsetHeight - carousel.scene.offsetHeight)};
  }

  function selectCasesFromScroll() {
    if (!phone.matches) return;
    caseCarousels.forEach(carousel => {
      const track = getCaseTrack(carousel);
      const progress = Math.max(0, Math.min(1, (scrollY - track.top) / track.range));
      const index = Math.min(carousel.items.length - 1, Math.floor(progress * carousel.items.length));
      if (carousel.tabs.dataset.active !== String(index)) carousel.tabs._selectMobileChoice(index);
      carousel.scene.style.setProperty('--mobile-case-progress', String(progress));
    });
  }

  function scrollToCase(carousel, index) {
    if (!phone.matches) return;
    const track = getCaseTrack(carousel);
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

  function getModelTrack() {
    if (!methodSection) return null;
    const shell = methodSection.querySelector(':scope > .shell');
    const top = methodSection.getBoundingClientRect().top + scrollY - modelStageOffset;
    return {top, range: Math.max(1, methodSection.offsetHeight - (shell?.offsetHeight || innerHeight))};
  }

  function selectModelFromScroll() {
    if (!phone.matches || !modelTabs || !methodSection) return;
    const track = getModelTrack();
    const progress = Math.max(0, Math.min(1, (scrollY - track.top) / track.range));
    const index = Math.min(modelCards.length - 1, Math.floor(progress * modelCards.length));
    if (modelTabs.dataset.active !== String(index)) modelTabs._selectMobileChoice(index);
    methodSection.style.setProperty('--mobile-model-progress', String(progress));
  }

  function scrollToModel(index) {
    if (!phone.matches || !modelTabs) return;
    const track = getModelTrack();
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
    [busTabs, fieldTabs, modelTabs].filter(Boolean).forEach(tabs => {
      const active = Number(tabs.dataset.active || 0);
      tabs._selectMobileChoice(active);
    });
    if (!phone.matches) {
      document.body.classList.remove('mobile-controls-hidden');
      revealTargets.forEach(target => target.classList.remove('is-mobile-visible'));
    }
    measureCaseTracks();
    requestAnimationFrame(() => {
      selectCasesFromScroll();
      selectModelFromScroll();
    });
  }

  let controlsTimer = 0;
  let lastScroll = scrollY;
  let mobileStoryFrame = 0;
  addEventListener('scroll', () => {
    if (!phone.matches) return;
    const moved = Math.abs(scrollY - lastScroll) > 2;
    lastScroll = scrollY;
    if (moved && scrollY > 180) document.body.classList.add('mobile-controls-hidden');
    clearTimeout(controlsTimer);
    controlsTimer = setTimeout(() => document.body.classList.remove('mobile-controls-hidden'), 480);
    if (!mobileStoryFrame) mobileStoryFrame = requestAnimationFrame(() => {
      mobileStoryFrame = 0;
      selectCasesFromScroll();
      selectModelFromScroll();
    });
  }, {passive: true});

  addEventListener('resize', configure, {passive: true});
  phone.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  addEventListener('load', configure, {once: true});
  document.fonts?.ready.then(configure);
  configure();
})();
