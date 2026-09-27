/* ---------- 小測驗 ----------
 * 題目分兩種（src/quiz/chNN.json 的 type）：
 *   recall   觀念記憶題
 *   scenario 情境題：先列出症狀與證據（s.symptom、s.evidence），再問下一步、原因或修正
 * 題目有 lab 欄位時，附上「到實驗驗證」的連結。分數存進學習紀錄。
 */
function initQuiz(box, items, chapterId){
  const scenarioHTML = s => `<div class="q-case"><p><b>症狀</b>${esc(s.symptom)}</p>
    <p><b>證據</b></p><ul>${s.evidence.map(e => `<li>${esc(e)}</li>`).join("")}</ul></div>`;
  box.innerHTML = items.map((item, i) => `
    <div class="q ${item.type}" data-i="${i}">
      <div class="q-prompt"><span class="qtype">${item.type === "scenario" ? "情境" : "觀念"}</span>${i + 1}. ${item.type === "scenario" ? "" : esc(item.q)}</div>
      ${item.type === "scenario" ? scenarioHTML(item.s) + `<p class="q-ask">${esc(item.q)}</p>` : ""}
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
      if (item.lab) ex.insertAdjacentHTML("beforeend", ` <a class="qlab" href="#ch${chapterId}/${item.lab}">到實驗驗證</a>`);
      ex.hidden = false;
      if (++answered === items.length){
        const pass = correct / items.length >= 0.8;
        box.querySelector(".score").textContent = `${items.length} 題答對 ${correct} 題。` +
          (pass ? "達到精通標準（80%）。" : "還沒到 80%，答錯的題目回去看對應的段落和實驗，再試一次。");
        updateProgress(p => {
          const prev = p.quiz[chapterId];
          p.quiz[chapterId] = { correct, total: items.length, at: new Date().toISOString(), best: Math.max(correct, prev ? prev.best || prev.correct : 0) };
        });
      }
    });
  });
}
