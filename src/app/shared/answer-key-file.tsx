import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, Paperclip, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { C, font } from '../lib/tokens';
import type { Row } from '../lib/database.types';
import { keyFileProblem } from '../teacher/validation';

type KeyFile = Row<'answer_key_files'>;
type Activity = { id: string; course_id: string; due_at: string | null };

const safeName = (name: string) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '-').toLowerCase();
const btn = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.375rem 0.625rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontFamily: font } as const;

function useKeyFile(activityId: string) {
  const [file, setFile] = useState<KeyFile | null | undefined>(undefined);
  const load = () => supabase.from('answer_key_files').select('*').eq('activity_id', activityId).maybeSingle()
    .then(({ data }) => setFile(data ?? null));
  useEffect(() => { load(); }, [activityId]);
  return { file, reload: load };
}

async function openFile(path: string) {
  const { data, error } = await supabase.storage.from('answer-keys').createSignedUrl(path, 60);
  if (error || !data) return toast.error('Não foi possível abrir o gabarito.');
  window.open(data.signedUrl, '_blank', 'noopener');
}

export function TeacherAnswerKeyFile({ activity }: { activity: Activity }) {
  const { file, reload } = useKeyFile(activity.id);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (f: File) => {
    const problem = keyFileProblem(f);
    if (problem) return toast.error(problem);
    setBusy(true);
    const path = `${activity.course_id}/${activity.id}/${Date.now()}-${safeName(f.name)}`;
    const up = await supabase.storage.from('answer-keys').upload(path, f, { contentType: f.type });
    if (up.error) { setBusy(false); return toast.error('Falha no envio. Verifique sua conexão e tente novamente.'); }
    const row = await supabase.from('answer_key_files').upsert({ activity_id: activity.id, name: f.name, path, content_type: f.type, size_bytes: f.size });
    if (row.error) { await supabase.storage.from('answer-keys').remove([path]); setBusy(false); return toast.error('Não foi possível salvar o gabarito.'); }
    if (file) await supabase.storage.from('answer-keys').remove([file.path]);
    setBusy(false);
    toast.success('Gabarito enviado com sucesso!');
    reload();
  };

  const remove = async () => {
    if (!file || !confirm(`Remover o gabarito "${file.name}"?`)) return;
    const { error } = await supabase.from('answer_key_files').delete().eq('activity_id', activity.id);
    if (error) return toast.error('Não foi possível remover.');
    await supabase.storage.from('answer-keys').remove([file.path]);
    reload();
  };

  if (file === undefined) return null;
  return (
    <div style={{ marginTop: '0.625rem', paddingTop: '0.625rem', borderTop: `1px dashed ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ color: C.textSec, fontSize: '0.75rem' }}>Gabarito em arquivo:</span>
      {file ? (
        <>
          <button type="button" style={{ ...btn, color: C.title }} onClick={() => openFile(file.path)}><Download size={13} /> {file.name}</button>
          <button type="button" aria-label="Remover gabarito" style={{ ...btn, color: C.error }} onClick={remove}><Trash2 size={13} /></button>
        </>
      ) : <span style={{ color: C.textTer, fontSize: '0.75rem' }}>nenhum</span>}
      <button type="button" disabled={busy} style={{ ...btn, color: C.mid1 }} onClick={() => input.current?.click()}>
        <Paperclip size={13} /> {busy ? 'Enviando…' : file ? 'Substituir' : 'Anexar PDF ou imagem'}
      </button>
      <input ref={input} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }} />
      <span style={{ color: C.textTer, fontSize: '0.7rem', width: '100%' }}>Os alunos só conseguem baixar o arquivo depois do prazo.</span>
    </div>
  );
}

export function StudentAnswerKeyFile({ activityId }: { activityId: string }) {
  const { file } = useKeyFile(activityId);
  if (!file) return null;
  return (
    <button type="button" style={{ ...btn, color: C.title, marginTop: '0.5rem' }} onClick={() => openFile(file.path)}>
      <Download size={13} /> Baixar gabarito ({file.name})
    </button>
  );
}
