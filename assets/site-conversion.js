(() => {
  const track = (event, params = {}) => {
    if (!['www.timux.site', 'timux.site'].includes(location.hostname)) return;
    if (typeof window.gtag === 'function') window.gtag('event', event, params);
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-track]');
    if (link) track(link.dataset.track, {method: link.dataset.method || 'navigation', scenario: link.dataset.scenario || 'general'});
  });
  const form = document.getElementById('contactDraft');
  if (form) {
    const workflowInput = document.getElementById('workflow');
    const summary = document.getElementById('summary');
    const email = document.getElementById('emailDraft');
    const scenario = new URLSearchParams(location.search).get('scenario');
    if (scenario === 'customer-service') workflowInput.value = '想將 AI 客服用在公司的工作流程';
    document.querySelectorAll('[data-solution]').forEach(link => {
      link.addEventListener('click', () => {
        workflowInput.value = link.dataset.solution;
        track('solution_selected', {scenario: link.dataset.solution});
        setTimeout(() => workflowInput.focus({preventScroll: true}), 450);
      });
    });
    const updateEmail = () => { email.href = 'mailto:service@timux.site?subject=' + encodeURIComponent('企業 AI 導入需求討論') + '&body=' + encodeURIComponent(summary.value); };
    form.addEventListener('submit', event => {
      event.preventDefault();
      const workflow = workflowInput.value.trim();
      if (!workflow) { workflowInput.focus(); return; }
      summary.value = 'Ian 你好，\n\n我想討論的工作流程：' + workflow + '\n\n最近的情況：\n' + (document.getElementById('context').value.trim() || '希望在討論時補充。') + '\n\n希望一起確認：適合先驗證的範圍、需要的資料與下一步。' + (scenario === 'customer-service' ? '\n\n我看過官網的客服案例體驗。' : '');
      updateEmail();
      document.getElementById('draftResult').hidden = false;
      summary.focus();
      track('contact_draft_ready', {scenario: scenario === 'customer-service' ? scenario : 'general'});
    });
    summary.addEventListener('input', updateEmail);
    document.getElementById('copyDraft').addEventListener('click', async () => {
      const status = document.getElementById('copyStatus');
      try { await navigator.clipboard.writeText(summary.value); status.textContent = '摘要已複製，請貼到 Email 並自行寄送。'; }
      catch { summary.focus(); summary.select(); status.textContent = '請複製上方已選取的摘要，再貼到 Email。'; }
    });
  }
  const tabs = [...document.querySelectorAll('[data-demo-step]')];
  if (tabs.length) {
    const scenes = [
      ['先理解問題，再提供答案。','旅客詢問路線或服務資訊時，客服需要根據可用資料回應，而不是只生成看似合理的文字。','你公司的常見詢問，需要哪些可靠的資料才能回答？這會是訪談時一起整理的起點。','southeast-ai-cs-normal.png','東南客運一般問答案例畫面'],
      ['資訊不足時，不急著猜。','缺少路線、時間或方向時，需要先補齊情境。案例畫面也呈現了即時資訊與一般知識的邊界；不是所有問題都能用同一份資料回答。','哪些資訊不足會造成誤判？我們會透過異常案例，把追問條件與資料來源一起釐清。','southeast-ai-cs-realtime.png','東南客運資訊邊界案例畫面'],
      ['需要人的時候，讓工作接得下去。','遇到需要人工確認的事項，應說明下一步並保留必要上下文。實際通知、接手人與處理時限，需依企業流程設計。','誰接手、接手時要看到什麼、怎樣才算完成？這些需求會進入責任分工與驗收情境。','southeast-ai-cs-realtime.png','東南客運人工接手提示案例畫面']
    ];
    let current = 0;
    const seen = new Set([0]);
    let completed = false;
    function show(index) {
      current = index; seen.add(index);
      const scene = scenes[index];
      tabs.forEach((tab, i) => { tab.classList.toggle('selected', i === index); tab.setAttribute('aria-pressed', String(i === index)); });
      document.getElementById('demoCounter').textContent = '情境 0' + (index + 1) + ' / 03';
      document.getElementById('demoTitle').textContent = scene[0];
      document.getElementById('demoDescription').textContent = scene[1];
      document.getElementById('demoTakeaway').textContent = scene[2];
      document.getElementById('demoImage').src = '/images/cases/' + scene[3];
      document.getElementById('demoImage').alt = scene[4];
      document.getElementById('nextDemo').textContent = index === 2 ? '回看第一個情境 ↺' : '看下一個情境 →';
      document.getElementById('demoStatus').textContent = '目前：' + scene[0];
      track('case_step_view', {scenario:'customer-service', step:index + 1});
      if (seen.size === 3 && !completed) { completed = true; track('case_guide_complete', {scenario:'customer-service'}); }
    }
    tabs.forEach(tab => tab.addEventListener('click', () => show(Number(tab.dataset.demoStep))));
    document.getElementById('nextDemo').addEventListener('click', () => show((current + 1) % scenes.length));
  }
})();

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const html = document.documentElement;
  html.dataset.motionSystem = 'v14';

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let progressFrame = 0;
  const paintProgress = () => {
    progressFrame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    const ratio = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };
  addEventListener('scroll', () => {
    if (!progressFrame) progressFrame = requestAnimationFrame(paintProgress);
  }, {passive: true});
  addEventListener('resize', paintProgress, {passive: true});
  paintProgress();

  const transitionLayer = document.createElement('div');
  transitionLayer.className = 'page-transition';
  transitionLayer.setAttribute('aria-hidden', 'true');
  transitionLayer.append(document.createElement('span'));
  document.body.append(transitionLayer);
  if (!reducedMotion.matches && sessionStorage.getItem('timux-page-transition') === '1') {
    sessionStorage.removeItem('timux-page-transition');
    transitionLayer.classList.add('is-entering');
    setTimeout(() => transitionLayer.classList.remove('is-entering'), 980);
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reducedMotion.matches) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || link.target === '_blank' || link.dataset.noTransition !== undefined) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin) return;
    if (target.pathname === location.pathname && target.search === location.search && target.hash) return;
    event.preventDefault();
    sessionStorage.setItem('timux-page-transition', '1');
    transitionLayer.classList.remove('is-entering');
    transitionLayer.classList.add('is-leaving');
    setTimeout(() => location.assign(target.href), 500);
  });

  const groups = [
    ['.workflow-demo', 'right'],
    ['.trust-copy', 'left'],
    ['.logo-card', 'up'],
    ['.section-head', 'up'],
    ['.solution-card', 'up'],
    ['.adoption-path article', 'up'],
    ['.case-card', 'up'],
    ['.model-pie-grid article', 'up'],
    ['.model-equation', 'up'],
    ['.phase-card', 'up'],
    ['.agent-layout > div', 'up'],
    ['.contact-grid > *', 'up'],
    ['.discovery-grid article', 'up'],
    ['.experience-card', 'up'],
    ['.guided-demo > *', 'up'],
    ['.faq-wrap details', 'up']
  ];
  const revealTargets = [];
  groups.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.dataset.reveal) return;
      element.dataset.reveal = direction;
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 85}ms`);
      revealTargets.push(element);
    });
  });

  if (reducedMotion.matches) {
    html.classList.add('motion-reduced');
    revealTargets.forEach(element => element.classList.add('is-visible'));
  } else {
    html.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {rootMargin: '0px 0px -7% 0px', threshold: .08});
    requestAnimationFrame(() => revealTargets.forEach(element => revealObserver.observe(element)));
  }

  const workflow = document.querySelector('.workflow-demo');
  if (workflow && !reducedMotion.matches) {
    let flowStep = 0;
    let flowTimer = 0;
    const stopFlow = () => { clearInterval(flowTimer); flowTimer = 0; };
    const startFlow = () => {
      if (flowTimer) return;
      const advance = () => {
        flowStep = flowStep % 4 + 1;
        workflow.dataset.flowStep = String(flowStep);
      };
      advance();
      flowTimer = setInterval(advance, 1450);
    };
    const flowObserver = new IntersectionObserver(([entry]) => entry.isIntersecting && !document.hidden ? startFlow() : stopFlow(), {threshold: .18});
    flowObserver.observe(workflow);
    document.addEventListener('visibilitychange', () => document.hidden ? stopFlow() : startFlow());
  }

  if (!reducedMotion.matches && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.solution-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--rx', `${(-y * 3.5).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(x * 4.5).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
(() => {
  document.querySelectorAll('[data-live-question]').forEach(button => {
    button.addEventListener('click', () => {
      const status = document.getElementById('liveDemoStatus');
      if (!window.TimuxChatWidget || !document.querySelector('.timux-chat-input')) {
        status.textContent = '客服暫時無法載入。你仍可看上方案例，或透過下方入口找 Ian 討論。';
        return;
      }
      window.TimuxChatWidget.open();
      const input = document.querySelector('.timux-chat-input');
      input.value = button.dataset.liveQuestion;
      input.dispatchEvent(new Event('input', {bubbles:true}));
      input.focus();
      status.textContent = '已帶入問題，請在客服視窗確認後按傳送。';
      if (['www.timux.site','timux.site'].includes(location.hostname) && typeof gtag === 'function') gtag('event','demo_question_selected',{scenario:'customer-service'});
    });
  });
})();
