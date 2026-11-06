export function chunkText(raw: string, size = 1200, overlap = 200): string[] {
  const text = raw.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (!text) return [];
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = '';
  for (const p of paragraphs) {
    const piece = p.trim();
    if (!piece) continue;
    if (current && current.length + piece.length + 2 > size) {
      chunks.push(current);
      current = current.slice(-overlap);
    }
    current = current ? `${current}\n\n${piece}` : piece;
    while (current.length > size * 1.5) {
      chunks.push(current.slice(0, size));
      current = current.slice(size - overlap);
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}
