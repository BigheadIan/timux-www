/* V42: compact mobile stages driven by native page scroll. */
(() => {
  const phone = matchMedia('(max-width: 820px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const english = root.lang === 'en';
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const v = clamp(value); return v * v * (3 - 2 * v); };
  const range = (value, start, end) => ease((value - start) / Math.max(.001, end - start));
  const pad = value => String(value).padStart(2, '0');

  root.classList.add('mobile-parity');

  function makeNav(count, className = '') {
    const nav = document.createElement('div');
    nav.className = `mobile-story-nav ${className}`.trim();
    nav.setAttribute('aria-hidden', 'true');
    nav.innerHTML = `<span class="mobile-story-nav-label">01 / ${pad(count)}</span><span class="mobile-story-nav-dots">${Array.from({length: count}, (_, i) => `<i${i === 0 ? ' class="is-current"' : ''}></i>`).join('')}</span><span>${english ? 'Scroll' : '滑動頁面'} ↓</span>`;
    return nav;
  }

  function setNav(nav, index, count) {
    if (!nav) return;
    nav.querySelector('.mobile-story-nav-label').textContent = `${pad(index + 1)} / ${pad(count)}`;
    nav.querySelectorAll('i').forEach((dot, i) => dot.classList.toggle('is-current', i === index));
  }

  const moduleSpecs = [
    ['.partner-orbit', '.logo-row', '.logo-card', 'orbit'],
    ['#solutions', '.solution-grid', ':scope > article', 'cards'],
    ['#adoption', '.adoption-path', ':scope > article', 'cards'],
    ['#method', '.model-pie-grid', ':scope > article', 'models'],
    ['#roadmap', '.phase-grid', ':scope > article', 'cards']
  ];

  const modules = moduleSpecs.map(([trackSelector, railSelector, itemSelector, type]) => {
    const track = document.querySelector(trackSelector);
    const rail = track?.querySelector(railSelector);
    const items = rail ? [...rail.querySelectorAll(itemSelector)] : [];
    if (!track || !rail || items.length < 2) return null;
    const nav = makeNav(items.length);
    rail.after(nav);
    return {track, rail, items, nav, type, top: 0, travel: 1, current: -1};
  }).filter(Boolean);

  const caseCollection = document.querySelector('.case-collection');
  const caseTracks = caseCollection ? [...caseCollection.querySelectorAll(':scope > .case-journey-track')] : [];
  const caseScenes = caseTracks.map(track => track.querySelector('.case-scene')).filter(Boolean);
  caseScenes.forEach(scene => scene.querySelector('.scene-inner')?.append(makeNav(4, 'mobile-case-nav')));
  const caseState = {track: caseCollection, top: 0, travel: 1, current: -1};

  function measure() {
    const stageHeight = Math.min(innerHeight - 70, 720);
    modules.forEach(module => {
      const rect = module.track.getBoundingClientRect();
      module.top = rect.top + scrollY;
      module.travel = Math.max(1, module.track.offsetHeight - stageHeight);
    });
    if (caseCollection) {
      const rect = caseCollection.getBoundingClientRect();
      caseState.top = rect.top + scrollY;
      caseState.travel = Math.max(1, caseCollection.offsetHeight - stageHeight);
    }
  }

  function progress(state) {
    return clamp((scrollY - state.top + 70) / state.travel);
  }

  function paintModule(module) {
    const q = progress(module);
    const position = q * (module.items.length - 1);
    const current = Math.max(0, Math.min(module.items.length - 1, Math.round(position)));
    module.track.style.setProperty('--mobile-progress', q.toFixed(4));
    module.items.forEach((item, index) => {
      const delta = index - position;
      const distance = Math.abs(delta);
      const active = index === current;
      const visible = active ? 1 : 0;
      const x = delta * (module.type === 'orbit' ? 24 : 12);
      const y = distance * (module.type === 'models' ? 7 : 9);
      const rotate = module.type === 'orbit' ? delta * 4 : delta * 2;
      const scale = 1 - Math.min(distance, 1) * (module.type === 'orbit' ? .09 : .04);
      item.style.setProperty('--mobile-opacity', String(visible));
      item.style.setProperty('--mobile-x', `${x}%`);
      item.style.setProperty('--mobile-y', `${y}px`);
      item.style.setProperty('--mobile-rotate', `${rotate}deg`);
      item.style.setProperty('--mobile-scale', scale.toFixed(3));
      item.style.setProperty('--mobile-saturation', active ? '1' : '.72');
      item.style.setProperty('--mobile-pointer', active ? 'auto' : 'none');
      item.setAttribute('aria-hidden', active ? 'false' : 'true');
      if ('inert' in item) item.inert = !active;
    });
    if (module.current !== current) {
      module.current = current;
      module.track.dataset.mobileStep = String(current);
      setNav(module.nav, current, module.items.length);
    }
  }

  function paintCases() {
    if (!caseCollection || caseScenes.length < 2) return;
    const q = progress(caseState);
    const switchProgress = range(q, .53, .66);
    const caseIndex = q < .595 ? 0 : 1;
    caseTracks.forEach((track, index) => {
      const opacity = index === 0 ? 1 - switchProgress : switchProgress;
      track.style.setProperty('--mobile-case-opacity', opacity.toFixed(3));
      track.style.setProperty('--mobile-pointer', index === caseIndex ? 'auto' : 'none');
      track.setAttribute('aria-hidden', index === caseIndex ? 'false' : 'true');
      if ('inert' in track) track.inert = index !== caseIndex;
    });

    const stations = [...caseScenes[0].querySelectorAll('.station')];
    const stationPosition = clamp(q / .53) * Math.max(0, stations.length - 1);
    const stationCurrent = Math.round(stationPosition);
    stations.forEach((station, index) => {
      const delta = index - stationPosition;
      const distance = Math.abs(delta);
      const active = index === stationCurrent;
      station.style.setProperty('--mobile-opacity', active ? '1' : '0');
      station.style.setProperty('--mobile-x', `${delta * 20}%`);
      station.style.setProperty('--mobile-y', `${distance * 12}px`);
      station.style.setProperty('--mobile-scale', String(1 - Math.min(distance, 1) * .065));
      station.style.setProperty('--mobile-pointer', active ? 'auto' : 'none');
      station.classList.toggle('station-active', active);
      station.classList.toggle('station-complete', index < stationCurrent);
      station.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    const busScene = caseScenes[0];
    busScene.dataset.journeyPhase = String(stationCurrent);
    busScene.style.setProperty('--journey-progress', String(clamp(q / .53)));
    const route = busScene.querySelector('.route-main');
    const traveller = busScene.querySelector('.route-traveller');
    if (route && traveller) {
      const routeQ = clamp(q / .53);
      const point = route.getPointAtLength(route.getTotalLength() * routeQ);
      traveller.setAttribute('cx', point.x);
      traveller.setAttribute('cy', point.y);
      traveller.style.display = '';
    }

    const fieldQ = clamp((q - .58) / .42);
    const phones = [...caseScenes[1].querySelectorAll('.device')];
    const phonePosition = fieldQ * Math.max(0, phones.length - 1);
    const phoneCurrent = Math.round(phonePosition);
    phones.forEach((phoneEl, index) => {
      const proximity = clamp(1 - Math.abs(phonePosition - index));
      phoneEl.style.setProperty('--device-scale', String(.74 + proximity * .34));
      phoneEl.style.setProperty('--device-depth', `${-72 + proximity * 108}px`);
      phoneEl.style.setProperty('--device-lift', `${-proximity * 12}px`);
      phoneEl.style.setProperty('--device-light', String(.82 + proximity * .18));
      phoneEl.style.zIndex = String(1 + Math.round(proximity * 4));
    });
    caseScenes[1].querySelectorAll('.editorial-steps>div').forEach((step, index) => step.classList.toggle('is-current', index === phoneCurrent));
    const overallStep = caseIndex === 0 ? stationCurrent : 3;
    caseScenes.forEach(scene => setNav(scene.querySelector('.mobile-case-nav'), overallStep, 4));
    if (caseState.current !== overallStep) {
      caseState.current = overallStep;
      caseCollection.dataset.mobileStep = String(overallStep);
    }
  }

  let frame = 0;
  function paint() {
    frame = 0;
    if (!phone.matches || reduced.matches) return;
    modules.forEach(paintModule);
    paintCases();
  }
  function requestPaint() { if (!frame) frame = requestAnimationFrame(paint); }

  let controlsTimer = 0;
  let lastScroll = scrollY;
  function handleScroll() {
    requestPaint();
    if (!phone.matches) return;
    const moved = Math.abs(scrollY - lastScroll) > 2;
    lastScroll = scrollY;
    if (moved && scrollY > 180) document.body.classList.add('mobile-controls-hidden');
    clearTimeout(controlsTimer);
    controlsTimer = setTimeout(() => document.body.classList.remove('mobile-controls-hidden'), 520);
  }

  function configure() {
    root.classList.toggle('mobile-story-v42', phone.matches);
    root.classList.toggle('mobile-story-reduced', phone.matches && reduced.matches);
    if (!phone.matches) document.body.classList.remove('mobile-controls-hidden');
    measure();
    requestPaint();
  }

  addEventListener('scroll', handleScroll, {passive: true});
  addEventListener('resize', configure, {passive: true});
  addEventListener('load', configure, {once: true});
  phone.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  document.fonts?.ready.then(configure);
  new ResizeObserver(() => { measure(); requestPaint(); }).observe(document.querySelector('main'));
  configure();
})();
