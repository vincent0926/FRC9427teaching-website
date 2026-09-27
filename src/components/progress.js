/* ---------- 學習紀錄 ----------
 * 章節完成沿用 frc9427-done；其他紀錄（實驗、工具站任務、小測驗分數、最終評量）放在 frc9427-progress。
 * 只存在這台瀏覽器，可以匯出給教練（見 scripts/views.js 的進度頁）。
 */
const PROGRESS_KEY = "frc9427-progress";
function loadProgress(){
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return { labs: p.labs || {}, tools: p.tools || {}, quiz: p.quiz || {}, final: p.final || null };
  } catch(e){ return { labs: {}, tools: {}, quiz: {}, final: null }; }
}
function saveProgress(p){ try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch(e){} }
function updateProgress(fn){ const p = loadProgress(); fn(p); saveProgress(p); return p; }
