import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCheck, CheckSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { C, gradeColor } from '../../lib/tokens';
import { FeedbackList, useFeedback } from '../../shared/feedback';
import { useTeacherData, type Submission, type TeacherData } from '../data';
import { scope } from '../stats';
import { Button, CourseFilter, Empty, Page, Select, card, fmtGrade, initials } from '../../shared/ui';

function Review({ data, sub }: { data: TeacherData; sub: Submission }) {
  const { reload } = useTeacherData();
  const [version, setVersion] = useState(0);
  const { rows, error } = useFeedback(sub.id, version);
  const [saving, setSaving] = useState(false);
  const answerIds = new Map(data.answers.filter(a => a.submission_id === sub.id).map(a => [a.question_id, a.id]));

  const approve = async () => {
    setSaving(true);
    const { error: e } = await supabase.rpc('mark_reviewed', { submission: sub.id });
    setSaving(false);
    if (e) return toast.error('Não foi possível salvar.');
    toast.success('Correção revisada e salva!');
    reload();
  };

  if (error) return <p style={{ color: C.error, fontSize: '0.8rem' }}>Não foi possível carregar as respostas.</p>;
  if (!rows) return <Loader2 size={18} color={C.primary} className="animate-spin" />;
  return (
    <div style={{ marginTop: '0.875rem' }}>
      <FeedbackList rows={rows} answerIds={answerIds} onGradeChange={g => { toast.success(`Nota recalculada: ${g.toFixed(1)}`); setVersion(v => v + 1); reload(); }} />
      {!sub.reviewed && <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}><Button onClick={approve} loading={saving}><CheckSquare size={14} /> Marcar como revisada</Button></div>}
    </div>
  );
}

export default function Corrections({ data }: { data: TeacherData }) {
  const { reload } = useTeacherData();
  const [courseId, setCourseId] = useState('');
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [open, setOpen] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const { submissions } = scope(data, courseId || undefined);
  const list = submissions.filter(s => filter === 'all' || !s.reviewed).sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  const pending = submissions.filter(s => !s.reviewed);
  const activity = new Map(data.activities.map(a => [a.id, a]));
  const name = new Map(data.students.map(s => [s.id, s.full_name]));

  const approveAll = async () => {
    if (!confirm(`Aprovar a correção automática de ${pending.length} envio(s)?`)) return;
    setApproving(true);
    const results = await Promise.all(pending.map(s => supabase.rpc('mark_reviewed', { submission: s.id })));
    setApproving(false);
    if (results.some(r => r.error)) toast.error('Alguns envios não foram salvos.');
    else toast.success(`${pending.length} correções aprovadas!`);
    reload();
  };

  return (
    <Page
      title="Correções"
      subtitle={`${pending.length} envio(s) aguardando revisão das questões dissertativas`}
      actions={<>
        <CourseFilter courses={data.courses} value={courseId} onChange={setCourseId} />
        <Select value={filter} onChange={e => setFilter(e.target.value as 'pending' | 'all')} aria-label="Filtro" style={{ width: 'auto' }}>
          <option value="pending">Aguardando revisão</option>
          <option value="all">Todos os envios</option>
        </Select>
        <Button variant="ghost" onClick={approveAll} loading={approving} disabled={!pending.length}><CheckCheck size={14} /> Aprovar todas</Button>
      </>}
    >
      <p style={{ color: C.textSec, fontSize: '0.78rem', marginTop: '-0.5rem', marginBottom: '1rem', lineHeight: 1.5 }}>
        Todas as respostas já recebem nota automática no envio. Aqui você confere as dissertativas e pode ajustar a pontuação; a nota final é recalculada na hora.
      </p>
      {list.length === 0 && <Empty icon={<CheckSquare size={24} />} title={filter === 'pending' ? 'Tudo revisado' : 'Nenhum envio ainda'} text={filter === 'pending' ? 'Não há correções aguardando sua revisão.' : 'Os envios dos alunos aparecem aqui.'} />}
      {list.map(s => {
        const a = activity.get(s.activity_id);
        const student = name.get(s.student_id) ?? 'Aluno';
        const isOpen = open === s.id;
        return (
          <div key={s.id} style={{ ...card, padding: '0.875rem 1.125rem', marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
              <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSec, fontSize: '0.75rem', fontWeight: 700 }}>{initials(student)}</div>
              <div style={{ flex: 1, minWidth: '11.25rem' }}>
                <div style={{ color: C.title, fontSize: '0.85rem', fontWeight: 600 }}>{student}</div>
                <div style={{ color: C.textSec, fontSize: '0.77rem' }}>{a?.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4375rem', marginTop: '0.1875rem' }}>
                  <span style={{ background: a?.kind === 'prova' ? '#F0EDF8' : C.bg, color: a?.kind === 'prova' ? '#6D28D9' : C.textSec, fontSize: '0.65rem', borderRadius: '0.375rem', padding: '2px 0.4375rem', fontWeight: 600, border: `1px solid ${C.border}` }}>{a?.kind}</span>
                  <span style={{ color: C.textTer, fontSize: '0.7rem' }}>Enviado em {new Date(s.submitted_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  {s.reviewed && <span style={{ color: C.success, fontSize: '0.7rem', fontWeight: 600 }}>✓ revisada</span>}
                </div>
              </div>
              <div style={{ color: s.grade === null ? C.textSec : gradeColor(s.grade), fontSize: '1.2rem', fontWeight: 800 }}>{fmtGrade(s.grade)}</div>
              <Button variant="ghost" onClick={() => setOpen(isOpen ? null : s.id)}>{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {s.reviewed ? 'Ver' : 'Revisar'}</Button>
            </div>
            {isOpen && <Review data={data} sub={s} />}
          </div>
        );
      })}
    </Page>
  );
}
