# FRC 9427 程式教學網站

給 FRC 9427 新成員的 Java 機器人程式課程。目標不是「每一章都讀過」，而是能自己寫出、部署並除錯一個機構的子系統，並用證據找出問題。

- 網站：https://vincent0926.github.io/FRC9427teaching-website/
- 原始檔（給其他 AI 或工具直接讀取）：https://raw.githubusercontent.com/vincent0926/FRC9427teaching-website/main/index.html
- 機器可讀的課程清單：https://vincent0926.github.io/FRC9427teaching-website/course.json
- 搭配的工具站：[電梯／手臂調參工作站](https://vincent0926.github.io/FRC-elevator-PID-Teaching-website/)（前饋、PID、SysId 的實作與模擬）

## 目前版本：v2.0.2

## 學習路徑

| 路徑 | 章節（建議順序） | 目標 |
|---|---|---|
| 核心（必修） | 00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 | 能寫出、部署並除錯一個機構的子系統 |
| 進階控制（選修） | 13 → 14 → 15 | 能量出、調好並驗證一個有重力的機構；搭配工具站實作 |
| 競賽實務（選修） | 16 → 17 → 18 → 19 | 能寫自動程式、用日誌找問題、處理比賽狀況 |
| 檢核 | 最終程式能力評量（`#final`） | 用一題沒看過的除錯題，檢查推理、證據與上機前的安全檢查 |

每章開頭的學習卡列出先備章節、學完要能做到的事、知道就好的範圍、依據的版本與查證日期。精通標準：學習目標都做得到、小測驗答對 80% 以上、練習先自己寫過再看提示。

每章都有：生活比喻與「比喻哪裡不準」、程式範例（控制參數標上來源：MODEL／MEASURED／SYSID／TUNED／CONSTRAINT／SIM）、常見錯誤、以情境題為主的小測驗、三層漸進提示的練習、資料來源。部分章節有站內實驗（標明模擬了什麼、沒模擬什麼）與「到工具站實作」的深層連結。

## 專案結構

整個網站最後是一個檔案 `index.html`，但原始內容分在 `src/`：

```
src/
├─ shell.html      外框（head、首頁封面、版面）
├─ chapters/       每章一個 HTML 片段（chNN.html）、首頁、最終評量
├─ quiz/           每章題庫（chNN.json）
├─ labs/           每個互動實驗一個檔案，用 registerLab 註冊
├─ components/     共用元件：小測驗、提示、學習卡、參數來源、學習紀錄、評量……
├─ data/           course.json：章節、路徑、學習目標、版本、實驗與工具站任務
├─ styles/         樣式
└─ scripts/        頁面邏輯與路由
tools/
├─ build.mjs       把 src/ 組回 index.html，並產生公開的 course.json
└─ check.mjs       內容檢查（標籤、引用、題庫、路徑、版本、工具站連結）
docs/
├─ INTEGRATION.md  和工具站的串接方式
└─ ROADMAP.md      還沒做的項目與原因
```

## 修改網站

需要 Node.js 20 以上，不需要安裝任何套件。

```
node tools/build.mjs      # 改完 src/ 之後重新產生 index.html 與 course.json
node tools/check.mjs      # 內容檢查
```

改完把 `src/`、`index.html`、`course.json` 一起 commit，合併到 `main` 後 GitHub Pages 會自動發布。CI 會確認 `index.html` 和 `src/` 同步、檢查通過。

版本只以 `package.json` 為準；改版時同時更新本檔的「目前版本」與下方更新紀錄（`tools/check.mjs` 會比對），合併後打上相同的 Git tag。

## 更新紀錄

- **v2.0.2**：全部內容改成比較口語的學長姐口吻（章節、首頁、最終評量、題庫解說）；技術內容與引用不變，補上幾個原本沒被引用的來源。
- **v2.0.1**：核心路徑恢復 00 → 12 的順序（第 6 章 IO 架構放回第 5 章之後；第 7–11 章都以讀過第 6 章為前提），並調整先備章節。
- **v2.0.0**
  - 模組化：`index.html` 拆成 `src/`，由建置腳本組回單檔。
  - 三條學習路徑、每章學習卡（先備章節、學習目標、知道就好的範圍、版本與查證日期）、首頁「下一步」推薦。
  - 小測驗以情境題為主（約八成），練習改成三層漸進提示。
  - 最終程式能力評量，可匯出作答與學習紀錄給教練（`#coach` 彙整）。
  - 控制參數標示來源；第 15 章 SysId 加上資料、回歸、擬合品質、壞資料與互動實驗。
  - 站內實驗標明模擬限制；和電梯／手臂調參工作站串接（深層連結、公開 course.json）。
- **v1**：20 章內容完成，發布到 GitHub Pages。

## 未來規劃

未來會和另外一個網站連動（已完成和調參工作站的串接，見 `docs/INTEGRATION.md`）。還沒做的項目見 `docs/ROADMAP.md`。
