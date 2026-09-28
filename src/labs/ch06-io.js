/* ---------- ch6 parts & tree ---------- */
function initParts(){
  const order = ["A","B","C","D","E","F"];
  const names = { A:"觀念與全貌", B:"簡易版 IO", C:"硬體層", D:"模擬層", E:"AdvantageKit 版", F:"測試與常見錯誤" };
  const tabs = view.querySelectorAll(".parttabs [role=tab]");
  const pager = document.getElementById("partPager");
  const show = (k, scroll) => {
    view.querySelectorAll(".cpart").forEach(p => p.hidden = p.dataset.part !== k);
    tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.part === k)));
    const i = order.indexOf(k);
    pager.innerHTML =
      (i > 0 ? `<button class="btn ghost" data-p="${order[i-1]}">← ${order[i-1]}　${names[order[i-1]]}</button>` : "<span></span>") +
      (i < order.length - 1 ? `<button class="btn" data-p="${order[i+1]}">${order[i+1]}　${names[order[i+1]]} →</button>` : `<span style="color:var(--ink-2)">六個部分都讀完了，接著做下面的小測驗。</span>`);
    pager.querySelectorAll("[data-p]").forEach(b => b.onclick = () => show(b.dataset.p, true));
    if (scroll) view.querySelector(".parttabs").scrollIntoView({ block: "start" });
  };
  tabs.forEach(t => t.onclick = () => show(t.dataset.part, false));
  view.querySelectorAll(".pcard").forEach(c => c.onclick = () => show(c.dataset.part, true));
  show("A", false);
}
function initArchTree(){
  const info = {
    robot: ["Robot", "導師所在的學校作息。", "在 robotPeriodic() 呼叫 CommandScheduler.run()；AdvantageKit 版在建構子最前面設定並啟動 Logger。", "放機構邏輯、直接碰馬達。"],
    container: ["RobotContainer", "決定今天由誰點名。", "依執行環境選擇 IO 實作（硬體、模擬、空實作）並傳給 ArmSubsystem；綁定按鍵到 Command。", "呼叫 IO 方法、保存機構狀態。"],
    command: ["Command", "主任：要找班級必須透過導師。", "只呼叫 ArmSubsystem 的公開方法（setGoal、atGoal），並宣告 requirements。factory 和獨立類別兩種寫法都一樣。", "拿到 ArmIO 或 TalonFX。"],
    subsystem: ["ArmSubsystem", "導師：保存目標、看點名表做判斷。", "持有 ArmIO 和輸入物件；periodic() 裡先 updateInputs，再依模式送出目標；提供 atGoal() 和 Command factory。", "import CTRE 類別、直接操作 TalonFX、在 periodic 反覆套用設定。"],
    io: ["ArmIO（介面）", "班長這個職位的工作說明。", "定義硬體能做的事：updateInputs、setPositionGoal、setVoltage、stop、setBrakeMode、resetPosition。每個方法都有 default 空實作。", "包含「目標角度是多少」這類決策。"],
    state: ["ArmState（目標 enum）", "導師說的「去教室／操場／禮堂」。", "列出 STOW、INTAKE、SCORE，每個帶一個目標角度（手臂端弧度，0 = 水平）。", "放感測器讀值，那是輸入物件的工作。"],
    inputs: ["ArmIOInputs", "點名表。", "純資料：連線狀態、位置、速度、電壓、電流、溫度，單位固定。每個週期由 IO 層填寫一次。", "放方法或硬體物件。"],
    hw: ["ArmIOHardware", "實體課的班長。", "在 CANivore「9427」上建立兩顆 TalonFX，建構時套用一次共用設定、設定 Follower、重設編碼器；每輪 refreshAll 讀值、換算單位、送出 MotionMagic 請求。", "決定目標、寫等待迴圈。"],
    sim: ["ArmIOSim", "線上系統點名。", "繼承 ArmIOHardware，每輪用 SingleJointedArmSim 算出角度，寫回 TalonFXSimState，讓同一套 MotionMagic 設定在模擬中運作。", "使用和實機不同的單位。"],
    replay: ["new ArmIO() {}", "翻過去的點名簿。", "什麼都不做。重播時，Logger.processInputs() 會把日誌裡的數值填進輸入物件。", "—"],
    talon: ["TalonFX ×2", "班長自己控制怎麼走。", "leader 在控制器內部執行 MotionMagic（S-curve）與 kG 重力補償；follower 以 MotorAlignmentValue 跟隨 leader。", "—"],
    physics: ["SingleJointedArmSim", "線上課的虛擬教室。", "依輸入電壓、齒輪比、轉動慣量和重力，算出手臂的角度與角速度。", "—"],
    log: ["日誌檔", "點名簿。", "比賽時由 WPILOGWriter 寫入 USB 隨身碟，重播時由 WPILOGReader 讀回。", "—"]
  };
  const box = document.getElementById("nodeInfo");
  const nodes = view.querySelectorAll(".tnode");
  const pick = k => {
    nodes.forEach(n => n.setAttribute("aria-pressed", String(n.dataset.node === k)));
    const [t, story, should, shouldnt] = info[k];
    box.innerHTML = `<h4>${esc(t)}</h4><p><b>比喻：</b>${esc(story)}</p><p><b>負責：</b>${esc(should)}</p>` + (shouldnt !== "—" ? `<p><b>不該做：</b>${esc(shouldnt)}</p>` : "");
  };
  nodes.forEach(n => n.onclick = () => pick(n.dataset.node));
  pick("subsystem");
}


/* ---------- ch6 lab ---------- */
function initEnvLab(){
  const con = document.getElementById("envConsole");
  const info = {
    real: { line: "arm = new ArmSubsystem(new ArmIOHardware());", src: "CANivore 9427 上兩顆 TalonFX 回報的位置、速度、電流", note: "Constants.currentMode == REAL" },
    sim: { line: "arm = new ArmSubsystem(new ArmIOSim());", src: "SingleJointedArmSim 算出的角度，經 TalonFXSimState 由同一套 MotionMagic 控制", note: "在筆電上執行 Simulate Robot Code" },
    replay: { line: "arm = new ArmSubsystem(new ArmIO() {});", src: "日誌檔。Logger.processInputs() 把比賽當時記錄的數值填回 inputs", note: "Constants.currentMode == REPLAY，IO 什麼都不做" }
  };
  const set = env => {
    view.querySelectorAll(".env").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.env === env)));
    view.querySelectorAll(".impl").forEach(b => b.classList.toggle("on", b.dataset.impl === env));
    const i = info[env];
    con.innerHTML = `<span class="c">// ${esc(i.note)}</span>\n${highlight(i.line)}\n<span class="c">// inputs 的資料來自：${esc(i.src)}</span>\n<span class="c">// ArmSubsystem.java：0 行修改</span>`;
  };
  view.querySelectorAll(".env").forEach(b => b.onclick = () => set(b.dataset.env));
  set("real");
}

registerLab(6, initParts, initArchTree, initEnvLab);
