/** Split raw grounding text into overlapping chunks for embedding + retrieval. */
export function chunkText(text: string, targetChars = 900, overlapChars = 150): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  // Prefer splitting on paragraph/sentence boundaries so chunks stay coherent.
  const paragraphs = clean.split(/\n{2,}/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length <= targetChars) {
      current = current ? `${current}\n\n${para}` : para;
      continue;
    }
    if (current) chunks.push(current);
    if (para.length <= targetChars) {
      current = para;
    } else {
      // Paragraph itself is too long — hard-split with overlap.
      let start = 0;
      while (start < para.length) {
        const end = Math.min(start + targetChars, para.length);
        chunks.push(para.slice(start, end));
        start = end - overlapChars;
        if (start < 0 || end === para.length) break;
      }
      current = "";
    }
  }
  if (current) chunks.push(current);

  return chunks.length ? chunks : [clean.slice(0, targetChars)];
}
