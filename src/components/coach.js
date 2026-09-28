/* ---------- 教練彙整（#coach） ----------
 * 讀學生匯出的學習紀錄 JSON（見 progress.js 的 exportProgress），整理成一張表。只在瀏覽器裡處理。
 */
function summarizeProgress(snap){
  const done = snap.done || [], p = snap.progress || {};
  const pathStat = PATHS.map(path => `${path.chapters.filter(id => done.includes(id)).length}/${path.chapters.length}`);
  const quiz = Object.entries(p.quiz || {});
  const pctOf = q => q.total ? q.correct / q.total : 0;
  const avg = quiz.length ? quiz.reduce((a, [, q]) => a + pctOf(q), 0) / quiz.length : null;
  const weak = quiz.filter(([, q]) => pctOf(q) < 0.8).map(([ch]) => Number(ch)).sort((a, b) => a - b);
  const sawSolution = Object.entries(p.hints || {}).filter(([, n]) => n >= 4).map(([ch]) => Number(ch));
  return {
    name: snap.name || "（沒有名字）", at: (snap.exportedAt || "").slice(0, 10),
    paths: pathStat, quizAvg: avg, quizCount: quiz.length, weak,
    labs: Object.keys(p.labs || {}).length, tools: Object.keys(p.tools || {}).length,
    sawSolution, final: p.final && p.final.submittedAt ? `${p.final.score} 分${p.final.pass ? "（通過）" : "（未通過）"}` : "未作答",
  };
}

function initCoach(){
  const input = document.getElementById("coachFiles"), out = document.getElementById("coachResult");
  input.onchange = async () => {
    const rows = [], bad = [];
    for (const f of input.files){
      try {
        const snap = JSON.parse(await f.text());
        if (snap.course !== "frc9427-course") throw new Error("不是本課程的學習紀錄");
        rows.push(summarizeProgress(snap));
      } catch(e){ bad.push(`${f.name}：${e.message}`); }
    }
    rows.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
    out.innerHTML = (bad.length ? `<div class="note warn"><strong>有 ${bad.length} 個檔案讀不了</strong>${bad.map(esc).join("<br>")}</div>` : "") +
      (rows.length ? `<table class="map coach"><thead><tr><th>學生</th><th>匯出日期</th>${PATHS.map(p => `<th>${esc(p.name)}</th>`).join("")}<th>小測驗平均</th><th>未達 80% 的章</th><th>實驗</th><th>工具站任務</th><th>直接看解答的章</th><th>最終評量</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${esc(r.name)}</td><td>${esc(r.at)}</td>${r.paths.map(x => `<td>${x}</td>`).join("")}
          <td>${r.quizAvg === null ? "—" : Math.round(100 * r.quizAvg) + "%（" + r.quizCount + " 章）"}</td>
          <td>${r.weak.length ? r.weak.join("、") : "無"}</td><td>${r.labs}</td><td>${r.tools}</td>
          <td>${r.sawSolution.length ? r.sawSolution.join("、") : "無"}</td><td>${esc(r.final)}</td></tr>`).join("")}
        </tbody></table>
        <p class="mastery">「直接看解答的章」是看到完整解答的章節，不代表沒學會，但可以優先確認他能不能自己寫出來。小測驗只記最近一次作答。</p>` : "");
  };
}
