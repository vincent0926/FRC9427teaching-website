/* ---------- 學習路徑與章節學習卡 ----------
 * 資料來自 course.json 的 paths 與每章的 path、prereqs、objectives、awareness、difficulty。
 */
const PATHS = COURSE_DATA.paths;
const pathOf = id => PATHS.find(p => p.chapters.includes(id));
const PATH_ORDER = PATHS.flatMap(p => p.chapters);          // 核心 → 進階控制 → 競賽實務
const stars = n => "●".repeat(n) + "○".repeat(3 - n);
const DIFF_NAME = ["", "入門", "中等", "進階"];

function missingPrereqs(id, done){ return (chapterById(id).prereqs || []).filter(p => !done.includes(p)); }

/** 下一步學什麼：依路徑順序，找第一個還沒完成、而且先備章節都完成的章節。 */
function recommendNext(done){
  for (const id of PATH_ORDER){
    if (done.includes(id)) continue;
    if (missingPrereqs(id, done).length === 0) return id;
  }
  return null;
}

/** 同一條路徑裡的前後章節；路徑最後一章的「下一章」交給 recommendNext。 */
function pathNeighbors(id){
  const p = pathOf(id), i = p.chapters.indexOf(id);
  return { path: p, prev: p.chapters[i - 1], next: p.chapters[i + 1] };
}

const chLink = id => `<a href="#ch${id}">第 ${id} 章 ${chapterById(id).title}</a>`;

function learningCardHTML(id){
  const c = chapterById(id), p = pathOf(id), done = loadDone();
  const miss = missingPrereqs(id, done);
  const pre = (c.prereqs || []).length
    ? c.prereqs.map(x => `<li class="${done.includes(x) ? "ok" : ""}">${done.includes(x) ? "✓ " : ""}${chLink(x)}</li>`).join("")
    : "<li>沒有，從這裡開始</li>";
  return `<aside class="lcard" aria-label="本章學習卡">
    <div class="lcard-head">
      <span class="ptag ${p.id}">${esc(p.name)}${p.required ? "（必修）" : "（選修）"}</span>
      <span class="diff" title="難度">${stars(c.difficulty)} ${DIFF_NAME[c.difficulty]}</span>
      <span class="order">路徑第 ${p.chapters.indexOf(id) + 1} / ${p.chapters.length} 章</span>
    </div>
    ${miss.length ? `<p class="lwarn">建議先完成：${miss.map(chLink).join("、")}。這一章會用到那裡的觀念。</p>` : ""}
    <p class="lver">依據版本：${(c.stack || []).map(k => esc(COURSE_DATA.stack[k])).join("、")}｜最後查證：${esc(c.verified)}</p>
    ${(c.legacy || []).length ? `<details class="llegacy"><summary>舊版與即將改變的 API（${c.legacy.length}）</summary><ul>${c.legacy.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}
    <div class="lcard-grid">
      <div><h4>先備章節</h4><ul>${pre}</ul></div>
      <div><h4>學完要能做到</h4><ul>${c.objectives.map(o => `<li>${esc(o)}</li>`).join("")}</ul></div>
      <div><h4>知道就好，不必精通</h4><ul>${(c.awareness || []).map(o => `<li>${esc(o)}</li>`).join("") || "<li>無</li>"}</ul></div>
    </div>
  </aside>`;
}

function insertLearningCard(id){
  const anchor = view.querySelector(".lede");
  if (anchor) anchor.insertAdjacentHTML("afterend", learningCardHTML(id));
}

function pathsHTML(){
  const done = loadDone(), next = recommendNext(done);
  const nextBox = next === null
    ? `<div class="nextbox"><strong>三條路徑都完成了</strong><a href="#final">到最終評量</a>，檢查自己能不能獨立除錯。</div>`
    : `<div class="nextbox"><strong>下一步</strong>${chLink(next)}<span>（${esc(pathOf(next).name)}，先備章節都已完成）</span></div>`;
  return nextBox + PATHS.map(p => {
    const n = p.chapters.filter(x => done.includes(x)).length;
    return `<section class="pathsec">
      <h3><span class="ptag ${p.id}">${esc(p.name)}</span>${p.required ? "必修" : "選修"}<span class="pcount">${n} / ${p.chapters.length}</span></h3>
      <p class="pgoal">${esc(p.goal)}</p>
      <ol class="outline">${p.chapters.map(id => { const c = chapterById(id); return `
        <li class="${done.includes(id) ? "done" : ""}${id === next ? " next" : ""}"><span class="cid">${pad(id)}</span>
          <span class="ttl"><a href="#ch${id}">${esc(c.title)}</a>${done.includes(id) ? "（已完成）" : id === next ? "（下一步）" : ""}<span class="diff">${stars(c.difficulty)}</span></span>
          <span class="desc">${esc(c.desc)}</span></li>`; }).join("")}</ol>
    </section>`;
  }).join("") + `<section class="pathsec"><h3><span class="ptag">檢核</span>完成核心路徑後</h3>
      <p class="pgoal"><a href="#final">最終程式能力評量</a>：一題沒看過的除錯題，看你能不能用證據找出問題、決定先查什麼，並在上機前做好檢查。</p></section>
    <p class="mastery">${esc(COURSE_DATA.mastery)}</p>`;
}
