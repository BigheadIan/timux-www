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
        'products.subtitle': '智造交給 AI，時光留給所愛',
        'products.desc': '每一個產品都圍繞同一個信念 — 用 AI 自動化繁瑣的管理與營運，把省下的時間還給場館主、教練和每一位熱愛運動的你。',
        'products.featured': '主推',
        'products.beta': 'Beta',
        'products.learnmore': '了解更多',
        'products.smartcourt.name': 'SmartCourt 智慧場館',
        'products.smartcourt.tagline': '把場館營運交給 AI，讓老闆有時間享受生活',
        'products.smartcourt.desc': 'AI 驅動的無人場館解決方案。SaaS + IoT 讓場館 24 小時自動營運 — 不用盯場、不用排班、不用手動收款。搭配 PlayTime 揪團平台，為場館持續導入社群流量與穩定營收。',
        'products.smartcourt.f1': '🔐 IoT 智慧門鎖 + 燈光電源自動控制',
        'products.smartcourt.f2': '📅 AI 動態定價 + 線上自助預約',
        'products.smartcourt.f3': '👥 會員管理 + PlayTime 社群裂變導流',
        'products.smartcourt.f4': '📊 智慧營收報表 + 數據驅動決策',
        'products.smartcourt.img1': '數據看板',
        'products.smartcourt.img2': '時段管理',
        'products.smartcourt.img3': '預約管理',
        'products.smartcourt.img4': '行銷工具',
        'products.smartcourt.img5': '用戶端 APP',
        'products.aics.name': 'AI 智能客服',
        'products.aics.tagline': '把客服應答交給 AI，讓團隊專注核心業務',
        'products.aics.desc': '基於 Gemini 2.0 Flash 的多租戶智能客服系統。降低 70% 客服成本，提升 3 倍回覆效率，支援意圖辨識、知識庫問答、人機協作，讓客戶服務智慧化升級。',
        'products.aics.f1': '🧠 AI 意圖辨識 + 多輪對話',
        'products.aics.f2': '📚 智慧訓練系統 + 多格式導入',
        'products.aics.f3': '🔄 無縫轉接真人 + 數據分析',
        'products.aics.f4': '🏢 多行業支援 + LINE/Web 整合',
        'products.aics.demo': '觀看 Demo',
        'products.aics.trial': '取得試用',
        'products.aics.img1': '客服工作台',
        'products.aics.img2': '報表分析',
        'products.aics.img3': '知識庫管理',
        'products.property.name': '智慧物業管理',
        'products.property.tagline': '把住宿管理交給 AI，讓經營者專注服務品質',
        'products.property.desc': 'IoT + AI 驅動的智慧住宿解決方案。TTLock 智慧門鎖、遠端控制、能耗管理，結合 AI 客服自動回覆房客問題，讓民宿、飯店、短租經營全面智慧化升級。',
        'products.property.f1': '🔐 TTLock 智慧門鎖整合',
        'products.property.f2': '⚡ IoT 設備遠端控制',
        'products.property.f3': '🤖 AI 客服自動回覆',
        'products.property.f4': '📈 能耗監控 + 成本分析',
        'products.property.img1': '🏠 智慧控制',
        'products.property.img2': '📊 營運分析',
        'products.property.demo': '觀看 Demo',
        'products.property.trial': '取得試用',

        'products.playtime.name': 'PlayTime 智慧揪團',
        'products.playtime.tagline': '把揪人排程交給 AI，讓球友專心享受比賽',
        'products.playtime.desc': 'AI 驅動的 LINE 運動社群平台。智能匹配等級、自動排賽程、數據追蹤戰績 — 不用再群組裡一個一個問，不用手動記比分。結合 SmartCourt 場館系統，從「訂場 → 揪人 → 比賽 → 覆盤」全自動化，把省下的時間還給真正的運動時光。',
        'products.playtime.f1': '🤖 AI 智能分組 — 按等級均衡配對，告別手動湊人',
        'products.playtime.f2': '📊 數據戰績引擎 — 勝率、積分、排名自動計算',
        'products.playtime.f3': '⚡ LINE 一鍵開團 — 30 秒發起，好友直接報名',
        'products.playtime.f4': '🏟️ SmartCourt 聯動 — 訂場揪團一站搞定',
        'products.playtime.f5': '🎯 智慧賽程編排 — 循環賽 / 淘汰賽自動生成',
        'products.playtime.f6': '📱 社群裂變 — AI 海報生成 + 分享 + 俱樂部',
        'products.playtime.cta': '立即體驗 PlayTime →',
        'products.playtime.img1': '智慧首頁',
        'products.playtime.img2': '活動詳情',
        'products.playtime.img3': '一鍵開團',
        'products.playtime.img4': 'AI 對抗分組',
        'products.playtime.scroll': '← 左右滑動查看更多截圖',
        'ecosystem.title': '🔗 智慧運動生態系',
        'ecosystem.motto': '智造交給 AI，時光留給所愛',
        'ecosystem.desc': '場館營運、揪人排程、客服應答 — 全部交給 AI。場館主省下管理時間，球友省下揪人麻煩，把時光花在真正重要的事：享受運動、陪伴所愛。',
        'ecosystem.smartcourt': 'SmartCourt',
        'ecosystem.smartcourt.role': '場館端 · 營運管理',
        'ecosystem.playtime': 'PlayTime',
        'ecosystem.playtime.role': '用戶端 · 揪團比賽',
        'ecosystem.aics': 'AI 客服',
        'ecosystem.aics.role': '服務端 · 智能應答',
        'ecosystem.link1': '數據互通',
        'ecosystem.link2': 'AI 賦能',
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
        'about.gallery_link': '📸 查看活動相簿',
        'contact.title': '聯繫我們',
        'contact.subtitle': '有任何問題或合作需求？歡迎與我們聯繫',
        'contact.name': '姓名',
        'contact.email': '電子郵件',
        'contact.company': '公司名稱（選填）',
        'contact.product': '感興趣的產品',
        'contact.opt1': 'SmartCourt 智慧場館',
        'contact.opt2': 'AI 智能客服',
        'contact.opt.property': '智慧物業管理',
        'contact.opt.playtime': 'PlayTime 智慧揪團',
        'contact.opt5': '合作洽談 / 產品試用',
        'contact.opt4': '其他',
        'contact.message': '訊息內容',
        'contact.submit': '發送訊息',
        'contact.success': '訊息已發送成功！我們會盡快回覆您。',
        'contact.error': '發送失敗，請稍後再試或直接聯繫我們的郵箱。',
        'contact.emailSection': '或直接寄信給我們',
        'contact.copy': '📋 複製',
        'contact.copied': '✅ 已複製',
        'footer.rights': 'All rights reserved.',
        'gallery.back': '← 返回官網',
        'gallery.title': '活動相簿',
        'gallery.subtitle': '時光智造的活動、演講與合作紀錄',
        'gallery.wuhan_title': '2026 台灣青年自媒體創業加速營',
        'gallery.wuhan_subtitle': '暨武漢深度考察營 — AI 創業分享',
        'gallery.wuhan_1': '青創營會議全景',
        'gallery.wuhan_2': 'AI 創業分享 — OpenClaw 私人 AI 管家',
        'clients.title': '合作夥伴',
        'clients.subtitle': '感謝這些企業的信任與支持',
        'clients.smartcourt': 'AI 技術顧問客戶',
        'clients.aics': 'AI 智能客服客戶',
        'founder.title': '創辦人',
        'founder.name': '黃昱仁',
        'founder.role': '創辦人暨執行長｜時光智造科技',
        'founder.title2': '共同創辦人｜Upfront Investment 美股 AI 分析平台',
        'founder.title3': 'AI 智能客服系統 專家顧問｜台灣',
        'founder.title4': 'AI 創業生態 特聘導師｜武漢',
        'founder.bio': '擁有多年軟體開發與 AI 產品經驗，致力於以科技改善傳統產業效率，讓人們有更多時間專注於真正重要的事。',
        'founder.line': 'Line ID: bigheadian'
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
        'products.subtitle': '智造交给 AI，时光留给所爱',
        'products.desc': '每一个产品都围绕同一个信念 — 用 AI 自动化繁琐的管理与运营，把省下的时间还给场馆主、教练和每一位热爱运动的你。',
        'products.featured': '主推',
        'products.beta': 'Beta',
        'products.learnmore': '了解更多',
        'products.smartcourt.name': 'SmartCourt 智慧场馆',
        'products.smartcourt.tagline': '把场馆运营交给 AI，让老板有时间享受生活',
        'products.smartcourt.desc': 'AI 驱动的无人场馆解决方案。SaaS + IoT 让场馆 24 小时自动运营 — 不用盯场、不用排班、不用手动收款。搭配 PlayTime 揪团平台，为场馆持续导入社群流量与稳定营收。',
        'products.smartcourt.f1': '🔐 IoT 智慧门锁 + 灯光电源自动控制',
        'products.smartcourt.f2': '📅 AI 动态定价 + 在线自助预约',
        'products.smartcourt.f3': '👥 会员管理 + PlayTime 社群裂变导流',
        'products.smartcourt.f4': '📊 智慧营收报表 + 数据驱动决策',
        'products.smartcourt.img1': '数据看板',
        'products.smartcourt.img2': '时段管理',
        'products.smartcourt.img3': '预约管理',
        'products.smartcourt.img4': '营销工具',
        'products.smartcourt.img5': '用户端 APP',
        'products.aics.name': 'AI 智能客服',
        'products.aics.tagline': '把客服应答交给 AI，让团队专注核心业务',
        'products.aics.desc': '基于 Gemini 2.0 Flash 的多租户智能客服系统。降低 70% 客服成本，提升 3 倍回复效率，支持意图识别、知识库问答、人机协作，让客户服务智慧化升级。',
        'products.aics.f1': '🧠 AI 意图识别 + 多轮对话',
        'products.aics.f2': '📚 智慧训练系统 + 多格式导入',
        'products.aics.f3': '🔄 无缝转接真人 + 数据分析',
        'products.aics.f4': '🏢 多行业支持 + LINE/Web 整合',
        'products.aics.demo': '观看 Demo',
        'products.aics.trial': '获取试用',
        'products.aics.img1': '客服工作台',
        'products.aics.img2': '报表分析',
        'products.aics.img3': '知识库管理',
        'products.property.name': '智慧物业管理',
        'products.property.tagline': '把住宿管理交给 AI，让经营者专注服务品质',
        'products.property.desc': 'IoT + AI 驱动的智慧住宿解决方案。TTLock 智慧门锁、远程控制、能耗管理，结合 AI 客服自动回复房客问题，让民宿、酒店、短租经营全面智慧化升级。',
        'products.property.f1': '🔐 TTLock 智慧门锁整合',
        'products.property.f2': '⚡ IoT 设备远程控制',
        'products.property.f3': '🤖 AI 客服自动回复',
        'products.property.f4': '📈 能耗监控 + 成本分析',
        'products.property.img1': '🏠 智慧控制',
        'products.property.img2': '📊 运营分析',
        'products.property.demo': '观看 Demo',
        'products.property.trial': '获取试用',
        'products.playtime.name': 'PlayTime 智慧揪团',
        'products.playtime.tagline': '把揪人排程交给 AI，让球友专心享受比赛',
        'products.playtime.desc': 'AI 驱动的 LINE 运动社群平台。智能匹配等级、自动排赛程、数据追踪战绩 — 不用再群组里一个一个问，不用手动记比分。结合 SmartCourt 场馆系统，从「订场 → 揪人 → 比赛 → 复盘」全自动化，把省下的时间还给真正的运动时光。',
        'products.playtime.f1': '🤖 AI 智能分组 — 按等级均衡配对，告别手动凑人',
        'products.playtime.f2': '📊 数据战绩引擎 — 胜率、积分、排名自动计算',
        'products.playtime.f3': '⚡ LINE 一键开团 — 30 秒发起，好友直接报名',
        'products.playtime.f4': '🏟️ SmartCourt 联动 — 订场揪团一站搞定',
        'products.playtime.f5': '🎯 智慧赛程编排 — 循环赛 / 淘汰赛自动生成',
        'products.playtime.f6': '📱 社群裂变 — AI 海报生成 + 分享 + 俱乐部',
        'products.playtime.cta': '立即体验 PlayTime →',
        'products.playtime.img1': '智慧首页',
        'products.playtime.img2': '活动详情',
        'products.playtime.img3': '一键开团',
        'products.playtime.img4': 'AI 对抗分组',
        'products.playtime.scroll': '← 左右滑动查看更多截图',
        'ecosystem.title': '🔗 智慧运动生态系',
        'ecosystem.motto': '智造交给 AI，时光留给所爱',
        'ecosystem.desc': '场馆运营、揪人排程、客服应答 — 全部交给 AI。场馆主省下管理时间，球友省下揪人麻烦，把时光花在真正重要的事：享受运动、陪伴所爱。',
        'ecosystem.smartcourt': 'SmartCourt',
        'ecosystem.smartcourt.role': '场馆端 · 运营管理',
        'ecosystem.playtime': 'PlayTime',
        'ecosystem.playtime.role': '用户端 · 揪团比赛',
        'ecosystem.aics': 'AI 客服',
        'ecosystem.aics.role': '服务端 · 智能应答',
        'ecosystem.link1': '数据互通',
        'ecosystem.link2': 'AI 赋能',
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
        'about.gallery_link': '📸 查看活动相册',
        'contact.title': '联系我们',
        'contact.subtitle': '有任何问题或合作需求？欢迎与我们联系',
        'contact.name': '姓名',
        'contact.email': '电子邮件',
        'contact.company': '公司名称（选填）',
        'contact.product': '感兴趣的产品',
        'contact.opt1': 'SmartCourt 智慧场馆',
        'contact.opt2': 'AI 智能客服',
        'contact.opt.property': '智慧物业管理',
        'contact.opt.playtime': 'PlayTime 智慧揪团',
        'contact.opt5': '合作洽谈 / 产品试用',
        'contact.opt4': '其他',
        'contact.message': '消息内容',
        'contact.submit': '发送消息',
        'contact.success': '消息已发送成功！我们会尽快回复您。',
        'contact.error': '发送失败，请稍后再试或直接联系我们的邮箱。',
        'contact.emailSection': '或直接寄信给我们',
        'contact.copy': '📋 复制',
        'contact.copied': '✅ 已复制',
        'footer.rights': 'All rights reserved.',
        'gallery.back': '← 返回官网',
        'gallery.title': '活动相册',
        'gallery.subtitle': '时光智造的活动、演讲与合作纪录',
        'gallery.wuhan_title': '2026 台湾青年自媒体创业加速营',
        'gallery.wuhan_subtitle': '暨武汉深度考察营 — AI 创业分享',
        'gallery.wuhan_1': '青创营会议全景',
        'gallery.wuhan_2': 'AI 创业分享 — OpenClaw 私人 AI 管家',
        'clients.title': '合作伙伴',
        'clients.subtitle': '感谢这些企业的信任与支持',
        'clients.smartcourt': 'AI 技术顾问客户',
        'clients.aics': 'AI 智能客服客户',
        'founder.title': '创办人',
        'founder.name': '黄昱仁',
        'founder.role': '创办人暨执行长｜时光智造科技',
        'founder.title2': '共同创办人｜Upfront Investment 美股 AI 分析平台',
        'founder.title3': 'AI 智能客服系统 专家顾问｜台湾',
        'founder.title4': 'AI 创业生态 特聘导师｜武汉',
        'founder.bio': '拥有多年软件开发与 AI 产品经验，致力于以科技改善传统产业效率，让人们有更多时间专注于真正重要的事。',
        'founder.line': 'Line ID: bigheadian'
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
        'products.subtitle': 'Let AI Handle the Work, Save Time for What You Love',
        'products.desc': 'Every product revolves around one belief — use AI to automate tedious management and operations, returning saved time to venue owners, coaches, and everyone who loves sports.',
        'products.featured': 'Featured',
        'products.beta': 'Beta',
        'products.learnmore': 'Learn More',
        'products.smartcourt.name': 'SmartCourt',
        'products.smartcourt.tagline': 'Let AI handle venue operations so owners can enjoy life',
        'products.smartcourt.desc': 'AI-driven unmanned venue solution. SaaS + IoT enables 24/7 automated operations — no supervision needed, no scheduling hassles, no manual payments. Combined with PlayTime community platform to continuously drive community traffic and stable revenue.',
        'products.smartcourt.f1': '🔐 IoT Smart Lock + Automated Lighting & Power Control',
        'products.smartcourt.f2': '📅 AI Dynamic Pricing + Self-Service Online Booking',
        'products.smartcourt.f3': '👥 Membership Management + PlayTime Community Growth',
        'products.smartcourt.f4': '📊 Smart Revenue Reports + Data-Driven Decisions',
        'products.smartcourt.img1': 'Dashboard',
        'products.smartcourt.img2': 'Schedule',
        'products.smartcourt.img3': 'Bookings',
        'products.smartcourt.img4': 'Marketing',
        'products.smartcourt.img5': 'Mobile App',
        'products.aics.name': 'AI Customer Service',
        'products.aics.tagline': 'Let AI handle customer service so teams can focus on core business',
        'products.aics.desc': 'Multi-tenant intelligent customer service system based on Gemini 2.0 Flash. Reduces customer service costs by 70%, improves response efficiency 3x, supports intent recognition, knowledge base Q&A, and human-AI collaboration for smart customer service upgrade.',
        'products.aics.f1': '🧠 AI Intent Recognition + Multi-turn Conversations',
        'products.aics.f2': '📚 Smart Training System + Multi-format Import',
        'products.aics.f3': '🔄 Seamless Human Handoff + Data Analytics',
        'products.aics.f4': '🏢 Multi-industry Support + LINE/Web Integration',
        'products.aics.demo': 'Watch Demo',
        'products.aics.trial': 'Get Trial',
        'products.aics.img1': 'Agent Workspace',
        'products.aics.img2': 'Reports & Analytics',
        'products.aics.img3': 'Knowledge Base',
        'products.property.name': 'Smart Property Management',
        'products.property.tagline': 'Let AI handle accommodation management so operators can focus on service quality',
        'products.property.desc': 'IoT + AI driven smart accommodation solution. TTLock smart door locks, remote control, energy management, combined with AI customer service to auto-reply guest inquiries, enabling full smart upgrade for B&Bs, hotels, and short-term rentals.',
        'products.property.f1': '🔐 TTLock Smart Lock Integration',
        'products.property.f2': '⚡ IoT Device Remote Control',
        'products.property.f3': '🤖 AI Customer Service Auto-Reply',
        'products.property.f4': '📈 Energy Monitoring + Cost Analysis',
        'products.property.img1': '🏠 Smart Control',
        'products.property.img2': '📊 Operations Analytics',
        'products.property.demo': 'Watch Demo',
        'products.property.trial': 'Get Trial',
        'products.playtime.name': 'PlayTime Sports Matchmaking',
        'products.playtime.tagline': 'Let AI handle player organization so players can focus on enjoying the game',
        'products.playtime.desc': 'AI-driven LINE sports community platform. Smart skill-based matching, automated scheduling, data-driven performance tracking — no more asking one by one in group chats, no more manual scorekeeping. Combined with SmartCourt venue system for full automation from "booking → organizing → playing → review", returning saved time to actual sports enjoyment.',
        'products.playtime.f1': '🤖 AI Smart Grouping — Balanced skill-based pairing, goodbye manual player recruitment',
        'products.playtime.f2': '📊 Data Performance Engine — Win rate, points, rankings automatically calculated',
        'products.playtime.f3': '⚡ LINE One-Click Organization — 30-second setup, friends sign up directly',
        'products.playtime.f4': '🏟️ SmartCourt Integration — Court booking and player organizing all in one',
        'products.playtime.f5': '🎯 Smart Tournament Scheduling — Round robin / Elimination brackets auto-generated',
        'products.playtime.f6': '📱 Community Viral Growth — AI poster generation + sharing + clubs',
        'products.playtime.cta': 'Experience PlayTime Now →',
        'products.playtime.img1': 'Smart Homepage',
        'products.playtime.img2': 'Event Details',
        'products.playtime.img3': 'One-Click Organization',
        'products.playtime.img4': 'AI Match Grouping',
        'products.playtime.scroll': '← Swipe left/right for more screenshots',
        'ecosystem.title': '🔗 Smart Sports Ecosystem',
        'ecosystem.motto': 'Let AI Handle the Work, Save Time for What You Love',
        'ecosystem.desc': 'Venue operations, player organizing, customer service — all handled by AI. Venue owners save management time, players save organizing hassles, spending time on what truly matters: enjoying sports and being with loved ones.',
        'ecosystem.smartcourt': 'SmartCourt',
        'ecosystem.smartcourt.role': 'Venue Side · Operations Management',
        'ecosystem.playtime': 'PlayTime',
        'ecosystem.playtime.role': 'User Side · Sports Matchmaking',
        'ecosystem.aics': 'AI Customer Service',
        'ecosystem.aics.role': 'Service Side · Smart Response',
        'ecosystem.link1': 'Data Integration',
        'ecosystem.link2': 'AI Empowerment',
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
        'about.gallery_link': '📸 View Gallery',
        'contact.title': 'Contact Us',
        'contact.subtitle': 'Have questions or partnership inquiries? Get in touch with us',
        'contact.name': 'Name',
        'contact.email': 'Email',
        'contact.company': 'Company (Optional)',
        'contact.product': 'Product of Interest',
        'contact.opt1': 'SmartCourt',
        'contact.opt2': 'AI Customer Service',
        'contact.opt.property': 'Smart Property Management',
        'contact.opt.playtime': 'PlayTime Sports Matchmaking',
        'contact.opt5': 'Partnership / Product Trial',
        'contact.opt4': 'Other',
        'contact.message': 'Message',
        'contact.submit': 'Send Message',
        'contact.success': 'Message sent successfully! We will get back to you soon.',
        'contact.error': 'Failed to send. Please try again later or contact us directly.',
        'contact.emailSection': 'Or email us directly',
        'contact.copy': '📋 Copy',
        'contact.copied': '✅ Copied',
        'footer.rights': 'All rights reserved.',
        'gallery.back': '← Back to Home',
        'gallery.title': 'Gallery',
        'gallery.subtitle': 'Events, talks, and collaboration highlights',
        'gallery.wuhan_title': '2026 Taiwan Youth Entrepreneurship Accelerator',
        'gallery.wuhan_subtitle': 'Wuhan Study Tour — AI Entrepreneurship Talk',
        'gallery.wuhan_1': 'Accelerator session overview',
        'gallery.wuhan_2': 'AI Entrepreneurship Talk — OpenClaw Personal AI Butler',
        'clients.title': 'Our Clients',
        'clients.subtitle': 'Trusted by leading businesses',
        'clients.smartcourt': 'AI Technical Consulting Clients',
        'clients.aics': 'AI Customer Service Clients',
        'founder.title': 'Founder',
        'founder.name': 'Ian Huang',
        'founder.role': 'Founder & CEO, Timux Technology',
        'founder.title2': 'Co-Founder, Upfront Investment — AI-Powered US Stock Analytics',
        'founder.title3': 'Senior AI Consultant — Intelligent Customer Service Systems, Taiwan',
        'founder.title4': 'AI Entrepreneurship Advisor — Wuhan Innovation Ecosystem',
        'founder.bio': 'With years of software development and AI product experience, dedicated to improving traditional industry efficiency through technology, giving people more time to focus on what truly matters.',
        'founder.line': 'Line ID: bigheadian'
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
    
    // Update selectors (desktop + mobile)
    ['lang-selector', 'lang-selector-mobile'].forEach(id => {
        const selector = document.getElementById(id);
        if (selector) selector.value = lang;
    });

    // Save preference
    localStorage.setItem('timux-lang', lang);
}

// Initialize
function initI18n() {
    const lang = detectLanguage();
    applyTranslations(lang);

    // Language selector change events (desktop + mobile, synced)
    ['lang-selector', 'lang-selector-mobile'].forEach(id => {
        const selector = document.getElementById(id);
        if (selector) {
            selector.addEventListener('change', (e) => {
                applyTranslations(e.target.value);
            });
        }
    });
}

// Export for use
window.i18n = {
    init: initI18n,
    apply: applyTranslations,
    detect: detectLanguage,
    translations
};

// 可以在 console 執行 checkI18n() 來檢查
window.checkI18n = function() {
    const keys = {tw: Object.keys(translations['zh-TW']), cn: Object.keys(translations['zh-CN']), en: Object.keys(translations['en'])};
    const allKeys = new Set([...keys.tw, ...keys.cn, ...keys.en]);
    allKeys.forEach(k => {
        if (!translations['zh-TW'][k]) console.warn('Missing zh-TW:', k);
        if (!translations['zh-CN'][k]) console.warn('Missing zh-CN:', k);
        if (!translations['en'][k]) console.warn('Missing en:', k);
    });
    console.log(`Total keys: ${allKeys.size}, zh-TW: ${keys.tw.length}, zh-CN: ${keys.cn.length}, en: ${keys.en.length}`);
};
