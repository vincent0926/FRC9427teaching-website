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
    .replace("<!--@styles-->\n", () => styles)
    .replace("<!--@templates-->", () => templates)
    .replace("<!--@scripts-->\n", () => scripts);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = build();
  const target = join(root, "index.html");
  if (process.argv.includes("--check")) {
    const same = existsSync(target) && read(target) === out;
    console.log(same ? "index.html 是最新的" : "index.html 不是最新的，請執行 node tools/build.mjs");
    process.exit(same ? 0 : 1);
  }
  writeFileSync(target, out);
  console.log(`已產生 index.html（${(out.length / 1024).toFixed(0)} KB）`);
}
