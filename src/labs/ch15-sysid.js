/* 第 15 章：用 quasistatic 資料擬合 kS、kG、kV（教學用的合成資料） */
function initSysIdLab(){
  const TRUE = { kS: 0.15, kG: 0.45, kV: 2.0 };   // 只在這個模擬裡的「真實值」
  const on = { tail: false, limit: false, noise: false, oneway: false };
  const cv = document.getElementById("sidCanvas"), con = document.getElementById("sidConsole");

  // 固定種子的亂數，每次畫出來都一樣
  const rng = seed => () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const gauss = r => { let s = 0; for (let i = 0; i < 6; i++) s += r(); return s - 3; };

  function makeData(){
    const r = rng(9427), pts = [];
    const sigma = on.noise ? 0.12 : 0.02;               // 速度雜訊（m/s）
    for (const dir of on.oneway ? [1] : [1, -1]){
      // quasistatic：電壓緩慢上升，a ≈ 0，所以 v = (V − kG − kS·sgn) / kV
      for (let i = 0; i <= 60; i++){
        const mag = 0.1 + i * 0.05;                      // 0.1～3.1 V 的「多出來」的電壓
        const V = TRUE.kG + dir * (TRUE.kS + mag);
        let v = dir * mag / TRUE.kV;
        if (on.limit && dir > 0 && i > 45) v = 0;        // 撞到上方極限：速度掉到 0，電壓還在升
        pts.push({ V, v: v + sigma * gauss(r), dir });
      }
      if (on.tail) for (let i = 0; i < 12; i++){         // 還沒開始動：電壓在升，速度是 0
        const V = TRUE.kG + dir * (TRUE.kS * i / 12);
        pts.push({ V, v: 0.004 * gauss(r), dir });
      }
    }
    return pts;
  }

  // 最小平方：V = kS·sgn(v) + kG + kV·v（解 3×3 正規方程式；只有一個方向時 sgn 與常數項分不開）
  function fit(pts){
    const rows = pts.map(p => [Math.sign(p.v) || p.dir, 1, p.v]);
    const oneDir = new Set(rows.map(r => r[0])).size < 2;
    const cols = oneDir ? [1, 2] : [0, 1, 2];
    const n = cols.length, A = Array.from({ length: n }, () => Array(n + 1).fill(0));
    pts.forEach((p, k) => cols.forEach((ci, i) => {
      cols.forEach((cj, j) => { A[i][j] += rows[k][ci] * rows[k][cj]; });
      A[i][n] += rows[k][ci] * p.V;
    }));
    for (let i = 0; i < n; i++){                         // 高斯消去
      for (let r2 = i + 1; r2 < n; r2++){ const f = A[r2][i] / A[i][i]; for (let c = i; c <= n; c++) A[r2][c] -= f * A[i][c]; }
    }
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--){ let s = A[i][n]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    const coef = oneDir ? { kS: null, kGplusS: x[0], kV: x[1] } : { kS: x[0], kG: x[1], kV: x[2] };
    const pred = p => oneDir ? coef.kGplusS + coef.kV * p.v : coef.kS * (Math.sign(p.v) || p.dir) + coef.kG + coef.kV * p.v;
    const mean = pts.reduce((a, p) => a + p.V, 0) / pts.length;
    const ssr = pts.reduce((a, p) => a + (p.V - pred(p)) ** 2, 0), sst = pts.reduce((a, p) => a + (p.V - mean) ** 2, 0);
    return { ...coef, oneDir, r2: 1 - ssr / sst, rmse: Math.sqrt(ssr / pts.length), pred };
  }

  function draw(pts, f){
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 640, H = Math.max(220, Math.round(W * 0.4));
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext("2d"), k = plotColors(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const L = 44, R = 10, T = 10, B = 28, vx = [-1.7, 1.7], vy = [-3.2, 4.2];
    const X = v => L + (v - vx[0]) / (vx[1] - vx[0]) * (W - L - R), Y = V => T + (1 - (V - vy[0]) / (vy[1] - vy[0])) * (H - T - B);
    ctx.strokeStyle = k.line; ctx.fillStyle = k.ink2; ctx.font = "12px system-ui,sans-serif"; ctx.lineWidth = 1;
    [-3, -2, -1, 0, 1, 2, 3, 4].forEach(V => { ctx.beginPath(); ctx.moveTo(L, Y(V)); ctx.lineTo(W - R, Y(V)); ctx.stroke(); ctx.fillText(V + " V", 4, Y(V) + 4); });
    [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].forEach(v => { ctx.textAlign = "center"; ctx.fillText(v, X(v), H - 8); });
    ctx.textAlign = "right"; ctx.fillText("速度 m/s", W - R, H - B - 4); ctx.textAlign = "left";
    ctx.fillStyle = k.a; pts.forEach(p => { ctx.beginPath(); ctx.arc(X(p.v), Y(p.V), 2.2, 0, 7); ctx.fill(); });
    ctx.strokeStyle = k.b; ctx.lineWidth = 2;
    for (const dir of f.oneDir ? [1] : [1, -1]){
      ctx.beginPath();
      for (let i = 0; i <= 20; i++){ const v = dir * (0.02 + i * 0.08); const V = f.pred({ v, dir }); i ? ctx.lineTo(X(v), Y(V)) : ctx.moveTo(X(v), Y(V)); }
      ctx.stroke();
    }
  }

  function update(){
    view.querySelectorAll(".sid").forEach(b => b.setAttribute("aria-pressed", String(on[b.dataset.sid])));
    const pts = makeData(), f = fit(pts);
    draw(pts, f);
    const pct = (a, b) => `${a >= b ? "+" : ""}${((a - b) / b * 100).toFixed(0)}%`;
    const lines = f.oneDir
      ? [`kG + kS = ${f.kGplusS.toFixed(3)} V（真實 ${(TRUE.kG + TRUE.kS).toFixed(2)}）`, `kV = ${f.kV.toFixed(3)} V/(m/s)（真實 ${TRUE.kV}，${pct(f.kV, TRUE.kV)}）`, "只有一個方向：kS 和 kG 分不開，只能得到兩者的和"]
      : [`kS = ${f.kS.toFixed(3)} V（真實 ${TRUE.kS}，${pct(f.kS, TRUE.kS)}）`, `kG = ${f.kG.toFixed(3)} V（真實 ${TRUE.kG}，${pct(f.kG, TRUE.kG)}）`, `kV = ${f.kV.toFixed(3)} V/(m/s)（真實 ${TRUE.kV}，${pct(f.kV, TRUE.kV)}）`];
    con.innerHTML = lines.map(l => `<span class="c">// ${esc(l)}</span>`).join("\n") +
      `\n<span class="c">// 擬合品質：電壓 r² = ${f.r2.toFixed(3)}，RMSE = ${f.rmse.toFixed(3)} V</span>` +
      (on.limit ? `\n<span class="c">// 撞到極限的點速度是 0、電壓卻很高，主要把截距（kS、kG）拉偏，r² 也明顯下降</span>` : "") +
      (on.tail ? `\n<span class="c">// 還沒動的點集中在速度 0 附近，讓 kS 被低估</span>` : "") +
      (on.noise ? `\n<span class="c">// 雜訊讓 RMSE 變大、r² 下降，每個參數的誤差都變大；這一組偏得不多，但換一次測試結果就會不同，所以要看圖和指標，不能只看數字</span>` : "");
  }
  view.querySelectorAll(".sid").forEach(b => b.onclick = () => { on[b.dataset.sid] = !on[b.dataset.sid]; update(); });
  update();
}

registerLab(15, initSysIdLab);
