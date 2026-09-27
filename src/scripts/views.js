/* ---------- map ---------- */
function renderMap(current){
  const done = loadDone();
  document.getElementById("map").innerHTML = COURSE.map(p => `
    <div class="part">${p.part}</div>
    <ul class="nodes">${p.items.map(([id,title,,ready]) => {
      const cls = ["node", ready ? "ready" : "", done.includes(id) ? "done" : "", current === id ? "active" : ""].join(" ");
      return `<li><button class="${cls}" data-go="${id}" ${current===id?'aria-current="page"':''}>
        <span class="id">${pad(id)}</span><span>${title}</span>${ready ? "" : '<span class="soon">撰寫中</span>'}</button></li>`;
    }).join("")}</ul>`).join("");
}

/* ---------- views ---------- */
const view = document.getElementById("view");
function mount(id){ view.innerHTML = ""; view.appendChild(document.getElementById(id).content.cloneNode(true)); }

function showHome(){
  mount("tpl-home");
  const done = loadDone();
  document.getElementById("outline").innerHTML = COURSE.map(p => `
    <h3>${p.part}</h3><ul class="outline">${p.items.map(([id,title,desc,ready]) => `
      <li><span class="cid">${pad(id)}</span><span class="ttl">${ready ? `<a href="#ch${id}">${title}</a>` : title}${done.includes(id) ? "（已完成）" : ""}</span><span class="desc">${desc}</span></li>`).join("")}
    </ul>`).join("");
  renderMap(null);
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
  view.querySelectorAll("pre code").forEach(el => { el.innerHTML = highlight(el.textContent); });
  const q = view.querySelector(".quiz");
  if (q && QUIZZES[id]) initQuiz(q, QUIZZES[id]);
  (LABS[id] || []).forEach(init => init());
  view.querySelectorAll("a.ref").forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (t){ t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); t.setAttribute("tabindex","-1"); t.focus({preventScroll:true}); }
  }));
  appendFooter(id);
  renderMap(id);
}

function appendFooter(id){
  const idx = READY.indexOf(id);
  const next = READY[idx + 1];
  const prev = READY[idx - 1];
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="finish">
      <button class="btn" id="markDone"></button>
      <span id="doneMsg" style="color:var(--ink-2)"></span>
    </div>
    <div class="pager">
      ${prev !== undefined ? `<button class="btn ghost" data-go="${prev}">上一章</button>` : `<button class="btn ghost" data-go="home">回課程大綱</button>`}
      ${next !== undefined ? `<button class="btn" data-go="${next}">下一章：${ALL.find(x => x[0] === next)[1]}</button>` : `<button class="btn ghost" data-go="home">回課程大綱</button>`}
    </div>`;
  view.appendChild(wrap);
  const btn = document.getElementById("markDone"), msg = document.getElementById("doneMsg");
  const refresh = () => {
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

