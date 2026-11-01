(() => {
  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = '/assets/site-lead-form.css?v=20261101-v1';
  document.head.append(styles);
  const form = document.getElementById('contactDraft');
  if (!form) return;

  const english = document.documentElement.lang === 'en';
  const copy = english ? {
    email: 'Email', required: 'Required', name: 'Name', company: 'Company / team', phone: 'Phone',
    optional: 'Optional', namePlaceholder: 'How should we address you?', companyPlaceholder: 'Company or team name',
    phonePlaceholder: 'A contact number', workflow: 'Which workflow would you like to improve?',
    workflowPlaceholder: 'For example: cross-team handoffs, customer service, or document search',
    context: 'What has been happening recently?', contextPlaceholder: 'Briefly describe one case. Do not enter personal or sensitive information.',
    submit: 'Send inquiry →', sending: 'Sending…', note: 'Email is required; all other fields are optional. We only use this information to respond to this inquiry.',
    successTitle: 'We received your inquiry', successBody: 'A consultant will reply to the Email you provided. Keep this reference:',
    error: 'We could not send the form right now. Please retry, or email service@timux.site.', invalid: 'Enter a valid Email address.',
  } : {
    email: 'Email', required: '必填', name: '姓名', company: '公司／團隊', phone: '電話', optional: '選填',
    namePlaceholder: '怎麼稱呼你', companyPlaceholder: '公司或團隊名稱', phonePlaceholder: '方便聯絡的電話',
    workflow: '想改善哪段工作？', workflowPlaceholder: '例如：跨部門交接、客服或文件查找',
    context: '最近遇到什麼情況？', contextPlaceholder: '簡單描述一個案例即可，請勿填入個人或敏感資料。',
    submit: '送出諮詢需求 →', sending: '送出中…', note: 'Email 為必填，其餘皆可選填。資料只用於回覆本次需求。',
    successTitle: '已收到你的需求', successBody: '顧問會透過你留下的 Email 回覆。請保留收件編號：',
    error: '目前無法送出，請稍後重試，或直接寄信至 service@timux.site。', invalid: '請填寫有效的 Email。',
  };

  const optionalLabel = `<small>${copy.optional}</small>`;
  form.dataset.leadForm = 'v1';
  form.noValidate = false;
  form.innerHTML = `
    <div class="form-field form-field-required"><label for="leadEmail">${copy.email} <span>${copy.required}</span></label><input id="leadEmail" name="email" type="email" maxlength="254" autocomplete="email" placeholder="name@company.com" required></div>
    <div class="form-field"><label for="leadName">${copy.name} ${optionalLabel}</label><input id="leadName" name="name" maxlength="80" autocomplete="name" placeholder="${copy.namePlaceholder}"></div>
    <div class="form-field"><label for="leadCompany">${copy.company} ${optionalLabel}</label><input id="leadCompany" name="company" maxlength="120" autocomplete="organization" placeholder="${copy.companyPlaceholder}"></div>
    <div class="form-field"><label for="leadPhone">${copy.phone} ${optionalLabel}</label><input id="leadPhone" name="phone" type="tel" maxlength="40" autocomplete="tel" placeholder="${copy.phonePlaceholder}"></div>
    <div class="form-field form-field-wide"><label for="workflow">${copy.workflow} ${optionalLabel}</label><input id="workflow" name="workflow" maxlength="240" placeholder="${copy.workflowPlaceholder}"></div>
    <div class="form-field form-field-wide"><label for="context">${copy.context} ${optionalLabel}</label><textarea id="context" name="context" maxlength="2000" rows="4" placeholder="${copy.contextPlaceholder}"></textarea></div>
    <div class="form-trap" aria-hidden="true"><label for="leadWebsite">Website</label><input id="leadWebsite" name="website" tabindex="-1" autocomplete="off"></div>
    <button class="button dark" type="submit">${copy.submit}</button>
    <p class="fine form-note">${copy.note}</p>
    <p id="leadStatus" class="form-status" role="status" aria-live="polite"></p>
    <div id="leadResult" class="lead-result" hidden><strong>${copy.successTitle}</strong><p>${copy.successBody} <b id="leadReceipt"></b></p></div>`;

  const scenario = new URLSearchParams(location.search).get('scenario');
  const workflow = form.elements.workflow;
  if (scenario === 'customer-service') {
    workflow.value = english ? 'Use AI customer service in our company workflow' : '想將 AI 客服用在公司的工作流程';
  }
  document.querySelectorAll('[data-solution]').forEach(link => {
    link.addEventListener('click', () => {
      workflow.value = link.dataset.solution || '';
      setTimeout(() => workflow.focus({ preventScroll: true }), 450);
    });
  });

  let started = false;
  form.addEventListener('input', () => {
    if (started) return;
    started = true;
    window.timuxTrack?.('contact_form_started', { scenario: scenario === 'customer-service' ? scenario : 'general' });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = form.elements.email;
    if (!email.validity.valid) {
      email.setCustomValidity(copy.invalid);
      email.reportValidity();
      email.addEventListener('input', () => email.setCustomValidity(''), { once: true });
      return;
    }
    const button = form.querySelector('[type="submit"]');
    const status = document.getElementById('leadStatus');
    const result = document.getElementById('leadResult');
    button.disabled = true;
    button.textContent = copy.sending;
    status.textContent = '';
    result.hidden = true;
    let sessionId = '';
    try {
      sessionId = localStorage.getItem('widget_session_cs_timux') || '';
      if (!/^visitor_[a-z0-9_-]{8,}$/i.test(sessionId)) {
        sessionId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem('widget_session_cs_timux', sessionId);
      }
    } catch {
      sessionId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    Object.assign(payload, {
      tenantCode: 'cs_timux', sessionId, locale: english ? 'en' : 'zh-TW',
      source: scenario === 'customer-service' ? 'website_customer_service' : 'website_contact_form',
      pageUrl: location.href,
    });
    try {
      const response = await fetch('https://ai-customer-service.timux.site/api/widget/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.submissionId) throw new Error(data.message || data.error || 'Lead submission failed');
      document.getElementById('leadReceipt').textContent = data.submissionId;
      result.hidden = false;
      status.textContent = '';
      form.querySelectorAll('input, textarea, button').forEach(control => { control.disabled = true; });
      window.dispatchEvent(new CustomEvent('timux:lead-submitted', { detail: { submissionId: data.submissionId, source: payload.source } }));
      result.focus?.();
    } catch (error) {
      status.textContent = copy.error;
      status.dataset.state = 'error';
      button.disabled = false;
      button.textContent = copy.submit;
    }
  });
})();
