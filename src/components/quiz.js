/* ---------- quiz ---------- */
function initQuiz(box, items){
  box.innerHTML = items.map((item, i) => `
    <div class="q" data-i="${i}">
      <div class="q-prompt">${i + 1}. ${esc(item.q)}</div>
      <div class="opts">${item.o.map((t, j) => `<button class="opt" data-j="${j}">${esc(t)}</button>`).join("")}</div>
      <div class="explain" hidden></div>
    </div>`).join("") + '<p class="score" style="font-weight:700;margin-top:16px"></p>';
  let answered = 0, correct = 0;
  box.querySelectorAll(".q").forEach(qEl => {
    const item = items[+qEl.dataset.i];
    qEl.querySelectorAll(".opt").forEach(btn => btn.onclick = () => {
      const j = +btn.dataset.j;
      qEl.querySelectorAll(".opt").forEach(b => { b.disabled = true; if (+b.dataset.j === item.a) b.classList.add("right"); });
      if (j !== item.a) btn.classList.add("wrong"); else correct++;
      const ex = qEl.querySelector(".explain");
      ex.textContent = (j === item.a ? "答對了。" : "不對。") + item.e;
      ex.hidden = false;
      if (++answered === items.length){
        box.querySelector(".score").textContent = `${items.length} 題答對 ${correct} 題。` + (correct === items.length ? "可以進下一章了。" : "答錯的題目回去看對應的段落再試一次。");
      }
    });
  });
}

