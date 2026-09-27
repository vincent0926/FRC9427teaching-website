/* ---------- ch7 lab ---------- */
function initLoopLab(){
  const con = document.getElementById("loopConsole");
  const sim = document.getElementById("simToggle");
  let mode = "disabled", last = null, n = 0;
  const log = h => { con.innerHTML += h + "\n"; con.scrollTop = con.scrollHeight; };
  const c = t => `<span class="c">${esc(t)}</span>`;
  const m = t => highlight(t);
  const boot = () => {
    last = null; n = 0; con.innerHTML = "";
    log(c("// Main.main() 啟動 Robot"));
    log(m("Robot()") + "   " + c("// 建構子，只執行一次：建立 RobotContainer"));
  };
  const setMode = md => {
    mode = md;
    view.querySelectorAll(".mode").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === md)));
  };
  view.querySelectorAll(".mode").forEach(b => b.onclick = () => setMode(b.dataset.mode));
  document.getElementById("stepLoop").onclick = () => {
    n++;
    log(c(`\n// ── 第 ${n} 輪（t = ${(n - 1) * 20} ms）`));
    if (last !== mode){
      if (last) log(m(last + "Exit()"));
      log(m(mode + "Init()"));
      last = mode;
    }
    log(m(mode + "Periodic()"));
    log(m("robotPeriodic()") + "   " + c("// CommandScheduler.run()：Subsystem periodic → 按鍵 → 指令"));
    log(c("// 更新 SmartDashboard / LiveWindow / Shuffleboard"));
    if (sim.checked) log(m("simulationPeriodic()") + "   " + c("// 只在模擬時"));
  };
  document.getElementById("resetLoop").onclick = () => { setMode("disabled"); boot(); };
  boot();
}

registerLab(7, initLoopLab);
