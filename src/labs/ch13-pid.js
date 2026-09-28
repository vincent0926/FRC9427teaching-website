/* 第 13 章：手臂 PID 模擬 */
function initPidLab(){
  const P = document.getElementById("pidP"), D = document.getElementById("pidD"), G = document.getElementById("pidG");
  const cv = document.getElementById("pidCanvas"), con = document.getElementById("pidConsole");
  const show = () => { document.getElementById("pidPv").textContent = (+P.value).toFixed(0) + " V/rot"; document.getElementById("pidDv").textContent = (+D.value).toFixed(2) + " V/(rot/s)"; document.getElementById("pidGv").textContent = (+G.value).toFixed(2) + " V"; };
  const run = () => {
    // 模擬手臂：V = kG·cos + kS·sgn(ω) + kV·ω + kA·α，1 kHz 控制、10 ms 量測延遲
    const TG = 0.6, TS = 0.1, TV = 6.0, TA = 0.25, goal = 0.2, delay = 10;
    const kP = +P.value, kD = +D.value, kG = +G.value;
    let th = 0, w = 0; const hist = Array(delay).fill(0), pts = [];
    let maxTh = 0, sat = 0;
    for (let i = 0; i < 2000; i++){
      const meas = hist.shift(); hist.push(th);
      let u = kP * (goal - meas) - kD * w + kG * Math.cos(2 * Math.PI * meas);
      if (Math.abs(u) > 12){ u = Math.sign(u) * 12; sat++; }
      const grav = TG * Math.cos(2 * Math.PI * th);
      let a;
      if (w === 0 && Math.abs(u - grav) <= TS) a = 0;
      else a = (u - grav - TS * Math.sign(w || (u - grav)) - TV * w) / TA;
      w += a / 1000; th += w / 1000;
      if (th < -0.05){ th = -0.05; w = 0; } if (th > 0.3){ th = 0.3; w = 0; }
      maxTh = Math.max(maxTh, th);
      if (i % 10 === 0) pts.push([i / 1000, th * 360]);
    }
    drawPlot(cv, [{ pts: [[0, goal * 360], [2, goal * 360]], color: plotColors().b, dash: [6, 4] }, { pts, color: plotColors().a }], 2, -20, 100, "時間 s", "角度 °");
    const err = (goal - th) * 360, over = (maxTh - goal) * 360;
    con.innerHTML = highlight(`kP = ${kP}, kD = ${kD}, kG = ${kG}`) + "\n" +
      `<span class="c">// 2 秒後角度 ${(th * 360).toFixed(1)}°，誤差 ${err.toFixed(1)}°` + (over > 0.5 ? `；最大過衝 ${over.toFixed(1)}°` : "") + (sat > 50 ? "；輸出曾飽和在 ±12 V" : "") + "</span>" +
      (kP === 0 && kG < TG - TS ? '\n<span class="c">// 沒有 P，kG 也不夠撐住手臂</span>' : "");
  };
  [P, D, G].forEach(el => el.oninput = show);
  document.getElementById("pidRun").onclick = run;
  view.querySelectorAll("[data-pid]").forEach(b => b.onclick = () => { const [p, d, g] = b.dataset.pid.split(","); P.value = p; D.value = d; G.value = g; show(); run(); });
  show(); run();
}
registerLab(13, initPidLab);
