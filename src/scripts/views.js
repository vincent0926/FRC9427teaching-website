/* ---------- map ---------- */
function renderMap(current){
  const done = loadDone();
  document.getElementById("map").innerHTML = COURSE.map(p => `
    <div class="part">${p.part}</div>
    <ul class="nodes">${p.items.map(([id,title,,ready]) => {
      const cls = ["node", ready ? "ready" : "", done.includes(id) ? "done" : "", current === id ? "active" : ""].join(" ");
      return `<li><button class="${cls}" data-go="${id}" ${current===id?'aria-current="page"':''}>
        <span class="id">${pad(id)}</span><span>${title}</span>${ready ? "" : '<span class="soon">撰寫中</span>'}</button></li>`;
    }).join("")}</ul>`).join("") + `
    <div class="part">檢核</div>
    <ul class="nodes"><li><button class="node ready ${current === "final" ? "active" : ""}" data-go="final" ${current === "final" ? 'aria-current="page"' : ""}>
      <span class="id">FN</span><span>最終程式能力評量</span></button></li></ul>`;
}

/* ---------- views ---------- */
const view = document.getElementById("view");
function mount(id){ view.innerHTML = ""; view.appendChild(document.getElementById(id).content.cloneNode(true)); }

function showHome(){
  mount("tpl-home");
  const done = loadDone();
  document.getElementById("outline").innerHTML = pathsHTML();
  renderMap(null);
}

function showFinal(){
  mount("tpl-final");
  view.querySelectorAll("pre code").forEach(el => { el.innerHTML = highlight(el.textContent); });
  initFinal();
  renderMap("final");
}

function showSoon(id){
  const [, title, desc] = ALL.find(x => x[0] === id);
  mount("tpl-soon");
  document.getElementById("soonId").textContent = `CAN ID ${pad(id)}`;
  document.getElementById("soonTitle").textContent = title;
  document.getElementById("soonDesc").textContent = desc;
  renderMap(id);
}

function showChapter(id){
  mount("tpl-ch" + id);
  insertLearningCard(id);
  view.querySelectorAll("pre code").forEach(el => { el.innerHTML = highlight(el.textContent); });
  const q = view.querySelector(".quiz");
  if (q && QUIZZES[id]) initQuiz(q, QUIZZES[id], id);
  (LABS[id] || []).forEach(init => init());
  decorateLabs(id);
  initHints(id);
  insertToolTasks(id);
  view.querySelectorAll("a.ref").forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (t){ t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); t.setAttribute("tabindex","-1"); t.focus({preventScroll:true}); }
  }));
  appendFooter(id);
  renderMap(id);
}

function appendFooter(id){
  const { path, prev, next: nextInPath } = pathNeighbors(id);
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="finish">
      <button class="btn" id="markDone"></button>
      <span id="doneMsg" style="color:var(--ink-2)"></span>
    </div>
    <div class="pager">
      ${prev !== undefined ? `<button class="btn ghost" data-go="${prev}">上一章：${esc(chapterById(prev).title)}</button>` : `<button class="btn ghost" data-go="home">回學習路徑</button>`}
      <span id="nextSlot"></span>
    </div>`;
  view.appendChild(wrap);
  const btn = document.getElementById("markDone"), msg = document.getElementById("doneMsg");
  const renderNext = () => {
    // 路徑內有下一章就去下一章；路徑走完了，依完成狀況推薦下一步
    const doneNow = [...new Set([...loadDone(), id])];
    const target = nextInPath !== undefined ? nextInPath : recommendNext(doneNow);
    const pathDone = path.chapters.every(x => doneNow.includes(x));
    const label = nextInPath !== undefined ? `下一章：${esc(chapterById(target).title)}`
      : target !== null ? `${pathDone ? esc(path.name) + "完成，" : ""}下一步：第 ${target} 章 ${esc(chapterById(target).title)}` : "";
    document.getElementById("nextSlot").innerHTML = target !== null && target !== undefined
      ? `<button class="btn" data-go="${target}">${label}</button>` : `<button class="btn ghost" data-go="home">回學習路徑</button>`;
  };
  const refresh = () => {
    renderNext();
    const d = loadDone().includes(id);
    btn.textContent = d ? "取消完成標記" : "標記本章完成";
    msg.textContent = d ? `第 ${id} 章已完成。` : "";
  };
  btn.onclick = () => {
    let d = loadDone();
    d = d.includes(id) ? d.filter(x => x !== id) : [...d, id];
    saveDone(d); refresh(); renderMap(id);
  };
  refresh();
}

