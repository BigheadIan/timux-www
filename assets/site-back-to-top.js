(() => {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;
  button.addEventListener('click', () => {
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
    const heading = document.querySelector('main h1');
    if (heading) {
      if (!heading.hasAttribute('tabindex')) {
        heading.setAttribute('tabindex', '-1');
        heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
      }
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
})();
