/* ---------- ch1 lab ---------- */
function initRollerLab(){
  const objs = { intake: { name: "Intake", voltage: 0 }, feeder: { name: "Feeder", voltage: 0 } };
  const con = document.getElementById("console");
  const paint = key => {
    const o = objs[key], el = document.getElementById("obj-" + key);
    el.innerHTML = `<div class="obj-name">${key} : Roller</div>name = "${o.name}"<br>voltage = <span class="${o.voltage ? "on" : ""}">${o.voltage.toFixed(1)}</span>`;
  };
  const flash = key => { const el = document.getElementById("obj-" + key); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 400); };
  const log = html => { con.innerHTML += html + "\n"; con.scrollTop = con.scrollHeight; };
  paint("intake"); paint("feeder");
  con.innerHTML = '<span class="c">// Roller intake = new Roller("Intake");\n// Roller feeder = new Roller("Feeder");\n// Roller shooter;   ← 只宣告，沒有 new</span>\n';
  view.querySelectorAll(".call[data-call]").forEach(b => b.onclick = () => {
    const call = b.dataset.call;
    const [, key, method, arg] = call.match(/^(\w+)\.(\w+)\(([-\d.]*)\)$/);
    if (!objs[key]){
      log(`&gt; ${esc(call)}\n<span class="err">Exception in thread "main" java.lang.NullPointerException:\n  Cannot invoke "Roller.run(double)" because "shooter" is null</span>`);
      return;
    }
    const o = objs[key];
    o.voltage = method === "run" ? Math.max(-12, Math.min(12, parseFloat(arg))) : 0;
    log(`&gt; ${esc(call)}   <span class="c">// ${key}.voltage = ${o.voltage.toFixed(1)}</span>`);
    paint(key); flash(key);
  });
}

registerLab(1, initRollerLab);
