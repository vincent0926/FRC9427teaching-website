/* ---------- ch8 lab ---------- */
function initSchedLab(){
  const con = document.getElementById("schConsole"), st = document.getElementById("schState");
  const names = { A: "A：goTo(SCORE)", B: "B：goTo(INTAKE)", C: "C：goTo(STOW)，kCancelIncoming", D: "預設指令：hold" };
  let cur = "D";
  const log = h => { con.innerHTML += h + "\n"; con.scrollTop = con.scrollHeight; };
  const c = t => `<span class="c">${esc(t)}</span>`;
  const paint = () => { st.innerHTML = `<div class="obj-name">ArmSubsystem 目前被誰使用</div><span class="on">${esc(names[cur])}</span>`; };
  con.innerHTML = c("// 手臂空閒，預設指令自動排程") + "\n" + highlight("default.initialize()") + "\n";
  paint();
  view.querySelectorAll("[data-sch]").forEach(b => b.onclick = () => {
    const k = b.dataset.sch;
    if (k === "finish"){
      if (cur === "D"){ log(c("// 預設指令不會自己結束")); return; }
      log(c(`// ${names[cur]} 的 isFinished() 回傳 true`));
      log(highlight(`${cur}.end(false)`));
      cur = "D";
      log(c("// 手臂空了，預設指令重新排程")); log(highlight("default.initialize()"));
      paint(); return;
    }
    if (cur === k){ log(c(`// ${names[k]} 已在執行，這次排程沒有效果`)); return; }
    if (cur === "C"){
      log(c(`// 嘗試排程 ${names[k]}：手臂被 C 佔用且 C 為 kCancelIncoming`));
      log('<span class="err">排程被放棄，C 繼續執行</span>'); return;
    }
    log(c(`// 排程 ${names[k]}，手臂正被 ${names[cur]} 使用（kCancelSelf）`));
    log(highlight(`${cur === "D" ? "default" : cur}.end(true)`) + "   " + c("// 被打斷"));
    log(highlight(`${k}.initialize()`));
    cur = k; paint();
  });
}

registerLab(8, initSchedLab);
