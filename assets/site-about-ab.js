(() => {
  const section = document.querySelector('[data-about-experiment]');
  if (!section) return;

  const variant = document.documentElement.dataset.aboutVariant === 'B' ? 'B' : 'A';
  section.dataset.activeVariant = variant;
  section.querySelectorAll('[data-ab-variant]').forEach(panel => {
    const active = panel.dataset.abVariant === variant;
    panel.hidden = !active;
    panel.setAttribute('aria-hidden', String(!active));
  });

  const track = (event, params = {}) => {
    if (document.documentElement.dataset.aboutPreview === 'true') return;
    window.timuxTrack?.(event, {
      experiment_id: 'about_copy_v1',
      experiment_variant: variant,
      ...params
    });
  };

  track('experiment_impression', {page_group: 'about_page'});
  track('about_page_view', {page_path: location.pathname});

  let viewed = false;
  let visibleSince = document.hidden ? 0 : performance.now();
  let visibleMs = 0;
  const updatePageVisibility = visible => {
    if (!visible && visibleSince) {
      visibleMs += performance.now() - visibleSince;
      visibleSince = 0;
    } else if (visible && !visibleSince) visibleSince = performance.now();
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (viewed || document.hidden || !entry.isIntersecting || entry.intersectionRatio < .35) return;
    viewed = true;
    track('about_content_view');
    observer.disconnect();
  }, {threshold: [.35, .6]});
  observer.observe(section.querySelector('.about-page-hero') || section);

  document.addEventListener('visibilitychange', () => {
    updatePageVisibility(!document.hidden);
  });

  addEventListener('pagehide', () => {
    updatePageVisibility(false);
    if (!viewed) return;
    track('about_page_engagement', {
      engagement_time_msec: Math.round(visibleMs),
      engagement_bucket: visibleMs >= 30000 ? '30s_plus' : visibleMs >= 10000 ? '10_29s' : visibleMs >= 3000 ? '3_9s' : 'under_3s'
    });
  }, {once: true});

  const mobileNav = document.querySelector('.mobile-nav');
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.open = false;
  }));
})();
