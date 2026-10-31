import { safeHref } from "./util";

/**
 * Yazılar için küçük, güvenli bir biçimlendirici (HTML üretmez, React öğeleri üretir).
 * Desteklenen: ##/### başlık, paragraf, - madde, 1. liste, > alıntı, ``` kod bloğu,
 * **kalın**, *eğik*, `kod`, [bağlantı](adres).
 */

const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text, keyPrefix) {
  const out = [];
  let last = 0, i = 0, m;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0], key = `${keyPrefix}-${i++}`;
    if (m[1]) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (m[3]) out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else {
      const [, label, url] = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = safeHref(url);
      out.push(href
        ? <a key={key} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        : label);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderMarkdown(source) {
  const lines = String(source || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0, k = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push(<pre key={k++}><code>{code.join("\n")}</code></pre>);
      continue;
    }
    if (!line.trim()) { i++; continue; }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const Tag = `h${h[1].length + 1}`; // # → h2 (sayfada zaten bir h1 var)
      blocks.push(<Tag key={k++}>{inline(h[2], `h${k}`)}</Tag>);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={k++}>{inline(q.join(" "), `q${k}`)}</blockquote>);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ""));
      blocks.push(<ul key={k++}>{items.map((t, n) => <li key={n}>{inline(t, `u${k}-${n}`)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ""));
      blocks.push(<ol key={k++}>{items.map((t, n) => <li key={n}>{inline(t, `o${k}-${n}`)}</li>)}</ol>);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,3}\s|>\s?|[-*]\s+|\d+\.\s+)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={k++}>{inline(para.join(" "), `p${k}`)}</p>);
  }
  return blocks;
}
