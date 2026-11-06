import { useRef, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { BookOpen, Copy, Download, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { C, font, gradeColor } from '../../lib/tokens';
import { useTeacherData, type Course, type TeacherData } from '../data';
import { overview } from '../stats';
import { Button, Empty, Input, Label, Page, card, fmtGrade, formatDate } from '../../shared/ui';

const MAX_BYTES = 20 * 1024 * 1024;
const safeName = (name: string) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '-').toLowerCase();
const STATUS = {
  pending: { label: 'aguardando', color: C.pending, bg: C.pendingBg, hint: 'Ainda não processado' },
  processing: { label: 'lendo…', color: C.info, bg: C.infoBg, hint: 'A Katherine está lendo o PDF' },
  ready: { label: 'pronto', color: C.success, bg: C.successBg, hint: 'Disponível para a Katherine' },
  error: { label: 'erro', color: C.error, bg: C.errorBg, hint: 'Não foi possível ler o PDF (é escaneado?)' },
} as const;
const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

function NewCourseForm({ teacherId, onDone }: { teacherId: string; onDone: () => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [topics, setTopics] = useState('');
  const [unit, setUnit] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('courses').insert({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      unit: unit.trim(),
      teacher_id: teacherId,
      topics: topics.split(',').map(t => t.trim()).filter(Boolean),
    });
    setSaving(false);
    if (error) return toast.error('Não foi possível criar a disciplina.');
    toast.success('Disciplina criada!');
    onDone();
  };

  return (
    <form onSubmit={submit} style={{ ...card, marginBottom: '1.125rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11.25rem, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
      <div><Label htmlFor="c-code">Código</Label><Input id="c-code" required value={code} onChange={e => setCode(e.target.value)} placeholder="MAT005" /></div>
      <div><Label htmlFor="c-name">Nome</Label><Input id="c-name" required value={name} onChange={e => setName(e.target.value)} placeholder="Cálculo II" /></div>
      <div><Label htmlFor="c-unit">Unidade FATEC</Label><Input id="c-unit" required value={unit} onChange={e => setUnit(e.target.value)} placeholder="FATEC Mauá" /></div>
      <div><Label htmlFor="c-topics">Tópicos (separados por vírgula)</Label><Input id="c-topics" value={topics} onChange={e => setTopics(e.target.value)} placeholder="Séries, EDO" /></div>
      <Button type="submit" loading={saving} disabled={!code.trim() || !name.trim() || !unit.trim()}>Salvar</Button>
    </form>
  );
}

function Materials({ course, data }: { course: Course; data: TeacherData }) {
  const { reload } = useTeacherData();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const files = data.materials.filter(m => m.course_id === course.id);

  const upload = async (file: File) => {
    if (file.type !== 'application/pdf') return toast.error('Envie apenas arquivos PDF.');
    if (file.size > MAX_BYTES) return toast.error('O arquivo passa de 20 MB.');
    setUploading(true);
    const path = `${course.id}/${Date.now()}-${safeName(file.name)}`;
    const up = await supabase.storage.from('materials').upload(path, file, { contentType: 'application/pdf' });
    const row = up.error ? up : await supabase.from('materials').insert({ course_id: course.id, name: file.name, path, size_bytes: file.size }).select('id').single();
    setUploading(false);
    if (row.error || !row.data) return toast.error('Falha no envio. Tente novamente.');
    toast.success(`${file.name} enviado. A Katherine está lendo o material…`);
    reload();
    process(row.data.id, file.name);
  };

  const process = async (id: string, name: string) => {
    const { data: res, error } = await supabase.functions.invoke('ingest-material', { body: { material_id: id } });
    if (error) toast.error(`Não foi possível processar ${name}. Tente "Reprocessar".`);
    else toast.success(`${name} pronto: ${res.chunks} trechos disponíveis para a Katherine.`);
    reload();
  };

  const download = async (path: string) => {
    const { data: link, error } = await supabase.storage.from('materials').createSignedUrl(path, 60);
    if (error) return toast.error('Não foi possível abrir o arquivo.');
    window.open(link.signedUrl, '_blank', 'noopener');
  };

  const remove = async (id: string, path: string, name: string) => {
    if (!confirm(`Excluir ${name}?`)) return;
    await supabase.storage.from('materials').remove([path]);
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) return toast.error('Não foi possível excluir.');
    reload();
  };

  return (
    <div style={{ marginTop: '0.875rem', borderTop: `1px solid ${C.bg}`, paddingTop: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ color: C.title, fontSize: '0.8rem', fontWeight: 600 }}>Materiais de apoio (usados pela Katherine)</span>
        <Button variant="ghost" loading={uploading} onClick={() => input.current?.click()} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}><Upload size={13} /> Enviar PDF</Button>
        <input ref={input} type="file" accept="application/pdf" hidden onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
      </div>
      {files.length === 0 && <p style={{ color: C.textTer, fontSize: '0.75rem', margin: 0 }}>Nenhum material enviado.</p>}
      {files.map(m => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0' }}>
          <FileText size={15} color={C.mid1} />
          <span style={{ flex: 1, color: C.title, fontSize: '0.8rem' }}>{m.name}</span>
          <span style={{ color: C.textTer, fontSize: '0.7rem' }}>{fmtSize(m.size_bytes)} · {formatDate(m.created_at)}</span>
          <span title={STATUS[m.status].hint} style={{ fontSize: '0.66rem', fontWeight: 600, borderRadius: '0.375rem', padding: '2px 0.4375rem', color: STATUS[m.status].color, background: STATUS[m.status].bg }}>{STATUS[m.status].label}</span>
          {(m.status === 'error' || m.status === 'pending') && <button onClick={() => process(m.id, m.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mid1, fontSize: '0.7rem', fontWeight: 600, padding: 0, fontFamily: font }}>Reprocessar</button>}
          <button aria-label={`Baixar ${m.name}`} onClick={() => download(m.path)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, display: 'flex' }}><Download size={14} /></button>
          <button aria-label={`Excluir ${m.name}`} onClick={() => remove(m.id, m.path, m.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, display: 'flex' }}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}

export default function Courses({ data, teacherId }: { data: TeacherData; teacherId: string }) {
  const { reload } = useTeacherData();
  const [creating, setCreating] = useState(false);

  const removeCourse = async (c: Course) => {
    if (!confirm(`Excluir ${c.name}? Atividades, notas e materiais desta disciplina serão apagados.`)) return;
    const { error } = await supabase.from('courses').delete().eq('id', c.id);
    if (error) return toast.error('Não foi possível excluir.');
    toast.success('Disciplina excluída.');
    reload();
  };

  const copy = (code: string) => navigator.clipboard.writeText(code).then(() => toast.success(`Código ${code} copiado`));

  return (
    <Page title="Disciplinas" subtitle="Compartilhe o código de acesso para os alunos entrarem" actions={<Button onClick={() => setCreating(v => !v)}><Plus size={14} /> Nova disciplina</Button>}>
      {creating && <NewCourseForm teacherId={teacherId} onDone={() => { setCreating(false); reload(); }} />}
      {data.courses.length === 0 && !creating && <Empty icon={<BookOpen size={24} />} title="Nenhuma disciplina" text="Crie a primeira disciplina para começar." />}
      <div className="t-grid">
      {data.courses.map(c => {
        const o = overview(data, c.id);
        const acts = data.activities.filter(a => a.course_id === c.id);
        return (
          <div key={c.id} style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: '0.875rem' }}>
            <div style={{ height: '0.25rem', background: C.primary }} />
            <div style={{ padding: '1.125rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: C.textTer, fontSize: '0.7rem' }}>{c.code}{c.unit ? ` · ${c.unit}` : ""}</div>
                  <div style={{ color: C.title, fontSize: '1rem', fontWeight: 700 }}>{c.name}</div>
                  {c.topics.length > 0 && <div style={{ color: C.textSec, fontSize: '0.74rem', marginTop: '2px' }}>{c.topics.join(' · ')}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => copy(c.join_code)} title="Copiar código de acesso" style={{ background: '#F6EEE6', border: `1px dashed ${C.mid1}`, borderRadius: '0.5rem', padding: '0.375rem 0.625rem', color: C.primary, fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: font }}>
                    {c.join_code} <Copy size={12} />
                  </button>
                  <button onClick={() => removeCourse(c)} aria-label={`Excluir ${c.name}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, display: 'flex' }}><Trash2 size={15} /></button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
                {[
                  ['Alunos', String(o.students), C.title],
                  ['Atividades', String(acts.filter(a => a.kind === 'atividade').length), C.title],
                  ['Provas', String(acts.filter(a => a.kind === 'prova').length), C.title],
                  ['Média', fmtGrade(o.avg), o.avg === null ? C.textSec : gradeColor(o.avg)],
                ].map(([l, v, color]) => (
                  <div key={l} style={{ background: C.bg, borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ color, fontSize: '1.05rem', fontWeight: 700 }}>{v}</div>
                    <div style={{ color: C.textTer, fontSize: '0.68rem' }}>{l}</div>
                  </div>
                ))}
              </div>
              <Materials course={c} data={data} />
            </div>
          </div>
        );
      })}
      </div>
    </Page>
  );
}
