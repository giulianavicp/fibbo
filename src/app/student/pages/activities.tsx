import { useState } from 'react';
import { Calendar, ClipboardList, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { C, font, gradeColor } from '../../lib/tokens';
import { Empty, formatDate } from '../../shared/ui';
import ActivitySolver from '../activity-solver';
import { useStudentData, type StudentData } from '../data';
import { activityRows, type ActivityStatus } from '../stats';
import { Header, kindTag, sCard, statusBadge } from '../ui';

type Filter = 'all' | ActivityStatus;

export default function Activities({ data }: { data: StudentData }) {
  const { reload } = useStudentData();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');
  const courseId = params.get('disciplina');
  const solvingId = params.get('resolver');

  const rows = activityRows(data);
  const solving = rows.find(r => r.activity.id === solvingId && r.status !== 'submitted');
  if (solving) {
    return <ActivitySolver activity={solving.activity} course={solving.course} onSubmitted={reload} onClose={() => { params.delete('resolver'); setParams(params); }} />;
  }

  const order: Record<ActivityStatus, number> = { overdue: 0, pending: 1, submitted: 2 };
  const visible = rows
    .filter(r => (!courseId || r.course.id === courseId) && (filter === 'all' || r.status === filter))
    .sort((a, b) => order[a.status] - order[b.status] || (a.activity.due_at ?? '').localeCompare(b.activity.due_at ?? ''));
  const courseName = data.courses.find(c => c.id === courseId)?.name;

  return (
    <div style={{ padding: '0 1rem 1rem' }}>
      <Header title="Atividades & Provas" subtitle={courseName} right={courseName && <button onClick={() => { params.delete('disciplina'); setParams(params); }} aria-label="Mostrar todas as disciplinas" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '6.1875rem', padding: '0.3125rem 0.625rem', color: C.textSec, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: font }}>{courseName} <X size={12} /></button>} />
      <div role="tablist" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.125rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {([['all', 'Todas'], ['pending', 'Pendentes'], ['submitted', 'Entregues'], ['overdue', 'Atrasadas']] as const).map(([v, l]) => (
          <button key={v} role="tab" aria-selected={filter === v} onClick={() => setFilter(v)} style={{ padding: '0.4375rem 1rem', borderRadius: '6.1875rem', border: `1px solid ${filter === v ? C.primary : C.border}`, cursor: 'pointer', fontSize: '0.8rem', fontWeight: filter === v ? 600 : 400, whiteSpace: 'nowrap', background: filter === v ? C.primary : C.card, color: filter === v ? 'white' : C.textSec, fontFamily: font }}>{l}</button>
        ))}
      </div>

      {visible.length === 0 && <Empty icon={<ClipboardList size={24} />} title="Nada por aqui" text={data.courses.length ? 'Nenhuma atividade neste filtro.' : 'Entre em uma disciplina para ver as atividades.'} />}

      <div className="s-list">
        {visible.map(({ activity: a, course, submission, status }) => {
          const badge = statusBadge(status);
          return (
            <div key={a.id} style={{ ...sCard, borderLeft: status === 'overdue' ? `0.1875rem solid ${C.errorBorder}` : sCard.border }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.25rem' }}>{kindTag(a.kind)}</div>
                  <div style={{ color: C.title, fontSize: '0.88rem', fontWeight: 600 }}>{a.title}</div>
                  <div style={{ color: C.textSec, fontSize: '0.75rem', marginTop: '1px' }}>{course.name}</div>
                </div>
                <span style={{ background: badge.bg, color: badge.color, fontSize: '0.7rem', borderRadius: '0.5rem', padding: '0.1875rem 0.5625rem', fontWeight: 600, marginLeft: '0.5rem' }}>{badge.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: C.textSec, fontSize: '0.73rem' }}><Calendar size={12} /><span>{formatDate(a.due_at)}</span></div>
                {submission ? (
                  <button onClick={() => navigate(`/aluno/correcoes?envio=${submission.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: submission.grade === null ? C.textSec : gradeColor(submission.grade), fontSize: '1rem', fontWeight: 700, fontFamily: font }}>{submission.grade === null ? '…' : submission.grade.toFixed(1)}</button>
                ) : (
                  <button onClick={() => { params.set('resolver', a.id); setParams(params); }} style={{ background: C.primary, color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.4375rem 1rem', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>Resolver</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
