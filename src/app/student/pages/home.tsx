import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, BookOpen, Brain, Calendar, FileText, Flame, Loader2, NotebookPen, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { C, font, gradeColor } from '../../lib/tokens';
import { useStudentData, type StudentData } from '../data';
import { courseSummary, level, overview, streak, topicScores } from '../stats';
import { formatDate } from '../../shared/ui';
import { sCard } from '../ui';

const PROMPTS = [
  (t: string) => `O que foi mais difícil em ${t} esta semana? Tente explicar com suas palavras.`,
  (t: string) => `Escreva um exemplo do dia a dia em que ${t} aparece.`,
  (t: string) => `Qual dúvida sobre ${t} você ainda quer tirar com o professor ou com a Katherine?`,
  () => 'O que você aprendeu hoje que não sabia ontem?',
  () => 'Como você vai se organizar para as próximas atividades?',
];

export const journalPrompt = (topic: string | null, date = new Date()) => {
  const day = Math.floor(date.getTime() / 864e5);
  const list = topic ? PROMPTS : PROMPTS.slice(3);
  return list[day % list.length](topic ?? '');
};

function Journal({ data, topic }: { data: StudentData; topic: string | null }) {
  const { reload } = useStudentData();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const prompt = journalPrompt(topic);
  const today = new Date().toDateString();
  const wroteToday = data.journal.some(j => new Date(j.created_at).toDateString() === today);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('journal_entries').insert({ prompt, content: text.trim() });
    setSaving(false);
    if (error) return toast.error('Não foi possível salvar.');
    setText('');
    toast.success('Reflexão salva! +5 XP');
    reload();
  };

  return (
    <div style={{ ...sCard, marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4375rem', marginBottom: '0.5rem' }}>
        <NotebookPen size={14} color={C.primary} />
        <span style={{ color: C.primary, fontSize: '0.8rem', fontWeight: 700 }}>Diário</span>
        <span style={{ marginLeft: 'auto', color: C.textTer, fontSize: '0.68rem' }}>{data.journal.length} reflexões</span>
      </div>
      <p style={{ color: C.title, fontSize: '0.84rem', lineHeight: 1.5, margin: '0 0 0.625rem' }}>{prompt}</p>
      {wroteToday ? (
        <p style={{ color: C.success, fontSize: '0.78rem', margin: 0 }}>✓ Você já escreveu hoje. Volte amanhã para uma nova reflexão.</p>
      ) : (
        <>
          <textarea value={text} onChange={e => setText(e.target.value)} maxLength={4000} placeholder="Escreva sua reflexão…" aria-label="Reflexão do diário" style={{ width: '100%', minHeight: '5rem', padding: '0.625rem 0.75rem', border: `1.5px solid ${C.border}`, borderRadius: '0.5625rem', fontSize: '0.84rem', fontFamily: font, color: C.title, resize: 'vertical', boxSizing: 'border-box', outline: 'none', background: C.bg }} />
          <button onClick={save} disabled={!text.trim() || saving} style={{ marginTop: '0.5rem', background: text.trim() ? C.primary : '#C9B9AE', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 600, cursor: text.trim() ? 'pointer' : 'not-allowed', fontFamily: font, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {saving && <Loader2 size={13} className="animate-spin" />} Salvar reflexão
          </button>
        </>
      )}
      {data.journal[0] && (
        <details style={{ marginTop: '0.625rem' }}>
          <summary style={{ color: C.mid1, fontSize: '0.75rem', cursor: 'pointer' }}>Ver reflexões anteriores</summary>
          {data.journal.slice(0, 10).map(j => (
            <div key={j.id} style={{ borderTop: `1px solid ${C.bg}`, padding: '0.5rem 0' }}>
              <div style={{ color: C.textTer, fontSize: '0.68rem' }}>{formatDate(j.created_at)} · {j.prompt}</div>
              <div style={{ color: C.title, fontSize: '0.8rem', whiteSpace: 'pre-wrap', marginTop: '2px' }}>{j.content}</div>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

function GeneralFeedback() {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ask = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('katherine', { body: { mode: 'feedback' } });
    setLoading(false);
    if (error || !data?.text) return toast.error('A Katherine não conseguiu analisar agora. Tente de novo.');
    setText(data.text);
  };
  if (text) return <div style={{ marginTop: '0.625rem', padding: '0.625rem 0.75rem', background: C.bg, borderRadius: '0.5rem', color: C.title, fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{text.split('**').map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</div>;
  return (
    <button onClick={ask} disabled={loading} style={{ marginTop: '0.5rem', background: 'none', border: 'none', padding: 0, color: C.mid1, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3125rem', fontFamily: font }}>
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Ver feedback geral do meu desempenho
    </button>
  );
}

export default function Home({ data, firstName }: { data: StudentData; firstName: string }) {
  const navigate = useNavigate();
  const o = overview(data);
  const lv = level(o.xp);
  const days = streak(data);
  const topics = topicScores(data);
  const weakest = topics[0] && topics[0].score < 80 ? topics[0].topic : null;
  const strongest = topics.length > 1 ? topics[topics.length - 1] : null;

  return (
    <div style={{ padding: '0 1rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0' }}>
        <div>
          <div style={{ color: C.textSec, fontSize: '0.8rem' }}>Bem-vindo de volta</div>
          <h1 style={{ color: C.title, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Olá, {firstName}!</h1>
        </div>
        <div style={{ width: '2.375rem', height: '2.375rem', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>{firstName[0]}</div>
      </div>

      <div className="s-cols">
        <div>
          <div style={{ background: C.primary, borderRadius: '0.875rem', padding: '1.125rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>Nível {lv.level}</div>
                <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600 }}>{lv.title}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem' }} title="Dias seguidos com atividade ou reflexão">
                <Flame size={15} color={days ? '#FFAF03' : 'rgba(255,255,255,0.4)'} />
                <span style={{ color: days ? '#FFAF03' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.9rem' }}>{days} {days === 1 ? 'dia' : 'dias'}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6.1875rem', height: '0.375rem', marginBottom: '0.375rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.8)', height: '0.375rem', borderRadius: '6.1875rem', width: `${(lv.into / lv.next) * 100}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
              <span>{o.xp.toLocaleString('pt-BR')} XP</span>
              <span>faltam {(lv.next - lv.into).toLocaleString('pt-BR')} XP</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Pendentes', value: String(o.pending), icon: <FileText size={16} color={C.pending} /> },
              { label: 'Esta semana', value: `${o.examsThisWeek} prova${o.examsThisWeek === 1 ? '' : 's'}`, icon: <Calendar size={16} color={C.textSec} /> },
              { label: 'Média geral', value: o.avg === null ? '—' : o.avg.toFixed(1), icon: <Star size={16} color={C.mid1} /> },
            ].map(s => (
              <div key={s.label} style={{ ...sCard, padding: '0.875rem 0.625rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.375rem' }}>{s.icon}</div>
                <div style={{ color: C.title, fontSize: '0.95rem', fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: C.textTer, fontSize: '0.68rem', marginTop: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {o.overdue.slice(0, 2).map(r => (
            <button key={r.activity.id} onClick={() => navigate('/aluno/atividades')} style={{ width: '100%', textAlign: 'left', background: '#FFF8F7', border: 'none', borderLeft: `0.1875rem solid ${C.errorBorder}`, borderRadius: '0.625rem', padding: '0.75rem 0.875rem', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontFamily: font }}>
              <AlertCircle size={15} color={C.error} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: C.title, fontSize: '0.83rem', fontWeight: 600 }}>Atividade em atraso</div>
                <div style={{ color: C.textSec, fontSize: '0.77rem', marginTop: '1px' }}>{r.activity.title} ({r.course.name}) · venceu em {formatDate(r.activity.due_at)}</div>
              </div>
            </button>
          ))}

          <div style={{ ...sCard, marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4375rem', marginBottom: '0.5rem' }}>
              <Sparkles size={14} color={C.primary} />
              <span style={{ color: C.primary, fontSize: '0.8rem', fontWeight: 700 }}>Katherine diz</span>
            </div>
            <div style={{ color: C.textSec, fontSize: '0.83rem', lineHeight: 1.6 }}>
              {weakest ? (
                <>{strongest && strongest.score >= 70 ? <>Você está indo bem em <span style={{ color: C.title, fontWeight: 600 }}>{strongest.topic}</span>! </> : null}Seu maior desafio agora é <span style={{ color: C.title, fontWeight: 600 }}>{weakest}</span> ({topics[0].score}% de acerto). Que tal revisar com a minha ajuda?</>
              ) : topics.length ? 'Ótimo desempenho até aqui! Continue praticando para manter o ritmo.' : 'Assim que você entregar atividades, eu mostro aqui seus pontos fortes e onde vale revisar.'}
            </div>
            {data.submissions.length > 0 && <GeneralFeedback />}
            <button onClick={() => navigate('/aluno/katherine')} style={{ marginTop: '0.75rem', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.4375rem 0.875rem', fontSize: '0.78rem', fontWeight: 500, color: C.title, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: font }}>
              <Brain size={13} color={C.primary} /> Perguntar à Katherine
            </button>
          </div>

        </div>
        <div>
          <div style={{ margin: '0.625rem 0 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <span style={{ color: C.title, fontSize: '0.9rem', fontWeight: 700 }}>Progresso nas Disciplinas</span>
              <button onClick={() => navigate('/aluno/disciplinas')} style={{ color: C.mid1, fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontFamily: font }}>Ver todas</button>
            </div>
            {data.courses.length === 0 && (
              <button onClick={() => navigate('/aluno/disciplinas')} style={{ ...sCard, width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '0.625rem', alignItems: 'center', fontFamily: font }}>
                <BookOpen size={18} color={C.mid1} />
                <span style={{ color: C.title, fontSize: '0.84rem' }}>Você ainda não está em nenhuma disciplina. Toque aqui e use o código que o professor passou.</span>
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {data.courses.slice(0, 3).map(c => {
                const s = courseSummary(data, c.id);
                return (
                  <div key={c.id} style={sCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                      <div>
                        <div style={{ color: C.title, fontSize: '0.87rem', fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: C.textTer, fontSize: '0.73rem', marginTop: '1px' }}>Prof. {data.teachers.get(c.teacher_id) ?? ''}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span style={{ color: s.avg === null ? C.textSec : gradeColor(s.avg), fontSize: '0.95rem', fontWeight: 700 }}>{s.avg === null ? '—' : s.avg.toFixed(1)}</span>
                        {s.pending > 0 && <span style={{ background: C.errorBg, color: C.error, fontSize: '0.65rem', borderRadius: '6.1875rem', padding: '2px 0.4375rem', fontWeight: 600 }}>{s.pending} pendente{s.pending > 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <div style={{ background: C.barEmpty, borderRadius: '6.1875rem', height: '0.3125rem' }}><div style={{ background: C.barFill, height: '0.3125rem', borderRadius: '6.1875rem', width: `${s.progress}%` }} /></div>
                    <div style={{ color: C.textTer, fontSize: '0.68rem', marginTop: '0.3125rem' }}>{s.progress}% concluído</div>
                  </div>
                );
              })}
            </div>
          </div>

          <Journal data={data} topic={weakest} />
        </div>
      </div>
    </div>
  );
}
