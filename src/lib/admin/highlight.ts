/** Wraps policy-matched words in <mark> inside already-sanitised HTML, touching text only (never tags). */
export function highlightHtml(html: string, words: string[]): string {
  const uniq = [...new Set(words.map((w) => w.trim()).filter((w) => w.length > 1 && w !== '•••'))];
  if (!uniq.length) return html;
  const escaped = uniq.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'giu');
  return html.split(/(<[^>]+>)/g).map((part) => (part.startsWith('<') ? part : part.replace(re, '<mark>$1</mark>'))).join('');
}
