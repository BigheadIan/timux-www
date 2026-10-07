(() => {
  const directory = document.querySelector('[data-nav-directory]');
  if (!directory) return;

  const entries = [...directory.querySelectorAll('.nav-entry')];
  const mobileNav = document.querySelector('.mobile-nav');
  const hoverCapable = matchMedia('(hover: hover) and (pointer: fine)');
  let closeTimer = 0;

  const closeEntry = (entry) => {
    const trigger = entry.querySelector('.nav-trigger');
    const panel = entry.querySelector('.mega-panel');
    entry.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
  };

  const closeAll = (except = null) => {
    clearTimeout(closeTimer);
    entries.forEach((entry) => {
      if (entry !== except) closeEntry(entry);
    });
  };

  const openEntry = (entry) => {
    clearTimeout(closeTimer);
    closeAll(entry);
    const trigger = entry.querySelector('.nav-trigger');
    const panel = entry.querySelector('.mega-panel');
    entry.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    panel.inert = false;
  };

  const scheduleClose = (entry) => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => closeEntry(entry), 180);
  };

  entries.forEach((entry) => {
    const trigger = entry.querySelector('.nav-trigger');
    const panel = entry.querySelector('.mega-panel');
    panel.inert = true;

    entry.addEventListener('pointerenter', () => {
      if (hoverCapable.matches) openEntry(entry);
    });
    entry.addEventListener('pointerleave', () => {
      if (hoverCapable.matches) scheduleClose(entry);
    });
    entry.addEventListener('focusin', () => openEntry(entry));
    entry.addEventListener('focusout', (event) => {
      if (!entry.contains(event.relatedTarget)) scheduleClose(entry);
    });
    trigger.addEventListener('click', () => closeAll());
    panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeAll()));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const activeEntry = entries.find((entry) => entry.classList.contains('is-open'));
    if (!activeEntry) return;
    closeAll();
    activeEntry.querySelector('.nav-trigger').focus();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!directory.contains(event.target)) closeAll();
  });
  addEventListener('scroll', () => closeAll(), { passive: true });

  if (mobileNav) {
    const groups = [...mobileNav.querySelectorAll('.mobile-nav-panel > details')];
    groups.forEach((group) => group.addEventListener('toggle', () => {
      if (!group.open) return;
      groups.forEach((other) => {
        if (other !== group) other.open = false;
      });
    }));
    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      mobileNav.open = false;
    }));
  }
})();
