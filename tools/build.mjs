// 把 src/ 組回單一 index.html（GitHub Pages 首頁，也方便其他 AI 直接讀原始檔）。
// 用法：node tools/build.mjs          產生 index.html
//       node tools/build.mjs --check  只比對，index.html 不是最新時結束碼為 1（CI 用）
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = p => join(root, "src", p);
const read = p => readFileSync(p, "utf8");
const list = (dir, ext) => readdirSync(src(dir)).filter(f => f.endsWith(ext)).sort();

// 樣式與程式的順序有意義，所以明確列出
const STYLES = ["base.css", "map.css", "content.css", "labs.css", "landing.css"];
const SCRIPTS_FIRST = ["scripts/core.js"];
const SCRIPTS_LAST = ["scripts/views.js", "scripts/router.js"];

export function build() {
  const course = JSON.parse(read(src("data/course.json")));
  course.version = JSON.parse(read(join(root, "package.json"))).version;   // 版本只以 package.json 為準
  const quizzes = {};
  for (const f of list("quiz", ".json")) quizzes[Number(f.match(/\d+/)[0])] = JSON.parse(read(src("quiz/" + f)));

  const styles = STYLES.map(f => read(src("styles/" + f))).join("");

  // 章節模板：chNN.html → <template id="tpl-chN">，其他檔名 → <template id="tpl-檔名">
  const templates = list("chapters", ".html").map(f => {
    const name = f.replace(/\.html$/, "");
    const id = /^ch\d+$/.test(name) ? "ch" + Number(name.slice(2)) : name;
    return `<template id="tpl-${id}">\n${read(src("chapters/" + f))}</template>\n`;
  }).join("\n");

  const data = `const COURSE_DATA = ${JSON.stringify(course)};\nconst QUIZ_DATA = ${JSON.stringify(quizzes)};\n`;
  const scripts = [
    data,
    ...SCRIPTS_FIRST.map(f => read(src(f))),
    ...list("components", ".js").map(f => read(src("components/" + f))),
    ...list("labs", ".js").map(f => read(src("labs/" + f))),
    ...SCRIPTS_LAST.map(f => read(src(f))),
  ].join("\n");

  return read(src("shell.html"))
    .replaceAll("{{version}}", course.version)
    .replace("<!--@styles-->\n", () => styles)
    .replace("<!--@templates-->", () => templates)
    .replace("<!--@scripts-->\n", () => scripts);
}

// 公開的課程清單（給工具站或其他程式讀）：章節、路徑、學習目標、工具站任務與每章網址
export function manifest() {
  const course = JSON.parse(read(src("data/course.json")));
  const pkg = JSON.parse(read(join(root, "package.json")));
  const site = "https://vincent0926.github.io/FRC9427teaching-website/";
  return JSON.stringify({
    schema: 1,
    version: pkg.version,
    site,
    paths: course.paths,
    tool: { name: course.tool.name, url: course.tool.url, minVersion: course.tool.minVersion },
    chapters: course.chapters.map(c => ({
      id: c.id, title: c.title, desc: c.desc, path: c.path, difficulty: c.difficulty,
      prereqs: c.prereqs, objectives: c.objectives, url: `${site}#ch${c.id}`,
      labs: (c.labs || []).map(l => ({ id: l.id, title: l.title, url: `${site}#ch${c.id}/${l.id}` })),
      toolTasks: (c.tools || []).map(t => ({ track: t.track, page: t.page, scenario: t.scenario, section: t.section, title: t.title })),
    })),
  }, null, 2) + "\n";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outputs = { "index.html": build(), "course.json": manifest() };
  if (process.argv.includes("--check")) {
    const stale = Object.entries(outputs).filter(([f, text]) => !existsSync(join(root, f)) || read(join(root, f)) !== text).map(([f]) => f);
    console.log(stale.length ? `${stale.join("、")} 不是最新的，請執行 node tools/build.mjs` : "index.html、course.json 是最新的");
    process.exit(stale.length ? 1 : 0);
  }
  for (const [f, text] of Object.entries(outputs)) writeFileSync(join(root, f), text);
  console.log(`已產生 index.html（${(outputs["index.html"].length / 1024).toFixed(0)} KB）與 course.json`);
}
