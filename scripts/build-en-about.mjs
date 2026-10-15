import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let html = await readFile(resolve(root, 'about/index.html'), 'utf8');

const translations = [
  ['關於時光智造 Timux', 'About Timux Technology'],
  ['關於時光智造 Timux｜企業 AI 導入與應用落地團隊', 'About Timux | Enterprise AI Adoption & Execution'],
  ['認識時光智造 Timux：從真實工作場景出發，連接 AI、企業知識、軟體系統與營運流程，讓 AI 在人的監督下協助團隊完成工作。', 'Meet Timux: we connect AI, enterprise knowledge, software, and operations so teams can complete real work with human oversight.'],
  ['讓 AI 從一次展示走進每天的工作，成為企業長期可靠的工作夥伴。', 'Move AI from a one-time demo into everyday work as a reliable, long-term partner.'],
  ['讓 AI 完成工作，讓人把時間留給更重要的事。', 'Let AI complete the work, so people can focus on what matters most.'],
  ['Timux 相信，科技真正的價值，不是讓企業擁有更多複雜工具，而是幫助人們減少重複工作，把時間重新留給判斷、創造與人和人之間的連結。', 'Timux believes technology creates value not by adding more complex tools, but by reducing repetitive work and giving people more time for judgment, creativity, and human connection.'],
  ['我們從真實工作場景出發，把 AI、企業知識、軟體系統與營運流程連接起來。Timux 不只讓 AI 回答問題，更讓它在清楚的權限與人的監督下，協助團隊取得資訊、推動任務並完成工作。', 'We start with real workflows and connect AI, enterprise knowledge, software, and operations. Timux helps AI do more than answer questions: within clear permissions and human oversight, it helps teams find information, move tasks forward, and complete work.'],
  ['我們在意的，不只是 AI 能做什麼。', 'We care about more than what AI can do.'],
  ['企業每天真正面對的，是分散的資訊、重複的確認、容易中斷的交接，以及需要人承擔的判斷。工具再多，如果不能接進原本的工作，仍然只會停在展示。', 'What organizations face every day is fragmented information, repeated confirmation, interrupted handoffs, and decisions that people must own. More tools still amount to a demo if they cannot connect to real work.'],
  ['Timux 從一段具體工作開始，理解誰在使用、資料從哪裡來、什麼情況需要人工確認，以及完成後要留下哪些紀錄。再把 AI 放進最適合的位置，讓團隊能放心使用，也能持續改善。', 'Timux begins with one concrete workflow: who uses it, where data comes from, when human confirmation is required, and what evidence remains after completion. We then place AI where it helps most, so teams can use it with confidence and keep improving.'],
  ['從面向客戶的服務，到企業內部的知識、現場與跨系統任務，讓每一段工作都有清楚的下一步。', 'From customer-facing service to internal knowledge, field operations, and cross-system tasks, every workflow gets a clear next step.'],
  ['理解問題、核對資料，並在需要時帶著完整上下文交給人工服務。', 'Understand questions, verify information, and hand off to people with the full context when needed.'],
  ['整理文件、系統與團隊經驗，讓正確知識更容易被找到與使用。', 'Organize documents, systems, and team experience so approved knowledge is easier to find and use.'],
  ['將 LINE 回報、出勤與執行結果，轉化為可以持續追蹤的紀錄。', 'Turn LINE reports, attendance, and execution results into records teams can keep tracking.'],
  ['串聯人員、資料與系統，讓跨部門任務不只通知，而是走到完成。', 'Connect people, data, and systems so cross-team tasks move beyond notification to completion.'],
  ['先理解使用者、責任與現有流程，不預設每一個問題都需要新增一套工具。', 'Understand users, ownership, and the current workflow before assuming every problem needs another tool.'],
  ['不只提供答案，也連接交接、審批、系統操作與後續紀錄。', 'Go beyond answers by connecting handoffs, approvals, system actions, and follow-up records.'],
  ['資料有來源、權限有範圍、重要決策回到人，異常發生時有人接手。', 'Keep data sourced, access scoped, critical decisions with people, and exceptions assigned to an owner.'],
  ['Timux 希望 AI 成為企業長期可靠的工作夥伴：', 'Timux wants AI to become a reliable, long-term partner at work:'],
  ['智造交給 AI，時光留給所愛。', 'Let AI handle the work, and save time for what you love.'],
  ['讓 AI 從一次展示，走進每天的工作。', 'Move AI from a one-time demo into everyday work.'],
  ['許多企業已經看見 AI 的可能，卻仍在尋找真正接進現有業務的方法。Timux 專注縮短從「看見可能」到「實際使用」之間的距離。', 'Many organizations see what AI can do but still need a practical way to connect it to existing operations. Timux closes the gap between seeing the possibility and putting it to work.'],
  ['我們從一項具體工作開始，理解人員、資訊與系統如何協作，再把 AI 放進最適合的位置。Timux 關注的不是展示多少技術，而是資訊是否更快取得、交接是否更順暢，以及任務是否真正完成。', 'We begin with one concrete workflow, understand how people, information, and systems work together, then place AI where it helps most. Timux focuses on whether information moves faster, handoffs improve, and work gets completed.'],
  ['先定義值得改善的結果，再用真實案例驗證，最後在清楚的權限與責任下逐步擴大。', 'Define the outcome worth improving, validate it with real cases, then expand in stages under clear permissions and ownership.'],
  ['找出重複發生、資訊分散或容易中斷的一段工作，先定義值得改善的結果。', 'Identify a recurring, fragmented, or easily interrupted workflow and define the outcome worth improving.'],
  ['使用獲准資料與真實案例，確認 AI 能否提供有依據的資訊並配合現有流程。', 'Use approved data and real cases to verify that AI provides grounded information and works with existing processes.'],
  ['建立權限、人工確認與異常接手機制，達到共同標準後再逐步擴大使用。', 'Establish permissions, human confirmation, and exception handoffs, then expand after shared criteria are met.'],
  ['把 AI 放進最常等待、反覆確認或容易遺漏的環節，讓資訊與任務持續向前。', 'Place AI where work waits, repeats, or gets missed, so information and tasks keep moving.'],
  ['回答、核對與人工接手，保留必要情境，減少重複詢問。', 'Answer, verify, and hand off with the context needed to reduce repeated questions.'],
  ['讓核准內容、版本與資料來源在組織中清楚流動。', 'Help approved content, versions, and sources move clearly across the organization.'],
  ['把前線回報整理成可查核、可接手的營運紀錄。', 'Turn frontline reports into verifiable, handoff-ready operational records.'],
  ['連接通知、審批、系統操作與後續結果，形成完整流程。', 'Connect notifications, approvals, system actions, and outcomes into a complete workflow.'],
  ['不只導入工具，也建立能持續運作的方法', 'Build an operating model, not just another tool'],
  ['對準成本、效率、風險與收入成果', 'Align cost, efficiency, risk, and revenue outcomes'],
  ['讓訊號、情境、批准、行動與復盤形成閉環', 'Connect signals, context, approvals, action, and review'],
  ['保留證據、權限、人工決策與結果追溯', 'Preserve evidence, permissions, human authority, and traceability'],
  ['Timux 不只讓 AI 提供答案，更讓答案成為', 'Timux does more than help AI provide answers; it turns answers into the'],
  ['下一步行動。', 'next action.'],
  ['企業 AI 導入與應用落地團隊', 'Enterprise AI adoption and execution team'],
  ['從人的工作開始', 'Start with people and their work'],
  ['讓 AI 協助完成工作', 'Help AI complete the work'],
  ['讓每一步有依據', 'Keep every step grounded'],
  ['三個不變的方向', 'Three principles that stay constant'],
  ['Timux 正在做的事', 'What Timux is building'],
  ['AI 客戶服務', 'AI Customer Service'],
  ['企業知識應用', 'Enterprise Knowledge'],
  ['現場營運管理', 'Field Operations'],
  ['流程自動化', 'Workflow Automation'],
  ['從真實需求，到日常營運', 'From a real need to daily operations'],
  ['從真實需求開始', 'Start with a real need'],
  ['在實際場景驗證', 'Validate in real scenarios'],
  ['逐步進入日常營運', 'Move into daily operations in stages'],
  ['Timux 聚焦的四類工作', 'Four workflows Timux focuses on'],
  ['Timux AI 落地方式', 'How Timux puts AI to work'],
  ['Timux 聚焦領域', 'Timux focus areas'],
  ['Timux 時光智造，', 'Timux Technology,'],
  ['Timux，', 'Timux,'],
  ['讓服務有下一步', 'Give service a clear next step'],
  ['讓知識容易使用', 'Make knowledge easier to use'],
  ['讓現場可以追蹤', 'Make field work traceable'],
  ['讓任務走到完成', 'Take tasks through to completion'],
  ['查看 Timux 實戰案例 →', 'Explore Timux case studies →'],
  ['與 Timux 討論需求 ↗', 'Discuss your needs with Timux ↗'],
  ['了解 Timux 導入方法 →', 'Explore the Timux adoption approach →'],
  ['開始討論 ↗', 'Start a conversation ↗'],
  ['解決方案', 'Solutions'],
  ['實戰案例', 'Case Studies'],
  ['關於我們', 'About Us'],
  ['導入方法', 'AI Adoption'],
  ['討論我的需求 ↗', 'Discuss my needs ↗'],
  ['討論需求 ↗', 'Talk to us ↗'],
  ['語言切換', 'Language switch'],
  ['主要導覽', 'Main navigation'],
  ['跳到主要內容', 'Skip to main content'],
  ['選單', 'Menu'],
  ['繁中', '中文'],
  ['時光智造 Timux', 'Timux Technology'],
  ['Timux 首頁', 'Timux home'],
  ['關於 Timux', 'About Timux']
];

translations.sort((a, b) => b[0].length - a[0].length);
for (const [source, target] of translations) html = html.split(source).join(target);

html = html
  .replace('<html lang="zh-Hant">', '<html lang="en">')
  .replaceAll('https://www.timux.site/about/', 'https://www.timux.site/en/about/')
  .replaceAll('href="/#', 'href="/en/#')
  .replaceAll('href="/method/"', 'href="/en/#roadmap"')
  .replaceAll('href="/about/"', 'href="/en/about/"')
  .replace('<a class="brand" href="/" aria-label="Timux home">', '<a class="brand" href="/en/" aria-label="Timux home">')
  .replace('<div class="intl-lang" role="group" aria-label="Language switch"><a class="is-active" href="/en/about/" lang="zh-Hant" hreflang="zh-Hant" aria-current="page">中文</a><i></i><a href="/en/about/" lang="en" hreflang="en">EN</a></div>', '<div class="intl-lang" role="group" aria-label="Language switch"><a href="/about/" lang="zh-Hant" hreflang="zh-Hant">中文</a><i></i><a class="is-active" href="/en/about/" lang="en" hreflang="en" aria-current="page">EN</a></div>')
  .replace('<div class="intl-mobile-lang" role="group" aria-label="Language switch"><a class="is-active" href="/en/about/" lang="zh-Hant" hreflang="zh-Hant" aria-current="page">中文</a><i></i><a href="/en/about/" lang="en" hreflang="en">ENGLISH</a></div>', '<div class="intl-mobile-lang" role="group" aria-label="Language switch"><a href="/about/" lang="zh-Hant" hreflang="zh-Hant">中文</a><i></i><a class="is-active" href="/en/about/" lang="en" hreflang="en" aria-current="page">ENGLISH</a></div>')
  .replace('<a class="brand" href="/">', '<a class="brand" href="/en/">');

await mkdir(resolve(root, 'en/about'), {recursive: true});
await writeFile(resolve(root, 'en/about/index.html'), html);
console.log('Generated en/about/index.html');
