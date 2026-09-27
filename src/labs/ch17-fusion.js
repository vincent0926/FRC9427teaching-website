/* 第 17 章：里程計與視覺融合 */
function initFuseLab(){
  const O = document.getElementById("fuO"), D = document.getElementById("fuD"), N = document.getElementById("fuN");
  const bar = document.getElementById("fuBar"), con = document.getElementById("fuConsole");
  const odo = 3.0, vis = 3.4, lo = 2.8, hi = 3.6;
  const pct = x => ((x - lo) / (hi - lo) * 100).toFixed(1) + "%";
  const upd = () => {
    const so = +O.value, d = +D.value, n = +N.value, sv = 0.05 * d * d / n;
    const wo = 1 / (so * so), wv = 1 / (sv * sv), fused = (odo * wo + vis * wv) / (wo + wv), share = wv / (wo + wv);
    document.getElementById("fuOv").textContent = so.toFixed(2) + " m";
    document.getElementById("fuDv").textContent = d.toFixed(1) + " m";
    document.getElementById("fuNv").textContent = n + " 個";
    bar.innerHTML = `<span class="fmark odo" style="left:${pct(odo)}">里程計</span><span class="fmark vis" style="left:${pct(vis)}">視覺</span><span class="fmark fus" style="left:${pct(fused)}">融合</span>`;
    con.innerHTML = `<span class="c">// 視覺標準差 = 0.05 × ${d.toFixed(1)}² ÷ ${n} = ${sv.toFixed(3)} m</span>\n` +
      `<span class="c">// 融合結果 x = ${fused.toFixed(3)} m，視覺佔 ${(share * 100).toFixed(0)}% 的權重</span>`;
  };
  [O, D, N].forEach(el => el.oninput = upd);
  upd();
}
registerLab(17, initFuseLab);
