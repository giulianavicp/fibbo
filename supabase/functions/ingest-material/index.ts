import { extractText, getDocumentProxy } from 'npm:unpdf@0.12.1';
import { chunkText } from '../_shared/chunk.ts';
import { embed } from '../_shared/gemini.ts';
import { clients, cors, json } from '../_shared/http.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const { asUser, admin } = clients(req);

  const { data: auth } = await asUser.auth.getUser();
  if (!auth.user) return json({ error: 'unauthorized' }, 401);

  const { material_id } = await req.json().catch(() => ({}));
  if (!material_id) return json({ error: 'material_id required' }, 400);

  const { data: material } = await admin.from('materials').select('id, course_id, path, courses(teacher_id)').eq('id', material_id).single();
  const teacherId = (material?.courses as { teacher_id: string } | null)?.teacher_id;
  if (!material || teacherId !== auth.user.id) return json({ error: 'not allowed' }, 403);

  await admin.from('materials').update({ status: 'processing' }).eq('id', material.id);

  try {
    const { data: file, error } = await admin.storage.from('materials').download(material.path);
    if (error || !file) throw new Error('download failed');
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    const chunks = chunkText(Array.isArray(text) ? text.join('\n\n') : text);
    if (!chunks.length) throw new Error('no text found in pdf');

    const vectors = await embed(chunks, 'RETRIEVAL_DOCUMENT');
    await admin.from('material_chunks').delete().eq('material_id', material.id);
    const rows = chunks.map((content, i) => ({
      material_id: material.id,
      course_id: material.course_id,
      position: i,
      content,
      embedding: JSON.stringify(vectors[i]),
    }));
    for (let i = 0; i < rows.length; i += 100) {
      const { error: insertError } = await admin.from('material_chunks').insert(rows.slice(i, i + 100));
      if (insertError) throw insertError;
    }
    await admin.from('materials').update({ status: 'ready', chunk_count: chunks.length }).eq('id', material.id);
    return json({ status: 'ready', chunks: chunks.length });
  } catch (e) {
    console.error(e);
    await admin.from('materials').update({ status: 'error' }).eq('id', material.id);
    return json({ status: 'error', error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
