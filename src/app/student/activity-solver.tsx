import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Brain, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import type { Row } from '../lib/database.types';
import { C, font, gradeColor } from '../lib/tokens';
import { FeedbackList, useFeedback } from '../shared/feedback';
import type { Activity, Course } from './data';
import { kindTag, sCard } from './ui';

type Question = Row<'questions'>;
const LETTERS = ['A', 'B', 'C', 'D'];
const btn = (primary: boolean, off = false) => ({ flex: 1, padding: '0.75rem', background: primary ? (off ? '#C9B9AE' : C.primary) : C.card, color: primary ? 'white' : C.title, border: primary ? 'none' : `1.5px solid ${C.border}`, borderRadius: '0.625rem', fontSize: '0.87rem', fontWeight: 600, cursor: off ? 'not-allowed' : 'pointer', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4375rem' }) as const;

function Result({ submissionId, onClose }: { submissionId: string; onClose: () => void }) {
  const { rows } = useFeedback(submissionId);
  const [grade, setGrade] = useState<number | null>(null);
  useEffect(() => {
    supabase.from('submissions').select('grade').eq('id', submissionId).single().then(({ data }) => setGrade(data?.grade ?? null));
  }, [submissionId]);

  return (
    <div>
      <div style={{ ...sCard, textAlign: 'center', marginBottom: '1rem' }}>
        <CheckCircle2 size={32} color={grade === null ? C.textSec : gradeColor(grade)} style={{ margin: '0 auto 0.5rem' }} />
        <div style={{ color: grade === null ? C.textSec : gradeColor(grade), fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{grade === null ? '…' : grade.toFixed(1)}</div>
        <div style={{ color: C.textSec, fontSize: '0.8rem', marginTop: '0.375rem' }}>Correção automática concluída. O professor ainda pode revisar as dissertativas.</div>
      </div>
      {rows ? <FeedbackList rows={rows} /> : <Loader2 size={20} color={C.primary} className="animate-spin" />}
      <button onClick={onClose} style={{ ...btn(true), width: '100%', marginTop: '1rem' }}>Voltar às atividades</button>
    </div>
  );
}

export default function ActivitySolver({ activity, course, onClose, onSubmitted }: { activity: Activity; course: Course; onClose: () => void; onSubmitted: () => void }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('questions').select('*').eq('activity_id', activity.id).order('position').then(({ data }) => setQuestions(data ?? []));
  }, [activity.id]);

  const answered = questions?.filter(q => (answers[q.id] ?? '').trim().length > 0).length ?? 0;
  const total = questions?.length ?? 0;

  const submit = async () => {
    if (answered < total && !confirm(`Você respondeu ${answered} de ${total} questões. Enviar mesmo assim?`)) return;
    setSending(true);
    const { data, error } = await supabase.rpc('submit_activity', {
      activity: activity.id,
      responses: Object.entries(answers).map(([question_id, response]) => ({ question_id, response })),
    });
    setSending(false);
    if (error) return toast.error(error.message === 'already submitted' ? 'Você já enviou esta atividade.' : 'Não foi possível enviar. Verifique sua conexão.');
    setSubmissionId(data);
    onSubmitted();
  };

  return (
    <div className="s-narrow" style={{ padding: '0 1rem 1rem' }}>
      <div style={{ padding: '1.125rem 0 0.875rem' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem', color: C.mid1, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 500, padding: 0, marginBottom: '0.75rem', fontFamily: font }}><ArrowLeft size={15} /> Voltar</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>{kindTag(activity.kind)}</div>
        <h1 style={{ color: C.title, fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{activity.title}</h1>
        <p style={{ color: C.textSec, fontSize: '0.78rem', margin: '2px 0 0' }}>{course.name}</p>
        {!submissionId && <button onClick={() => navigate(`/aluno/katherine?atividade=${activity.id}`)} style={{ marginTop: '0.625rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.4375rem 0.75rem', fontSize: '0.76rem', color: C.title, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: font }}><Brain size={13} color={C.primary} /> Pedir ajuda à Katherine</button>}
      </div>

      {submissionId ? <Result submissionId={submissionId} onClose={onClose} /> : questions === null ? (
        <Loader2 size={22} color={C.primary} className="animate-spin" />
      ) : (
        <>
          <div style={{ ...sCard, padding: '0.75rem 1rem', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: C.textSec, marginBottom: '0.375rem' }}><span>Progresso</span><span style={{ color: C.title, fontWeight: 600 }}>{answered}/{total}</span></div>
            <div style={{ background: C.barEmpty, borderRadius: '6.1875rem', height: '0.375rem' }}><div style={{ background: C.barFill, height: '0.375rem', borderRadius: '6.1875rem', width: `${total ? (answered / total) * 100 : 0}%`, transition: 'width 0.2s' }} /></div>
          </div>
          {questions.map(q => (
            <fieldset key={q.id} style={{ ...sCard, margin: '0 0 0.75rem' }}>
              <legend style={{ display: 'contents' }}>
                <span style={{ display: 'block', color: C.textTer, fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Questão {q.position} · {q.kind === 'objective' ? 'objetiva' : 'dissertativa'}{q.topic ? ` · ${q.topic}` : ''}</span>
                <span style={{ display: 'block', color: C.title, fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '0.75rem' }}>{q.prompt}</span>
              </legend>
              {q.kind === 'objective' ? (
                <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: '0.4375rem' }}>
                  {((q.options as string[] | null) ?? []).map((opt, i) => {
                    const L = LETTERS[i];
                    const selected = answers[q.id] === L;
                    return (
                      <label key={L} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', borderRadius: '0.5625rem', border: `1.5px solid ${selected ? C.primary : C.border}`, background: selected ? '#F6EEE6' : C.card, cursor: 'pointer', fontSize: '0.84rem', color: C.title }}>
                        <input type="radio" name={q.id} checked={selected} onChange={() => setAnswers(a => ({ ...a, [q.id]: L }))} style={{ accentColor: C.primary }} />
                        <strong style={{ color: C.textSec }}>{L})</strong> {opt}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <textarea value={answers[q.id] ?? ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} placeholder="Escreva sua resposta…" aria-label={`Resposta da questão ${q.position}`} maxLength={5000} style={{ width: '100%', minHeight: '6.875rem', padding: '0.625rem 0.75rem', border: `1.5px solid ${C.border}`, borderRadius: '0.5625rem', fontSize: '0.85rem', fontFamily: font, color: C.title, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
              )}
            </fieldset>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: C.textSec, fontSize: '0.74rem', margin: '0.25rem 0 0.75rem' }}><Sparkles size={13} color={C.primary} /> A correção é automática e sai assim que você enviar. Você só pode enviar uma vez.</div>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button onClick={onClose} style={btn(false)}>Cancelar</button>
            <button onClick={submit} disabled={sending || answered === 0} style={btn(true, sending || answered === 0)}>{sending ? <Loader2 size={15} className="animate-spin" /> : 'Enviar respostas'}</button>
          </div>
        </>
      )}
    </div>
  );
}
