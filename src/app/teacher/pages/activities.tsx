import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, ClipboardList, Eye, EyeOff, FileText, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { C, gradeColor } from '../../lib/tokens';
import type { Row } from '../../lib/database.types';
import ActivityBuilder from '../activity-builder';
import { TeacherAnswerKeyFile } from '../../shared/answer-key-file';
import { useTeacherData, type Activity, type TeacherData } from '../data';
import { activityStats } from '../stats';
import { Button, CourseFilter, Empty, Page, card, fmtGrade, formatDate } from '../../shared/ui';

type QuestionWithKey = Row<'questions'> & { question_keys: Row<'question_keys'> | null };

function QuestionList({ activityId }: { activityId: string }) {
  const [items, setItems] = useState<QuestionWithKey[] | null>(null);
  useEffect(() => {
    supabase.from('questions').select('*, question_keys(*)').eq('activity_id', activityId).order('position')
      .then(({ data }) => setItems((data as unknown as QuestionWithKey[]) ?? []));
  }, [activityId]);
  if (items === null) return <p style={{ color: C.textSec, fontSize: '0.78rem' }}>Carregando questões…</p>;
  if (!items.length) return <p style={{ color: C.textSec, fontSize: '0.78rem' }}>Sem questões cadastradas.</p>;
  return (
    <ol style={{ margin: 0, paddingLeft: '1.125rem' }}>
      {items.map(q => (
        <li key={q.id} style={{ color: C.title, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          {q.prompt} {q.topic && <span style={{ color: C.textTer }}>· {q.topic}</span>}
          <div style={{ color: C.textSec, fontSize: '0.74rem', marginTop: '2px' }}>
            {q.kind === 'objective'
              ? <>Gabarito: <strong style={{ color: C.success }}>{q.question_keys?.correct_option}</strong> — {(q.options as string[] | null)?.map((o, i) => `${'ABCD'[i]}) ${o}`).join('  ')}</>
              : <>Palavras-chave: {q.question_keys?.keywords.join(', ')}</>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ActivityCard({ a, data, courseName }: { a: Activity; data: TeacherData; courseName: string }) {
  const { reload } = useTeacherData();
  const [open, setOpen] = useState(false);
  const s = activityStats(data, a.id);
  const overdue = a.due_at && new Date(a.due_at) < new Date();

  const togglePublished = async () => {
    const { error } = await supabase.from('activities').update({ published: !a.published }).eq('id', a.id);
    if (error) return toast.error('Não foi possível alterar.');
    reload();
  };
  const remove = async () => {
    if (!confirm(`Excluir "${a.title}"? Os envios e notas também serão apagados.`)) return;
    const { error } = await supabase.from('activities').delete().eq('id', a.id);
    if (error) return toast.error('Não foi possível excluir.');
    reload();
  };

  return (
    <div style={{ ...card, padding: '1rem 1.125rem', marginBottom: '0.625rem', opacity: a.published ? 1 : 0.7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.625rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: C.title, fontSize: '0.92rem', fontWeight: 700 }}>{a.title}</div>
          <div style={{ color: C.textSec, fontSize: '0.76rem', marginTop: '2px' }}>
            {courseName} · prazo {formatDate(a.due_at)}{overdue ? ' (encerrado)' : ''}{a.published ? '' : ' · oculta para alunos'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button onClick={togglePublished} aria-label={a.published ? 'Ocultar dos alunos' : 'Publicar para alunos'} title={a.published ? 'Ocultar dos alunos' : 'Publicar para alunos'} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.4375rem', padding: '0.375rem', cursor: 'pointer', color: C.textSec, display: 'flex' }}>{a.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>
          <button onClick={remove} aria-label="Excluir" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.4375rem', padding: '0.375rem', cursor: 'pointer', color: C.error, display: 'flex' }}><Trash2 size={14} /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', marginTop: '0.75rem' }}>
        {[
          ['Entregues', `${s.delivered}/${s.enrolled}`, C.title],
          ['Média', fmtGrade(s.avg), s.avg === null ? C.textSec : gradeColor(s.avg)],
          ['Aguardando nota', String(s.pending), s.pending ? C.pending : C.title],
        ].map(([l, v, color]) => (
          <div key={l} style={{ textAlign: 'center', background: C.bg, borderRadius: '0.5rem', padding: '0.5rem' }}>
            <div style={{ color, fontSize: '0.95rem', fontWeight: 700 }}>{v}</div>
            <div style={{ color: C.textTer, fontSize: '0.68rem' }}>{l}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setOpen(o => !o)} style={{ marginTop: '0.625rem', background: 'none', border: 'none', color: C.mid1, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {open ? 'Ocultar questões e gabarito' : 'Ver questões e gabarito'}
      </button>
      {open && <div style={{ marginTop: '0.625rem' }}><QuestionList activityId={a.id} /></div>}
      <TeacherAnswerKeyFile activity={a} />
    </div>
  );
}

export default function Activities({ data, kind }: { data: TeacherData; kind: 'atividade' | 'prova' }) {
  const { reload } = useTeacherData();
  const [building, setBuilding] = useState(false);
  const [courseId, setCourseId] = useState('');
  const label = kind === 'prova' ? 'Provas' : 'Atividades';
  const courseName = new Map(data.courses.map(c => [c.id, c.name]));
  const list = data.activities.filter(a => a.kind === kind && (!courseId || a.course_id === courseId));

  return (
    <Page
      title={label}
      subtitle="Cadastre as questões, o gabarito e as palavras-chave para a correção automática"
      actions={<>
        <CourseFilter courses={data.courses} value={courseId} onChange={setCourseId} />
        {data.courses.length > 0 && <Button onClick={() => setBuilding(b => !b)}><Plus size={14} /> {kind === 'prova' ? 'Nova prova' : 'Nova atividade'}</Button>}
      </>}
    >
      {building && <ActivityBuilder courses={data.courses} kind={kind} onCancel={() => setBuilding(false)} onDone={() => { setBuilding(false); reload(); }} />}
      {list.length === 0 && !building && (
        <Empty
          icon={kind === 'prova' ? <ClipboardList size={24} /> : <FileText size={24} />}
          title={`Nenhuma ${kind} cadastrada`}
          text={data.courses.length ? 'Crie uma para que os alunos possam responder e receber correção automática.' : 'Crie uma disciplina primeiro.'}
        />
      )}
      <div className="t-grid">
        {list.map(a => <ActivityCard key={a.id} a={a} data={data} courseName={courseName.get(a.course_id) ?? ''} />)}
      </div>
    </Page>
  );
}
