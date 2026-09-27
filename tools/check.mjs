// 內容檢查：node tools/check.mjs
// 找出會讓網站壞掉或讓學生學錯的結構問題。有錯誤時結束碼為 1。
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = p => join(root, "src", p);
const read = p => readFileSync(p, "utf8");
const errors = [], warnings = [];
const err = (where, msg) => errors.push(`${where}：${msg}`);
const warn = (where, msg) => warnings.push(`${where}：${msg}`);

const course = JSON.parse(read(src("data/course.json")));
const chapters = course.chapters;
const ids = chapters.map(c => c.id);
const pad = n => String(n).padStart(2, "0");
const VOID = new Set(["br", "img", "input", "meta", "link", "hr", "source", "wbr"]);

// ---- 課程資料
if (new Set(ids).size !== ids.length) err("course.json", "章節 id 重複");
for (const p of course.parts) for (const id of p.chapters) if (!ids.includes(id)) err("course.json", `部分「${p.name}」列了不存在的章節 ${id}`);
for (const c of chapters) {
  if (!course.parts.some(p => p.chapters.includes(c.id))) err("course.json", `第 ${c.id} 章沒有放在任何部分`);
  if (!existsSync(src(`chapters/ch${pad(c.id)}.html`))) err("course.json", `第 ${c.id} 章沒有 chapters/ch${pad(c.id)}.html`);
}

// ---- 學習路徑：每章剛好屬於一條路徑，先備章節要排在前面（核心 → 進階控制 → 競賽實務）
const order = (course.paths || []).flatMap(p => p.chapters);
for (const c of chapters) {
  const inPaths = (course.paths || []).filter(p => p.chapters.includes(c.id));
  if (inPaths.length !== 1) err("course.json", `第 ${c.id} 章屬於 ${inPaths.length} 條路徑（應該剛好 1 條）`);
  else if (inPaths[0].id !== c.path) err("course.json", `第 ${c.id} 章的 path 是 ${c.path}，但被放在 ${inPaths[0].id}`);
  for (const pre of c.prereqs || []) {
    if (!ids.includes(pre)) err("course.json", `第 ${c.id} 章的先備章節 ${pre} 不存在`);
    else if (order.indexOf(pre) > order.indexOf(c.id)) err("course.json", `第 ${c.id} 章的先備章節 ${pre} 排在它後面`);
  }
  if (!c.objectives?.length) err("course.json", `第 ${c.id} 章沒有學習目標`);
  if (![1, 2, 3].includes(c.difficulty)) err("course.json", `第 ${c.id} 章的難度要是 1～3`);
}

// ---- 工具站任務：情境、單元、樓層都要是工具站真的有的（清單在 course.json 的 tool）
const tool = course.tool || {};
for (const c of chapters) for (const [i, t] of (c.tools || []).entries()) {
  const w = `第 ${c.id} 章工具站任務 ${i + 1}`;
  if (!["elevator", "arm"].includes(t.track)) err(w, `track 要是 elevator 或 arm`);
  const pages = t.track === "arm" ? tool.armPages : tool.pages;
  if (!pages?.includes(t.page)) err(w, `${t.track} 沒有 ${t.page} 這一層`);
  if (t.scenario && (t.page !== "sim" || !tool.scenarios?.[t.track]?.includes(t.scenario))) err(w, `${t.track} 3F 沒有情境 ${t.scenario}`);
  if (t.section && !tool.sections?.includes(t.section)) err(w, `工具站沒有區塊 ${t.section}`);
  if (!t.title || !t.do || !t.check) err(w, "缺少 title／do／check");
}

// ---- 章節 HTML：標籤成對、引用都有來源、來源都有被引用、引用編號與來源一致
for (const f of readdirSync(src("chapters")).filter(f => f.endsWith(".html"))) {
  const html = read(src("chapters/" + f));
  const stack = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g)) {
    const [, close, tag0, self] = m, tag = tag0.toLowerCase();
    if (VOID.has(tag) || self) continue;
    if (!close) stack.push(tag);
    else if (stack.at(-1) === tag) stack.pop();
    else { err(f, `標籤不成對：遇到 </${tag}>，但目前開著 <${stack.at(-1) || "（無）"}>`); break; }
  }
  if (stack.length) err(f, `沒有關閉的標籤：${stack.join(", ")}`);

  const m = f.match(/^ch(\d+)\.html$/);
  if (!m) continue;
  const n = Number(m[1]);
  const cites = [...html.matchAll(new RegExp(`href="#src${n}-(\\d+)">\\[(\\d+)\\]`, "g"))];
  const defs = [...html.matchAll(new RegExp(`id="src${n}-(\\d+)"`, "g"))].map(x => x[1]);
  for (const [, a, b] of cites) {
    if (a !== b) err(f, `引用 src${n}-${a} 顯示成 [${b}]`);
    if (!defs.includes(a)) err(f, `引用了不存在的來源 [${a}]`);
  }
  const cited = new Set(cites.map(x => x[1]));
  for (const d of defs) if (!cited.has(d)) warn(f, `來源 [${d}] 沒有在內文被引用`);
  const labCount = (html.match(/<div class="lab"/g) || []).length;
  const labMeta = (chapters.find(c => c.id === n)?.labs || []).length;
  if (labCount !== labMeta) err(f, `有 ${labCount} 個實驗，但 course.json 描述了 ${labMeta} 個`);
  if (/<div class="quiz">/.test(html) && !existsSync(src(`quiz/ch${pad(n)}.json`))) err(f, "有小測驗區塊但沒有題庫");
}

// ---- 小測驗：格式、情境題的症狀與證據、實驗連結；情境題約七成（規格：約 30% 記憶、70% 情境）
let totalQ = 0, scenarioQ = 0;
for (const f of readdirSync(src("quiz")).filter(f => f.endsWith(".json"))) {
  let qs;
  try { qs = JSON.parse(read(src("quiz/" + f))); } catch (e) { err(f, "JSON 格式錯誤：" + e.message); continue; }
  const n = Number(f.match(/\d+/)[0]);
  const labs = (chapters.find(c => c.id === n)?.labs || []).map(l => l.id);
  let sc = 0;
  qs.forEach((q, i) => {
    const w = `${f} 第 ${i + 1} 題`;
    if (!["recall", "scenario"].includes(q.type)) err(w, "type 要是 recall 或 scenario");
    if (q.type === "scenario" && (!q.s?.symptom || !q.s?.evidence?.length)) err(w, "情境題要有 s.symptom 與 s.evidence");
    if (q.type === "scenario") sc++;
    if (!q.q || !Array.isArray(q.o) || q.o.length < 2 || typeof q.a !== "number" || !q.e) err(w, "缺少 q／o／a／e");
    else if (q.a < 0 || q.a >= q.o.length) err(w, `答案索引 ${q.a} 超出選項範圍`);
    if (q.o && new Set(q.o).size !== q.o.length) err(w, "選項重複");
    if (q.lab && !labs.includes(q.lab)) err(w, `連到不存在的實驗 ${q.lab}`);
  });
  if (qs.length && sc / qs.length < 0.5) warn(f, `情境題只有 ${sc} / ${qs.length}`);
  totalQ += qs.length; scenarioQ += sc;
}
if (totalQ && scenarioQ / totalQ < 0.65) err("小測驗", `情境題只佔 ${(100 * scenarioQ / totalQ).toFixed(0)}%，目標約 70%`);
console.log(`小測驗：${totalQ} 題，情境題 ${scenarioQ}（${(100 * scenarioQ / totalQ).toFixed(0)}%）`);

for (const w of warnings) console.log("注意　" + w);
for (const e of errors) console.log("錯誤　" + e);
console.log(errors.length ? `\n${errors.length} 個錯誤` : `\n檢查通過（${warnings.length} 個注意事項）`);
process.exit(errors.length ? 1 : 0);
