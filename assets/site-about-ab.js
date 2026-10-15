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

  const track = (event, params = {}) => window.timuxTrack?.(event, {
    experiment_id: 'about_copy_v1',
    experiment_variant: variant,
    ...params
  });

  track('experiment_impression', {page_group: 'homepage'});

  let viewed = false;
  let visibleSince = 0;
  let visibleMs = 0;
  let sectionVisible = false;
  const updateVisibility = visible => {
    if (visible === sectionVisible) return;
    sectionVisible = visible;
    if (visible) {
      visibleSince = performance.now();
      if (!viewed) {
        viewed = true;
        track('about_section_view');
      }
    } else if (visibleSince) {
      visibleMs += performance.now() - visibleSince;
      visibleSince = 0;
    }
  };

  const observer = new IntersectionObserver(([entry]) => {
    updateVisibility(entry.isIntersecting && entry.intersectionRatio >= .35 && !document.hidden);
  }, {threshold: [.35, .6]});
  observer.observe(section);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) updateVisibility(false);
  });

  addEventListener('pagehide', () => {
    updateVisibility(false);
    if (!viewed) return;
    track('about_section_engagement', {
      engagement_time_msec: Math.round(visibleMs),
      engagement_bucket: visibleMs >= 30000 ? '30s_plus' : visibleMs >= 10000 ? '10_29s' : visibleMs >= 3000 ? '3_9s' : 'under_3s'
    });
  }, {once: true});
})();
