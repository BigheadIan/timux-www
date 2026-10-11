/* Native scroll, reversible service journey and depth runway. No timers or scroll hijacking. */
(() => {
  const tracks = [...document.querySelectorAll('.case-journey-track')];
  if (!tracks.length) return;
  const root = document.documentElement;
  const desktop = matchMedia('(min-width:1100px) and (min-height:700px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;
  let measurements = [];
  const scenes = tracks.map(track => {
    const scene = track.querySelector('.case-scene');
    const route = scene.querySelector('.route-main');
    return {track, scene, route, length: route?.getTotalLength(), traveller: scene.querySelector('.route-traveller'), stations: [...scene.querySelectorAll('.station')], phones: [...scene.querySelectorAll('.device')]};
  });
  function measure() {
    measurements = scenes.map(({track,scene}) => ({top:track.getBoundingClientRect().top + scrollY, travel:Math.max(1,track.offsetHeight - scene.offsetHeight)}));
  }
  function paint() {
    frame = 0;
    const enabled = desktop.matches && !reduced.matches;
    scenes.forEach(({scene,route,length,traveller,stations,phones}, index) => {
      const m = measurements[index];
      const q = enabled ? clamp((scrollY - m.top + 80) / m.travel) : .5;
      const phase = enabled ? Math.min(2,Math.floor(q * 3)) : 2;
      scene.dataset.journeyPhase = String(phase);
      scene.style.setProperty('--journey-progress', enabled ? String(q) : '1');
      stations.forEach((station,i) => {
        station.classList.toggle('station-active', !enabled || i === phase);
        station.classList.toggle('station-complete', !enabled || i < phase);
      });
      if (route && traveller) {
        const point = route.getPointAtLength(length * q);
        traveller.setAttribute('cx', point.x); traveller.setAttribute('cy',point.y);
        traveller.style.display = enabled ? '' : 'none';
      }
      phones.forEach((phone,i) => {
        const proximity = enabled ? clamp(1 - Math.abs(q - i / 2) * 2) : (i === 1 ? .75 : .35);
        phone.style.setProperty('--device-scale', String(.72 + proximity * .39));
        phone.style.setProperty('--device-depth', `${-80 + proximity * 120}px`);
        phone.style.setProperty('--device-lift', `${-proximity * 14}px`);
        phone.style.setProperty('--device-light', String(.84 + proximity * .16));
        phone.style.zIndex = String(1 + Math.round(proximity * 4));
      });
      scene.querySelectorAll('.editorial-steps>div').forEach((step,i) => step.classList.toggle('is-current', enabled && i===phase));
    });
  }
  const requestPaint = () => { if (!frame) frame = requestAnimationFrame(paint); };
  function configure() {
    if (innerWidth >= 1100) {
      const scale = Math.min(1, (innerWidth-144)/1600, (innerHeight-80)/1000);
      root.style.setProperty('--case-scale',String(Math.max(.4,scale)));
      root.style.setProperty('--case-height',`${1000*Math.max(.4,scale)}px`);
    }
    root.classList.toggle('journey-motion', desktop.matches && !reduced.matches);
    measure(); requestPaint();
  }
  addEventListener('scroll',requestPaint,{passive:true});
  addEventListener('resize',configure,{passive:true});
  addEventListener('load',configure,{once:true});
  desktop.addEventListener('change',configure); reduced.addEventListener('change',configure);
  document.fonts?.ready.then(configure);
  new ResizeObserver(() => {measure();requestPaint();}).observe(document.querySelector('main'));
  configure();
})();
