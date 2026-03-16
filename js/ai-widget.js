/**
 * 時光智造 AI 客服 - 嵌入式聊天 Widget
 * 
 * 零依賴，純 vanilla JavaScript
 * 任何網站只需加一行 script 即可使用
 * 
 * 使用方式：
 * <script src="https://ai-customer-service.timux.site/widget.js" data-tenant="cs_xxxxx"></script>
 * 
 * 可選屬性：
 * - data-color: 自定義主色（預設 #4F46E5）
 * - data-position: left 或 right（預設 right）
 */

(function() {
  'use strict';

  // 避免重複載入
  if (window.TimuxChatWidget) return;

  // Widget 配置
  let config = {
    tenantCode: null,
    apiBase: null,
    primaryColor: '#4F46E5',
    position: 'right',
    greeting: '您好！有什麼可以幫您的嗎？',
    tenantName: 'AI 客服'
  };

  let sessionId = null;
  let isOpen = false;
  let messages = [];

  // DOM 元素
  let chatBubble = null;
  let chatWindow = null;
  let messagesContainer = null;
  let messageInput = null;
  let sendButton = null;

  /**
   * 初始化 Widget
   */
  function initWidget() {
    // 取得 script 標籤的配置
    const scriptTag = document.querySelector('script[data-tenant]');
    if (!scriptTag || !scriptTag.getAttribute('data-tenant')) {
      console.error('[TimuxChatWidget] 缺少 data-tenant 屬性');
      return;
    }

    config.tenantCode = scriptTag.getAttribute('data-tenant');
    config.primaryColor = scriptTag.getAttribute('data-color') || config.primaryColor;
    config.position = scriptTag.getAttribute('data-position') || config.position;

    // API base URL — 從 script src 推斷或用 data-api 屬性
    if (scriptTag.getAttribute('data-api')) {
      config.apiBase = scriptTag.getAttribute('data-api').replace(/\/+$/, '');
    } else {
      // 從 script src 提取 origin（支援 /api/widget.js、/widget.js、/js/ai-widget.js 等各種路徑）
      try {
        const srcUrl = new URL(scriptTag.src);
        config.apiBase = srcUrl.origin;
      } catch (e) {
        // 相對路徑時用當前頁面的 origin
        config.apiBase = window.location.origin;
      }
    }

    // 生成或取得 sessionId
    sessionId = localStorage.getItem(`widget_session_${config.tenantCode}`) || 
                `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(`widget_session_${config.tenantCode}`, sessionId);

    // 取得租戶配置
    fetchTenantConfig().then(() => {
      createChatElements();
      loadChatHistory();
      
      // 如果沒有歷史訊息，顯示歡迎語
      if (messages.length === 0) {
        addMessage(config.greeting, 'assistant');
      }
    });
  }

  /**
   * 取得租戶配置
   */
  async function fetchTenantConfig() {
    try {
      const response = await fetch(`${config.apiBase}/api/widget/config/${config.tenantCode}`);
      const data = await response.json();
      
      if (data.success) {
        config.greeting = data.config.greeting || config.greeting;
        config.tenantName = data.config.name || config.tenantName;
        if (data.config.primaryColor) {
          config.primaryColor = data.config.primaryColor;
        }
      }
    } catch (error) {
      console.warn('[TimuxChatWidget] 無法取得租戶配置:', error);
    }
  }

  /**
   * 建立聊天元素
   */
  function createChatElements() {
    // 建立樣式
    injectStyles();

    // 建立聊天氣泡
    createChatBubble();

    // 建立聊天視窗
    createChatWindow();
  }

  /**
   * 注入 CSS 樣式
   */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .timux-chat-widget * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .timux-chat-bubble {
        position: fixed;
        ${config.position}: 20px;
        bottom: 20px;
        width: 60px;
        height: 60px;
        background: ${config.primaryColor};
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .timux-chat-bubble:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }

      .timux-chat-bubble::after {
        content: '💬';
        font-size: 24px;
      }

      .timux-chat-window {
        position: fixed;
        ${config.position}: 20px;
        bottom: 90px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2);
        display: none;
        flex-direction: column;
        z-index: 999998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
      }

      .timux-chat-window.open {
        display: flex;
      }

      .timux-chat-header {
        background: ${config.primaryColor};
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .timux-chat-title {
        font-size: 16px;
        font-weight: 600;
      }

      .timux-chat-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .timux-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .timux-message {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 18px;
        word-wrap: break-word;
        line-height: 1.4;
        font-size: 14px;
      }

      .timux-message.user {
        align-self: flex-end;
        background: ${config.primaryColor};
        color: white;
        margin-left: auto;
      }

      .timux-message.assistant {
        align-self: flex-start;
        background: #f1f3f4;
        color: #202124;
      }

      .timux-message.loading {
        align-self: flex-start;
        background: #f1f3f4;
        color: #202124;
      }

      .timux-chat-input-container {
        padding: 15px 20px;
        border-top: 1px solid #e8eaed;
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .timux-chat-input {
        flex: 1;
        border: 1px solid #dadce0;
        border-radius: 20px;
        padding: 8px 14px;
        font-size: 14px;
        outline: none;
        font-family: inherit;
        color: #1a1a2e;
        background: #ffffff;
      }

      .timux-chat-input:focus {
        border-color: ${config.primaryColor};
      }

      .timux-send-button {
        background: ${config.primaryColor};
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: background 0.2s;
      }

      .timux-send-button:hover:not(:disabled) {
        opacity: 0.8;
      }

      .timux-send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .timux-loading-dots {
        display: inline-flex;
        gap: 3px;
      }

      .timux-loading-dots span {
        width: 6px;
        height: 6px;
        background: #666;
        border-radius: 50%;
        animation: timux-bounce 1.4s ease-in-out infinite both;
      }

      .timux-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .timux-loading-dots span:nth-child(2) { animation-delay: -0.16s; }

      @keyframes timux-bounce {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      /* 手機適配 */
      @media (max-width: 480px) {
        .timux-chat-window {
          ${config.position}: 10px;
          bottom: 80px;
          width: calc(100vw - 20px);
          height: calc(100vh - 100px);
          max-height: 500px;
        }

        .timux-chat-bubble {
          ${config.position}: 15px;
          bottom: 15px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 建立聊天氣泡
   */
  function createChatBubble() {
    chatBubble = document.createElement('div');
    chatBubble.className = 'timux-chat-widget timux-chat-bubble';
    chatBubble.addEventListener('click', toggleChat);
    document.body.appendChild(chatBubble);
  }

  /**
   * 建立聊天視窗
   */
  function createChatWindow() {
    chatWindow = document.createElement('div');
    chatWindow.className = 'timux-chat-widget timux-chat-window';
    
    // 標題列
    const header = document.createElement('div');
    header.className = 'timux-chat-header';
    
    const title = document.createElement('div');
    title.className = 'timux-chat-title';
    title.textContent = config.tenantName;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'timux-chat-close';
    closeButton.innerHTML = '✕';
    closeButton.addEventListener('click', closeChat);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // 訊息區域
    messagesContainer = document.createElement('div');
    messagesContainer.className = 'timux-chat-messages';
    
    // 輸入區域
    const inputContainer = document.createElement('div');
    inputContainer.className = 'timux-chat-input-container';
    
    messageInput = document.createElement('input');
    messageInput.className = 'timux-chat-input';
    messageInput.type = 'text';
    messageInput.placeholder = '輸入訊息...';
    messageInput.addEventListener('keypress', handleInputKeypress);
    
    sendButton = document.createElement('button');
    sendButton.className = 'timux-send-button';
    sendButton.innerHTML = '→';
    sendButton.addEventListener('click', sendMessage);
    
    inputContainer.appendChild(messageInput);
    inputContainer.appendChild(sendButton);
    
    chatWindow.appendChild(header);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputContainer);
    
    document.body.appendChild(chatWindow);
  }

  /**
   * 切換聊天視窗
   */
  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  /**
   * 開啟聊天視窗
   */
  function openChat() {
    chatWindow.classList.add('open');
    messageInput.focus();
    isOpen = true;
    saveChatHistory();
  }

  /**
   * 關閉聊天視窗
   */
  function closeChat() {
    chatWindow.classList.remove('open');
    isOpen = false;
    saveChatHistory();
  }

  /**
   * 處理輸入框按鍵事件
   */
  function handleInputKeypress(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }

  /**
   * 發送訊息
   */
  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // 清空輸入框並禁用發送按鈕
    messageInput.value = '';
    sendButton.disabled = true;

    // 顯示用戶訊息
    addMessage(message, 'user');

    // 顯示載入中訊息
    const loadingMessage = addMessage('', 'loading');
    loadingMessage.innerHTML = '<div class="timux-loading-dots"><span></span><span></span><span></span></div>';

    try {
      // 呼叫 API
      const response = await fetch(`${config.apiBase}/api/widget/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantCode: config.tenantCode,
          message: message,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      // 移除載入中訊息
      messagesContainer.removeChild(loadingMessage);

      if (data.success) {
        // 顯示 AI 回覆
        addMessage(data.reply, 'assistant');

        // 檢查是否需要轉人工
        if (data.transferToHuman) {
          setTimeout(() => {
            addMessage('正在為您轉接人工客服，請稍候...', 'assistant');
          }, 500);
        }
      } else {
        addMessage('抱歉，系統忙碌中，請稍後再試。', 'assistant');
      }
    } catch (error) {
      console.error('[TimuxChatWidget] API 錯誤:', error);
      
      // 移除載入中訊息
      if (loadingMessage.parentNode) {
        messagesContainer.removeChild(loadingMessage);
      }
      
      addMessage('網路連線出現問題，請稍後再試。', 'assistant');
    }

    // 重新啟用發送按鈕
    sendButton.disabled = false;
    messageInput.focus();

    // 儲存對話記錄
    saveChatHistory();
  }

  /**
   * 新增訊息
   */
  function addMessage(content, role) {
    const messageElement = document.createElement('div');
    messageElement.className = `timux-message ${role}`;
    messageElement.textContent = content;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 儲存到記憶體
    if (role !== 'loading') {
      messages.push({ content, role, timestamp: Date.now() });
    }

    return messageElement;
  }

  /**
   * 載入聊天記錄
   */
  function loadChatHistory() {
    try {
      const saved = sessionStorage.getItem(`timux_chat_${config.tenantCode}`);
      if (saved) {
        messages = JSON.parse(saved);
        
        // 只顯示最近 20 條訊息
        const recentMessages = messages.slice(-20);
        recentMessages.forEach(msg => {
          addMessage(msg.content, msg.role);
        });
      }
    } catch (error) {
      console.warn('[TimuxChatWidget] 載入聊天記錄失敗:', error);
    }
  }

  /**
   * 儲存聊天記錄
   */
  function saveChatHistory() {
    try {
      // 只保留最近 20 條訊息
      const recentMessages = messages.slice(-20);
      sessionStorage.setItem(`timux_chat_${config.tenantCode}`, JSON.stringify(recentMessages));
    } catch (error) {
      console.warn('[TimuxChatWidget] 儲存聊天記錄失敗:', error);
    }
  }

  // 全域暴露
  window.TimuxChatWidget = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
  };

  // DOM 載入完成後初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();