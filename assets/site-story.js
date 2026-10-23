/* Timux V17. Native scrolling, progressively enhanced business storytelling. */
(() => {
  const root = document.documentElement;
  const english = root.lang === 'en';
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
  const layerNames = english ? ['Signal received', 'Knowledge checked', 'Rules applied', 'Human decision', 'Action recorded'] : ['訊號進來', '知識核對', '規則判斷', '人的決策', '行動與紀錄'];
  const details = english ? ['Customer request · Field report · Work task', 'Approved documents · Available data · Sources', 'Permission scope · Exceptions · Priorities', 'Approval for critical actions · Human handoff', 'Execute · Preserve evidence · Improve'] : ['客戶詢問 · 現場回報 · 工作任務', '核准文件 · 可用資料 · 引用依據', '權限範圍 · 例外條件 · 處理順序', '重要操作先批准 · 異常有人接手', '執行任務 · 留下證據 · 持續改進'];
  const outputs = english ? ['Service & sales', 'Enterprise knowledge', 'Field operations', 'System automation'] : ['客服與銷售', '企業知識', '現場營運', '系統自動化'];
  const outputDetails = english ? ['Respond and continue service', 'Find and verify sources', 'Connect teams and track progress', 'Reduce repetition, retain approvals'] : ['回應詢問，接續服務', '找到資料，核對依據', '串起現場，追蹤進度', '減少重複，保留審批'];
  const colors = ['#73e0ce', '#a590ff', '#82bfff', '#eab68d', '#b7efbb'];
  stage.innerHTML = '<div class="engine-grid"></div><div class="engine-orbit orbit-one"></div><div class="engine-orbit orbit-two"></div><div class="engine-coordinate">TIMUX / EXECUTION ENGINE</div>';
  const stack = make('div', 'engine-stack');
  const layers = layerNames.map((name, i) => {
    const el = make('div', 'engine-layer', `<div class="engine-layer-head"><span>0${i + 1} / <b>${name}</b></span><i></i></div><svg viewBox="0 0 400 145" focusable="false"><path class="engine-wires" d="M20 35 H110 Q145 35 145 70 T180 105 H380 M20 105 H80 Q110 105 110 70 T160 35 H260 Q290 35 290 70 T330 105 H380 M200 10 V135"/><path class="engine-pulse" pathLength="100" d="M20 35 H110 Q145 35 145 70 T180 105 H380"/><rect x="165" y="48" width="68" height="48" rx="12"/><circle cx="30" cy="35" r="5"/><circle cx="370" cy="105" r="5"/><circle cx="80" cy="105" r="5"/><circle cx="290" cy="35" r="5"/><text x="199" y="79" text-anchor="middle">${['IN','DATA','RULE','HUMAN','ACT'][i]}</text></svg><p>${details[i]}</p>`);
    el.style.setProperty('--layer-color', colors[i]);
    stack.append(el); return el;
  });
  stage.append(stack);
  const mobileOverview = make('div', 'mobile-engine-overview', english ? `
    <div class="mobile-overview-head"><span>ONE WORKFLOW</span><strong>How real work reaches completion</strong></div>
    <svg class="mobile-overview-map" viewBox="0 0 320 206" role="img" aria-label="A request enters, AI understands and verifies, people supervise key decisions, then the task is executed and recorded.">
      <defs><marker id="mobile-flow-arrow-en" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#72dfcf"/></marker></defs>
      <g class="mobile-overview-edges" fill="none" stroke="#72dfcf" stroke-width="1.4" marker-end="url(#mobile-flow-arrow-en)">
        <path d="M46 38 V49 H54 V60"/><path d="M160 38 V49 H54 V60"/><path d="M274 38 V49 H54 V60"/>
        <path d="M98 79 H114"/><path d="M204 79 H220"/>
        <path d="M266 98 V108 H82 V116"/><path d="M266 98 V108 H238 V116"/>
        <path d="M82 150 V160 H160 V170"/><path d="M238 150 V160 H160 V170"/>
      </g>
      <g class="mobile-overview-inputs"><rect x="4" y="8" width="84" height="30" rx="10"/><rect x="118" y="8" width="84" height="30" rx="10"/><rect x="232" y="8" width="84" height="30" rx="10"/><text x="46" y="27">Customer</text><text x="160" y="27">Field</text><text x="274" y="27">Work task</text></g>
      <g class="mobile-overview-process"><rect x="10" y="60" width="88" height="38" rx="12"/><rect x="116" y="60" width="88" height="38" rx="12"/><rect x="222" y="60" width="88" height="38" rx="12"/><text x="54" y="76"><tspan x="54">UNDERSTAND</tspan><tspan x="54" dy="14">intent</tspan></text><text x="160" y="76"><tspan x="160">VERIFY</tspan><tspan x="160" dy="14">sources</tspan></text><text x="266" y="76"><tspan x="266">DECIDE</tspan><tspan x="266" dy="14">by rules</tspan></text></g>
      <g class="mobile-overview-ai"><rect x="22" y="116" width="120" height="34" rx="11"/><text x="82" y="137">AI executes</text></g>
      <g class="mobile-overview-human"><rect x="178" y="116" width="120" height="34" rx="11"/><text x="238" y="137">Human confirms</text></g>
      <g class="mobile-overview-output"><rect x="34" y="170" width="252" height="32" rx="11"/><text x="160" y="190">Execute · Write back · Record</text></g>
    </svg>
    <div class="mobile-overview-proof"><span>Grounded</span><span>Human oversight</span><span>Traceable</span></div>` : `
    <div class="mobile-overview-head"><span>ONE WORKFLOW</span><strong>一段真實工作，如何走到完成</strong></div>
    <svg class="mobile-overview-map" viewBox="0 0 320 206" role="img" aria-label="需求進入後，由 AI 理解與核對，人在關鍵節點監督，再執行任務並留下紀錄。">
      <defs><marker id="mobile-flow-arrow-zh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#72dfcf"/></marker></defs>
      <g class="mobile-overview-edges" fill="none" stroke="#72dfcf" stroke-width="1.4" marker-end="url(#mobile-flow-arrow-zh)">
        <path d="M46 38 V49 H54 V60"/><path d="M160 38 V49 H54 V60"/><path d="M274 38 V49 H54 V60"/>
        <path d="M98 79 H114"/><path d="M204 79 H220"/>
        <path d="M266 98 V108 H82 V116"/><path d="M266 98 V108 H238 V116"/>
        <path d="M82 150 V160 H160 V170"/><path d="M238 150 V160 H160 V170"/>
      </g>
      <g class="mobile-overview-inputs"><rect x="4" y="8" width="84" height="30" rx="10"/><rect x="118" y="8" width="84" height="30" rx="10"/><rect x="232" y="8" width="84" height="30" rx="10"/><text x="46" y="27">客戶詢問</text><text x="160" y="27">現場回報</text><text x="274" y="27">工作任務</text></g>
      <g class="mobile-overview-process"><rect x="10" y="60" width="88" height="38" rx="12"/><rect x="116" y="60" width="88" height="38" rx="12"/><rect x="222" y="60" width="88" height="38" rx="12"/><text x="54" y="76"><tspan x="54">理解意圖</tspan><tspan x="54" dy="14">補齊情境</tspan></text><text x="160" y="76"><tspan x="160">核對資料</tspan><tspan x="160" dy="14">引用依據</tspan></text><text x="266" y="76"><tspan x="266">規則判斷</tspan><tspan x="266" dy="14">權限與例外</tspan></text></g>
      <g class="mobile-overview-ai"><rect x="22" y="116" width="120" height="34" rx="11"/><text x="82" y="137">AI 執行下一步</text></g>
      <g class="mobile-overview-human"><rect x="178" y="116" width="120" height="34" rx="11"/><text x="238" y="137">人員確認／接手</text></g>
      <g class="mobile-overview-output"><rect x="34" y="170" width="252" height="32" rx="11"/><text x="160" y="190">執行任務 · 回寫系統 · 留下紀錄</text></g>
    </svg>
    <div class="mobile-overview-proof"><span>資料有依據</span><span>人保有決策</span><span>結果可追蹤</span></div>`);
  stage.append(mobileOverview);
  stage.append(make('div', 'engine-footer', english ? '<span>Grounded in data</span><span>Humans decide</span><span>Results traceable</span>' : '<span>資料有依據</span><span>人保有決策</span><span>結果可追蹤</span>'));
  const caption = document.querySelector('.engine-caption');

  // Connect the actual service cards to the assembled execution layers.
  const solutions = document.querySelector('#solutions');
  const solutionCards = [...solutions.querySelectorAll('.solution-card')];
  const adoption = document.querySelector('.adoption-path');
  const phases = document.querySelector('.phase-grid');
  function addRoute(container) {
    const svg = make('div', 'story-route', '<svg viewBox="0 0 1000 44" preserveAspectRatio="none" aria-hidden="true"><path class="route-base" d="M10 22 H990"/><path class="route-ink" pathLength="1" d="M10 22 H990"/><circle class="route-terminal route-start" cx="10" cy="22" r="6"/><circle class="route-terminal route-end" cx="990" cy="22" r="6"/><circle class="route-head" cx="10" cy="22" r="9"/></svg>');
    container.before(svg);
    return {root: svg, ink: svg.querySelector('.route-ink'), head: svg.querySelector('.route-head')};
  }
  const adoptionRoute = adoption ? addRoute(adoption) : null;
  const phaseRoute = addRoute(phases);
  const caseCards = [...document.querySelectorAll('.case-card')];
  const cases = caseCards.map(card => {
    const track = make('div', 'case-track'); card.before(track); track.append(card);
    return {track, card, screens: [...card.querySelectorAll('.case-screen,.phone')], steps: card.id === 'case-southeast' ? [] : [...card.querySelectorAll('.case-flow-item')]};
  });

  const models = document.querySelector('.model-pie-grid');
  const modelTrack = make('div', 'model-track');
  const modelStage = make('div', 'model-stage');
  modelStage.innerHTML = english ? '<div class="model-orb" aria-hidden="true"><svg viewBox="0 0 500 500"><defs><marker id="orb-flow-head" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto"><path class="orb-flow-head" d="M1 1 L11 6 L1 11 Z"/></marker></defs><circle class="orb-guide" cx="250" cy="250" r="206"/><g class="orb-segments"></g><circle class="orb-loop" cx="250" cy="250" r="216"/><path class="orb-flow" d="M250 34 A216 216 0 0 1 466 250" marker-end="url(#orb-flow-head)"/><path class="orb-shield" pathLength="1" d="M250 20 L452 100 L436 290 Q410 410 250 482 Q90 410 64 290 L48 100 Z"/></svg><div class="orb-center"><b>CORE</b><span>Do the right work</span></div></div><div class="model-story-copy"><p class="eyebrow">ONE SYSTEM / THREE PRINCIPLES</p><h3>Align on outcomes,<br>then move work forward.</h3><p class="model-story-description">Reduce cost, improve operations, manage risk, or grow revenue: first define what should change.</p><div class="model-chapters"><span>01 CORE</span><span>02 SCALE</span><span>03 TRUST</span></div></div>' : '<div class="model-orb" aria-hidden="true"><svg viewBox="0 0 500 500"><defs><marker id="orb-flow-head" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto"><path class="orb-flow-head" d="M1 1 L11 6 L1 11 Z"/></marker></defs><circle class="orb-guide" cx="250" cy="250" r="206"/><g class="orb-segments"></g><circle class="orb-loop" cx="250" cy="250" r="216"/><path class="orb-flow" d="M250 34 A216 216 0 0 1 466 250" marker-end="url(#orb-flow-head)"/><path class="orb-shield" pathLength="1" d="M250 20 L452 100 L436 290 Q410 410 250 482 Q90 410 64 290 L48 100 Z"/></svg><div class="orb-center"><b>CORE</b><span>做對的事</span></div></div><div class="model-story-copy"><p class="eyebrow">ONE SYSTEM / THREE PRINCIPLES</p><h3>先對準結果，<br>再讓工作前進。</h3><p class="model-story-description">降低成本、提升營運、管理風險，或改善收入：先確認這次真正要改變什麼。</p><div class="model-chapters"><span>01 CORE</span><span>02 SCALE</span><span>03 TRUST</span></div></div>';
  modelTrack.append(modelStage); models.before(modelTrack);
  modelStage.querySelector('.model-story-copy').append(make('a','layout-method-link',english ? 'Explore the adoption approach ↗' : '探索完整導入方法 ↗'));
  modelStage.querySelector('.layout-method-link').href = english ? '/en/#roadmap' : '/method/';
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
  const descriptions = english ? [
    ['CORE','Do the right work','Align on outcomes,<br>then move work forward.','Align on business outcomes.'],
    ['SCALE','Finish the work','Every signal<br>gets a next step.','Take tasks through to completion.'],
    ['TRUST','Use AI with confidence','Extend capability,<br>keep boundaries clear.','Keep execution under control.']
  ] : [
    ['CORE','做對的事','先對準結果，<br>再讓工作前進。','對準經營結果。'],
    ['SCALE','把事情做完','每一個訊號，<br>都有下一步。','讓任務走到完成。'],
    ['TRUST','放心地使用','能力向外延伸，<br>邊界始終清楚。','讓過程保持可控。']
  ];

  const captionStep = caption.querySelector('.engine-step');
  const captionTitle = caption.querySelector('strong');
  const captionBody = caption.querySelector('p');
  const captionMeter = caption.querySelector('.engine-meter i');
  const layerParts = layers.map(layer => ({layer, title:layer.querySelector('b'), detail:layer.querySelector('p')}));
  const routePairs = [[adoption,adoptionRoute],[phases,phaseRoute]].filter(([container,route]) => container && route).map(([container,route]) => ({
    container,
    route,
    cards:[...container.querySelectorAll(':scope > article')],
    arrows:[...container.children].filter(element => element.tagName === 'I')
  }));
  const modelOrbFlow = modelStage.querySelector('.orb-flow');
  const modelOrbShield = modelStage.querySelector('.orb-shield');
  const modelOrbGuide = modelStage.querySelector('.orb-guide');
  const modelOrbCode = modelStage.querySelector('.orb-center b');
  const modelOrbLabel = modelStage.querySelector('.orb-center span');
  const modelHeading = modelStage.querySelector('h3');
  const modelDescription = modelStage.querySelector('.model-story-description');
  const modelChapters = [...modelStage.querySelectorAll('.model-chapters span')];
  const modelCards = [...models.children];
  const setStyle = (el,name,value) => { if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name,value); };
  const setTransform = (el,value) => { if (el.style.transform !== value) el.style.transform=value; };
  const setText = (el,value) => { if (el.textContent !== value) el.textContent=value; };
  const setHtml = (el,value) => { if (el.innerHTML !== value) el.innerHTML=value; };
  const setAttr = (el,name,value) => { value=String(value); if (el.getAttribute(name) !== value) el.setAttribute(name,value); };
  const setData = (el,name,value) => { value=String(value); if (el.dataset[name] !== value) el.dataset[name]=value; };
  const setClass = (el,name,value) => { if (el.classList.contains(name) !== value) el.classList.toggle(name,value); };
  const number = (value,digits=3) => Number(value.toFixed(digits)).toString();

  let enabled = false, frame = 0, modelIndex = -1, heroIndex = -1;
  let targetScrollY = scrollY, currentScrollY = scrollY, lastFrameTime = 0;
  const measurements = new Map();
  const tracked = [heroTrack,solutions,adoption,...cases.map(c=>c.track),modelTrack,models,phases].filter(Boolean);
  function measure() {
    tracked.forEach(el => {const r=el.getBoundingClientRect();measurements.set(el,{top:r.top+scrollY,height:r.height});});
  }
  function progress(el, pinned = false, y = currentScrollY) {
    const m = measurements.get(el);
    return pinned ? clamp((y - m.top + 80) / Math.max(1,m.height-innerHeight+80))
      : clamp((y+innerHeight*.84-m.top) / Math.min(m.height+innerHeight*.2,innerHeight*.85));
  }
  function isNear(el) {
    const m=measurements.get(el);
    return m && m.top+m.height >= targetScrollY-innerHeight*.6 && m.top <= targetScrollY+innerHeight*1.6;
  }
  function paint(now) {
    frame = 0;
    if (!enabled) return;
    const elapsed=lastFrameTime ? Math.min(64,now-lastFrameTime) : 16;
    lastFrameTime=now;
    const alpha=1-Math.exp(-elapsed/42);
    currentScrollY += (targetScrollY-currentScrollY)*alpha;
    if(Math.abs(targetScrollY-currentScrollY)<.25)currentScrollY=targetScrollY;

    if(isNear(heroTrack)){
      const p=progress(heroTrack,true), explode=range(p,.08,.36), assemble=range(p,.60,.90);
      setStyle(stage,'--orbit-turn',`${number(p*150)}deg`);
      layerParts.forEach(({layer,title,detail},i) => {
      const initialX=(i-2)*16, initialY=(i-2)*26;
      const spreadX=(i-2)*59, spreadY=(i-2)*68;
      const targetX=(i%2===0?-144:144), targetY=(i<2?-108:108);
      const x=lerp(lerp(initialX,spreadX,explode),targetX,assemble);
      const y=lerp(lerp(initialY,spreadY,explode),targetY,assemble);
      const rx=lerp(54,12,explode)*(1-assemble), rz=lerp(-28,-14,explode)*(1-assemble);
        setTransform(layer,`translate3d(${number(x)}px,${number(y)}px,${number((i-2)*36*(1-assemble))}px) rotateX(${number(rx)}deg) rotateZ(${number(rz)}deg) scale(${number(lerp(1,.64,assemble),4)})`);
        setStyle(layer,'opacity',i===4 ? number(1-assemble) : '1');
        setStyle(layer,'--pulse-offset',number(-(p*200+i*19)));
        setText(title,assemble>.75&&i<4?outputs[i]:layerNames[i]);
        setClass(layer,'is-assembled',assemble>.75);
        setText(detail,assemble>.75&&i<4?outputDetails[i]:details[i]);
      });
      const hi=p<.32?0:p<.67?1:2;
      if(hi!==heroIndex){
        heroIndex=hi; setData(hero,'engineStep',hi);
        setText(captionStep,`0${hi+1} / 03`);
        setText(captionTitle,(english ? ['Bring scattered signals into one workflow.','Break down each step so decisions have evidence.','Assemble a workflow that fits your team.'] : ['讓分散訊號，進入同一段工作。','拆開每一步，讓判斷有依據。','組成適合你的工作方式。'])[hi]);
        setText(captionBody,(english ? ['Start with one real need and see how AI helps the team reach the next step.','Knowledge, rules, and human decisions stay connected, with approval for critical actions.','Connect service, knowledge, operations, and systems—starting with the workflow that matters most.'] : ['從一個真實需求開始，看 AI 如何協助團隊完成下一步。','知識、規則與人的決策彼此連接，重要操作保留人工確認。','客服、知識、現場與系統整合，從你最想改善的流程開始。'])[hi]);
      }
      setTransform(captionMeter,`scaleX(${p.toFixed(4)})`);
    }
    if(isNear(solutions)){
      const sp=progress(solutions);
      solutionCards.forEach((c,i)=>{
        const t=range(sp,i*.09,.65+i*.09);
        setStyle(c,'--card-x',`${number((1-t)*(1.5-i)*85)}px`);
        setStyle(c,'--card-turn',`${number((1-t)*(i-1.5)*8)}deg`);
        setStyle(c,'--card-y',`${number((1-t)*65)}px`);
      });
    }
    routePairs.forEach(({container,route,cards,arrows})=>{
      if(!isNear(container))return;
      const q=progress(container);
      const activeIndex=Math.min(cards.length-1,Math.floor(q*cards.length));
      setStyle(route.ink,'stroke-dashoffset',number(1-q,4));
      setAttr(route.head,'cx',number(10+980*q));
      setStyle(route.root,'--route-progress',q.toFixed(4));
      setData(route.root,'routeIndex',activeIndex);
      cards.forEach((card,i)=>{
        const reveal=range(q,Math.max(0,(i-.45)/cards.length),(i+.38)/cards.length);
        const current=i===activeIndex, complete=i<activeIndex;
        const emphasis=current?1:complete?.38:0;
        setStyle(card,'--step-lift',`${number((1-reveal)*72-emphasis*14)}px`);
        setStyle(card,'--step-rotate',`${number((1-reveal)*-10)}deg`);
        setStyle(card,'--step-scale',number(.92+reveal*.08+emphasis*.026,4));
        setStyle(card,'--step-opacity',number(.34+reveal*.66,4));
        setStyle(card,'--step-saturation',number(.48+reveal*.52,4));
        setStyle(card,'z-index',current?'3':complete?'2':'1');
        setClass(card,'route-current',current);
        setClass(card,'route-complete',complete);
        setClass(card,'route-upcoming',i>activeIndex);
      });
      arrows.forEach((arrow,i)=>{
        setClass(arrow,'route-passed',i<activeIndex);
        setClass(arrow,'route-next',i===activeIndex);
      });
    });
    cases.forEach(({track,card,screens,steps})=>{
      if(!isNear(track))return;
      const q=progress(track,true), phase=Math.min(2,Math.floor(q*3)); setData(card,'casePhase',phase);
      steps.forEach((step,i)=>setClass(step,'case-focus',i===phase));
      screens.forEach((screen,i)=>{
        const focus=screens.length===3 ? i/2 : i/Math.max(1,screens.length-1);
        const proximity=clamp(1-Math.abs(q-focus)*2);
        const side=i-(screens.length-1)/2;
        const farAngle=side===0 ? (q<.5?8:-8) : side*12;
        setStyle(screen,'--screen-x',`${number(Math.sin(q*Math.PI)*(i%2?-28:28))}px`);
        setStyle(screen,'--screen-y',`${number((q-.5)*(i%2?76:-56)-proximity*10)}px`);
        setStyle(screen,'--screen-z',`${number(-64+proximity*98)}px`);
        setStyle(screen,'--screen-angle',`${number(farAngle*(1-proximity))}deg`);
        setStyle(screen,'--screen-scale',number(.76+proximity*.34,4));
        setStyle(screen,'--screen-opacity',number(.72+proximity*.28,4));
        setStyle(screen,'--screen-saturation',number(.68+proximity*.32,4));
        setStyle(screen,'--screen-brightness',number(.78+proximity*.22,4));
        setStyle(screen,'z-index',String(1+Math.round(proximity*2)));
      });
      const panel=card.querySelector('.ai-decision,.audit-panel');
      if(panel)setStyle(panel,'clip-path',`inset(0 ${number(100*(1-range(q,.15,.48)))}% 0 0 round 18px)`);
    });
    if(isNear(modelTrack)){
      const mp=progress(modelTrack,true), split=range(mp,.22,.42), mi=mp<.32?0:mp<.68?1:2;
      const count=4+split, rotate=range(mp,.35,.66)*Math.PI*.45;
      segments.forEach((segment,i)=>{
        const start=-Math.PI/2+i*Math.PI*2/count+rotate+.035;
        const span=i===4?Math.PI*2/count*split:Math.PI*2/count;
        setAttr(segment,'d',arc(start,start+Math.max(.001,span-.07),170+Math.sin(mp*Math.PI)*8));
        setStyle(segment,'opacity',i===4?number(split,4):'1');
      });
      setAttr(modelOrbFlow,'transform',`rotate(${number(mp*540)} 250 250)`);
      setStyle(modelOrbShield,'stroke-dashoffset',number(1-range(mp,.66,.95),4));
      setTransform(modelOrbGuide,`rotate(${number(mp*90)}deg)`);
      if(mi!==modelIndex){
        modelIndex=mi; const d=descriptions[mi]; setData(modelStage,'model',d[0]);
        setText(modelOrbCode,d[0]);
        setText(modelOrbLabel,d[1]);
        setHtml(modelHeading,d[2]);
        setText(modelDescription,d[3]);
        modelChapters.forEach((s,i)=>setClass(s,'active',i===mi));
      }
    }
    if(isNear(models)){
      const gridProgress=progress(models), eased=ease(gridProgress);
      modelCards.forEach((c,i)=>{
        setStyle(c,'--model-x',`${number((1-eased)*(1-i)*210)}px`);
        setStyle(c,'--model-scale',number(.84+.16*eased,4));
      });
    }
    if(currentScrollY!==targetScrollY)frame=requestAnimationFrame(paint);
    else lastFrameTime=0;
  }
  const requestPaint=()=>{if(enabled&&!frame)frame=requestAnimationFrame(paint);};
  const onScroll=()=>{
    targetScrollY=scrollY;
    if(Math.abs(targetScrollY-currentScrollY)>innerHeight*1.25)currentScrollY=targetScrollY;
    requestPaint();
  };
  function configure(){
    enabled=desktop.matches&&!reduced.matches;
    root.classList.toggle('story-desktop',enabled);
    root.classList.toggle('story-static',reduced.matches);
    root.classList.toggle('story-mobile-route',!enabled&&!reduced.matches);
    if (!enabled) {
      document.querySelectorAll('.ai-decision,.audit-panel').forEach(panel => panel.style.removeProperty('clip-path'));
      [adoptionRoute,phaseRoute].filter(Boolean).forEach(route => {
        route.ink.style.strokeDashoffset=reduced.matches?'0':'1';
        route.head.setAttribute('cx',reduced.matches?'990':'10');
      });
    }
    targetScrollY=currentScrollY=scrollY; lastFrameTime=0;
    measure(); requestPaint();
  }
  const mobileRoutes=[[adoption,adoptionRoute],[phases,phaseRoute]].filter(([container,route])=>container&&route);
  mobileRoutes.forEach(([container])=>[...container.querySelectorAll(':scope > article')].forEach((card,i)=>card.style.setProperty('--route-order',String(i))));
  const mobileRouteObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting||desktop.matches||reduced.matches)return;
    const pair=mobileRoutes.find(([container])=>container===entry.target);
    entry.target.classList.add('route-mobile-play');
    pair?.[1].root.classList.add('route-mobile-play');
    mobileRouteObserver.unobserve(entry.target);
  }),{threshold:.14,rootMargin:'0px 0px -8%'});
  mobileRoutes.forEach(([container])=>mobileRouteObserver.observe(container));
  addEventListener('scroll',onScroll,{passive:true});
  let resizeFrame=0;
  addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(configure);},{passive:true});
  desktop.addEventListener('change',configure); reduced.addEventListener('change',configure);
  addEventListener('load',()=>{measure();requestPaint();},{once:true});
  document.fonts?.ready.then(()=>{measure();requestPaint();});
  const observer=new ResizeObserver(()=>{measure();requestPaint();});
  tracked.forEach(el=>observer.observe(el));
  configure();
})();
