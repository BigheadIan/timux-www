/* Mobile chapter rails: native swipe first, buttons and keyboard as progressive enhancement. */
(() => {
  const query = matchMedia('(max-width: 820px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const english = document.documentElement.lang === 'en';
  const rails = [
    ['.partner-orbit .logo-row', '.logo-card'],
    ['.solution-grid', ':scope > article'],
    ['.adoption-path', ':scope > article'],
    ['.case-collection', ':scope > .case-journey-track'],
    ['.model-pie-grid', ':scope > article'],
    ['.phase-grid', ':scope > article']
  ];

  document.documentElement.classList.add('mobile-parity');

  rails.forEach(([selector, itemSelector], railIndex) => {
    const rail = document.querySelector(selector);
    if (!rail) return;
    const items = [...rail.querySelectorAll(itemSelector)];
    if (items.length < 2) return;

    rail.tabIndex = 0;
    if (!rail.hasAttribute('role')) {
      rail.setAttribute('role', 'region');
      rail.setAttribute('aria-roledescription', english ? 'carousel' : '輪播');
    }

    const nav = document.createElement('div');
    nav.className = 'mobile-rail-nav';
    nav.dataset.rail = String(railIndex);
    const buttons = items.map((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', english ? `View item ${index + 1}` : `查看第 ${index + 1} 項`);
      button.addEventListener('click', () => item.scrollIntoView({
        behavior: reduced.matches ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center'
      }));
      nav.append(button);
      return button;
    });
    rail.after(nav);

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!query.matches) return;
      const center = rail.scrollLeft + rail.clientWidth / 2;
      let active = 0;
      let distance = Infinity;
      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const nextDistance = Math.abs(itemCenter - center);
        if (nextDistance < distance) { distance = nextDistance; active = index; }
      });
      buttons.forEach((button, index) => button.setAttribute('aria-current', index === active ? 'true' : 'false'));
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    rail.addEventListener('scroll', requestUpdate, { passive: true });
    rail.addEventListener('keydown', event => {
      if (!query.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const current = Math.max(0, buttons.findIndex(button => button.getAttribute('aria-current') === 'true'));
      const next = Math.max(0, Math.min(items.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1)));
      items[next].scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    });
    addEventListener('resize', requestUpdate, { passive: true });
    requestUpdate();
  });
})();
