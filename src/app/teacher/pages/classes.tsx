import { useState } from 'react';
import { Eye, Search, Users, X } from 'lucide-react';
import { C, font, gradeColor } from '../../lib/tokens';
import type { TeacherData } from '../data';
import { studentRows } from '../stats';
import { CourseFilter, Empty, Input, Page, StatusBadge, card, fmtGrade, formatDate, initials } from '../../shared/ui';

function StudentDetail({ data, studentId, courseId, onClose }: { data: TeacherData; studentId: string; courseId: string; onClose: () => void }) {
  const name = data.students.find(s => s.id === studentId)?.full_name ?? 'Aluno';
  const courses = new Set(data.enrollments.filter(e => e.student_id === studentId && (!courseId || e.course_id === courseId)).map(e => e.course_id));
  const activities = data.activities.filter(a => courses.has(a.course_id));
  const courseName = new Map(data.courses.map(c => [c.id, c.name]));

  return (
    <div role="dialog" aria-label={`Desempenho de ${name}`} style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(46,42,38,0.45)' }} />
      <div style={{ position: 'relative', width: 'min(27.5rem, 100%)', background: C.bg, height: '100%', overflowY: 'auto', padding: '1.375rem', fontFamily: font }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.125rem' }}>
          <div style={{ width: '2.625rem', height: '2.625rem', borderRadius: '50%', background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initials(name)}</div>
          <div style={{ flex: 1, color: C.title, fontWeight: 700 }}>{name}</div>
          <button onClick={onClose} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSec }}><X size={18} /></button>
        </div>
        {activities.length === 0 && <p style={{ color: C.textSec, fontSize: '0.82rem' }}>Nenhuma atividade cadastrada.</p>}
        {activities.map(a => {
          const sub = data.submissions.find(s => s.activity_id === a.id && s.student_id === studentId);
          const late = !sub && a.due_at && new Date(a.due_at) < new Date();
          return (
            <div key={a.id} style={{ ...card, padding: '0.75rem 0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.title, fontSize: '0.82rem', fontWeight: 600 }}>{a.title}</div>
                <div style={{ color: C.textTer, fontSize: '0.7rem' }}>{courseName.get(a.course_id)} · prazo {formatDate(a.due_at)}</div>
              </div>
              {sub ? (
                <span style={{ color: sub.grade === null ? C.pending : gradeColor(sub.grade), fontWeight: 700, fontSize: '0.9rem' }}>{sub.grade === null ? 'corrigindo' : fmtGrade(sub.grade)}</span>
              ) : (
                <span style={{ color: late ? C.error : C.textSec, fontSize: '0.72rem', fontWeight: 600 }}>{late ? 'não entregue' : 'pendente'}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Classes({ data }: { data: TeacherData }) {
  const [courseId, setCourseId] = useState(data.courses[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const course = data.courses.find(c => c.id === courseId);
  const rows = studentRows(data, courseId || undefined).filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Page
      title="Turmas"
      subtitle={course ? `${course.name} · ${studentRows(data, courseId).length} alunos · código de acesso ${course.join_code}` : 'Todas as disciplinas'}
    >
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.125rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '12.5rem' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: C.textSec }} />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." aria-label="Buscar aluno" style={{ paddingLeft: '2.125rem' }} />
        </div>
        <CourseFilter courses={data.courses} value={courseId} onChange={setCourseId} />
      </div>

      {rows.length === 0 ? (
        <Empty icon={<Users size={24} />} title={search ? 'Nenhum aluno encontrado' : 'Nenhum aluno matriculado'} text={search ? 'Tente outro nome.' : `Compartilhe o código ${course?.join_code ?? ''} com os alunos para que eles entrem na disciplina.`} />
      ) : (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '35rem' }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['Aluno', 'Média', 'Entregas', 'Status', ''].map(h => (
                  <th key={h} scope="col" style={{ textAlign: 'left', padding: '0.625rem 1rem', color: C.textSec, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(s => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.bg}` }}>
                  <td style={{ padding: '0.6875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: '1.875rem', height: '1.875rem', borderRadius: '50%', background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSec, fontSize: '0.72rem', fontWeight: 700 }}>{initials(s.name)}</div>
                      <span style={{ color: C.title, fontSize: '0.83rem' }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.6875rem 1rem', color: s.avg === null ? C.textSec : gradeColor(s.avg), fontSize: '0.88rem', fontWeight: 700 }}>{fmtGrade(s.avg)}</td>
                  <td style={{ padding: '0.6875rem 1rem', color: C.textSec, fontSize: '0.82rem' }}>{s.delivered}/{s.total}</td>
                  <td style={{ padding: '0.6875rem 1rem' }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: '0.6875rem 1rem' }}>
                    <button onClick={() => setOpen(s.id)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.4375rem', padding: '0.3125rem 0.625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: C.textSec, fontSize: '0.73rem', fontFamily: font }}><Eye size={12} /> Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && <StudentDetail data={data} studentId={open} courseId={courseId} onClose={() => setOpen(null)} />}
    </Page>
  );
}
