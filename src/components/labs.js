/* ---------- 實驗與工具站任務 ----------
 * 站內實驗：依 course.json 的 labs 替每個 .lab 加上標題、目標、固定 id（#chN/lab-id 可以直接跳過來）、
 * 模擬限制說明，並記錄有沒有動手做過。
 * 工具站任務：依 tools 產生深層連結（直接進電梯或手臂、載入 3F 情境、捲到 4F 單元），並能勾選完成。
 */
const TOOL = COURSE_DATA.tool;

function toolUrl(task, chapterId){
  const q = new URLSearchParams({ track: task.track });
  if (task.scenario) q.set("scenario", task.scenario);
  if (task.section) q.set("section", task.section);
  q.set("from", "course");
  q.set("ch", String(chapterId));
  return `${TOOL.url}?${q}#${task.page}`;
}

const listHTML = items => items.length ? `<ul>${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "<p>無</p>";

function decorateLabs(chapterId){
  const meta = chapterById(chapterId).labs || [];
  view.querySelectorAll(".lab").forEach((el, i) => {
    const m = meta[i];
    if (!m) return;
    const key = `ch${chapterId}/${m.id}`;
    el.id = "lab-" + m.id;
    el.insertAdjacentHTML("beforebegin", `<div class="labhead"><span class="labtag">實驗</span><b>${esc(m.title)}</b><span class="labgoal">目標：${esc(m.objective)}</span></div>`);
    const note = m.kind === "model"
      ? `<details class="simnote"><summary>教學模擬：用簡化的模型說明觀念，不是 TalonFX 韌體或真實機構的數值重現，結果不代表實機一定會這樣。</summary>
          <div class="simgrid"><div><h4>有模擬</h4>${listHTML(m.modeled)}</div><div><h4>近似</h4>${listHTML(m.approximated)}</div><div><h4>沒有模擬</h4>${listHTML(m.omitted)}</div></div></details>`
      : `<p class="simnote logic">流程示意：只模擬程式的執行順序與邏輯，不含任何物理或硬體行為。</p>`;
    el.insertAdjacentHTML("beforeend", note);
    // 在實驗裡按過任何按鈕或拉過滑桿，就算動手做過
    const mark = () => { updateProgress(p => { p.labs[key] = p.labs[key] || new Date().toISOString(); }); };
    el.addEventListener("click", e => { if (e.target.closest("button")) mark(); });
    el.addEventListener("input", mark);
  });
}

function toolTasksHTML(chapterId){
  const tasks = chapterById(chapterId).tools || [];
  if (!tasks.length) return "";
  const done = loadProgress().tools;
  return `<section class="tooltasks" id="tool-tasks">
    <h2>到工具站實作</h2>
    <p>這一章的觀念在<a href="${TOOL.url}" target="_blank" rel="noopener">${esc(TOOL.name)}</a>可以實際操作。按下連結會直接打開對應的機構、情境或單元，做完再回來答小測驗。</p>
    <ol class="tasklist">${tasks.map((t, i) => {
      const key = `ch${chapterId}/${i}`;
      return `<li>
        <label class="taskdone"><input type="checkbox" data-task="${key}" ${done[key] ? "checked" : ""}> 做完了</label>
        <a class="tasklink" href="${toolUrl(t, chapterId)}" target="_blank" rel="noopener">${esc(t.title)}</a>
        <span class="tasktrack">${t.track === "arm" ? "手臂" : "電梯"}</span>
        <p>${esc(t.do)}</p>
        <p class="taskcheck">做完要能回答：${esc(t.check)}</p>
      </li>`; }).join("")}</ol>
  </section>`;
}

function insertToolTasks(chapterId){
  const html = toolTasksHTML(chapterId);
  if (!html) return;
  // 放在小測驗前面：先實作，再用小測驗檢查
  const quizH2 = [...view.querySelectorAll("h2")].find(h => h.textContent.trim() === "小測驗");
  if (quizH2) quizH2.insertAdjacentHTML("beforebegin", html); else view.insertAdjacentHTML("beforeend", html);
  view.querySelectorAll("[data-task]").forEach(cb => cb.onchange = () => {
    updateProgress(p => { if (cb.checked) p.tools[cb.dataset.task] = new Date().toISOString(); else delete p.tools[cb.dataset.task]; });
  });
}
