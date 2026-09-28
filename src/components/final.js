/* ---------- 最終程式能力評量（#final） ----------
 * 七個問題自由作答，送出後顯示參考解答與評分表。評分表逐項勾選，
 * 看的是推理、證據與除錯流程；上機前的安全檢查（第 7 題）一定要過。
 */
const FINAL_QUESTIONS = [
  { q: "發生了什麼事？", hint: "用一兩句話描述你認為的根本原因與它造成的結果。", weight: 2,
    ref: "手臂 leader TalonFX（ID 21）在 6.1 秒被撞後失去電源；follower 跟隨 leader，leader 不見後也沒有輸出，所以手臂失去出力掉下來，之後整場無法控制。",
    rubric: ["指出是 leader（ID 21）失去電源，而不只是「手臂壞了」", "說明 follower 為什麼也停止出力（它跟隨 leader）"] },
  { q: "哪些證據支持你的判斷？", hint: "列出具體的欄位、數值或觀察，並說它們代表什麼。", weight: 3,
    ref: "LeaderConnected 從 6.1 秒起一直 false；PDH 上 leader 那一路 0 A；Pit 裡 leader 的 LED 完全不亮；Follower 有連線但輸出 0 V；目標會變但角度不動，代表程式還在下命令。",
    rubric: ["用到斷線證據（LeaderConnected、Alert 或 Tuner X 看不到 ID 21）", "用到電源證據（PDH 電流 0 A 或 LED 不亮）", "解釋 follower 有連線卻是 0 V"] },
  { q: "問題最可能出在哪一層或哪個子系統？哪些可能性可以排除？", hint: "程式、控制參數、CAN 匯流排、電源、機構……逐一說明。", weight: 3,
    ref: "硬體的電源層。可以排除：程式（GitSHA 與上一場相同、dirty 為 false，上一場正常）；控制參數（沒改過，而且馬達根本沒有輸出）；整條 CAN 匯流排（其他裝置整場都在）；brownout（最低 10.9 V、12V fault 為 0）。IO 層有正確回報斷線。",
    rubric: ["判斷是電源／硬體，而不是程式或 PID", "用證據排除程式（GitSHA 相同）或 brownout（電壓與 fault 計數）", "用證據排除整條 CAN 匯流排（其他裝置都在）"] },
  { q: "第一個要檢查的是什麼？", hint: "具體到零件或接點。", weight: 2,
    ref: "斷電後檢查 leader 的電源線：PDH 端的接頭與斷路器、馬達端的電源接頭，並逐條做拉線測試，特別是機構組換軸時拆過的線。",
    rubric: ["斷電後檢查 leader 的電源線路（PDH 接點、斷路器、馬達端接頭）", "提到拉線測試或兩場之間被拆過的位置"] },
  { q: "為什麼先檢查這個？", hint: "說明你排序的理由。", weight: 2,
    ref: "它能解釋所有證據（LED 不亮、0 A、只有 ID 21 不見），檢查起來又快；而且兩場之間剛好有人動過這一區的線。",
    rubric: ["理由是「能解釋全部證據」", "理由是「容易檢查」或「最近有人動過」"] },
  { q: "建議做什麼修改？", hint: "硬體、程式或流程都可以，說明哪些不該改。", weight: 2,
    ref: "重新壓接或鎖緊鬆掉的電源接點，把線固定並做好應力釋放。不要改 PID 或其他參數。程式可以另外加強（非必要）：leader 斷線時把手臂目標改成安全狀態、在 Pit 檢查清單加上這個機構的拉線測試。",
    rubric: ["修電源接點並固定線材", "明確說不需要改 PID 或控制參數"] },
  { q: "上機前一定要確認什麼？", hint: "修好之後、Enable 之前。", weight: 3, safety: true,
    ref: "Tuner X 看得到 ID 21 且 LED 正常、斷線 Alert 消失；手臂周圍淨空、有人顧 Disable 和緊急停止；軟體極限與電流限制開著；先用低電壓確認兩顆馬達方向一致（Follower 的 Opposed 設定仍正確）；用網路線連著做搖線與抬起放下測試，確認不會再斷。",
    rubric: ["確認裝置回來了（Tuner X、LED 或 Alert 消失）", "安全措施：周圍淨空、有人顧 Disable／緊急停止、限制開著", "低電壓確認方向（兩顆馬達沒有互相對抗）", "重現測試：搖線或抬起放下，確認不會再斷"] },
];

function initFinal(){
  const form = document.getElementById("finalForm");
  const saved = loadProgress().final || {};
  const answers = saved.answers || [];
  form.innerHTML = FINAL_QUESTIONS.map((x, i) => `
    <div class="fq">
      <label for="fa${i}"><b>${i + 1}. ${esc(x.q)}</b>${x.safety ? '<span class="must">安全題，一定要過</span>' : ""}<span class="fhint">${esc(x.hint)}</span></label>
      <textarea id="fa${i}" rows="3">${esc(answers[i] || "")}</textarea>
    </div>`).join("");
  form.addEventListener("input", () => updateProgress(p => {
    p.final = { ...(p.final || {}), answers: FINAL_QUESTIONS.map((_, i) => document.getElementById("fa" + i).value) };
  }));
  const tl = document.getElementById("finalToolLink");
  if (tl) tl.href = toolUrl({ track: "elevator", page: "learn", section: "unit4" }, 19);
  document.getElementById("finalSubmit").onclick = () => {
    const empty = FINAL_QUESTIONS.filter((_, i) => !document.getElementById("fa" + i).value.trim()).length;
    const msg = document.getElementById("finalMsg");
    if (empty) { msg.textContent = `還有 ${empty} 題沒寫。每一題都寫了再送出。`; return; }
    msg.textContent = "";
    showFinalReview();
  };
  drawFinalPlots();
  if (saved.submittedAt) showFinalReview();
}

function showFinalReview(){
  const saved = loadProgress().final || {};
  const checks = saved.checks || {};
  document.getElementById("finalReview").innerHTML = `
    <h2>參考解答與評分表</h2>
    <p>逐題對照，勾選你的答案有涵蓋的項目。重點是有沒有用證據推理，用字不必一樣。</p>
    ${FINAL_QUESTIONS.map((x, i) => `
      <div class="frev">
        <p><b>${i + 1}. ${esc(x.q)}</b>（${x.weight} 分）</p>
        <p class="fmine">你的答案：${esc(document.getElementById("fa" + i).value)}</p>
        <p class="fref">參考：${esc(x.ref)}</p>
        <ul class="rubric">${x.rubric.map((r, j) => `<li><label><input type="checkbox" data-k="${i}-${j}" ${checks[`${i}-${j}`] ? "checked" : ""}> ${esc(r)}</label></li>`).join("")}</ul>
      </div>`).join("")}
    <p class="fscore" id="finalScore"></p>
    <p><button class="btn ghost" id="finalExport">下載作答紀錄給教練</button></p>`;
  const recompute = () => {
    const c = {};
    document.querySelectorAll("#finalReview [data-k]").forEach(cb => { if (cb.checked) c[cb.dataset.k] = true; });
    let got = 0, total = 0, safetyOk = true;
    FINAL_QUESTIONS.forEach((x, i) => {
      const n = x.rubric.filter((_, j) => c[`${i}-${j}`]).length;
      got += x.weight * n / x.rubric.length; total += x.weight;
      if (x.safety && n < Math.ceil(x.rubric.length / 2)) safetyOk = false;
    });
    const pct = Math.round(100 * got / total);
    const pass = pct >= 70 && safetyOk;
    document.getElementById("finalScore").textContent = `得分 ${pct} / 100。` +
      (pass ? "通過：推理、證據和安全檢查都到位。" : !safetyOk ? "未通過：上機前的安全檢查至少要涵蓋一半的項目。" : "未通過：70 分以上才算通過，回頭看缺少的證據與推理。");
    updateProgress(p => { p.final = { ...(p.final || {}), checks: c, score: pct, pass, submittedAt: (p.final && p.final.submittedAt) || new Date().toISOString() }; });
  };
  document.querySelectorAll("#finalReview [data-k]").forEach(cb => cb.onchange = recompute);
  document.getElementById("finalExport").onclick = () => exportProgress();
  recompute();
}

/* 教學用的合成日誌資料（不是真實比賽紀錄） */
function drawFinalPlots(){
  const k = plotColors();
  const goal = [], act = [], lv = [], fv = [];
  const goalAt = t => t < 2 ? 0.1 : t < 15 ? 1.66 : t < 20 ? 0.26 : t < 26 ? 1.66 : 0.1;
  let pos = 0.1;
  for (let i = 0; i <= 300; i++){
    const t = i / 10, g = goalAt(t);
    if (t < 6.1) pos += Math.max(-0.08, Math.min(0.08, (g - pos) * 0.35));
    else pos = Math.max(0.08, pos - 0.12);   // 失去出力，掉到接近收起的位置後被機構擋住
    goal.push([t, g * 57.3]); act.push([t, pos * 57.3]);
    const v = t < 6.1 ? (t < 4.5 && t > 2 ? 7.5 : 1.3) : 1.3;   // leader 最後一個值不再更新
    lv.push([t, v]); fv.push([t, t < 6.1 ? v : 0]);
  }
  drawPlot(document.getElementById("finalPlotPos"), [{ pts: goal, color: k.b, dash: [6, 4] }, { pts: act, color: k.a }], 30, -10, 110, "時間 s", "角度 °");
  drawPlot(document.getElementById("finalPlotDev"), [{ pts: fv, color: k.b, dash: [6, 4] }, { pts: lv, color: k.a }], 30, -2, 10, "時間 s", "電壓 V");
}
