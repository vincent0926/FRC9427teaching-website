/* ---------- routing ---------- */
const landing = document.getElementById("landing");
function setLanding(on){ landing.hidden = !on; document.body.classList.toggle("on-landing", on); }
function route(){
  const h = location.hash.replace("#", "");
  const m = h.match(/^ch(\d+)$/);
  setLanding(h === "");
  if (h === "") renderMap(null);
  else if (m){ const id = +m[1]; READY.includes(id) ? showChapter(id) : ALL.some(x => x[0] === id) ? showSoon(id) : showHome(); }
  else showHome();
  window.scrollTo(0, 0);
  closeMenu();
}
document.addEventListener("click", e => {
  const t = e.target.closest("[data-go]");
  if (!t) return;
  location.hash = t.dataset.go === "home" ? "home" : "ch" + t.dataset.go;
});
document.getElementById("startBtn").onclick = () => { location.hash = "home"; };
window.addEventListener("hashchange", route);

/* ---------- mobile menu ---------- */
const bus = document.getElementById("bus"), menuBtn = document.getElementById("menuBtn");
function closeMenu(){ bus.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
menuBtn.onclick = () => { const o = bus.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(o)); };
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

route();