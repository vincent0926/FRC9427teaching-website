/* ---------- 學習紀錄 ----------
 * 章節完成沿用 frc9427-done；其他紀錄（實驗、工具站任務、小測驗分數、最終評量）放在 frc9427-progress。
 * 只存在這台瀏覽器，可以匯出給教練（見 scripts/views.js 的進度頁）。
 */
const PROGRESS_KEY = "frc9427-progress";
function loadProgress(){
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return { labs: p.labs || {}, tools: p.tools || {}, quiz: p.quiz || {}, hints: p.hints || {}, final: p.final || null };
  } catch(e){ return { labs: {}, tools: {}, quiz: {}, hints: {}, final: null }; }
}
function saveProgress(p){ try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch(e){} }
function updateProgress(fn){ const p = loadProgress(); fn(p); saveProgress(p); return p; }

/* ---------- 匯出學習紀錄（給教練彙整，見 #coach） ---------- */
function studentName(){
  try { return localStorage.getItem("frc9427-name") || ""; } catch(e){ return ""; }
}
function progressSnapshot(){
  return {
    schema: 1,
    course: "frc9427-course",
    version: COURSE_DATA.version,
    name: studentName(),
    exportedAt: new Date().toISOString(),
    done: loadDone(),
    progress: loadProgress(),
  };
}
function exportProgress(){
  let name = studentName();
  if (!name){
    name = (prompt("匯出前請輸入你的名字（教練彙整時用）") || "").trim();
    if (!name) return;
    try { localStorage.setItem("frc9427-name", name); } catch(e){}
  }
  const blob = new Blob([JSON.stringify(progressSnapshot(), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  // 檔名只用 ASCII（中文檔名在部分瀏覽器會變成 download），名字記在檔案內容裡
  a.download = `frc9427-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
