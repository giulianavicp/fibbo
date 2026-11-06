export type Draft = { kind: 'objective' | 'essay'; prompt: string; topic: string; options: string[]; correct: string; keywords: string };

export const keywordList = (raw: string) => raw.split(',').map(k => k.trim()).filter(Boolean);

export function questionProblem(q: Draft): string | null {
  if (!q.prompt.trim()) return 'enunciado vazio';
  if (q.kind === 'objective') {
    if (q.options.some(o => !o.trim())) return 'preencha as 4 alternativas';
    if (!q.correct) return 'marque a alternativa correta';
  } else if (keywordList(q.keywords).length === 0) return 'informe ao menos uma palavra-chave';
  return null;
}

export const KEY_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
export const KEY_FILE_MAX_BYTES = 10 * 1024 * 1024;

export function keyFileProblem(file: { type: string; size: number }): string | null {
  if (!KEY_FILE_TYPES.includes(file.type)) return 'Formato inválido. Envie o gabarito em PDF, PNG ou JPG.';
  if (file.size === 0) return 'O arquivo está vazio.';
  if (file.size > KEY_FILE_MAX_BYTES) return 'O arquivo passa de 10 MB.';
  return null;
}
