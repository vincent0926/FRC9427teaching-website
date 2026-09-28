/* 第 14 章：梯形／三角形速度曲線 */
function initProfileLab(){
  const Dd = document.getElementById("mmD"), Vv = document.getElementById("mmV"), Aa = document.getElementById("mmA");
  const cv = document.getElementById("mmCanvas"), con = document.getElementById("mmConsole");
  const upd = () => {
    const d = +Dd.value, v = +Vv.value, a = +Aa.value;
    document.getElementById("mmDv").textContent = d.toFixed(2) + " rot";
    document.getElementById("mmVv").textContent = v.toFixed(2) + " rot/s";
    document.getElementById("mmAv").textContent = a.toFixed(2) + " rot/s²";
    const tri = d < v * v / a; // 加速+減速距離 = v²/a
    const vp = tri ? Math.sqrt(d * a) : v, ta = vp / a, tc = tri ? 0 : (d - v * v / a) / v, T = 2 * ta + tc;
    const pts = [[0, 0], [ta, vp], [ta + tc, vp], [T, 0]];
    drawPlot(cv, [{ pts: [[0, v], [Math.max(T, 0.01), v]], color: plotColors().b, dash: [6, 4] }, { pts, color: plotColors().a }], Math.max(T, 0.01), 0, 2, "時間 s", "速度 rot/s");
    con.innerHTML = `<span class="c">// ${tri ? "三角形：還沒到巡航速度就要減速" : "梯形：加速 → 巡航 → 減速"}</span>\n` +
      `<span class="c">// 最高速度 ${vp.toFixed(2)} rot/s，加速 ${ta.toFixed(2)} s，巡航 ${tc.toFixed(2)} s，總共 ${T.toFixed(2)} s</span>`;
  };
  [Dd, Vv, Aa].forEach(el => el.oninput = upd);
  upd();
}

registerLab(14, initProfileLab);
