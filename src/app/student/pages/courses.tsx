import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { ChevronRight, KeyRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { C, font, gradeColor } from '../../lib/tokens';
import { useStudentData, type StudentData } from '../data';
import { courseSummary } from '../stats';
import { Header, sCard } from '../ui';

function JoinCourse() {
  const { reload } = useStudentData();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const join = async (e: FormEvent) => {
    e.preventDefault();
    setJoining(true);
    const { error } = await supabase.rpc('join_course', { code });
    setJoining(false);
    if (error) return toast.error(error.message === 'invalid course code' ? 'Código não encontrado. Confira com o professor.' : 'Não foi possível entrar na disciplina.');
    toast.success('Você entrou na disciplina!');
    setCode('');
    reload();
  };

  return (
    <form onSubmit={join} style={{ ...sCard, marginBottom: '1rem' }}>
      <label htmlFor="join" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: C.title, fontSize: '0.83rem', fontWeight: 600, marginBottom: '0.5rem' }}><KeyRound size={14} color={C.mid1} /> Entrar em uma disciplina</label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input id="join" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={12} placeholder="Código do professor (ex.: CALC01)" style={{ flex: 1, padding: '0.625rem 0.75rem', border: `1.5px solid ${C.border}`, borderRadius: '0.5625rem', fontSize: '0.85rem', letterSpacing: '1px', fontFamily: font, outline: 'none', minWidth: 0 }} />
        <button type="submit" disabled={code.trim().length < 4 || joining} style={{ background: code.trim().length >= 4 ? C.primary : '#C9B9AE', color: 'white', border: 'none', borderRadius: '0.5625rem', padding: '0 1rem', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: font }}>{joining ? <Loader2 size={14} className="animate-spin" /> : 'Entrar'}</button>
      </div>
    </form>
  );
}

export default function Courses({ data }: { data: StudentData }) {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '0 1rem 1rem' }}>
      <Header title="Minhas Disciplinas" subtitle={`${data.courses.length} disciplina${data.courses.length === 1 ? '' : 's'}`} />
      <JoinCourse />
      <div className="s-list">
        {data.courses.map(c => {
          const s = courseSummary(data, c.id);
          return (
            <div key={c.id} style={{ ...sCard, padding: 0, overflow: 'hidden', borderRadius: '0.875rem' }}>
              <div style={{ height: '0.25rem', background: C.primary }} />
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                  <div>
                    <span style={{ color: C.textTer, fontSize: '0.7rem' }}>{c.code}</span>
                    <div style={{ color: C.title, fontSize: '0.95rem', fontWeight: 700, marginTop: '1px' }}>{c.name}</div>
                    <div style={{ color: C.textSec, fontSize: '0.77rem', marginTop: '2px' }}>Prof. {data.teachers.get(c.teacher_id) ?? ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: s.avg === null ? C.textSec : gradeColor(s.avg), fontSize: '1.05rem', fontWeight: 800 }}>{s.avg === null ? '—' : s.avg.toFixed(1)}</div>
                    <div style={{ color: C.textTer, fontSize: '0.63rem' }}>nota</div>
                  </div>
                </div>
                {c.topics.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3125rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {c.topics.map(t => <span key={t} style={{ background: C.bg, color: C.textSec, fontSize: '0.7rem', borderRadius: '6.1875rem', padding: '0.1875rem 0.5625rem', border: `1px solid ${C.border}` }}>{t}</span>)}
                  </div>
                )}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textSec, fontSize: '0.75rem', marginBottom: '0.3125rem' }}><span>Progresso</span><span style={{ fontWeight: 600, color: C.title }}>{s.progress}%</span></div>
                  <div style={{ background: C.barEmpty, borderRadius: '6.1875rem', height: '0.375rem' }}><div style={{ background: C.barFill, height: '0.375rem', borderRadius: '6.1875rem', width: `${s.progress}%` }} /></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {s.pending > 0
                    ? <span style={{ background: C.errorBg, color: C.error, fontSize: '0.73rem', borderRadius: '0.5rem', padding: '0.25rem 0.625rem', fontWeight: 600 }}>{s.pending} pendente{s.pending > 1 ? 's' : ''}</span>
                    : <span style={{ background: C.successBg, color: C.success, fontSize: '0.73rem', borderRadius: '0.5rem', padding: '0.25rem 0.625rem', fontWeight: 600 }}>Em dia ✓</span>}
                  <button onClick={() => navigate(`/aluno/atividades?disciplina=${c.id}`)} style={{ background: 'none', border: 'none', color: C.mid1, fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.1875rem', fontFamily: font }}>Ver atividades <ChevronRight size={13} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
