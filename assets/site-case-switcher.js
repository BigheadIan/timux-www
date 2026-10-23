/* V72: borderless cinematic hero with on-demand secondary media; no autoplay. */
(() => {
  const root = document.querySelector('[data-case-switcher]');
  if (!root) return;

  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  const stage = root.querySelector('.case-switcher-stage');
  const count = root.querySelector('[data-case-count]');
  const phone = matchMedia('(max-width: 820px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = Math.max(0, panels.findIndex(panel => panel.classList.contains('is-active')));
  let scrollFrame = 0;

  function loadPanelImage(panel) {
    if (!panel || panel.dataset.imageReady === 'true') return;
    panel.querySelectorAll('source[data-srcset]').forEach(source => {
      source.srcset = source.dataset.srcset;
      delete source.dataset.srcset;
    });
    panel.querySelectorAll('img[data-src]').forEach(image => {
      image.src = image.dataset.src;
      delete image.dataset.src;
    });
    panel.dataset.imageReady = 'true';
  }

  function updateState(index, { move = false, focus = false, track = false } = {}) {
    activeIndex = Math.max(0, Math.min(panels.length - 1, index));
    loadPanelImage(panels[activeIndex]);
    tabs.forEach((tab, itemIndex) => {
      const current = itemIndex === activeIndex;
      tab.classList.toggle('is-active', current);
      tab.setAttribute('aria-selected', String(current));
      tab.tabIndex = current ? 0 : -1;
    });
    panels.forEach((panel, itemIndex) => {
      const current = itemIndex === activeIndex;
      panel.classList.toggle('is-active', current);
      panel.setAttribute('aria-hidden', String(!current));
    });
    if (count) count.textContent = String(activeIndex + 1).padStart(2, '0');

    if (move && phone.matches) {
      const first = panels[0];
      const panel = panels[activeIndex];
      stage.scrollTo({
        left: panel.offsetLeft - first.offsetLeft,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    }
    if (focus) tabs[activeIndex].focus();
    if (track && typeof window.gtag === 'function') {
      window.gtag('event', 'case_preview_switch', {
        case_id: panels[activeIndex].dataset.casePanel,
        page_group: 'home'
      });
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => updateState(index, { move: true, track: true }));
    tab.addEventListener('pointerenter', () => loadPanelImage(panels[index]), { once: true });
    tab.addEventListener('focus', () => loadPanelImage(panels[index]), { once: true });
    tab.addEventListener('keydown', event => {
      let target = null;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target === null) return;
      event.preventDefault();
      updateState(target, { move: true, focus: true, track: true });
    });
  });

  stage.addEventListener('scroll', () => {
    if (!phone.matches || scrollFrame) return;
    if (stage.scrollLeft > 8 && panels[1]) loadPanelImage(panels[1]);
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const left = stage.scrollLeft;
      const firstLeft = panels[0].offsetLeft;
      let nearest = 0;
      let distance = Infinity;
      panels.forEach((panel, index) => {
        const nextDistance = Math.abs((panel.offsetLeft - firstLeft) - left);
        if (nextDistance < distance) {
          distance = nextDistance;
          nearest = index;
        }
      });
      if (nearest !== activeIndex) updateState(nearest);
    });
  }, { passive: true });

  const syncLayout = () => {
    if (phone.matches) updateState(activeIndex, { move: true });
    else stage.scrollLeft = 0;
  };
  phone.addEventListener('change', syncLayout);
  addEventListener('resize', syncLayout, { passive: true });
  updateState(activeIndex, { move: phone.matches });
})();

(() => {
  const section = document.querySelector('.adoption-scene-section');
  if (!section) return;

  const revealScene = () => {
    if (section.classList.contains('is-scene-image-ready')) return;
    if (!matchMedia('(max-width: 820px)').matches) {
      section.querySelectorAll('source[data-srcset]').forEach(source => {
        source.srcset = source.dataset.srcset;
        delete source.dataset.srcset;
      });
      section.querySelectorAll('img[data-src]').forEach(image => {
        image.src = image.dataset.src;
        delete image.dataset.src;
      });
    }
    section.classList.add('is-scene-image-ready');
  };

  if (!('IntersectionObserver' in window)) {
    revealScene();
    return;
  }
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    revealScene();
    observer.disconnect();
  }, { rootMargin: '500px 0px' });
  observer.observe(section);
})();
