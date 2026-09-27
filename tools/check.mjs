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
  if (/<div class="quiz">/.test(html) && !existsSync(src(`quiz/ch${pad(n)}.json`))) err(f, "有小測驗區塊但沒有題庫");
}

// ---- 小測驗
for (const f of readdirSync(src("quiz")).filter(f => f.endsWith(".json"))) {
  let qs;
  try { qs = JSON.parse(read(src("quiz/" + f))); } catch (e) { err(f, "JSON 格式錯誤：" + e.message); continue; }
  qs.forEach((q, i) => {
    const w = `${f} 第 ${i + 1} 題`;
    if (!q.q || !Array.isArray(q.o) || q.o.length < 2 || typeof q.a !== "number" || !q.e) err(w, "缺少 q／o／a／e");
    else if (q.a < 0 || q.a >= q.o.length) err(w, `答案索引 ${q.a} 超出選項範圍`);
    if (q.o && new Set(q.o).size !== q.o.length) err(w, "選項重複");
  });
}

for (const w of warnings) console.log("注意　" + w);
for (const e of errors) console.log("錯誤　" + e);
console.log(errors.length ? `\n${errors.length} 個錯誤` : `\n檢查通過（${warnings.length} 個注意事項）`);
process.exit(errors.length ? 1 : 0);
