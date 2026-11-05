(() => {
  const phone = matchMedia('(max-width: 820px)');
  // Keep the headline evidence visible; visitors choose when to read the full story.
  document.querySelectorAll('details.outcome-story').forEach(story => { story.open = !phone.matches; });
  const bar = document.querySelector('.mobile-contact-bar');
  if (!bar || !('IntersectionObserver' in window)) return;
  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    bar.hidden = visible.size > 0;
  }, { threshold: 0, rootMargin: '-80px 0px -80px 0px' });
  document.querySelectorAll('#agent,#contact').forEach(section => observer.observe(section));
})();
