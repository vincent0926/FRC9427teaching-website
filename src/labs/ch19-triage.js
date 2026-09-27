/* 第 19 章：Pit 分診 */
function initTriageLab(){
  const info = {
    nomove: ["整台都不動", ["看 Driver Station 三個燈：Communications、Robot Code、Joysticks 是否都是綠的。", "Robot Code 是紅的 → 程式沒在跑，看 Console 有沒有例外；必要時重新部署已知可以動的版本。", "Communications 是紅的 → 看 DS Log 判斷是 roboRIO 重開、無線電還是網路線。", "都綠但不動 → 確認真的 Enable 了、模式正確，搖桿的 USB 順序沒有跑掉。"]],
    onemech: ["一個機構不動", ["看儀表板有沒有該機構的斷線 Alert（第 12 章）。", "用 Tuner X 掃描，看裝置是否消失；消失的從哪一顆開始？（daisy-chain）", "看該馬達的斷路器、電源線有沒有鬆。", "裝置都在 → 看 AdvantageScope 裡該機構的目標和輸出電壓：程式有沒有送出命令？是不是被軟體極限或電流限制擋住？"]],
    disconnect: ["場上斷線", ["打開 DS Log Viewer 找到那一場。", "有「Time since robot boot」事件、其他裝置 ping 得到只有 roboRIO 不回應 → roboRIO 重開，查 roboRIO 電源線與 brownout。", "對照文件的圖例判斷是否為無線電重開或網路線問題：檢查無線電電源、網路線卡榫有沒有斷。", "在 Pit 用網路線連著、通電搖線，嘗試重現。"]],
    weak: ["越打越無力、偶爾重開", ["看 CAN/Power 分頁 12V fault 計數，和 DS Log 的電壓曲線。", "換一顆確定充飽的電池，檢查電池接頭與主斷路器螺帽。", "檢查各馬達的電流限制是否設定並啟用（第 11 章）。", "看哪些機構同時大電流：考慮在程式裡讓它們不要同時動作。"]],
    auto: ["自動程式走錯", ["確認選單選的是對的 Auto，不是 None。", "確認機器人擺放位置和 Auto 起點一致、DS 的聯盟顏色正確（第 16 章）。", "看 AdvantageScope 2D Field：規劃的路徑和實際位置差多少？一開始就偏 → 起始位置或陀螺儀；越走越偏 → 里程計、Robot Config 或 PID。", "Named Command 沒執行 → 名字大小寫是否和 GUI 一致、是否在建立 Auto 前註冊。"]],
    vision: ["瞄準不準", ["看相機畫面是否正常、曝光是否適合場地燈光。", "看 AdvantageScope：視覺估計的位置和里程計差多少？Accepted / Rejected 計數有沒有增加（第 17 章）？", "確認相機裝設位置的設定和實際一致，相機支架有沒有被撞歪。", "只有某些距離不準 → 調整標準差與距離的關係。"]]
  };
  const box = document.getElementById("triInfo"), btns = view.querySelectorAll(".tri");
  const pick = k => {
    btns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tri === k)));
    const [t, steps] = info[k];
    box.innerHTML = `<h4>${esc(t)}：依序檢查</h4><ol>${steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>`;
  };
  btns.forEach(b => b.onclick = () => pick(b.dataset.tri));
  box.innerHTML = "<p>選一個症狀，看看要依序檢查什麼。</p>";
}

registerLab(19, initTriageLab);
