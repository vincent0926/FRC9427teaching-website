# 課程網站與工具站的串接

- 課程網站：https://vincent0926.github.io/FRC9427teaching-website/（本 repo）
- 工具站：電梯／手臂調參工作站 https://vincent0926.github.io/FRC-elevator-PID-Teaching-website/（`vincent0926/FRC-elevator-PID-Teaching-website`，需要 v0.13 以上）

分工：課程網站負責觀念、程式架構與比賽實務；前饋與 PID 的計算、模擬、日誌診斷與 SysId 實作交給工具站。課程第 13～15、18 章不重複工具站已經做得很深的內容，而是在章節裡用「到工具站實作」直接連過去。

## 課程 → 工具站

每章的工具站任務寫在 `src/data/course.json` 的 `tools`：

```json
{ "track": "elevator", "page": "sim", "scenario": "noKg",
  "title": "3F 情境：沒有 kG", "do": "要做什麼", "check": "做完要能回答的問題" }
```

產生的網址：

```
{工具站}/?track=elevator&scenario=noKg&from=course&ch=13#sim
```

| 參數 | 作用 |
|---|---|
| `track` | `elevator` 或 `arm`，直接進該機構 |
| `scenario` | 3F 情境 id，進 3F 時直接載入 |
| `section` | 捲到該區塊並打開，例如 4F 的 `unit2`、`measure-ks`（電梯與手臂都有） |
| `from=course&ch=N` | 工具站顯示「回到課程第 N 章」 |
| `#calc` `#tune` `#sim` `#learn` | 樓層（電梯與手臂都有） |

工具站有哪些情境、單元，列在 `course.json` 的 `tool.scenarios`、`tool.sections`。`node tools/check.mjs` 會確認每個任務都指到存在的情境與單元。**工具站改了情境 id 或單元 id，這份清單要一起改。**

## 工具站 → 課程

工具站從課程連進來時，會在畫面上方與側欄顯示「回到課程第 N 章」，網址固定是 `{課程}/#chN`，不接受任意網址。

## 深層連結到課程

| 網址 | 打開 |
|---|---|
| `#chN` | 第 N 章 |
| `#chN/實驗 id` | 第 N 章並捲到該實驗，例如 `#ch13/pid` |
| `#chN/tool-tasks` | 第 N 章的「到工具站實作」 |
| `#final` | 最終程式能力評量 |

## 機器可讀的課程清單

建置時會在網站根目錄產生 `course.json`：

```
https://vincent0926.github.io/FRC9427teaching-website/course.json
```

內容有版本、三條學習路徑、每章的標題、先備章節、學習目標、實驗與工具站任務，以及每章的網址。其他網站或 AI 可以用它知道「某個觀念在哪一章」「學這章前要先會什麼」。

兩個網站都在 `vincent0926.github.io` 底下，屬於同一個網域；如果之後要讓工具站讀取課程進度，可以直接讀 localStorage 的 `frc9427-done` 與 `frc9427-progress`，不需要後端。
