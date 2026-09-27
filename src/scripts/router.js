/* ---------- routing ---------- */
const landing = document.getElementById("landing");
function setLanding(on){ landing.hidden = !on; document.body.classList.toggle("on-landing", on); }
function route(){
  const h = location.hash.replace("#", "");
  // #chN 或 #chN/錨點（例如 #ch13/pid 捲到實驗、#ch13/tool-tasks 捲到工具站任務）
  const m = h.match(/^ch(\d+)(?:\/([A-Za-z0-9_-]+))?$/);
  setLanding(h === "");
  if (h === "") renderMap(null);
  else if (h === "final") showFinal();
  else if (h === "coach") showCoach();
  else if (m){ const id = +m[1]; READY.includes(id) ? showChapter(id) : ALL.some(x => x[0] === id) ? showSoon(id) : showHome(); }
  else showHome();
  const anchor = m && m[2] && (document.getElementById("lab-" + m[2]) || document.getElementById(m[2]));
  if (anchor) anchor.scrollIntoView({ block: "start" }); else window.scrollTo(0, 0);
  closeMenu();
}
document.addEventListener("click", e => {
  const t = e.target.closest("[data-go]");
  if (!t) return;
  location.hash = ["home", "final", "coach"].includes(t.dataset.go) ? t.dataset.go : "ch" + t.dataset.go;
});
document.getElementById("startBtn").onclick = () => { location.hash = "home"; };
window.addEventListener("hashchange", route);

/* ---------- mobile menu ---------- */
const bus = document.getElementById("bus"), menuBtn = document.getElementById("menuBtn");
function closeMenu(){ bus.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
menuBtn.onclick = () => { const o = bus.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(o)); };
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

route();