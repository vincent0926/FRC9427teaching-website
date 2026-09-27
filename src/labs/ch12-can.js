/* ---------- ch12 lab ---------- */
function initCanLab(){
  const devs = [
    { name: "CANivore", sub: "9427・內建終端" },
    { name: "TalonFX 21", sub: "手臂主馬達", model: "fx", id: 21 },
    { name: "TalonFX 22", sub: "手臂從馬達", model: "fx", id: 22 },
    { name: "CANcoder 23", sub: "手臂角度", model: "cc", id: 23 },
    { name: "Pigeon 2 · 30", sub: "陀螺儀", model: "pg", id: 30 },
    { name: "120 Ω", sub: "末端終端電阻", term: true }
  ];
  let cut, noTerm, dupFx, dupCc;
  const box = document.getElementById("canChain"), con = document.getElementById("canConsole");
  const log = h => { con.innerHTML += h + "\n"; con.scrollTop = con.scrollHeight; };
  const c = t => `<span class="c">${esc(t)}</span>`;
  const firstCut = () => cut.findIndex(Boolean); // 第 i 段 = 裝置 i 與 i+1 之間
  const idOf = i => (i === 2 && dupFx) || (i === 3 && dupCc) ? 21 : devs[i].id;
  const paint = () => {
    box.innerHTML = devs.map((d, i) => {
      const off = d.term && noTerm;
      const node = `<div class="cnode${off ? " off" : ""}"><b>${esc(d.id ? d.name.replace(/\d+$/, idOf(i)) : d.name)}</b><small>${esc(off ? "（已拿掉）" : d.sub)}</small></div>`;
      if (i === devs.length - 1) return node;
      return node + `<button class="clink${cut[i] ? " cut" : ""}" data-seg="${i}" aria-pressed="${cut[i]}" aria-label="${esc(d.name)} 與 ${esc(devs[i + 1].name)} 之間的線，${cut[i] ? "已剪斷，點一下接回" : "點一下剪斷"}">${cut[i] ? "✂" : ""}</button>`;
    }).join("");
    box.querySelectorAll(".clink").forEach(b => b.onclick = () => {
      const i = +b.dataset.seg; cut[i] = !cut[i];
      log(c(`// ${devs[i].name} ↔ ${devs[i + 1].name}：${cut[i] ? "剪斷" : "接回"}`)); paint();
    });
    document.getElementById("canTerm").setAttribute("aria-pressed", String(noTerm));
    document.getElementById("canDupFx").setAttribute("aria-pressed", String(dupFx));
    document.getElementById("canDupCc").setAttribute("aria-pressed", String(dupCc));
  };
  const reset = () => {
    cut = devs.slice(1).map(() => false); noTerm = dupFx = dupCc = false;
    con.innerHTML = c("// 點裝置之間的線可以剪斷或接回，再用下面的按鈕檢查") + "\n"; paint();
  };
  document.getElementById("canTerm").onclick = () => { noTerm = !noTerm; log(c(noTerm ? "// 拿掉末端 120 Ω" : "// 裝回末端 120 Ω")); paint(); };
  document.getElementById("canDupFx").onclick = () => { dupFx = !dupFx; log(c(dupFx ? "// TalonFX 22 的 ID 改成 21" : "// TalonFX 的 ID 改回 22")); paint(); };
  document.getElementById("canDupCc").onclick = () => { dupCc = !dupCc; log(c(dupCc ? "// CANcoder 23 的 ID 改成 21" : "// CANcoder 的 ID 改回 23")); paint(); };
  document.getElementById("canOhm").onclick = () => {
    // 從 CANivore 端量：看得到的終端 = CANivore 自己 + 末端電阻（中間沒斷、也沒拿掉）
    const both = firstCut() === -1 && !noTerm;
    log(highlight("電錶（斷電）：CAN-H ↔ CAN-L = " + (both ? "60 Ω" : "120 Ω")));
    log(c(both ? "// 兩顆 120 Ω 並聯，正常" : firstCut() !== -1 ? "// 從這裡只看得到一顆終端：線在某處斷了" : "// 只有一端有終端：末端電阻不見了"));
  };
  document.getElementById("canScan").onclick = () => {
    const fc = firstCut();
    const reach = fc === -1 ? devs.length - 1 : fc; // 能通訊的最後一個裝置索引
    const oneTerm = fc !== -1 || noTerm;
    log(highlight("Tuner X：掃描 CANivore 9427"));
    devs.forEach((d, i) => {
      if (!d.model) return;
      const id = idOf(i);
      if (i > reach){ log(`<span class="err">  ✗ ${esc(d.name.replace(/\d+$/, id))}：找不到</span>`); return; }
      const clash = devs.some((o, j) => j !== i && j <= reach && o.model === d.model && idOf(j) === id);
      if (clash) log(`<span class="err">  ✗ ${esc(d.name.replace(/\d+$/, id))}：同型號 ID 重複（紅色卡片）</span>`);
      else log(`  ✓ ${esc(d.name.replace(/\d+$/, id))}` + (oneTerm ? c("　// 看得到，但只有一端終端，長線上可能時好時壞") : ""));
    });
    const label = i => devs[i].id ? devs[i].name.replace(/\d+$/, idOf(i)) : devs[i].name;
    if (fc !== -1) log(c(`// 最後一個還在：${label(fc)}；第一個不見：${label(fc + 1)}。問題在這兩者之間`));
    if (dupCc && !dupFx) log(c("// CANcoder 21 和 TalonFX 21 型號不同，不算衝突"));
  };
  document.getElementById("canReset").onclick = reset;
  reset();
}

registerLab(12, initCanLab);
