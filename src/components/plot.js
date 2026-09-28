/* 共用的折線圖（第 13、14 章實驗） */
function plotColors(){
  const cs = getComputedStyle(document.documentElement);
  return { ink: cs.getPropertyValue("--ink").trim(), ink2: cs.getPropertyValue("--ink-2").trim(), line: cs.getPropertyValue("--line").trim(),
    a: cs.getPropertyValue("--blue").trim(), b: cs.getPropertyValue("--can-h").trim(), bg: cs.getPropertyValue("--bg").trim() };
}
function drawPlot(cv, series, xMax, yMin, yMax, xLabel, yLabel){
  // 依實際顯示寬度與像素密度繪製，手機上文字才不會被縮得太小
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 640, H = Math.max(200, Math.round(W * 0.375));
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const ctx = cv.getContext("2d"), L = 48, R = 12, T = 12, B = 30, k = plotColors();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const X = x => L + (x / xMax) * (W - L - R), Y = y => T + (1 - (y - yMin) / (yMax - yMin)) * (H - T - B);
  ctx.strokeStyle = k.line; ctx.lineWidth = 1; ctx.fillStyle = k.ink2; ctx.font = "12px system-ui,sans-serif";
  for (let i = 0; i <= 4; i++){ const y = yMin + (yMax - yMin) * i / 4; ctx.beginPath(); ctx.moveTo(L, Y(y)); ctx.lineTo(W - R, Y(y)); ctx.stroke(); ctx.fillText(y.toFixed(yMax - yMin < 5 ? 2 : 0), 4, Y(y) + 4); }
  for (let i = 0; i <= 4; i++){ const x = xMax * i / 4; ctx.textAlign = i === 0 ? "left" : i === 4 ? "right" : "center"; ctx.fillText(x.toFixed(2), X(x), H - 10); }
  ctx.textAlign = "right"; ctx.fillText(xLabel, W - R, H - B - 6); ctx.textAlign = "left"; ctx.fillText(yLabel, L + 4, T + 12);
  series.forEach(s => {
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
    ctx.beginPath(); s.pts.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke();
  });
  ctx.setLineDash([]);
}
