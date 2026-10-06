/* Timux V20 partner orbit. Card-only hover pause with static fallbacks. */
(() => {
  const section=document.querySelector('.partner-orbit');
  if(!section)return;
  const row=section.querySelector('.logo-row');
  const cards=[...row.querySelectorAll('.logo-card')];
  const motion=matchMedia('(min-width: 821px) and (min-height: 600px)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let phase=-Math.PI/12,frame=0,last=0,visible=false,paused=false,enabled=false;

  function place(){
    if(!enabled)return;
    const rx=Math.min(row.clientWidth*.39,530);
    const ry=Math.min(row.clientHeight*.355,220);
    cards.forEach((card,index)=>{
      const angle=phase+index*Math.PI*2/cards.length;
      const depth=(Math.sin(angle)+1)/2;
      const x=Math.cos(angle)*rx;
      const y=Math.sin(angle)*ry;
      const scale=.82+depth*.30;
      card.style.transform=`translate3d(calc(-50% + ${x.toFixed(2)}px),calc(-50% + ${y.toFixed(2)}px),0) scale(${scale.toFixed(4)})`;
      card.style.opacity=(.58+depth*.42).toFixed(3);
      card.style.zIndex=String(2+Math.round(depth*5));
      card.dataset.orbitDepth=depth.toFixed(3);
    });
    row.dataset.orbitPhase=phase.toFixed(4);
  }
  function tick(now){
    frame=0;
    if(!enabled||!visible||document.hidden)return;
    if(!last)last=now;
    const delta=Math.min(50,now-last);last=now;
    if(!paused)phase=(phase+delta*Math.PI*2/28000)%(Math.PI*2);
    place();
    frame=requestAnimationFrame(tick);
  }
  function start(){if(enabled&&visible&&!frame){last=0;frame=requestAnimationFrame(tick);}}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}
  function configure(){
    enabled=motion.matches&&!reduced.matches;
    section.classList.toggle('is-orbiting',enabled);
    if(enabled){place();start();}
    else{
      stop();row.removeAttribute('data-orbit-phase');
      cards.forEach(card=>{card.style.removeProperty('transform');card.style.removeProperty('opacity');card.style.removeProperty('z-index');delete card.dataset.orbitDepth;});
    }
  }
  function setPaused(value){paused=value;section.classList.toggle('is-paused',value);last=0;value?stop():start();}
  cards.forEach(card=>{
    card.addEventListener('pointerenter',()=>setPaused(true));
    card.addEventListener('pointerleave',()=>setPaused(false));
  });
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  motion.addEventListener('change',configure);reduced.addEventListener('change',configure);
  addEventListener('resize',()=>{if(enabled)place();},{passive:true});
  new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting||false;visible?start():stop();},{rootMargin:'160px 0px'}).observe(section);
  configure();
})();
