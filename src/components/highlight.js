/* ---------- syntax highlight ---------- */
const KW = "public|private|protected|final|static|class|new|return|void|double|int|boolean|import|package|this|super|if|else|interface|extends|implements|enum|switch|case|default|throw|true|false|null";
const TOKEN = new RegExp(`(\\/\\/.*$)|("(?:[^"\\\\]|\\\\.)*")|(@[A-Za-z]+)|\\b(${KW})\\b|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Z][A-Za-z0-9_]*)\\b`, "gm");
const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function highlight(src){
  let out = "", last = 0, m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))){
    out += esc(src.slice(last, m.index));
    const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "n" : m[4] ? "k" : m[5] ? "n" : "t";
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    last = TOKEN.lastIndex;
  }
  return out + esc(src.slice(last));
}

