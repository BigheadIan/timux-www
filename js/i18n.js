// i18n - Internationalization support
const translations = {
    'zh-TW': {
        brand: '時光智造',
        'nav.products': '產品',
        'nav.about': '關於我們',
        'nav.contact': '聯繫我們',
        'hero.badge': 'AI 驅動的智能解決方案',
        'hero.title1': '智造交給 AI',
        'hero.title2': '時光留給所愛',
        'hero.subtitle': '時光智造透過 AI 自動化重複性工作，節省您的寶貴時間，讓您能專注於更有價值的事，或陪伴您真正在乎的人。',
        'hero.cta1': '探索產品',
        'hero.cta2': '聯繫我們',
        'products.title': '我們的產品',
        'products.subtitle': 'AI 賦能，智慧未來',
        'products.featured': '主推',
        'products.beta': 'Beta',
        'products.learnmore': '了解更多',
        'products.smartcourt.name': 'SmartCourt 智慧場館',
        'products.smartcourt.desc': '台灣第一個無人運動場館解決方案。整合 SaaS 管理平台與 IoT 智慧硬體，實現 24 小時自動營運，大幅節省人力成本。',
        'products.smartcourt.f1': '智慧門鎖 + 電源自動控制',
        'products.smartcourt.f2': '線上預約 + 動態定價',
        'products.smartcourt.f3': '會員管理 + 行銷裂變',
        'products.smartcourt.f4': '數據分析 + 營收報表',
        'products.smartcourt.img1': '數據看板',
        'products.smartcourt.img2': '時段管理',
        'products.smartcourt.img3': '預約管理',
        'products.smartcourt.img4': '行銷工具',
        'products.smartcourt.img5': '用戶端 APP',
        'products.aics.name': 'AI 智能客服',
        'products.aics.desc': '基於大型語言模型的智能客服系統，7×24 小時自動回覆客戶諮詢，大幅提升客戶滿意度與服務效率。',
        'products.aics.f1': '自然語言理解',
        'products.aics.f2': '多輪對話能力',
        'products.aics.f3': '知識庫自動學習',
        'products.aics.f4': '無縫轉接人工',
        'products.aics.img1': '客服工作台',
        'products.aics.img2': '報表分析',
        'products.aics.img3': '知識庫管理',
        'products.fortune.name': 'AI 智能算命',
        'products.fortune.desc': '結合傳統命理學與現代 AI 技術，提供個人化的命理分析與人生建議，為用戶帶來全新的命理體驗。',
        'products.fortune.f1': '八字命盤分析',
        'products.fortune.f2': 'AI 個人化解讀',
        'products.fortune.f3': '運勢預測建議',
        'products.fortune.f4': '互動式諮詢',
        'products.fortune.img1': '命理報告',
        'products.fortune.img2': '產品特色',
        'about.title': '關於時光智造',
        'about.p1': '時光智造成立於台灣，是一家專注於 AI 智能解決方案的科技公司。我們相信 AI 技術能夠改變傳統行業的運作方式，幫助企業實現數位轉型。',
        'about.p2': '我們的團隊由資深軟體工程師和 AI 專家組成，擁有豐富的產品開發經驗。從智慧場館管理到 AI 客服，我們致力於打造實用、可靠、創新的解決方案。',
        'about.stat1': '產品線',
        'about.stat2': '智能服務',
        'about.stat3': 'AI 驅動',
        'about.tech1': 'AI 技術',
        'about.tech2': '雲端服務',
        'about.tech3': 'IoT 整合',
        'about.tech4': '數據分析',
        'contact.title': '聯繫我們',
        'contact.subtitle': '有任何問題或合作需求？歡迎與我們聯繫',
        'contact.name': '姓名',
        'contact.email': '電子郵件',
        'contact.company': '公司名稱（選填）',
        'contact.product': '感興趣的產品',
        'contact.opt1': 'SmartCourt 智慧場館',
        'contact.opt2': 'AI 智能客服',
        'contact.opt3': 'AI 智能算命',
        'contact.opt5': '合作洽談 / 產品試用',
        'contact.opt4': '其他',
        'contact.message': '訊息內容',
        'contact.submit': '發送訊息',
        'contact.success': '訊息已發送成功！我們會盡快回覆您。',
        'contact.error': '發送失敗，請稍後再試或直接聯繫我們的郵箱。',
        'footer.rights': 'All rights reserved.'
    },
    'zh-CN': {
        brand: '时光智造',
        'nav.products': '产品',
        'nav.about': '关于我们',
        'nav.contact': '联系我们',
        'hero.badge': 'AI 驱动的智能解决方案',
        'hero.title1': '智造交给 AI',
        'hero.title2': '时光留给所爱',
        'hero.subtitle': '时光智造通过 AI 自动化重复性工作，节省您的宝贵时间，让您能专注于更有价值的事，或陪伴您真正在乎的人。',
        'hero.cta1': '探索产品',
        'hero.cta2': '联系我们',
        'products.title': '我们的产品',
        'products.subtitle': 'AI 赋能，智慧未来',
        'products.featured': '主推',
        'products.beta': 'Beta',
        'products.learnmore': '了解更多',
        'products.smartcourt.name': 'SmartCourt 智慧场馆',
        'products.smartcourt.desc': '台湾第一个无人运动场馆解决方案。整合 SaaS 管理平台与 IoT 智慧硬件，实现 24 小时自动运营，大幅节省人力成本。',
        'products.smartcourt.f1': '智慧门锁 + 电源自动控制',
        'products.smartcourt.f2': '在线预约 + 动态定价',
        'products.smartcourt.f3': '会员管理 + 营销裂变',
        'products.smartcourt.f4': '数据分析 + 营收报表',
        'products.smartcourt.img1': '数据看板',
        'products.smartcourt.img2': '时段管理',
        'products.smartcourt.img3': '预约管理',
        'products.smartcourt.img4': '营销工具',
        'products.smartcourt.img5': '用户端 APP',
        'products.aics.name': 'AI 智能客服',
        'products.aics.desc': '基于大型语言模型的智能客服系统，7×24 小时自动回复客户咨询，大幅提升客户满意度与服务效率。',
        'products.aics.f1': '自然语言理解',
        'products.aics.f2': '多轮对话能力',
        'products.aics.f3': '知识库自动学习',
        'products.aics.f4': '无缝转接人工',
        'products.aics.img1': '客服工作台',
        'products.aics.img2': '报表分析',
        'products.aics.img3': '知识库管理',
        'products.fortune.name': 'AI 智能算命',
        'products.fortune.desc': '结合传统命理学与现代 AI 技术，提供个性化的命理分析与人生建议，为用户带来全新的命理体验。',
        'products.fortune.f1': '八字命盘分析',
        'products.fortune.f2': 'AI 个性化解读',
        'products.fortune.f3': '运势预测建议',
        'products.fortune.f4': '互动式咨询',
        'products.fortune.img1': '命理报告',
        'products.fortune.img2': '产品特色',
        'about.title': '关于时光智造',
        'about.p1': '时光智造成立于台湾，是一家专注于 AI 智能解决方案的科技公司。我们相信 AI 技术能够改变传统行业的运作方式，帮助企业实现数字化转型。',
        'about.p2': '我们的团队由资深软件工程师和 AI 专家组成，拥有丰富的产品开发经验。从智慧场馆管理到 AI 客服，我们致力于打造实用、可靠、创新的解决方案。',
        'about.stat1': '产品线',
        'about.stat2': '智能服务',
        'about.stat3': 'AI 驱动',
        'about.tech1': 'AI 技术',
        'about.tech2': '云端服务',
        'about.tech3': 'IoT 整合',
        'about.tech4': '数据分析',
        'contact.title': '联系我们',
        'contact.subtitle': '有任何问题或合作需求？欢迎与我们联系',
        'contact.name': '姓名',
        'contact.email': '电子邮件',
        'contact.company': '公司名称（选填）',
        'contact.product': '感兴趣的产品',
        'contact.opt1': 'SmartCourt 智慧场馆',
        'contact.opt2': 'AI 智能客服',
        'contact.opt3': 'AI 智能算命',
        'contact.opt5': '合作洽谈 / 产品试用',
        'contact.opt4': '其他',
        'contact.message': '消息内容',
        'contact.submit': '发送消息',
        'contact.success': '消息已发送成功！我们会尽快回复您。',
        'contact.error': '发送失败，请稍后再试或直接联系我们的邮箱。',
        'footer.rights': 'All rights reserved.'
    },
    'en': {
        brand: 'Timux',
        'nav.products': 'Products',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'hero.badge': 'AI-Powered Smart Solutions',
        'hero.title1': 'Let AI Handle the Routine',
        'hero.title2': 'Save Time for What You Love',
        'hero.subtitle': 'Timux automates repetitive work with AI, giving you back precious time to focus on what truly matters — whether it\'s meaningful work or the people you care about.',
        'hero.cta1': 'Explore Products',
        'hero.cta2': 'Contact Us',
        'products.title': 'Our Products',
        'products.subtitle': 'AI Empowered, Smart Future',
        'products.featured': 'Featured',
        'products.beta': 'Beta',
        'products.learnmore': 'Learn More',
        'products.smartcourt.name': 'SmartCourt',
        'products.smartcourt.desc': 'The first unmanned sports venue solution in Taiwan. Integrates SaaS management platform with IoT smart hardware for 24/7 automated operations, significantly reducing labor costs.',
        'products.smartcourt.f1': 'Smart Lock + Auto Power Control',
        'products.smartcourt.f2': 'Online Booking + Dynamic Pricing',
        'products.smartcourt.f3': 'Membership + Marketing Tools',
        'products.smartcourt.f4': 'Analytics + Revenue Reports',
        'products.smartcourt.img1': 'Dashboard',
        'products.smartcourt.img2': 'Schedule',
        'products.smartcourt.img3': 'Bookings',
        'products.smartcourt.img4': 'Marketing',
        'products.smartcourt.img5': 'Mobile App',
        'products.aics.name': 'AI Customer Service',
        'products.aics.desc': 'An intelligent customer service system based on large language models, providing 24/7 automated customer support to significantly improve customer satisfaction and service efficiency.',
        'products.aics.f1': 'Natural Language Understanding',
        'products.aics.f2': 'Multi-turn Conversations',
        'products.aics.f3': 'Auto Knowledge Base Learning',
        'products.aics.f4': 'Seamless Human Handoff',
        'products.aics.img1': 'Agent Workspace',
        'products.aics.img2': 'Reports & Analytics',
        'products.aics.img3': 'Knowledge Base',
        'products.fortune.name': 'AI Fortune Telling',
        'products.fortune.desc': 'Combining traditional Chinese fortune telling with modern AI technology to provide personalized destiny analysis and life advice for a brand new fortune telling experience.',
        'products.fortune.f1': 'Bazi Chart Analysis',
        'products.fortune.f2': 'AI Personalized Reading',
        'products.fortune.f3': 'Fortune Predictions',
        'products.fortune.f4': 'Interactive Consultation',
        'products.fortune.img1': 'Fortune Report',
        'products.fortune.img2': 'Features',
        'about.title': 'About Timux',
        'about.p1': 'Founded in Taiwan, Timux is a technology company focused on AI-powered solutions. We believe AI technology can transform traditional industries and help businesses achieve digital transformation.',
        'about.p2': 'Our team consists of senior software engineers and AI experts with extensive product development experience. From smart venue management to AI customer service, we are committed to creating practical, reliable, and innovative solutions.',
        'about.stat1': 'Product Lines',
        'about.stat2': 'Smart Service',
        'about.stat3': 'AI Powered',
        'about.tech1': 'AI Tech',
        'about.tech2': 'Cloud',
        'about.tech3': 'IoT',
        'about.tech4': 'Analytics',
        'contact.title': 'Contact Us',
        'contact.subtitle': 'Have questions or partnership inquiries? Get in touch with us',
        'contact.name': 'Name',
        'contact.email': 'Email',
        'contact.company': 'Company (Optional)',
        'contact.product': 'Product of Interest',
        'contact.opt1': 'SmartCourt',
        'contact.opt2': 'AI Customer Service',
        'contact.opt3': 'AI Fortune Telling',
        'contact.opt5': 'Partnership / Product Trial',
        'contact.opt4': 'Other',
        'contact.message': 'Message',
        'contact.submit': 'Send Message',
        'contact.success': 'Message sent successfully! We will get back to you soon.',
        'contact.error': 'Failed to send. Please try again later or contact us directly.',
        'footer.rights': 'All rights reserved.'
    }
};

// Detect user language based on location/browser
function detectLanguage() {
    // Check localStorage first
    const savedLang = localStorage.getItem('timux-lang');
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }

    // Get all browser languages
    const languages = navigator.languages || [navigator.language || navigator.userLanguage];
    
    // Check timezone for better region detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    
    // Taiwan/HK/Macau timezones -> Traditional Chinese
    const twTimezones = ['Asia/Taipei', 'Asia/Hong_Kong', 'Asia/Macau'];
    if (twTimezones.some(tz => timezone.includes(tz.split('/')[1]))) {
        return 'zh-TW';
    }
    
    // China timezones -> Simplified Chinese
    const cnTimezones = ['Asia/Shanghai', 'Asia/Chongqing', 'Asia/Harbin', 'Asia/Urumqi'];
    if (cnTimezones.some(tz => timezone.includes(tz.split('/')[1]))) {
        return 'zh-CN';
    }

    // Check browser language settings
    for (const lang of languages) {
        const lowerLang = lang.toLowerCase();
        
        // Traditional Chinese regions
        if (lowerLang === 'zh-tw' || lowerLang === 'zh-hk' || lowerLang === 'zh-mo' ||
            lowerLang === 'zh-hant' || lowerLang === 'zh-cht') {
            return 'zh-TW';
        }
        
        // Simplified Chinese
        if (lowerLang === 'zh-cn' || lowerLang === 'zh-sg' || 
            lowerLang === 'zh-hans' || lowerLang === 'zh-chs') {
            return 'zh-CN';
        }
        
        // Generic Chinese - default to Traditional (more conservative choice for Taiwan)
        if (lowerLang === 'zh') {
            return 'zh-TW';
        }
    }
    
    // All other regions -> English
    return 'en';
}

// Apply translations
function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
    
    // Update selector
    const selector = document.getElementById('lang-selector');
    if (selector) {
        selector.value = lang;
    }

    // Save preference
    localStorage.setItem('timux-lang', lang);
}

// Initialize
function initI18n() {
    const lang = detectLanguage();
    applyTranslations(lang);

    // Language selector change event
    const selector = document.getElementById('lang-selector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            applyTranslations(e.target.value);
        });
    }
}

// Export for use
window.i18n = {
    init: initI18n,
    apply: applyTranslations,
    detect: detectLanguage,
    translations
};
