/**
 * Slides Toolkit v1.0
 * 通用投影片工具包 — 適用於所有 Reveal.js 投影片
 * 功能：懸浮工具列、總覽模式、編輯模式、存檔（localStorage + 下載）
 *
 * 用法：在 Reveal.js 投影片 </body> 前加入：
 *   <script src="slides-toolkit.js"></script>
 */
(function () {
  'use strict';

  // ========== 識別碼（用檔名當 key） ==========
  const SLIDE_KEY = 'slides_edit_' + location.pathname.replace(/[^a-z0-9]/gi, '_');

  // ========== 注入 CSS ==========
  const css = document.createElement('style');
  css.textContent = `
    /* --- 懸浮工具列 --- */
    #st-toolbar {
      position:fixed; bottom:20px; right:20px; z-index:9999;
      display:flex; flex-direction:column; gap:6px;
      opacity:0.35; transition:opacity .3s;
    }
    #st-toolbar:hover { opacity:1; }
    #st-toolbar button {
      width:44px; height:44px; border-radius:50%;
      border:1px solid rgba(79,195,247,.3); background:rgba(10,22,40,.85);
      color:#4fc3f7; font-size:18px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s; backdrop-filter:blur(8px); position:relative;
    }
    #st-toolbar button:hover {
      background:rgba(79,195,247,.2); border-color:#4fc3f7; transform:scale(1.1);
    }
    #st-toolbar button.active {
      background:rgba(79,195,247,.3); border-color:#00e5ff; color:#00e5ff;
    }
    #st-toolbar .st-tip {
      position:absolute; right:54px; top:50%; transform:translateY(-50%);
      background:rgba(10,22,40,.92); color:#4fc3f7; font-size:11px;
      padding:4px 10px; border-radius:6px; white-space:nowrap;
      pointer-events:none; opacity:0; transition:opacity .2s;
      border:1px solid rgba(79,195,247,.2);
    }
    #st-toolbar button:hover .st-tip { opacity:1; }

    /* --- 總覽 --- */
    #st-overview {
      display:none; position:fixed; inset:0; z-index:9998;
      background:rgba(6,18,32,.97); overflow-y:auto; padding:30px;
    }
    #st-overview.show { display:block; }
    #st-overview .st-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
      gap:18px; max-width:1500px; margin:0 auto;
    }
    #st-overview .st-card {
      border:2px solid rgba(79,195,247,.15); border-radius:10px;
      overflow:hidden; cursor:pointer; transition:all .2s;
      background:rgba(10,22,40,.6); position:relative;
    }
    #st-overview .st-card:hover {
      border-color:#4fc3f7; transform:scale(1.02);
      box-shadow:0 0 20px rgba(79,195,247,.2);
    }
    #st-overview .st-card .st-thumb {
      width:100%; aspect-ratio:16/9; overflow:hidden; position:relative;
    }
    #st-overview .st-card .st-thumb iframe {
      position:absolute; top:0; left:0; width:1280px; height:720px;
      transform-origin:top left; pointer-events:none; border:none;
    }
    #st-overview .st-num {
      position:absolute; top:6px; left:8px;
      background:rgba(0,0,0,.6); color:#4fc3f7;
      font-size:12px; padding:2px 9px; border-radius:10px;
    }
    #st-overview .st-close {
      position:fixed; top:20px; right:30px; z-index:9999;
      background:rgba(10,22,40,.8); border:1px solid rgba(79,195,247,.3);
      color:#4fc3f7; font-size:24px; width:42px; height:42px;
      border-radius:50%; cursor:pointer; display:flex;
      align-items:center; justify-content:center;
    }
    #st-overview h3 {
      text-align:center; color:#4fc3f7; margin:0 0 20px;
      font-size:15px; font-weight:400; font-family:sans-serif;
    }

    /* --- 編輯模式 --- */
    .st-editing [contenteditable="true"]:hover {
      outline:1px dashed rgba(79,195,247,.3); outline-offset:1px;
    }
    .st-editing [contenteditable="true"]:focus {
      outline:2px dashed #00e5ff; outline-offset:2px;
      background:rgba(0,229,255,.05); border-radius:4px;
    }
    #st-banner {
      display:none; position:fixed; top:0; left:0; right:0; z-index:9999;
      background:linear-gradient(90deg,#0d47a1,#00838f);
      color:#fff; text-align:center; padding:7px 12px;
      font-size:13px; font-family:sans-serif;
    }
    #st-banner.show { display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap; }
    #st-banner button {
      background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.4);
      color:#fff; padding:3px 14px; border-radius:14px;
      cursor:pointer; font-size:12px; transition:background .2s;
    }
    #st-banner button:hover { background:rgba(255,255,255,.35); }
    #st-banner .st-saved {
      color:#69f0ae; font-size:12px; opacity:0; transition:opacity .3s;
    }
    #st-banner .st-saved.flash { opacity:1; }

    /* --- 放大模式 --- */
    #st-zoom-overlay {
      display:none; position:fixed; inset:0; z-index:9997;
      background:rgba(0,0,0,.92); cursor:grab;
      overflow:hidden;
    }
    #st-zoom-overlay.show { display:flex; align-items:center; justify-content:center; }
    #st-zoom-overlay.dragging { cursor:grabbing; }
    #st-zoom-overlay img {
      max-width:none; max-height:none; transition:transform .15s ease-out;
      user-select:none; -webkit-user-drag:none;
    }
    #st-zoom-controls {
      position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
      z-index:9998; display:none; gap:8px;
      background:rgba(10,22,40,.9); padding:8px 16px; border-radius:24px;
      border:1px solid rgba(79,195,247,.3); backdrop-filter:blur(8px);
    }
    #st-zoom-controls.show { display:flex; }
    #st-zoom-controls button {
      width:36px; height:36px; border-radius:50%;
      border:1px solid rgba(79,195,247,.3); background:rgba(10,22,40,.85);
      color:#4fc3f7; font-size:18px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
    }
    #st-zoom-controls button:hover { background:rgba(79,195,247,.2); }
    #st-zoom-controls span { color:#4fc3f7; font-size:13px; display:flex; align-items:center; padding:0 8px; font-family:monospace; }
    .st-zoomable { cursor:zoom-in !important; transition:outline .2s; }
    .st-zoomable:hover { outline:2px solid rgba(79,195,247,.5); outline-offset:4px; border-radius:8px; }

    /* --- 存檔還原提示 --- */
    #st-restore-bar {
      display:none; position:fixed; bottom:70px; right:20px; z-index:9999;
      background:rgba(10,22,40,.92); border:1px solid rgba(255,193,7,.4);
      color:#ffc107; padding:10px 16px; border-radius:10px;
      font-size:12px; font-family:sans-serif; max-width:280px;
      backdrop-filter:blur(8px);
    }
    #st-restore-bar.show { display:block; }
    #st-restore-bar button {
      background:rgba(255,193,7,.2); border:1px solid rgba(255,193,7,.4);
      color:#ffc107; padding:3px 12px; border-radius:10px;
      cursor:pointer; font-size:11px; margin:6px 4px 0 0;
    }
  `;
  document.head.appendChild(css);

  // ========== 注入 HTML ==========
  const toolbar = document.createElement('div');
  toolbar.id = 'st-toolbar';
  toolbar.innerHTML = `
    <button onclick="ST.fullscreen()" title="全螢幕"><span class="st-tip">全螢幕 (F)</span>⛶</button>
    <button onclick="ST.speakerNotes()" title="講者備註"><span class="st-tip">講者備註 (S)</span>📋</button>
    <button onclick="ST.overview()" title="總覽"><span class="st-tip">總覽所有頁面 (G)</span>🔍</button>
    <button id="st-zoom-btn" onclick="ST.toggleZoom()" title="放大模式"><span class="st-tip">放大模式 (Z)</span>🔎</button>
    <button id="st-edit-btn" onclick="ST.toggleEdit()" title="編輯"><span class="st-tip">編輯模式 (E)</span>✏️</button>
  `;
  document.body.appendChild(toolbar);

  const overview = document.createElement('div');
  overview.id = 'st-overview';
  overview.innerHTML = `
    <button class="st-close" onclick="ST.overview()">✕</button>
    <h3>📖 所有頁面總覽（點擊跳轉）</h3>
    <div class="st-grid" id="st-grid"></div>
  `;
  document.body.appendChild(overview);

  const banner = document.createElement('div');
  banner.id = 'st-banner';
  banner.innerHTML = `
    <span>✏️ 編輯模式 — 點擊文字直接修改</span>
    <button onclick="ST.save()">💾 存檔</button>
    <button onclick="ST.download()">📥 下載 HTML</button>
    <button onclick="ST.discard()">🗑️ 放棄修改</button>
    <button onclick="ST.toggleEdit()">✕ 退出</button>
    <span class="st-saved" id="st-saved-msg">✅ 已存檔</span>
  `;
  document.body.appendChild(banner);

  const restoreBar = document.createElement('div');
  restoreBar.id = 'st-restore-bar';
  restoreBar.innerHTML = `
    <div>📝 偵測到上次未儲存的編輯</div>
    <button onclick="ST.restore()">✅ 還原</button>
    <button onclick="ST.clearDraft()">✕ 忽略</button>
  `;
  document.body.appendChild(restoreBar);

  // ========== 放大模式 ==========
  const zoomOverlay = document.createElement('div');
  zoomOverlay.id = 'st-zoom-overlay';
  document.body.appendChild(zoomOverlay);

  const zoomControls = document.createElement('div');
  zoomControls.id = 'st-zoom-controls';
  zoomControls.innerHTML = `
    <button onclick="ST.zoomIn()">＋</button>
    <span id="st-zoom-level">100%</span>
    <button onclick="ST.zoomOut()">－</button>
    <button onclick="ST.zoomReset()">↺</button>
    <button onclick="ST.zoomClose()">✕</button>
  `;
  document.body.appendChild(zoomControls);

  // ========== 狀態 ==========
  let editMode = false;
  let zoomMode = false;
  let zoomScale = 1;
  let zoomTranslateX = 0, zoomTranslateY = 0;
  let isDragging = false, dragStartX = 0, dragStartY = 0;
  let zoomImg = null;

  // ========== API ==========
  window.ST = {
    fullscreen() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    },

    speakerNotes() {
      try { Reveal.getPlugin('notes').open(); } catch (e) { alert('講者備註插件未載入'); }
    },

    overview() {
      const ov = document.getElementById('st-overview');
      if (ov.classList.contains('show')) { ov.classList.remove('show'); return; }
      const grid = document.getElementById('st-grid');
      grid.innerHTML = '';
      const slides = document.querySelectorAll('.reveal .slides > section');
      const headHTML = document.head.innerHTML;
      slides.forEach((slide, i) => {
        const card = document.createElement('div');
        card.className = 'st-card';
        card.onclick = () => { Reveal.slide(i); ov.classList.remove('show'); };

        const thumb = document.createElement('div');
        thumb.className = 'st-thumb';

        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:1280px;height:720px;transform-origin:top left;pointer-events:none;border:none;';
        iframe.srcdoc = '<html><head>' + headHTML + '</head><body style="margin:0;overflow:hidden;"><div style="width:1280px;height:720px;padding:30px 50px;box-sizing:border-box;background:linear-gradient(135deg,#0a1628,#0d2137,#0a1628,#061220);">' + slide.innerHTML + '</div></body></html>';

        thumb.appendChild(iframe);

        const num = document.createElement('div');
        num.className = 'st-num';
        num.textContent = (i + 1) + ' / ' + slides.length;

        card.appendChild(thumb);
        card.appendChild(num);
        grid.appendChild(card);

        // 動態計算縮放
        requestAnimationFrame(() => {
          const scale = thumb.offsetWidth / 1280;
          iframe.style.transform = 'scale(' + scale + ')';
        });
      });
      ov.classList.add('show');
    },

    // ---- 放大模式 ----
    toggleZoom() {
      zoomMode = !zoomMode;
      const btn = document.getElementById('st-zoom-btn');
      if (zoomMode) {
        btn.classList.add('active');
        // 讓所有圖片可點擊放大
        document.querySelectorAll('.reveal .slides section img').forEach(img => {
          img.classList.add('st-zoomable');
          img._stZoomClick = () => ST.zoomOpen(img.src);
          img.addEventListener('click', img._stZoomClick);
        });
      } else {
        btn.classList.remove('active');
        document.querySelectorAll('.st-zoomable').forEach(img => {
          img.classList.remove('st-zoomable');
          if (img._stZoomClick) {
            img.removeEventListener('click', img._stZoomClick);
            delete img._stZoomClick;
          }
        });
        ST.zoomClose();
      }
    },

    zoomOpen(src) {
      const ov = document.getElementById('st-zoom-overlay');
      const ctrl = document.getElementById('st-zoom-controls');
      ov.innerHTML = '';
      zoomImg = document.createElement('img');
      zoomImg.src = src;
      zoomScale = 1; zoomTranslateX = 0; zoomTranslateY = 0;
      ST._applyZoomTransform();
      ov.appendChild(zoomImg);
      ov.classList.add('show');
      ctrl.classList.add('show');
      // 滾輪縮放
      ov.onwheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        zoomScale = Math.max(0.3, Math.min(8, zoomScale + delta));
        ST._applyZoomTransform();
      };
      // 拖動平移
      ov.onmousedown = (e) => {
        if (e.target === zoomImg || e.target === ov) {
          isDragging = true; dragStartX = e.clientX - zoomTranslateX; dragStartY = e.clientY - zoomTranslateY;
          ov.classList.add('dragging');
        }
      };
      ov.onmousemove = (e) => {
        if (!isDragging) return;
        zoomTranslateX = e.clientX - dragStartX;
        zoomTranslateY = e.clientY - dragStartY;
        ST._applyZoomTransform();
      };
      ov.onmouseup = () => { isDragging = false; ov.classList.remove('dragging'); };
      ov.onmouseleave = () => { isDragging = false; ov.classList.remove('dragging'); };
      // 雙擊還原
      ov.ondblclick = () => { zoomScale = 1; zoomTranslateX = 0; zoomTranslateY = 0; ST._applyZoomTransform(); };
    },

    zoomClose() {
      document.getElementById('st-zoom-overlay').classList.remove('show');
      document.getElementById('st-zoom-controls').classList.remove('show');
      zoomImg = null;
    },

    zoomIn() { zoomScale = Math.min(8, zoomScale + 0.3); ST._applyZoomTransform(); },
    zoomOut() { zoomScale = Math.max(0.3, zoomScale - 0.3); ST._applyZoomTransform(); },
    zoomReset() { zoomScale = 1; zoomTranslateX = 0; zoomTranslateY = 0; ST._applyZoomTransform(); },

    _applyZoomTransform() {
      if (zoomImg) {
        zoomImg.style.transform = 'translate(' + zoomTranslateX + 'px,' + zoomTranslateY + 'px) scale(' + zoomScale + ')';
      }
      document.getElementById('st-zoom-level').textContent = Math.round(zoomScale * 100) + '%';
    },

    toggleEdit() {
      editMode = !editMode;
      const btn = document.getElementById('st-edit-btn');
      const ban = document.getElementById('st-banner');
      if (editMode) {
        btn.classList.add('active');
        ban.classList.add('show');
        document.body.classList.add('st-editing');
        document.querySelectorAll('.reveal .slides section h1,.reveal .slides section h2,.reveal .slides section h3,.reveal .slides section p,.reveal .slides section span,.reveal .slides section li,.reveal .slides section td,.reveal .slides section th').forEach(el => {
          if (!el.closest('aside') && !el.closest('#st-toolbar') && !el.closest('#st-banner') && !el.closest('#st-overview')) {
            el.contentEditable = 'true';
          }
        });
      } else {
        btn.classList.remove('active');
        ban.classList.remove('show');
        document.body.classList.remove('st-editing');
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
          el.contentEditable = 'false';
        });
      }
    },

    save() {
      // 暫存到 localStorage
      const html = document.querySelector('.reveal .slides').innerHTML;
      try {
        localStorage.setItem(SLIDE_KEY, html);
        localStorage.setItem(SLIDE_KEY + '_time', new Date().toLocaleString('zh-TW'));
        const msg = document.getElementById('st-saved-msg');
        msg.classList.add('flash');
        setTimeout(() => msg.classList.remove('flash'), 2000);
      } catch (e) {
        alert('存檔失敗：' + e.message);
      }
    },

    download() {
      // 清除 contentEditable 屬性
      document.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute('contenteditable'));
      const fullHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      // 還原 contentEditable
      if (editMode) {
        document.querySelectorAll('.reveal .slides section h1,.reveal .slides section h2,.reveal .slides section h3,.reveal .slides section p,.reveal .slides section span,.reveal .slides section li,.reveal .slides section td,.reveal .slides section th').forEach(el => {
          if (!el.closest('aside') && !el.closest('#st-toolbar') && !el.closest('#st-banner') && !el.closest('#st-overview')) {
            el.contentEditable = 'true';
          }
        });
      }
      const blob = new Blob([fullHTML], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = location.pathname.split('/').pop() || 'slides.html';
      a.click();
      URL.revokeObjectURL(a.href);
    },

    discard() {
      if (!confirm('確定要放棄所有修改？將重新載入原始版本。')) return;
      localStorage.removeItem(SLIDE_KEY);
      localStorage.removeItem(SLIDE_KEY + '_time');
      location.reload();
    },

    restore() {
      const saved = localStorage.getItem(SLIDE_KEY);
      if (saved) {
        document.querySelector('.reveal .slides').innerHTML = saved;
        Reveal.sync();
        Reveal.slide(0);
      }
      document.getElementById('st-restore-bar').classList.remove('show');
    },

    clearDraft() {
      localStorage.removeItem(SLIDE_KEY);
      localStorage.removeItem(SLIDE_KEY + '_time');
      document.getElementById('st-restore-bar').classList.remove('show');
    }
  };

  // ========== 快捷鍵 ==========
  document.addEventListener('keydown', (e) => {
    // 編輯模式下不攔截文字按鍵
    if (editMode && e.target.contentEditable === 'true') return;
    if (e.key === 'g' || e.key === 'G') ST.overview();
    if (e.key === 'e' || e.key === 'E') ST.toggleEdit();
    if (e.key === 'z' || e.key === 'Z') ST.toggleZoom();
    if (e.key === '+' || e.key === '=') { if (zoomImg) { e.preventDefault(); ST.zoomIn(); } }
    if (e.key === '-' || e.key === '_') { if (zoomImg) { e.preventDefault(); ST.zoomOut(); } }
    if (e.key === 'Escape') {
      if (zoomImg) { ST.zoomClose(); return; }
      document.getElementById('st-overview').classList.remove('show');
      document.getElementById('st-restore-bar').classList.remove('show');
      if (editMode) ST.toggleEdit();
    }
  });

  // ========== 載入時檢查草稿 ==========
  window.addEventListener('load', () => {
    const saved = localStorage.getItem(SLIDE_KEY);
    if (saved) {
      const time = localStorage.getItem(SLIDE_KEY + '_time') || '未知時間';
      document.querySelector('#st-restore-bar div').textContent = '📝 偵測到上次編輯的草稿（' + time + '）';
      document.getElementById('st-restore-bar').classList.add('show');
    }
  });

})();
