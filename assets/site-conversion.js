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
