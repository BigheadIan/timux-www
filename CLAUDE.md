# 關於使用者

- 黃昱仁（頭頭），時光智造 CEO
- 偏好文字溝通，反感訊息被修改
- 每次收到任務先回覆「收到，開始處理」
- 大改動前先確認，不要默默開始做
- 做事風格：給方向讓你執行，關鍵決策要問他

# 時光智造

- 公司：時光智造科技有限公司 (www.timux.site)
- 口號：「智造交給 AI，時光留給所愛」
- 產品線：AceTime（場館管理）、PlayTime（揪團）、AI 客服、龍蝦管家


# 專案資訊

# timux-www 官網

## 概述
- 時光智造官方網站，單頁 SPA
- Repo: git@github.com:BigheadIan/timux-www.git
- 本地: `/Users/yurenhuang/.openclaw/workspace/timux-www`

## 技術
- 單頁 index.html + Tailwind CDN
- Hosting: GitHub Pages + Cloudflare DNS
- **⚠️ Cloudflare SSL 必須 `full` 模式**（不是 flexible，否則 redirect loop）
- CNAME: www.timux.site

# 記憶管理規則

本檔案是你的持久記憶。請遵守以下規則：

## 自動更新
- 每次對話結束前，如果學到了重要的新資訊（技術坑、部署變更、新決策），請更新本檔案
- 更新時保持簡潔，用條列式，不要寫長段落
- 技術教訓使用信心等級標記：🔴高（踩過3+次）🟡中（1-2次）🟢低（觀察到但未驗證）

## 壓縮規則
- 如果本檔案超過 200 行，主動壓縮：
  - 移除已解決且不太可能再發生的問題
  - 合併重複的教訓
  - 降級 6 個月未驗證的 🟢 條目
- 保留最重要的：部署流程、認證密碼、技術棧、關鍵教訓

## 禁止事項
- 不要刪除認證/密碼資訊
- 不要刪除部署流程
- 不要刪除 🔴 等級的教訓
