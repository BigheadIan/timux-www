import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://www.timux.site';
const publicPages = JSON.parse(fs.readFileSync(path.join(root, 'scripts/seo-pages.json'), 'utf8'));
const excludedPages = JSON.parse(fs.readFileSync(path.join(root, 'scripts/seo-excluded-pages.json'), 'utf8'));

function upsertRobots(html, value) {
  const tag = `<meta name="robots" content="${value}">`;
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
    return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, tag);
  }
  if (/<meta\s+name=["']viewport["'][^>]*>/i.test(html)) {
    return html.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, `$1\n  ${tag}`);
  }
  return html.replace(/<head>/i, `<head>\n  ${tag}`);
}

function titleOf(html, file) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) throw new Error(`Missing title: ${file}`);
  return match[1].replace(/<[^>]+>/g, '').trim();
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

for (const page of publicPages.filter(page => page.description)) {
  const file = path.join(root, page.file);
  let html = fs.readFileSync(file, 'utf8');
  const title = titleOf(html, page.file);
  const url = origin + page.path;
  html = upsertRobots(html, 'index,follow');
  const tags = [
    `<meta name="description" content="${escapeAttribute(page.description)}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${escapeAttribute(title)}">`,
    `<meta property="og:description" content="${escapeAttribute(page.description)}">`,
    `<meta property="og:image" content="${origin}/images/og-image.png">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeAttribute(title)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(page.description)}">`,
    `<meta name="twitter:image" content="${origin}/images/og-image.png">`
  ];
  const missing = tags.filter(tag => {
    const key = tag.match(/(?:name|property|rel)="([^"]+)"/)?.[1];
    if (key === 'canonical') return !/<link\s+rel=["']canonical["']/i.test(html);
    return key && !new RegExp(`<meta\\s+(?:name|property)=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html);
  });
  if (missing.length) html = html.replace('</head>', `  ${missing.join('\n  ')}\n</head>`);
  fs.writeFileSync(file, html);
}

for (const page of excludedPages) {
  const file = path.join(root, page.file);
  let html = fs.readFileSync(file, 'utf8');
  html = upsertRobots(html, 'noindex,follow');
  fs.writeFileSync(file, html);
}

const methodFile = path.join(root, 'method/index.html');
let method = fs.readFileSync(methodFile, 'utf8');
if (!method.includes('class="shell faq-wrap" id="faq"')) {
  method = method.replace('class="shell faq-wrap"', 'class="shell faq-wrap" id="faq"');
}
const methodFaqAnchor = '<a class="button dark" href="/#contact">帶著你的案例，和 Ian 討論 ↗</a>';
const methodFaqAddition = '<details><summary>什麼樣的企業最適合先做 AI 導入？</summary><p>客服量持續成長、企業知識分散、現場依賴 LINE／微信、跨部門交接容易中斷，或已有 ERP／CRM 卻仍需要人工追進度的團隊，通常最容易找到可衡量的第一個流程。</p></details><details><summary>沒有整理好的資料，也可以開始嗎？</summary><p>可以先帶一件去除個人與敏感資訊的真實案例。我們會先確認資料來源、缺口、責任與完成條件，再決定是否適合做試點。</p></details><details><summary>Timux 的主要服務據點在哪裡？</summary><p>主要服務據點為台北、高雄、武漢、上海與馬來西亞；依專案需要安排遠端協作或在地訪談。</p></details>';
if (!method.includes('什麼樣的企業最適合先做 AI 導入？</summary>')) {
  if (!method.includes(methodFaqAnchor)) throw new Error('Method FAQ insertion anchor missing');
  method = method.replace(methodFaqAnchor, methodFaqAddition + methodFaqAnchor);
  fs.writeFileSync(methodFile, method);
}

const demoFile = path.join(root, 'demo/index.html');
let demo = fs.readFileSync(demoFile, 'utf8');
const demoAnchor = '</article></div></section><section class="section roadmap-section">';
const demoCard = '<article class="experience-card"><img src="/assets/partners/timux-sofun-fde.svg" alt="Timux 與 Sofun.AI FDE 合作流程"><div><p class="eyebrow paper-eyebrow">FDE 合作與企業 AI 執行</p><h2>從真實工作，到可驗收執行。</h2><p>看 Timux 與 Sofun.AI 如何把需求探索、資料驗證、受控執行與聯合驗收連成一段完整交付。</p><a class="button dark" href="/cases/sofun-fde/">查看 FDE 合作案例 →</a></div></article>';
if (!demo.includes('/cases/sofun-fde/')) {
  if (!demo.includes(demoAnchor)) throw new Error('Demo card insertion anchor missing');
  demo = demo.replace(demoAnchor, '</article>' + demoCard + '</div></section><section class="section roadmap-section">');
  fs.writeFileSync(demoFile, demo);
}

console.log(`Applied metadata to ${publicPages.filter(page => page.description).length} public pages and noindex to ${excludedPages.length} risk pages.`);
