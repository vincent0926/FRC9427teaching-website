/* ---------- 練習的漸進提示 ----------
 * 章節裡的 <div class="hints"> 依序放三層提示與完整解答：
 *   提示 1 方向或觀念 → 提示 2 用到的 API → 提示 3 部分程式或推理 → 完整解答
 * 一次只揭露一層，先自己試過再看下一層。看到第幾層會記進學習紀錄。
 */
function initHints(chapterId){
  view.querySelectorAll(".hints").forEach(box => {
    const steps = [...box.querySelectorAll(":scope > .hint")];
    let shown = 0;
    steps.forEach(el => { el.hidden = true; });
    box.insertAdjacentHTML("afterbegin", `<p class="hints-intro">先自己寫寫看。卡住時再一層一層打開提示，每一層只多給一點線索。</p>`);
    const btn = document.createElement("button");
    btn.className = "btn ghost hint-btn";
    box.appendChild(btn);
    const label = () => {
      if (shown >= steps.length) { btn.remove(); return; }
      const next = steps[shown].dataset.label;
      btn.textContent = shown === steps.length - 1 ? `看${next}` : `看${next}`;
    };
    btn.onclick = () => {
      const el = steps[shown];
      el.hidden = false;
      el.insertAdjacentHTML("afterbegin", `<p class="hint-label">${esc(el.dataset.label)}</p>`);
      shown++;
      updateProgress(p => {
        p.hints = p.hints || {};
        p.hints[chapterId] = Math.max(p.hints[chapterId] || 0, shown);
      });
      label();
    };
    label();
  });
}
