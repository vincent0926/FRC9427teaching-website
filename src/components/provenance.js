/* ---------- 參數來源標籤 ----------
 * 章節裡（包括程式註解）寫 [SYSID]、[TUNED] 這類標記，顯示時換成標籤。
 * 分類和電梯／手臂調參工作站一致，另外加上 SIM（只在模擬中有意義）。
 */
const PROVENANCE = {
  "MODEL":        "由物理模型或機構規格算出的初始估計",
  "MODEL→SYSID":  "先用模型估計，再用系統鑑別（SysId）量出實際值",
  "MEASURED":     "直接在機構上量測",
  "MEASURED／SYSID": "直接量測，或由系統鑑別擬合得到",
  "SYSID":        "由系統鑑別（SysId）擬合得到",
  "TUNED":        "上機依回饋調整，沒有公式可以直接算準",
  "CONSTRAINT":   "為了安全或運動限制而決定的值",
  "SIM":          "只在模擬中有意義，不代表實機",
};
const PROV_RE = new RegExp(`\\[(${Object.keys(PROVENANCE).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\]`, "g");

function provBadge(tag){
  return `<span class="prov" data-prov="${tag}" title="${PROVENANCE[tag]}">${tag}</span>`;
}
/** 把畫面上文字裡的 [TAG] 換成標籤（只處理文字節點，不動 HTML 結構與事件） */
function applyProvenance(root){
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) if (PROV_RE.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
  for (const node of hits){
    PROV_RE.lastIndex = 0;
    const span = document.createElement("span");
    span.innerHTML = esc(node.nodeValue).replace(PROV_RE, (_, tag) => provBadge(tag));
    node.replaceWith(...span.childNodes);
  }
}
