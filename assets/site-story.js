/* Timux V17. Native scrolling, progressively enhanced business storytelling. */
(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.outcome-hero');
  if (!hero) return;
  root.classList.add('story-home');
  const desktop = matchMedia('(min-width: 1100px) and (min-height: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  const range = (v, a, b) => ease((v - a) / (b - a));
  const lerp = (a, b, v) => a + (b - a) * v;
  const make = (tag, name, html = '') => {
    const el = document.createElement(tag); el.className = name; el.innerHTML = html; return el;
  };

  const heroTrack = document.querySelector('.engine-track');
  const stage = document.querySelector('.engine-stage');
  const layerNames = ['訊號進來', '知識核對', '規則判斷', '人的決策', '行動與紀錄'];
  const details = ['客戶詢問 · 現場回報 · 工作任務', '核准文件 · 可用資料 · 引用依據', '權限範圍 · 例外條件 · 處理順序', '重要操作先批准 · 異常有人接手', '執行任務 · 留下證據 · 持續改進'];
  const outputs = ['客服與銷售', '企業知識', '現場營運', '系統自動化'];
  const outputDetails = ['回應詢問，接續服務', '找到資料，核對依據', '串起現場，追蹤進度', '減少重複，保留審批'];
  const colors = ['#73e0ce', '#a590ff', '#82bfff', '#eab68d', '#b7efbb'];
  stage.innerHTML = '<div class="engine-grid"></div><div class="engine-orbit orbit-one"></div><div class="engine-orbit orbit-two"></div><div class="engine-coordinate">TIMUX / EXECUTION ENGINE</div>';
  const stack = make('div', 'engine-stack');
  const layers = layerNames.map((name, i) => {
    const el = make('div', 'engine-layer', `<div class="engine-layer-head"><span>0${i + 1} / <b>${name}</b></span><i></i></div><svg viewBox="0 0 400 145" focusable="false"><path class="engine-wires" d="M20 35 H110 Q145 35 145 70 T180 105 H380 M20 105 H80 Q110 105 110 70 T160 35 H260 Q290 35 290 70 T330 105 H380 M200 10 V135"/><path class="engine-pulse" pathLength="100" d="M20 35 H110 Q145 35 145 70 T180 105 H380"/><rect x="165" y="48" width="68" height="48" rx="12"/><circle cx="30" cy="35" r="5"/><circle cx="370" cy="105" r="5"/><circle cx="80" cy="105" r="5"/><circle cx="290" cy="35" r="5"/><text x="199" y="79" text-anchor="middle">${['IN','DATA','RULE','HUMAN','ACT'][i]}</text></svg><p>${details[i]}</p>`);
    el.style.setProperty('--layer-color', colors[i]);
    stack.append(el); return el;
  });
  stage.append(stack);
  stage.append(make('div', 'engine-footer', '<span>資料有依據</span><span>人保有決策</span><span>結果可追蹤</span>'));
  const caption = document.querySelector('.engine-caption');

  // Connect the actual service cards to the assembled execution layers.
  const solutions = document.querySelector('#solutions');
  const solutionCards = [...solutions.querySelectorAll('.solution-card')];
  const adoption = document.querySelector('.adoption-path');
  const phases = document.querySelector('.phase-grid');
  function addRoute(container) {
    const svg = make('div', 'story-route', '<svg viewBox="0 0 1000 44" preserveAspectRatio="none" aria-hidden="true"><path class="route-base" d="M10 22 H990"/><path class="route-ink" pathLength="1" d="M10 22 H990"/><circle cx="10" cy="22" r="6"/><circle cx="990" cy="22" r="6"/></svg>');
    container.before(svg); return svg.querySelector('.route-ink');
  }
  const adoptionLine = addRoute(adoption);
  const phaseLine = addRoute(phases);
  const caseCards = [...document.querySelectorAll('.case-card')];
  const cases = caseCards.map(card => {
    const track = make('div', 'case-track'); card.before(track); track.append(card);
    return {track, card, screens: [...card.querySelectorAll('.case-screen,.phone')], steps: [...card.querySelectorAll('.case-flow-item')]};
  });

  const models = document.querySelector('.model-pie-grid');
  const modelTrack = make('div', 'model-track');
  const modelStage = make('div', 'model-stage');
  modelStage.innerHTML = '<div class="model-orb" aria-hidden="true"><svg viewBox="0 0 500 500"><circle class="orb-guide" cx="250" cy="250" r="206"/><g class="orb-segments"></g><path class="orb-shield" pathLength="1" d="M250 20 L452 100 L436 290 Q410 410 250 482 Q90 410 64 290 L48 100 Z"/><path class="orb-loop" pathLength="1" d="M250 34 A216 216 0 1 1 80 118 M80 118 L79 150 M80 118 L111 124"/></svg><div class="orb-center"><b>CORE</b><span>做對的事</span></div></div><div class="model-story-copy"><p class="eyebrow">ONE SYSTEM / THREE PRINCIPLES</p><h3>先對準結果，<br>再讓工作前進。</h3><p class="model-story-description">降低成本、提升營運、管理風險，或改善收入：先確認這次真正要改變什麼。</p><div class="model-chapters"><span>01 CORE</span><span>02 SCALE</span><span>03 TRUST</span></div></div>';
  modelTrack.append(modelStage); models.before(modelTrack);
  const ns = 'http://www.w3.org/2000/svg';
  const segments = Array.from({length:5}, (_,i) => {
    const p = document.createElementNS(ns,'path'); p.setAttribute('fill', colors[i]);
    modelStage.querySelector('.orb-segments').append(p); return p;
  });
  function arc(start, end, radius = 170) {
    const point = (angle,r) => [250 + Math.cos(angle) * r, 250 + Math.sin(angle) * r];
    const a=point(start,radius),b=point(end,radius),c=point(end,112),d=point(start,112);
    return `M${a} A${radius} ${radius} 0 0 1 ${b} L${c} A112 112 0 0 0 ${d} Z`;
  }
  const descriptions = [
    ['CORE','做對的事','先對準結果，<br>再讓工作前進。','降低成本、提升營運、管理風險，或改善收入：先確認這次真正要改變什麼。'],
    ['SCALE','把事情做完','每一個訊號，<br>都有下一步。','感知、補足情境、審批、行動、復盤。讓 AI 走過完整流程，再用結果持續改進。'],
    ['TRUST','放心地使用','能力向外延伸，<br>邊界始終清楚。','證據透明、確認恢復方式、人保有決策、權限有範圍、結果可追溯。']
  ];

  let enabled = false, frame = 0, modelIndex = -1, heroIndex = -1;
  let measurements = [];
  const tracked = [heroTrack,solutions,adoption,...cases.map(c=>c.track),modelTrack,models,phases];
  function measure() {
    measurements = tracked.map(el => {const r=el.getBoundingClientRect();return {top:r.top+scrollY,height:r.height};});
  }
  function progress(el, pinned = false) {
    const m = measurements[tracked.indexOf(el)];
    return pinned ? clamp((scrollY - m.top + 80) / Math.max(1,m.height-innerHeight+80))
      : clamp((scrollY+innerHeight*.84-m.top) / Math.min(m.height+innerHeight*.2,innerHeight*.85));
  }
  function paint() {
    frame = 0;
    if (!enabled) return;
    const p=progress(heroTrack,true), explode=range(p,.08,.36), assemble=range(p,.60,.90);
    root.style.setProperty('--engine-progress',p.toFixed(4));
    stage.style.setProperty('--orbit-turn',`${p*150}deg`);
    layers.forEach((layer,i) => {
      const initialX=(i-2)*16, initialY=(i-2)*26;
      const spreadX=(i-2)*59, spreadY=(i-2)*68;
      const targetX=(i%2===0?-144:144), targetY=(i<2?-108:108);
      const x=lerp(lerp(initialX,spreadX,explode),targetX,assemble);
      const y=lerp(lerp(initialY,spreadY,explode),targetY,assemble);
      const rx=lerp(54,12,explode)*(1-assemble), rz=lerp(-28,-14,explode)*(1-assemble);
      layer.style.transform=`translate3d(${x}px,${y}px,${(i-2)*36*(1-assemble)}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${lerp(1,.64,assemble)})`;
      layer.style.opacity=i===4 ? String(1-assemble) : '1';
      layer.style.setProperty('--pulse-offset',`${-(p*200+i*19)}`);
      layer.querySelector('b').textContent=assemble>.75&&i<4?outputs[i]:layerNames[i];
      layer.classList.toggle('is-assembled',assemble>.75);
      layer.querySelector('p').textContent=assemble>.75&&i<4?outputDetails[i]:details[i];
    });
    const hi=p<.32?0:p<.67?1:2;
    if(hi!==heroIndex){
      heroIndex=hi; hero.dataset.engineStep=String(hi);
      caption.querySelector('.engine-step').textContent=`0${hi+1} / 03`;
      caption.querySelector('strong').textContent=['讓分散訊號，進入同一段工作。','拆開每一步，讓判斷有依據。','組成適合你的工作方式。'][hi];
      caption.querySelector('p').textContent=['從一個真實需求開始，看 AI 如何協助團隊完成下一步。','知識、規則與人的決策彼此連接，重要操作保留人工確認。','客服、知識、現場與系統整合，從你最想改善的流程開始。'][hi];
    }
    caption.querySelector('.engine-meter i').style.transform=`scaleX(${p})`;
    const sp=progress(solutions);
    solutionCards.forEach((c,i)=>{
      const t=range(sp,i*.09,.65+i*.09);
      c.style.setProperty('--card-x',`${(1-t)*(1.5-i)*85}px`);
      c.style.setProperty('--card-turn',`${(1-t)*(i-1.5)*8}deg`);
      c.style.setProperty('--card-y',`${(1-t)*65}px`);
    });
    [[adoption,adoptionLine],[phases,phaseLine]].forEach(([container,line])=>{
      const q=progress(container); line.style.strokeDashoffset=String(1-q);
      const cards=[...container.querySelectorAll(':scope > article')];
      cards.forEach((card,i)=>{
        const t=range(q,i*.12,.5+i*.12);
        card.style.setProperty('--step-lift',`${(1-t)*60}px`);
        card.style.setProperty('--step-rotate',`${(1-t)*-9}deg`);
        card.classList.toggle('route-active',q>(i+.4)/cards.length);
      });
    });
    cases.forEach(({track,card,screens,steps})=>{
      const q=progress(track,true), phase=Math.min(2,Math.floor(q*3)); card.dataset.casePhase=String(phase);
      steps.forEach((step,i)=>step.classList.toggle('case-focus',i===phase));
      screens.forEach((screen,i)=>{
        screen.style.setProperty('--screen-x',`${Math.sin(q*Math.PI)*(i%2?-24:24)}px`);
        screen.style.setProperty('--screen-y',`${(q-.5)*(i%2?70:-50)}px`);
        screen.style.setProperty('--screen-angle',`${(1-q)*(i%2?7:-7)}deg`);
        screen.style.setProperty('--screen-scale',String(1+Math.sin(q*Math.PI)*.065));
      });
      const panel=card.querySelector('.ai-decision,.audit-panel');
      if(panel)panel.style.clipPath=`inset(0 ${100*(1-range(q,.15,.48))}% 0 0 round 18px)`;
    });
    const mp=progress(modelTrack,true), split=range(mp,.22,.42), mi=mp<.32?0:mp<.68?1:2;
    const count=4+split, rotate=range(mp,.35,.66)*Math.PI*.45;
    segments.forEach((segment,i)=>{
      const start=-Math.PI/2+i*Math.PI*2/count+rotate+.035;
      const span=i===4?Math.PI*2/count*split:Math.PI*2/count;
      segment.setAttribute('d',arc(start,start+Math.max(.001,span-.07),170+Math.sin(mp*Math.PI)*8));
      segment.style.opacity=i===4?String(split):'1';
    });
    modelStage.querySelector('.orb-loop').style.strokeDashoffset=String(1-range(mp,.3,.66));
    modelStage.querySelector('.orb-shield').style.strokeDashoffset=String(1-range(mp,.66,.95));
    modelStage.querySelector('.orb-guide').style.transform=`rotate(${mp*90}deg)`;
    if(mi!==modelIndex){
      modelIndex=mi; const d=descriptions[mi]; modelStage.dataset.model=d[0];
      modelStage.querySelector('.orb-center b').textContent=d[0];
      modelStage.querySelector('.orb-center span').textContent=d[1];
      modelStage.querySelector('h3').innerHTML=d[2];
      modelStage.querySelector('.model-story-description').textContent=d[3];
      modelStage.querySelectorAll('.model-chapters span').forEach((s,i)=>s.classList.toggle('active',i===mi));
    }
    const gridProgress=progress(models);
    [...models.children].forEach((c,i)=>{
      c.style.setProperty('--model-x',`${(1-ease(gridProgress))*(1-i)*210}px`);
      c.style.setProperty('--model-scale',String(.84+.16*ease(gridProgress)));
    });
  }
  const requestPaint=()=>{if(enabled&&!frame)frame=requestAnimationFrame(paint);};
  function configure(){
    enabled=desktop.matches&&!reduced.matches;
    root.classList.toggle('story-desktop',enabled);
    root.classList.toggle('story-static',reduced.matches);
    if (!enabled) {
      document.querySelectorAll('.ai-decision,.audit-panel').forEach(panel => panel.style.removeProperty('clip-path'));
      [adoptionLine,phaseLine].forEach(line => line.style.strokeDashoffset='0');
    }
    measure(); requestPaint();
  }
  addEventListener('scroll',requestPaint,{passive:true});
  let resizeFrame=0;
  addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(configure);},{passive:true});
  desktop.addEventListener('change',configure); reduced.addEventListener('change',configure);
  addEventListener('load',()=>{measure();requestPaint();},{once:true});
  document.fonts?.ready.then(()=>{measure();requestPaint();});
  const observer=new ResizeObserver(()=>{measure();requestPaint();});
  tracked.forEach(el=>observer.observe(el));
  configure();
})();
