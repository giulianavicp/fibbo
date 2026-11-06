const API = 'https://generativelanguage.googleapis.com/v1beta/models';
const KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
export const CHAT_MODELS = (Deno.env.get('GEMINI_CHAT_MODELS') ?? 'gemini-3.1-flash-lite,gemini-3.5-flash,gemini-flash-lite-latest').split(',').map(m => m.trim()).filter(Boolean);
export const EMBED_MODEL = Deno.env.get('GEMINI_EMBED_MODEL') ?? 'gemini-embedding-001';
export const DIMENSIONS = 768;
const TIMEOUT_MS = 15_000;

export class GeminiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const retryable = (status: number) => status === 429 || status === 404 || status >= 500;

async function call(model: string, method: string, body: unknown) {
  if (!KEY) throw new GeminiError(500, 'GEMINI_API_KEY is not set');
  let res: Response;
  try {
    res = await fetch(`${API}/${model}:${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new GeminiError(504, `${model} timed out`);
  }
  if (res.ok) return res.json();
  throw new GeminiError(res.status, `${model}: ${(await res.text()).slice(0, 300)}`);
}

export async function embed(texts: string[], task: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50);
    let data;
    for (let attempt = 0; ; attempt++) {
      try {
        data = await call(EMBED_MODEL, 'batchEmbedContents', {
          requests: batch.map(text => ({ model: `models/${EMBED_MODEL}`, content: { parts: [{ text }] }, taskType: task, outputDimensionality: DIMENSIONS })),
        });
        break;
      } catch (e) {
        if (attempt >= 2 || !(e instanceof GeminiError) || !retryable(e.status)) throw e;
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    out.push(...data.embeddings.map((e: { values: number[] }) => e.values));
  }
  return out;
}

export type Turn = { role: 'user' | 'model'; text: string };

export async function generate(system: string, turns: Turn[], maxTokens = 1024): Promise<string> {
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: turns.map(t => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens + 2048 },
  };
  let last: unknown;
  for (const model of CHAT_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const data = await call(model, 'generateContent', body);
        const parts = data.candidates?.[0]?.content?.parts ?? [];
        const text = parts.filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text ?? '').join('').trim();
        if (text) return text;
        last = new GeminiError(502, `${model} returned no text`);
        break;
      } catch (e) {
        console.error(e instanceof Error ? e.message : e);
        last = e;
        if (!(e instanceof GeminiError) || !retryable(e.status)) throw e;
        if (e.status !== 503 || attempt === 1) break;
        await new Promise(r => setTimeout(r, 800));
      }
    }
  }
  throw last instanceof GeminiError && last.status === 429 ? last : new GeminiError(429, 'all models busy');
}
