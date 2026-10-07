import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let html = await readFile(resolve(root, 'index.html'), 'utf8');

const translations = [
  ['時光智造 Timux｜企業 AI 導入顧問與落地團隊', 'Timux Technology | Enterprise AI Adoption & Execution'],
  ['讓 AI 進入客服、企業知識、現場營運與跨系統流程。時光智造從需求盤點、試點驗證到受控上線，協助企業把 AI 變成真正完成工作的能力。', 'Bring AI into customer service, enterprise knowledge, field operations, and cross-system workflows. Timux helps teams discover needs, validate pilots, and adopt AI under clear human oversight.'],
  ['企業AI導入,AI顧問,AI Agent,AI智能體,AI客服,企業知識庫,流程自動化,系統整合,時光智造,Timux', 'enterprise AI adoption,AI consulting,AI agents,AI customer service,enterprise knowledge,workflow automation,system integration,Timux'],
  ['從真實業務痛點、資料與流程出發，把 AI 做成企業真正用得起來、能安全擴大的工作能力。', 'Turn AI into a practical, governable capability—starting with real business problems, data, and workflows.'],
  ['企業 AI 導入顧問與落地團隊，從業務痛點、資料與流程出發，協助企業建立可驗證、可治理、可持續營運的 AI 能力。', 'An enterprise AI adoption and execution team helping organizations build verifiable, governable, and sustainable AI capabilities from real business workflows.'],
  ['從需求聚焦、案例驗證到受控上線，每一階段都有共同確認的交付與門檻。', 'From problem framing and case validation to controlled adoption, every stage has shared deliverables and acceptance gates.'],
  ['不必先決定要用哪個模型。選擇目前最常卡住、最需要等待或最容易遺漏的工作，我們再一起確認資料、角色與適合驗證的範圍。', 'You do not need to choose a model first. Start with work that gets stuck, waits too long, or is easily missed; then we define the data, roles, and validation scope together.'],
  ['先聚焦一段工作，再用真實情境驗證。達到共同確認的標準後，才逐步接入正式流程。', 'Focus on one workflow and validate it with real scenarios. Only after meeting shared criteria do we connect it to production work.'],
  ['不只展示模型能做什麼，更要讓企業看見資料、人工接管、後台與持續訓練如何一起運作。', 'We show more than model capability: data, human handoff, operations, and continuous improvement must work together.'],
  ['同一個客服入口，先理解問題與路線意圖；能由核准知識回答的立即處理，需要即時官方資訊或人工判斷的則安全轉接。', 'From one service entry point, AI identifies the question and route intent. Approved knowledge is answered immediately; requests requiring live official data or human judgment are handed off safely.'],
  ['前線用熟悉的 LINE 完成打卡與回報，把現場資訊整理為可查閱的紀錄，讓主管有依據地確認出勤與處理情況。', 'Frontline teams use familiar LINE flows to check in and report. Field data becomes searchable records so supervisors can verify attendance and follow-up with evidence.'],
  ['體驗讓你看見能力；三個模型讓能力對準經營結果、走完整個流程，並在清楚的責任與邊界內運作。', 'A demo shows capability. These three principles align it with business outcomes, complete the workflow, and keep responsibilities and boundaries clear.'],
  ['先選一段範圍清楚的工作。約 13 週的參考節奏，依資料、系統接入與雙方確認的範圍調整；不是一次取代所有流程。', 'Choose one clearly scoped workflow. This reference cadence spans about 13 weeks and adapts to data, integration conditions, and an agreed scope—it is not a one-step replacement of every process.'],
  ['訪談執行同仁、主管與系統負責人，回看正常及異常案例，確認資料、交接與現況指標。', 'Interview operators, managers, and system owners; review normal and exception cases; confirm data, handoffs, and current metrics.'],
  ['建立試點系統，以獲准資料只讀分析，與原有人工結果對照，找出誤判、漏判及例外。', 'Build a pilot using approved data in read-only analysis, compare it with existing human results, and identify errors, omissions, and exceptions.'],
  ['限定人員與操作範圍，小規模接入實際流程；必要動作保留人工批准，異常有人接手。', 'Limit users and permissions, connect a small-scale production flow, retain human approval for critical actions, and assign exception ownership.'],
  ['與業務、財務及技術負責人依相關指標核對正確性、等待時間、實際效益及異常。', 'Review accuracy, wait time, realized value, and exceptions with business, finance, and technical owners.'],
  ['AI 顧問能協助釐清問題與介紹方法；深入的需求判斷，由 Ian 與你及實際使用者一起完成。', 'The AI advisor can clarify questions and explain our method. Ian works with you and actual users on deeper discovery and decisions.'],
  ['不必先寫完整需求書。告訴 Ian 一段想改善的工作，我們從現有做法、參與角色與困難開始，判斷適合先驗證的範圍。', 'You do not need a complete requirements document. Tell Ian about one workflow you want to improve; we start with the current process, people involved, and the friction to identify a suitable validation scope.'],
  ['深入訪談、試點範圍、費用與雙方投入，會在合作前確認。', 'Discovery depth, pilot scope, fees, and commitments from both sides are confirmed before engagement.'],
  ['我是 Timux 的 AI 導入顧問，不是 Ian 本人。你可以先體驗案例、了解 90 天合作方式，或直接找 Ian。若還不確定從哪裡開始，也可以告訴我一段工作上的困難。', 'I am the Timux AI adoption advisor, not Ian. You can explore a case, review the 90-day approach, or contact Ian directly. If you are unsure where to start, tell me about one difficult workflow.'],
  ['可以直接與 Ian 討論，不必先完成 AI 訪談。你可以在聯絡區整理一段需求，確認後開啟 Email 草稿，再由你寄送。', 'You can speak with Ian directly without completing an AI interview. Draft your request in the contact section, review it, and open an email draft to send yourself.'],
  ['可以先從公開客服案例了解回答、追問與人工接手情境，再選擇實際對話。案例體驗不等於已開通你公司的系統；用自己的資料導入，會另行確認範圍。', 'Start with the public customer-service case to see answering, follow-up questions, and human handoff before trying the live conversation. The case experience does not mean your company system is enabled; adopting your own data requires a separately agreed scope.'],
  ['90 天是約 13 週的參考節奏：第 1–2 週基線與流程確認，第 3–6 週並行驗證，第 7–10 週受控執行，第 11–13 週聯合驗收。每階段有交付與確認門檻；實際時程依資料、接入條件與範圍調整。', 'The 90-day approach is a reference cadence of about 13 weeks: baseline and workflow confirmation in weeks 1–2, parallel validation in weeks 3–6, controlled execution in weeks 7–10, and joint acceptance in weeks 11–13. Each stage has deliverables and gates; timing varies with data, integration conditions, and scope.'],
  ['從客服、企業知識、現場回報到跨系統任務，Timux 協助你盤點流程、驗證成效，並在人的監督下把 AI 接進日常營運。', 'From customer service and enterprise knowledge to field reporting and cross-system tasks, Timux helps you map workflows, validate outcomes, and bring AI into daily operations under human oversight.'],
  ['先選情境，再一起確認資料、角色與適合驗證的範圍。', 'Choose a use case, then define the data, roles, and right validation scope together.'],
  ['不只看模型回答，也看資料、人工接手與後續紀錄如何一起運作。', 'Look beyond model answers to how data, human handoff, and follow-up records work together.'],
  ['讓分散訊號，進入同一段工作。', 'Bring scattered signals into one workflow.'],
  ['從一個真實需求開始，看 AI 如何協助團隊完成下一步。', 'Start with one real need and see how AI helps the team reach the next step.'],
  ['說明現在怎麼做、誰參與，以及最常卡住的一個案例。', 'Explain the current process, who participates, and one case that gets stuck most often.'],
  ['用獲准資料與真實案例，對照 AI 與原本做法的結果。', 'Use approved data and real cases to compare AI results with the current approach.'],
  ['確認權限、人工接手與驗收方式，再逐步擴大使用範圍。', 'Confirm permissions, human handoff, and acceptance criteria before expanding use.'],
  ['詢問量大、資訊分散，或人工接手時需要重新問一次。', 'High inquiry volume, fragmented information, or handoffs that make customers repeat themselves.'],
  ['文件很多、版本難找，新人與跨部門常重複詢問。', 'Too many documents, hard-to-find versions, and repeated questions across new hires and teams.'],
  ['回報散落在群組、表單與紙本，主管難以持續追蹤。', 'Reports are scattered across chats, forms, and paper, making continuous oversight difficult.'],
  ['資訊要在多個系統間重複搬運，交接後容易失去進度。', 'Information is repeatedly moved between systems, and progress is easily lost after handoffs.'],
  ['先確認 AI 要改善哪一項經營結果，再建立基線與優先順序。', 'Define the business outcome AI should improve, then establish a baseline and priorities.'],
  ['讓每個訊號走過完整流程，最後以真實結果進入下一輪改進。', 'Move every signal through the complete workflow, then use real results for the next improvement cycle.'],
  ['重要動作保留清楚證據、責任與邊界，異常發生時知道如何接手。', 'Keep clear evidence, ownership, and boundaries for critical actions, with known handoff paths for exceptions.'],
  ['這不是三個口號，而是每一個試點都會被問到的三組問題。', 'These are not slogans; they are three sets of questions applied to every pilot.'],
  ['現況流程圖、需求優先順序、責任與驗收方式。', 'Current-state workflow, prioritized needs, responsibilities, and acceptance method.'],
  ['問題、範圍與成功標準取得共識。', 'Shared agreement on the problem, scope, and success criteria.'],
  ['可操作試點、結果對照、例外清單與調整規則。', 'Working pilot, result comparison, exception list, and adjustment rules.'],
  ['選定情境的結果達到共同確認的品質門檻。', 'Results for the selected use case meet an agreed quality threshold.'],
  ['試點流程、權限與審批設定、操作及異常紀錄。', 'Pilot workflow, permission and approval settings, and operation and exception records.'],
  ['團隊用得起來，異常處理與恢復方式已驗證。', 'The team can use it, and exception handling and recovery have been validated.'],
  ['驗收報告、操作交接說明、擴大或調整建議。', 'Acceptance report, operating handoff, and recommendations to expand or adjust.'],
  ['達標才擴大；未達標則調整驗證或暫停相關操作。', 'Expand only after meeting the criteria; otherwise revise validation or pause the operation.'],
  ['達標才擴大；資料或規則不穩定，就回到驗證。', 'Scale only after meeting the criteria; return to validation when data or rules are unstable.'],
  ['內容只在此頁整理，不會自動送出。你可以修改後再寄信。', 'Your content is prepared only on this page and is not sent automatically. Review it before emailing.'],
  ['開啟草稿後，請在信箱完成寄送；此頁不代表詢問已送達。', 'After opening the draft, send it from your email client. This page does not confirm delivery.'],
  ['企業 AI 導入與執行', 'Enterprise AI Adoption & Execution'],
  ['從最想改善的一段工作開始', 'Start with the workflow you most want to improve'],
  ['從真實工作現場累積的經驗', 'Experience built in real operations'],
  ['把「如何開始」放進完整導入路徑', 'Turn “how to start” into a complete adoption path'],
  ['先驗證，再逐步進入正式流程。', 'Validate first, then enter production in controlled stages.'],
  ['AI 進入工作現場，', 'Bring AI into real work,'],
  ['真正把事做完。', 'and get work done.'],
  ['先從你最想改善的', 'Start with one workflow'],
  ['一段工作開始。', 'that matters most.'],
  ['三步看懂，', 'Three clear steps'],
  ['AI 如何從需求走到使用。', 'from need to adoption.'],
  ['每個案例，都從', 'Every case starts'],
  ['真實工作現場開始。', 'in real operations.'],
  ['真正的 AI 肌肉，', 'Real AI capability'],
  ['是從驚艷走到可用。', 'moves from impressive to usable.'],
  ['看過能力與理念，', 'See the capability and principles,'],
  ['再看 90 天怎麼落地。', 'then see how 90 days take shape.'],
  ['還不確定從哪裡開始？', 'Not sure where to begin?'],
  ['先聊一段工作。', 'Start with one workflow.'],
  ['帶一個真實問題，', 'Bring one real problem'],
  ['開始有意義的討論。', 'and start a useful conversation.'],
  ['客服與銷售回應', 'Customer Service & Sales'],
  ['企業知識與 SOP', 'Enterprise Knowledge & SOPs'],
  ['現場營運與 LINE 流程', 'Field Operations & LINE Workflows'],
  ['現場營運與 LINE', 'Field Operations & LINE'],
  ['跨系統任務與自動化', 'Cross-system Tasks & Automation'],
  ['理解意圖、核對知識、保留交接上下文', 'Understand intent, verify knowledge, and preserve handoff context'],
  ['從核准內容找答案，保留引用與版本邊界', 'Answer from approved content with source and version boundaries'],
  ['讓回報、紀錄與人工覆核進入同一流程', 'Connect reporting, records, and human review in one workflow'],
  ['串起資料與任務，高風險動作保留審批', 'Connect data and tasks while retaining approval for high-risk actions'],
  ['東南客運：AI 不只回答，也知道什麼時候該交給人。', 'Southeast Bus: AI answers—and knows when to hand off.'],
  ['銘將保全：把行動作業，接回可追蹤的紀錄。', 'MJ Security: Connect mobile work to traceable records.'],
  ['東南客運 AI 客服', 'Southeast Bus AI Customer Service'],
  ['銘將保全 LINE 營運', 'MJ Security LINE Operations'],
  ['案例體驗中心', 'Case Experience Center'],
  ['分辨可回答內容與需要即時資料、人工判斷的情境', 'Separate answerable requests from cases requiring live data or human judgment'],
  ['把行動打卡、回報與主管覆核接回可查紀錄', 'Connect mobile check-ins, reports, and supervisor review to searchable records'],
  ['依場景查看可操作展示與公開產品畫面', 'Explore interactive demos and public product views by scenario'],
  ['對準經營結果、走完整流程，並保留治理邊界', 'Align outcomes, complete the workflow, and retain governance boundaries'],
  ['選一段工作、看演示並驗證，再進入受控使用', 'Choose a workflow, validate a demo, then move into controlled use'],
  ['基線確認、並行驗證、受控執行與聯合驗收', 'Baseline, parallel validation, controlled execution, and joint acceptance'],
  ['整理問題、了解方法，或直接準備與 Ian 討論', 'Frame the problem, learn the method, or prepare to speak with Ian'],
  ['企業 AI 導入', 'Enterprise AI Adoption'],
  ['AI 智能客服', 'AI Customer Service'],
  ['企業知識庫', 'Enterprise Knowledge'],
  ['流程自動化', 'Workflow Automation'],
  ['系統整合', 'System Integration'],
  ['跳到主要內容', 'Skip to main content'],
  ['主要導覽', 'Main navigation'],
  ['Timux 首頁', 'Timux home'],
  ['解決方案總覽', 'Solutions overview'],
  ['查看四類工作全貌 →', 'Explore all four workflow categories →'],
  ['AI 知道何時回答，也知道何時交給人。', 'AI knows when to answer—and when to hand off.'],
  ['跟著案例看一次 →', 'Walk through the case →'],
  ['查看完整導入方式 →', 'Explore the full adoption approach →'],
  ['討論需求 ↗', 'Talk to us ↗'],
  ['討論我的需求 ↗', 'Discuss my needs ↗'],
  ['選擇想改善的流程 ↓', 'Choose a workflow to improve ↓'],
  ['查看真實案例 →', 'View real cases →'],
  ['從真實工作找到問題', 'Find the problem in real work'],
  ['用資料與案例驗證', 'Validate with data and cases'],
  ['在清楚邊界內使用', 'Adopt within clear boundaries'],
  ['AI 如何接進一段工作', 'How AI joins a workflow'],
  ['「客戶詢問服務，同時需要即時資料。」', '“A customer asks about a service that also requires live data.”'],
  ['理解、核對、判斷三個步驟', 'Three steps: understand, verify, decide'],
  ['需即時資料或決策', 'Live data or decision required'],
  ['帶著上下文交給人', 'Hand off with context'],
  ['公開合作與實作經驗', 'Selected Partnerships & Delivery Experience'],
  ['真實工作現場，持續累積的交付經驗', 'Delivery experience built continuously in real operations'],
  ['合作與實作案例', 'Partnerships and delivery cases'],
  ['自動旋轉 · 懸停卡片暫停', 'Auto-rotates · Hover a card to pause'],
  ['理解意圖與補問條件', 'Understand intent and follow-up conditions'],
  ['依核准知識回答', 'Answer from approved knowledge'],
  ['保留上下文交給人', 'Preserve context for human handoff'],
  ['從核准內容找答案', 'Find answers in approved content'],
  ['保留引用與資料邊界', 'Preserve citations and data boundaries'],
  ['把缺口回饋給管理者', 'Report knowledge gaps to owners'],
  ['在熟悉入口完成回報', 'Report through familiar channels'],
  ['把資料整理成可查紀錄', 'Turn data into searchable records'],
  ['例外情況提醒人工覆核', 'Flag exceptions for human review'],
  ['串起表單、資料與任務', 'Connect forms, data, and tasks'],
  ['高風險動作保留審批', 'Retain approval for high-risk actions'],
  ['留下狀態與處理紀錄', 'Preserve status and action records'],
  ['得到：清楚的試點範圍', 'Outcome: a clear pilot scope'],
  ['得到：可操作試點與例外清單', 'Outcome: a working pilot and exception list'],
  ['得到：可追蹤、可接手的工作流程', 'Outcome: a traceable, handoff-ready workflow'],
  ['先看 AI 客服實戰 ↗', 'See the AI customer-service case ↗'],
  ['查看完整 90 天導入方式 →', 'Explore the complete 90-day approach →'],
  ['辨識班次、站點、遺失物與客訴情境', 'Identify schedules, stops, lost property, and complaint scenarios'],
  ['靜態知識直接回答，動態資訊不猜測', 'Answer from static knowledge; never guess dynamic information'],
  ['保留對話與必要資訊，減少重複詢問', 'Keep the conversation and essential context to reduce repetition'],
  ['打卡、GPS、班別與工作日誌進入同一流程', 'Bring check-ins, GPS, shifts, and work logs into one workflow'],
  ['以紀錄與位置資訊，協助人工確認', 'Use records and location data to support human verification'],
  ['保留需要進一步處理的上下文', 'Preserve context for further action'],
  ['GPS 與哨所位置校對', 'Verify GPS and post location'],
  ['出勤與回報紀錄查閱', 'Review attendance and report records'],
  ['人工覆核後留下處置紀錄', 'Preserve action records after human review'],
  ['CORE：C 降低成本、O 提升營運效率、R 管理風險、E 提升收入與利潤', 'CORE: C reduce cost, O improve operations, R manage risk, E grow earnings'],
  ['SCALE 執行閉環：S 感知訊號、C 補足情境、A 權限審批、L 啟動行動、E 復盤進化', 'SCALE execution loop: S sense, C add context, A approve, L launch action, E evolve'],
  ['TRUST：T 證據透明、R 行動可恢復、U 人保有決策權、S 權限有範圍、T 結果可追溯', 'TRUST: T transparent evidence, R recoverable actions, U human authority, S scoped access, T traceable results'],
  ['CORE · 做對的事', 'CORE · Do the right work'],
  ['SCALE · 把事情做完', 'SCALE · Complete the work'],
  ['TRUST · 放心地使用', 'TRUST · Use AI with confidence'],
  ['看三模型如何進入需求分析 ↗', 'See how the three principles guide discovery ↗'],
  ['了解你的參與與每階段驗收 →', 'See your role and acceptance at each stage →'],
  ['也可以直接找 Ian，不必先與 AI 對話 →', 'You can also contact Ian directly—no AI conversation required →'],
  ['右下角提供時光智造文字客服與電話式語音對話。', 'The lower-right widget provides Timux text support and turn-based voice conversation.'],
  ['了解方法、整理問題、找到合適的下一步', 'Understand the method, frame the problem, and find the right next step'],
  ['從你現在最想了解的事開始：', 'Start with what you most want to understand:'],
  ['例如：我們每天有 200 筆客服訊息，怎麼開始？', 'For example: We receive 200 service messages a day. How should we start?'],
  ['案例體驗', 'Case experience'],
  ['90 天導入方法', '90-day approach'],
  ['找 Ian 討論', 'Talk with Ian'],
  ['直接寄信給 Ian →', 'Email Ian directly →'],
  ['想改善哪段工作？', 'Which workflow would you like to improve?'],
  ['例如：跨部門交接、客服或文件查找', 'For example: cross-team handoffs, customer service, or document search'],
  ['最近遇到什麼情況？', 'What has been happening recently?'],
  ['簡單描述一個案例即可，請勿填入個人或敏感資料。', 'Briefly describe one case. Do not enter personal or sensitive information.'],
  ['整理我的討論摘要 ↓', 'Prepare my discussion summary ↓'],
  ['確認或修改你的摘要', 'Review or edit your summary'],
  ['開啟 Email 草稿 ↗', 'Open email draft ↗'],
  ['複製摘要', 'Copy summary'],
  ['我想先體驗 AI 客服', 'I want to explore the AI customer-service case'],
  ['90 天會如何進行？', 'How does the 90-day approach work?'],
  ['想直接找 Ian 討論', 'I want to speak with Ian directly'],
  ['整理需求，找 Ian 討論 →', 'Prepare my request and talk with Ian →'],
  ['開始客服案例體驗 →', 'Start the customer-service case →'],
  ['查看方法、交付與你的參與 →', 'Review the approach, deliverables, and your role →'],
  ['目前沒有取得回覆，請稍後再試。', 'No response was received. Please try again shortly.'],
  ['這次回覆超時了。你可以再試一次，或透過下方「找 Ian 討論」入口聯絡真人。', 'This response timed out. Try again or use “Talk with Ian” below to contact a person.'],
  ['官網 Agent 暫時無法連線；你仍可瀏覽案例，或透過下方「找 Ian 討論」入口聯絡真人。', 'The website agent is temporarily unavailable. You can still explore the cases or use “Talk with Ian” below.'],
  ['幫我找第一個 AI 場景', 'Help me identify the first AI use case'],
  ['智造交給 AI，時光留給所愛。', 'Let AI handle the work, and save time for what you love.'],
  ['服務重點', 'Service focus'], ['AI 導入三步驟', 'Three steps to AI adoption'], ['可導入的四類工作', 'Four workflow categories'],
  ['AI 工作流程示意', 'AI workflow illustration'], ['人在迴路', 'Human in the loop'], ['收到訊號', 'Signal received'],
  ['理解意圖', 'Understand intent'], ['補齊情境', 'Add context'], ['核對資料', 'Verify data'], ['不憑空猜', 'Never guess'],
  ['判斷下一步', 'Decide next step'], ['依規則分流', 'Route by rules'], ['可核准內容', 'Approved content'], ['AI 立即回應', 'AI responds now'],
  ['回答只是起點', 'An answer is only the start'], ['下一步可追蹤', 'The next step stays traceable'], ['向下探索 AI 如何工作', 'Scroll to explore how AI works'],
  ['訊號進來，工作有下一步。', 'Every signal gets a next step.'], ['客服', 'Service'], ['知識', 'Knowledge'], ['現場', 'Operations'], ['系統', 'Systems'],
  ['帶這個需求開始 →', 'Start with this need →'],
  ['客服與銷售', 'Service & Sales'], ['企業知識', 'Enterprise Knowledge'], ['現場營運', 'Field Operations'], ['系統自動化', 'System Automation'],
  ['解決方案', 'Solutions'], ['實戰案例', 'Case Studies'], ['導入方法', 'AI Adoption'], ['三步開始', 'Three-step Start'], ['先問 AI 顧問', 'Ask the AI Advisor'],
  ['90 天導入路徑', '90-day Adoption Path'], ['基線與流程', 'Baseline & Workflow'], ['並行驗證', 'Parallel Validation'], ['受控執行', 'Controlled Execution'], ['聯合驗收', 'Joint Acceptance'],
  ['選單', 'Menu'], ['問 AI 顧問', 'Ask the AI Advisor'], ['選一段工作', 'Choose a Workflow'], ['看演示並驗證', 'Demo & Validate'], ['受控上線', 'Adopt with Control'],
  ['理解旅客意圖', 'Understand passenger intent'], ['核對知識與即時性', 'Verify knowledge and timeliness'], ['人工接手有上下文', 'Human handoff with context'],
  ['案例動畫步驟', 'Case animation steps'], ['AI 客服對話重演', 'AI customer-service conversation replay'], ['AI 判斷與接手狀態', 'AI decision and handoff status'],
  ['情境準備中', 'Preparing scenario'], ['旅客 · 剛剛', 'Passenger · Just now'], ['請問 299 路今天 18:30 從捷運輔大站發車嗎？', 'Does route 299 depart MRT Fu Jen University Station at 18:30 today?'],
  ['Timux AI 正在核對', 'Timux AI is checking'], ['Timux AI · 已回覆', 'Timux AI · Replied'], ['我可以先幫你確認固定時刻表。今天是否臨時調整，需要以官方即時資訊為準。', 'I can confirm the scheduled timetable first. Any temporary change today must be verified through official live information.'],
  ['已建立人工接手', 'Human handoff created'], ['路線、站點與時間已整理，客服可直接確認即時班次，不必重新詢問。', 'The route, stop, and time are organized so an agent can verify the live service without asking again.'],
  ['班次確認', 'Schedule confirmation'], ['捷運輔大站', 'MRT Fu Jen University'], ['299 路', 'Route 299'], ['知識核對', 'Knowledge check'], ['路線與站點資料', 'Route and stop data'], ['固定時刻表', 'Scheduled timetable'], ['今日即時異動', 'Live changes today'],
  ['即時資訊不猜測', 'Never guess live information'], ['保留對話、已辨識條件與知識核對結果，再交給客服確認。', 'Preserve the conversation, detected conditions, and knowledge checks before handing off to an agent.'],
  ['滾動頁面 · 自動推進', 'Scroll to advance automatically'], ['01 理解意圖', '01 UNDERSTAND'],
  ['回覆與接手情境', 'Response & handoff scenarios'], ['案例畫面', 'Case screens'], ['意圖辨識', 'Intent recognition'], ['路線動態', 'Route updates'],
  ['知識邊界', 'Knowledge boundary'], ['需官方即時資料', 'Official live data required'], ['下一動作', 'Next action'], ['建議人工接手', 'Human handoff recommended'],
  ['LINE 行動作業', 'LINE mobile operations'], ['前線資料即時結構化', 'Structure frontline data in real time'], ['出勤紀錄集中查閱', 'Centralize attendance records'], ['主管依據紀錄確認', 'Supervisor verification from records'], ['資料與覆核流程', 'Data & review workflow'],
  ['經營結果', 'Business outcomes'], ['降低成本', 'Reduce cost'], ['營運效率', 'Operational efficiency'], ['管理風險', 'Manage risk'], ['收入利潤', 'Revenue & profit'],
  ['執行閉環', 'Execution loop'], ['感知訊號', 'Sense signals'], ['補足情境', 'Add context'], ['權限審批', 'Approve access'], ['啟動行動', 'Launch action'], ['復盤進化', 'Learn & evolve'],
  ['治理原則', 'Governance'], ['證據透明', 'Transparent evidence'], ['可恢復', 'Recoverable'], ['人保決策', 'Human authority'], ['權限範圍', 'Scoped access'], ['結果追溯', 'Traceable results'],
  ['決定改善什麼', 'Define what to improve'], ['讓工作走到完成', 'Move work to completion'], ['確保過程可控', 'Keep execution controlled'],
  ['第 1–2 週', 'Weeks 1–2'], ['第 3–6 週', 'Weeks 3–6'], ['第 7–10 週', 'Weeks 7–10'], ['第 11–13 週', 'Weeks 11–13'],
  ['基線與流程確認', 'Baseline & Workflow Confirmation'], ['從真實工作找到對的問題。', 'Find the right problem in real work.'], ['你會得到', 'You receive'], ['階段確認', 'Stage gate'],
  ['先對照，再決定是否交付。', 'Compare first, then decide whether to proceed.'], ['在清楚的邊界內進入工作。', 'Enter real work within clear boundaries.'], ['用結果，決定下一步。', 'Let results determine the next step.'],
  ['Timux AI 導入顧問', 'Timux AI Adoption Advisor'], ['AI 顧問', 'AI Advisor'], ['輸入問題', 'Enter a question'], ['傳送問題', 'Send question'],
  ['繁中', '中文'], ['語言切換', 'Language switch'],
  ['東南客運', 'Southeast Bus'], ['金龍旅遊', 'Dragon Tours'], ['台灣便利帶', 'Taiwan Bianli Bag'], ['熱楚聯盟匹克球', 'Rechuu Pickleball Alliance'], ['銘將保全', 'MJ Security'], ['羲光劇遊', 'Xiguang Play'],
  ['東南客運 AI 客服案例畫面', 'Southeast Bus AI customer-service case screen'], ['東南客運 AI 客服意圖判斷與班次回答畫面', 'Southeast Bus AI intent and schedule response screen'], ['東南客運即時資訊邊界與人工交接畫面', 'Southeast Bus live-data boundary and human-handoff screen'],
  ['銘將保全 LINE 機器人與功能入口', 'MJ Security LINE bot and feature menu'], ['銘將保全 LIFF 行動打卡畫面', 'MJ Security LIFF mobile check-in screen'], ['銘將保全 LIFF 出勤紀錄畫面', 'MJ Security LIFF attendance record screen'],
  ['時光智造 Timux', 'Timux Technology']
];

translations.sort((a, b) => b[0].length - a[0].length);
for (const [source, target] of translations) html = html.split(source).join(target);

html = html
  .replace('<html lang="zh-Hant">', '<html lang="en">')
  .replace('homepage-v28-scroll-replay-20261007', 'homepage-en-v3-scroll-replay-20261007')
  .replace('<link rel="canonical" href="https://www.timux.site/">', '<link rel="canonical" href="https://www.timux.site/en/">')
  .replace('<meta property="og:locale" content="zh_TW">', '<meta property="og:locale" content="en_US">')
  .replace('<meta property="og:url" content="https://www.timux.site/">', '<meta property="og:url" content="https://www.timux.site/en/">')
  .replaceAll('https://www.timux.site/#', 'https://www.timux.site/en/#')
  .replaceAll('"url": "https://www.timux.site/"', '"url": "https://www.timux.site/en/"')
  .replace('"inLanguage": "zh-Hant"', '"inLanguage": "en"')
  .replaceAll('href="/#', 'href="/en/#')
  .replaceAll('href="/" aria-label="Timux home"', 'href="/en/" aria-label="Timux home"')
  .replaceAll('<a class="brand" href="/">', '<a class="brand" href="/en/">')
  .replace('<div class="intl-lang" role="group" aria-label="Language switch"><a class="is-active" href="/" lang="zh-Hant" hreflang="zh-Hant" aria-current="page" data-language-link>中文</a><i></i><a href="/en/" lang="en" hreflang="en" data-language-link>EN</a></div>', '<div class="intl-lang" role="group" aria-label="Language switch"><a href="/" lang="zh-Hant" hreflang="zh-Hant" data-language-link>中文</a><i></i><a class="is-active" href="/en/" lang="en" hreflang="en" aria-current="page" data-language-link>EN</a></div>')
  .replace('<div class="intl-mobile-lang" role="group" aria-label="Language switch"><a class="is-active" href="/" lang="zh-Hant" hreflang="zh-Hant" aria-current="page" data-language-link>中文</a><i></i><a href="/en/" lang="en" hreflang="en" data-language-link>ENGLISH</a></div>', '<div class="intl-mobile-lang" role="group" aria-label="Language switch"><a href="/" lang="zh-Hant" hreflang="zh-Hant" data-language-link>中文</a><i></i><a class="is-active" href="/en/" lang="en" hreflang="en" aria-current="page" data-language-link>ENGLISH</a></div>')
  .replace('<span class="intl-nav-zh">Solutions</span><small class="intl-nav-en">Solutions</small>', '<span class="intl-nav-zh">Solutions</span><small class="intl-nav-en">解決方案</small>')
  .replace('<span class="intl-nav-zh">Case Studies</span><small class="intl-nav-en">Case Studies</small>', '<span class="intl-nav-zh">Case Studies</span><small class="intl-nav-en">實戰案例</small>')
  .replace('<span class="intl-nav-zh">AI Adoption</span><small class="intl-nav-en">AI Adoption</small>', '<span class="intl-nav-zh">AI Adoption</span><small class="intl-nav-en">導入方法</small>')
  .replace('<span class="intl-nav-zh">Talk to us ↗</span><small class="intl-nav-en">Talk to us</small>', '<span class="intl-nav-zh">Talk to us ↗</span><small class="intl-nav-en">討論需求</small>')
  .replace('<span class="intl-mobile-summary">Solutions<small>Solutions</small></span>', '<span class="intl-mobile-summary">Solutions<small>解決方案</small></span>')
  .replace('<span class="intl-mobile-summary">Case Studies<small>Case Studies</small></span>', '<span class="intl-mobile-summary">Case Studies<small>實戰案例</small></span>')
  .replace('<span class="intl-mobile-summary">AI Adoption<small>AI Adoption</small></span>', '<span class="intl-mobile-summary">AI Adoption<small>導入方法</small></span>')
  .replace('<p class="intl-section-en">Start with one workflow that matters.</p>', '<p class="intl-section-en">從一段重要的工作開始。</p>');

html = html
  .replaceAll('https://www.timux.site/en/#organization', 'https://www.timux.site/#organization')
  .replace('"url": "https://www.timux.site/en/",\n        "logo"', '"url": "https://www.timux.site/",\n        "logo"')
  .replaceAll('href="/demo/customer-service/"', 'href="/en/#case-southeast"')
  .replaceAll('href="/demo/"', 'href="/en/#cases"')
  .replaceAll('href="/method/#discovery"', 'href="/en/#method"')
  .replaceAll('href="/method/#roadmap"', 'href="/en/#roadmap"')
  .replaceAll('href="/method/"', 'href="/en/#roadmap"')
  .replaceAll('href: "/demo/customer-service/"', 'href: "/en/#case-southeast"')
  .replaceAll('href: "/method/"', 'href: "/en/#roadmap"')
  .replace('/真人|找.{0,8}(Ian|顧問)|聯絡|联系|聯繫|預約/i', '/person|human|Ian|advisor|contact|book|真人|聯絡/i')
  .replace('/體驗|試用|试用|demo/i', '/experience|try|demo|體驗|試用/i')
  .replace('/90|九十|四階段|AI Adoption|合作流程|CORE|SCALE|TRUST/i', '/90|weeks?|stages?|adoption|approach|CORE|SCALE|TRUST/i');

await mkdir(resolve(root, 'en'), { recursive: true });
await writeFile(resolve(root, 'en/index.html'), html);
console.log('Generated en/index.html');
