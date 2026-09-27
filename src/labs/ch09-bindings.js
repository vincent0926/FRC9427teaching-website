/* ---------- ch9 lab ---------- */
function initBindLab(){
  const box = document.getElementById("bindState"), con = document.getElementById("bindConsole");
  const binds = ["onTrue", "whileTrue", "toggleOnTrue"];
  let running, pressed;
  const log = h => { con.innerHTML += h + "\n"; con.scrollTop = con.scrollHeight; };
  const c = t => `<span class="c">${esc(t)}</span>`;
  const paint = () => {
    box.innerHTML = binds.map(b => `<div class="obj"><div class="obj-name">${b}</div>吸入指令：<span class="${running[b] ? "on" : ""}">${running[b] ? "執行中" : "停止"}</span></div>`).join("");
  };
  const reset = () => { running = { onTrue: false, whileTrue: false, toggleOnTrue: false }; pressed = false; con.innerHTML = c("// 三個綁定各自綁著一個「吸入」指令（不會自己結束）") + "\n"; paint(); };
  document.getElementById("btnPress").onclick = () => {
    if (pressed){ log(c("// 按鍵已經是按下狀態，沒有新的上升邊緣")); return; }
    pressed = true; log(highlight("按鍵：false → true"));
    log(c(running.onTrue ? "// onTrue：指令已在執行，排程沒有效果" : "// onTrue：排程")); running.onTrue = true;
    log(c("// whileTrue：排程")); running.whileTrue = true;
    log(c(running.toggleOnTrue ? "// toggleOnTrue：正在執行 → 取消" : "// toggleOnTrue：沒在執行 → 排程")); running.toggleOnTrue = !running.toggleOnTrue;
    paint();
  };
  document.getElementById("btnRelease").onclick = () => {
    if (!pressed){ log(c("// 按鍵本來就沒按")); return; }
    pressed = false; log(highlight("按鍵：true → false"));
    log(c("// onTrue：什麼都不做"));
    log(c(running.whileTrue ? "// whileTrue：取消指令" : "// whileTrue：指令已停止")); running.whileTrue = false;
    log(c("// toggleOnTrue：什麼都不做"));
    paint();
  };
  document.getElementById("btnReset").onclick = reset;
  reset();
}

registerLab(9, initBindLab);
