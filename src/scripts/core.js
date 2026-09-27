/* ---------- 課程資料與共用工具 ----------
 * COURSE_DATA、QUIZ_DATA 由 tools/build.mjs 從 src/data/course.json 與 src/quiz/*.json 注入。
 */
const CHAPTERS = COURSE_DATA.chapters;
const chapterById = id => CHAPTERS.find(c => c.id === id);
// 課程地圖依學習路徑排列（[id, title, desc, ready] 形式）
const COURSE = COURSE_DATA.paths.map(p => ({
  part: p.name + (p.required ? "（必修）" : "（選修）"),
  items: p.chapters.map(id => { const c = chapterById(id); return [c.id, c.title, c.desc, c.ready !== false]; })
}));
const ALL = COURSE.flatMap(p => p.items);
const READY = ALL.filter(x => x[3]).map(x => x[0]);
const QUIZZES = QUIZ_DATA;
const pad = n => String(n).padStart(2, "0");

/* ---------- 實驗註冊 ----------
 * 每個 src/labs/*.js 在檔案最後呼叫 registerLab(章節, 初始化函式…)，
 * 章節載入時依序執行，章節頁面不需要知道有哪些實驗。
 */
const LABS = {};
function registerLab(chapterId, ...inits){ (LABS[chapterId] = LABS[chapterId] || []).push(...inits); }

/* ---------- progress ---------- */
function loadDone(){ try { return JSON.parse(localStorage.getItem("frc9427-done") || "[]"); } catch(e){ return []; } }
function saveDone(arr){ try { localStorage.setItem("frc9427-done", JSON.stringify(arr)); } catch(e){} }
