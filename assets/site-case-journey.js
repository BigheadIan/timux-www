/* Native scroll, reversible service journey and depth runway. No timers or scroll hijacking. */
(() => {
  const tracks = [...document.querySelectorAll('.case-journey-track')];
  if (!tracks.length) return;
  const root = document.documentElement;
  const desktop = matchMedia('(min-width:1100px) and (min-height:700px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const setStyle = (el,name,value) => { if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name,value); };
  const setAttr = (el,name,value) => { value=String(value); if (el.getAttribute(name) !== value) el.setAttribute(name,value); };
  const setClass = (el,name,value) => { if (el.classList.contains(name) !== value) el.classList.toggle(name,value); };
  const number = (value,digits=4) => Number(value.toFixed(digits)).toString();
  let frame = 0;
  let enabled = false;
  let targetScrollY = scrollY, currentScrollY = scrollY, lastFrameTime = 0;
  let measurements = [];
  const scenes = tracks.map(track => {
    const scene = track.querySelector('.case-scene');
    const route = scene.querySelector('.route-main');
    return {track, scene, route, length: route?.getTotalLength(), traveller: scene.querySelector('.route-traveller'), stations: [...scene.querySelectorAll('.station')], phones: [...scene.querySelectorAll('.device')], editorialSteps: [...scene.querySelectorAll('.editorial-steps>div')]};
  });
  function measure() {
    measurements = scenes.map(({track,scene}) => ({top:track.getBoundingClientRect().top + scrollY, height:track.offsetHeight, travel:Math.max(1,track.offsetHeight - scene.offsetHeight)}));
  }
  function paint(now=performance.now()) {
    frame = 0;
    if(enabled){
      const elapsed=lastFrameTime ? Math.min(64,now-lastFrameTime) : 16;
      lastFrameTime=now;
      currentScrollY+=(targetScrollY-currentScrollY)*(1-Math.exp(-elapsed/42));
      if(Math.abs(targetScrollY-currentScrollY)<.25)currentScrollY=targetScrollY;
    }
    scenes.forEach(({scene,route,length,traveller,stations,phones,editorialSteps}, index) => {
      const m = measurements[index];
      if(enabled && (m.top+m.height<targetScrollY-innerHeight*.6 || m.top>targetScrollY+innerHeight*1.6))return;
      const q = enabled ? clamp((currentScrollY - m.top + 80) / m.travel) : .5;
      const phase = enabled ? Math.min(2,Math.floor(q * 3)) : 2;
      if(scene.dataset.journeyPhase!==String(phase))scene.dataset.journeyPhase=String(phase);
      setStyle(scene,'--journey-progress',enabled ? number(q) : '1');
      stations.forEach((station,i) => {
        setClass(station,'station-active',!enabled || i===phase);
        setClass(station,'station-complete',!enabled || i<phase);
      });
      if (route && traveller) {
        const point = route.getPointAtLength(length * q);
        setAttr(traveller,'cx',number(point.x,2)); setAttr(traveller,'cy',number(point.y,2));
        setStyle(traveller,'display',enabled ? '' : 'none');
      }
      phones.forEach((phone,i) => {
        const proximity = enabled ? clamp(1 - Math.abs(q - i / 2) * 2) : (i === 1 ? .75 : .35);
        setStyle(phone,'--device-scale',number(.72+proximity*.39));
        setStyle(phone,'--device-depth',`${number(-80+proximity*120,2)}px`);
        setStyle(phone,'--device-lift',`${number(-proximity*14,2)}px`);
        setStyle(phone,'--device-light',number(.84+proximity*.16));
        setStyle(phone,'z-index',String(1+Math.round(proximity*4)));
      });
      editorialSteps.forEach((step,i) => setClass(step,'is-current',enabled&&i===phase));
    });
    if(enabled&&currentScrollY!==targetScrollY)frame=requestAnimationFrame(paint);
    else lastFrameTime=0;
  }
  const requestPaint = () => { if (enabled && !frame) frame = requestAnimationFrame(paint); };
  const onScroll = () => {
    targetScrollY=scrollY;
    if(Math.abs(targetScrollY-currentScrollY)>innerHeight*1.25)currentScrollY=targetScrollY;
    requestPaint();
  };
  function configure() {
    enabled = desktop.matches && !reduced.matches;
    root.dataset.journeyScroll = enabled ? 'active' : 'idle';
    if (innerWidth >= 1100) {
      const scale = Math.min(1, (innerWidth-144)/1600, (innerHeight-80)/1000);
      root.style.setProperty('--case-scale',String(Math.max(.4,scale)));
      root.style.setProperty('--case-height',`${1000*Math.max(.4,scale)}px`);
    }
    root.classList.toggle('journey-motion', enabled);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (enabled) {
      targetScrollY=currentScrollY=scrollY;
      lastFrameTime=0;
      measure();
      requestPaint();
    } else {
      paint();
    }
  }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',configure,{passive:true});
  addEventListener('load',configure,{once:true});
  desktop.addEventListener('change',configure); reduced.addEventListener('change',configure);
  document.fonts?.ready.then(configure);
  new ResizeObserver(() => {
    if (!enabled) return;
    measure();
    requestPaint();
  }).observe(document.querySelector('main'));
  configure();
})();
