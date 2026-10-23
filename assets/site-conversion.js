(() => {
  const english = document.documentElement.lang === 'en';
  const experimentId = 'about_copy_v1';
  let experimentVariant = document.documentElement.dataset.aboutVariant || '';
  const experimentPreview = document.documentElement.dataset.aboutPreview === 'true';
  if (experimentVariant !== 'A' && experimentVariant !== 'B') {
    try { experimentVariant = localStorage.getItem('timux_about_variant_v1') || ''; } catch {}
  }
  if (experimentVariant !== 'A' && experimentVariant !== 'B' || experimentPreview) experimentVariant = '';
  const pageGroup = location.pathname === '/' || location.pathname === '/en/'
    ? 'homepage'
    : location.pathname === '/about/' || location.pathname === '/en/about/'
      ? 'about_page'
    : location.pathname.startsWith('/demo/customer-service')
      ? 'customer_service_demo'
      : location.pathname.startsWith('/demo')
        ? 'demo_hub'
        : location.pathname.startsWith('/method')
          ? 'method'
          : 'other';
  const track = (event, params = {}) => {
    if (!['www.timux.site', 'timux.site'].includes(location.hostname)) return;
    const enriched = {...params};
    if (experimentVariant) {
      if (!enriched.experiment_id) enriched.experiment_id = experimentId;
      if (!enriched.experiment_variant) enriched.experiment_variant = experimentVariant;
    }
    if (!enriched.page_group) enriched.page_group = pageGroup;
    if (typeof window.gtag === 'function') window.gtag('event', event, enriched);
  };
  window.timuxTrack = track;

  if (experimentVariant) {
    track('experiment_page_view', {page_path: location.pathname});
    try {
      const sessionKey = `timux_ab_session_${experimentId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, '1');
        track('experiment_session_started');
      }
      const firstSeenKey = `timux_ab_first_seen_${experimentId}`;
      const today = new Date();
      const currentDay = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      const firstSeen = Number(localStorage.getItem(firstSeenKey) || 0);
      if (!firstSeen) localStorage.setItem(firstSeenKey, String(currentDay));
      else {
        const daysSinceFirst = Math.max(0, Math.floor((currentDay - firstSeen) / 86400000));
        const returnKey = `timux_ab_return_${experimentId}_${currentDay}`;
        if (daysSinceFirst > 0 && !localStorage.getItem(returnKey)) {
          localStorage.setItem(returnKey, '1');
          track('experiment_return_visit', {days_since_first: daysSinceFirst});
        }
      }
    } catch {}

    const depthMarks = [25, 50, 75, 90];
    const sentDepths = new Set();
    const measureDepth = () => {
      const distance = document.documentElement.scrollHeight - innerHeight;
      const depth = distance > 0 ? Math.round((scrollY / distance) * 100) : 100;
      depthMarks.forEach(mark => {
        if (depth >= mark && !sentDepths.has(mark)) {
          sentDepths.add(mark);
          track('page_scroll_depth', {percent_scrolled: mark});
        }
      });
    };
    addEventListener('scroll', measureDepth, {passive: true});
    requestAnimationFrame(measureDepth);

    let visibleSince = document.hidden ? 0 : performance.now();
    let visibleMs = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && visibleSince) {
        visibleMs += performance.now() - visibleSince;
        visibleSince = 0;
      } else if (!document.hidden && !visibleSince) visibleSince = performance.now();
    });
    addEventListener('pagehide', () => {
      if (visibleSince) visibleMs += performance.now() - visibleSince;
      track('page_engagement_summary', {
        engagement_time_msec: Math.round(visibleMs),
        engagement_bucket: visibleMs >= 60000 ? '60s_plus' : visibleMs >= 30000 ? '30_59s' : visibleMs >= 10000 ? '10_29s' : 'under_10s'
      });
    }, {once: true});
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-track]');
    if (link) track(link.dataset.track, {method: link.dataset.method || 'navigation', scenario: link.dataset.scenario || 'general'});
    const feature = event.target.closest('[data-feature]');
    if (feature) track('feature_used', {feature_name: feature.dataset.feature});
    if (event.target.closest('#starterQuestions .chip, #chatFeed .chip')) track('agent_interaction', {method: 'suggestion'});
  });
  addEventListener('timux:lead-submitted', event => {
    if (!event.detail?.submissionId) return;
    track('lead_submit_success', {lead_source: event.detail.source || 'website'});
  });
  const agentForm = document.getElementById('agentForm');
  if (agentForm) agentForm.addEventListener('submit', () => track('agent_interaction', {method: 'typed_question'}));
  const form = document.getElementById('contactDraft');
  if (form) {
    const workflowInput = document.getElementById('workflow');
    const summary = document.getElementById('summary');
    const email = document.getElementById('emailDraft');
    const scenario = new URLSearchParams(location.search).get('scenario');
    let formStarted = false;
    form.addEventListener('input', () => {
      if (formStarted) return;
      formStarted = true;
      track('contact_form_started', {scenario: scenario === 'customer-service' ? scenario : 'general'});
    });
    if (scenario === 'customer-service') workflowInput.value = english ? 'Use AI customer service in our company workflow' : '想將 AI 客服用在公司的工作流程';
    document.querySelectorAll('[data-solution]').forEach(link => {
      link.addEventListener('click', () => {
        workflowInput.value = link.dataset.solution;
        track('solution_selected', {scenario: link.dataset.solution});
        setTimeout(() => workflowInput.focus({preventScroll: true}), 450);
      });
    });
    const updateEmail = () => { email.href = 'mailto:service@timux.site?subject=' + encodeURIComponent(english ? 'Enterprise AI adoption discussion' : '企業 AI 導入需求討論') + '&body=' + encodeURIComponent(summary.value); };
    form.addEventListener('submit', event => {
      event.preventDefault();
      const workflow = workflowInput.value.trim();
      if (!workflow) { workflowInput.focus(); return; }
      summary.value = english
        ? 'Hi Ian,\n\nThe workflow I would like to discuss:\n' + workflow + '\n\nCurrent situation:\n' + (document.getElementById('context').value.trim() || 'I would like to add details during our discussion.') + '\n\nI would like to clarify a suitable validation scope, the data required, and the next step.' + (scenario === 'customer-service' ? '\n\nI reviewed the customer service case experience on the Timux website.' : '')
        : 'Ian 你好，\n\n我想討論的工作流程：' + workflow + '\n\n最近的情況：\n' + (document.getElementById('context').value.trim() || '希望在討論時補充。') + '\n\n希望一起確認：適合先驗證的範圍、需要的資料與下一步。' + (scenario === 'customer-service' ? '\n\n我看過官網的客服案例體驗。' : '');
      updateEmail();
      document.getElementById('draftResult').hidden = false;
      summary.focus();
      track('contact_draft_ready', {
        scenario: scenario === 'customer-service' ? scenario : 'general',
        context_provided: Boolean(document.getElementById('context').value.trim()),
        fields_completed: document.getElementById('context').value.trim() ? 2 : 1,
        context_length_bucket: document.getElementById('context').value.trim().length >= 240 ? 'long' : document.getElementById('context').value.trim().length >= 80 ? 'medium' : document.getElementById('context').value.trim().length ? 'short' : 'none'
      });
    });
    summary.addEventListener('input', updateEmail);
    document.getElementById('copyDraft').addEventListener('click', async () => {
      const status = document.getElementById('copyStatus');
      track('contact_summary_copied', {scenario: scenario === 'customer-service' ? scenario : 'general'});
      try { await navigator.clipboard.writeText(summary.value); status.textContent = english ? 'Summary copied. Paste it into your email and send when ready.' : '摘要已複製，請貼到 Email 並自行寄送。'; }
      catch { summary.focus(); summary.select(); status.textContent = english ? 'Copy the selected summary above, then paste it into your email.' : '請複製上方已選取的摘要，再貼到 Email。'; }
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
  const storyHome = Boolean(document.querySelector('script[src*="site-story.js"]'));
  html.dataset.motionSystem = storyHome ? 'v17' : 'v15';

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

  const sceneDefinitions = [
    {root: '.dark-world', label: '首頁', layers: ['.outcome-hero .hero-copy', '.workflow-demo', '.trust-inner']},
    {root: '#solutions', label: '解決方案', layers: ['.section-head', '.solution-card']},
    {root: '#adoption', label: '如何開始', layers: ['.section-head', '.adoption-path article', '.adoption-actions']},
    {root: '#cases', label: '實戰案例', layers: ['.section-head', '.case-card']},
    {root: '#method', label: '導入模型', layers: ['.section-head', '.model-pie-grid article', '.model-equation', '.section-tail']},
    {root: '#roadmap', label: '90 天路徑', layers: ['.section-head', '.phase-card', '.section-tail']},
    {root: '#agent', label: 'AI 顧問', layers: ['.agent-layout > *']},
    {root: '#contact', label: '開始討論', layers: ['.contact-grid > *']}
  ];
  const desktopScenes = !storyHome && !reducedMotion.matches && matchMedia('(min-width: 821px)').matches && document.querySelector('#solutions');

  if (reducedMotion.matches) {
    html.classList.add('motion-reduced');
    revealTargets.forEach(element => element.classList.add('is-visible'));
  } else {
    html.classList.add('motion-ready');
    if (desktopScenes || storyHome) {
      revealTargets.forEach(element => element.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, {rootMargin: '0px 0px -7% 0px', threshold: .08});
      requestAnimationFrame(() => revealTargets.forEach(element => revealObserver.observe(element)));
    }
  }

  if (desktopScenes) {
    html.classList.add('scene-motion');
    const clamp = value => Math.min(1, Math.max(0, value));
    const ease = value => value * value * (3 - 2 * value);
    const scenes = sceneDefinitions.map((definition, sceneIndex) => {
      const root = document.querySelector(definition.root);
      if (!root) return null;
      root.classList.add('scene-module');
      root.dataset.sceneIndex = String(sceneIndex);
      const layers = definition.layers.flatMap(selector => [...root.querySelectorAll(selector)]).filter((element, index, all) => all.indexOf(element) === index);
      const states = layers.map((element, layerIndex) => {
        element.classList.add('scene-layer');
        element.style.setProperty('--scene-order', String(layerIndex));
        return {element, opacity: 1, y: 0, scale: 1, blur: 0, targetOpacity: 1, targetY: 0, targetScale: 1, targetBlur: 0};
      });
      return {root, label: definition.label, states, visibility: 1};
    }).filter(Boolean);

    const indicator = document.createElement('div');
    indicator.className = 'scene-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    scenes.forEach((scene, index) => {
      const dot = document.createElement('i');
      dot.dataset.sceneDot = String(index);
      dot.title = scene.label;
      indicator.append(dot);
    });
    document.body.append(indicator);

    const applyState = state => {
      state.element.style.setProperty('--scene-opacity', state.opacity.toFixed(4));
      state.element.style.setProperty('--scene-y', `${state.y.toFixed(2)}px`);
      state.element.style.setProperty('--scene-scale', state.scale.toFixed(4));
      state.element.style.setProperty('--scene-blur', `${state.blur.toFixed(2)}px`);
    };
    const updateTargets = () => {
      const viewport = innerHeight;
      let activeIndex = 0;
      let activeDistance = Infinity;
      scenes.forEach((scene, sceneIndex) => {
        const rect = scene.root.getBoundingClientRect();
        const enter = ease(clamp((viewport * .94 - rect.top) / (viewport * .58)));
        const exit = ease(clamp((rect.bottom - viewport * .1) / (viewport * .48)));
        scene.visibility = Math.min(enter, exit);
        scene.root.classList.toggle('is-scene-active', scene.visibility > .68);
        const distance = Math.abs(rect.top - viewport * .24);
        if (rect.bottom > viewport * .2 && rect.top < viewport * .72 && distance < activeDistance) {
          activeDistance = distance;
          activeIndex = sceneIndex;
        }
        scene.states.forEach((state, layerIndex) => {
          const stagger = Math.min(layerIndex, 5) * .045;
          const layerEnter = ease(clamp((enter - stagger) / (1 - stagger)));
          const visibility = Math.min(layerEnter, exit);
          state.targetOpacity = .035 + visibility * .965;
          state.targetY = enter < 1 ? (1 - layerEnter) * 74 : exit < 1 ? -(1 - exit) * 58 : 0;
          state.targetScale = .965 + visibility * .035;
          state.targetBlur = (1 - visibility) * 7;
        });
      });
      html.dataset.activeScene = String(activeIndex);
      indicator.querySelectorAll('i').forEach((dot, index) => dot.classList.toggle('active', index === activeIndex));
    };

    let animationFrame = 0;
    let firstPaint = true;
    const animateScenes = () => {
      animationFrame = 0;
      updateTargets();
      let moving = false;
      scenes.forEach(scene => scene.states.forEach(state => {
        if (firstPaint) {
          state.opacity = state.targetOpacity;
          state.y = state.targetY;
          state.scale = state.targetScale;
          state.blur = state.targetBlur;
        } else {
          const follow = .075;
          state.opacity += (state.targetOpacity - state.opacity) * follow;
          state.y += (state.targetY - state.y) * follow;
          state.scale += (state.targetScale - state.scale) * follow;
          state.blur += (state.targetBlur - state.blur) * follow;
        }
        applyState(state);
        if (Math.abs(state.targetOpacity - state.opacity) > .002 || Math.abs(state.targetY - state.y) > .18 || Math.abs(state.targetScale - state.scale) > .0008 || Math.abs(state.targetBlur - state.blur) > .08) moving = true;
      }));
      firstPaint = false;
      if (moving) animationFrame = requestAnimationFrame(animateScenes);
    };
    const requestSceneFrame = () => { if (!animationFrame) animationFrame = requestAnimationFrame(animateScenes); };
    addEventListener('scroll', requestSceneFrame, {passive: true});
    addEventListener('resize', requestSceneFrame, {passive: true});
    animateScenes();
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
