import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Calendar, Check, ChevronRight, ClipboardCheck, Loader2, Sparkles, X } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { C, essayStyle, font, gradeColor } from '../../lib/tokens';
import { FeedbackList, useFeedback, type FeedbackRow } from '../../shared/feedback';
import { Empty, formatDate } from '../../shared/ui';
import type { StudentData } from '../data';
import { Header, sCard } from '../ui';
import { StudentAnswerKeyFile } from '../../shared/answer-key-file';

export function feedbackSummary(rows: FeedbackRow[]) {
  const obj = rows.filter(r => r.kind === 'objective');
  const ess = rows.filter(r => r.kind === 'essay');
  const right = obj.filter(r => r.score === 100).length;
  const missed = [...new Set(rows.filter(r => (r.score ?? 0) < 60 && r.topic).map(r => r.topic!))];
  const missingKeywords = ess.flatMap(r => r.keywords.filter(k => !r.matched_keywords.includes(k))).slice(0, 4);
  const parts: string[] = [];
  if (obj.length) parts.push(`Você acertou ${right} de ${obj.length} questões objetivas.`);
  if (missed.length) parts.push(`Vale revisar ${missed.join(' e ')}.`);
  if (missingKeywords.length) parts.push(`Nas dissertativas, faltou mencionar: ${missingKeywords.join(', ')}.`);
  if (!missed.length && !missingKeywords.length) parts.push('Excelente trabalho, continue assim!');
  return parts.join(' ');
}

function KatherineFeedback({ submissionId, rows }: { submissionId: string; rows: FeedbackRow[] }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    supabase.functions.invoke('katherine', { body: { mode: 'feedback', submission_id: submissionId } }).then(({ data, error }) => {
      if (alive) setText(error || !data?.text ? feedbackSummary(rows) : data.text);
    });
    return () => { alive = false; };
  }, [submissionId, rows]);
  return text === null ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Loader2 size={13} className="animate-spin" /> Katherine está analisando sua correção…</span> : <span style={{ whiteSpace: 'pre-wrap' }}>{renderBoldText(text)}</span>;
}

const renderBoldText = (t: string) => t.split('**').map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

function Detail({ data, submissionId, onBack }: { data: StudentData; submissionId: string; onBack: () => void }) {
  const { rows, error } = useFeedback(submissionId);
  const sub = data.submissions.find(s => s.id === submissionId);
  const activity = data.activities.find(a => a.id === sub?.activity_id);
  const course = data.courses.find(c => c.id === activity?.course_id);

  return (
    <div className="s-narrow">
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem', color: C.mid1, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 500, marginBottom: '1rem', padding: 0, fontFamily: font }}><ArrowLeft size={15} /> Voltar</button>
      <div style={{ ...sCard, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: C.title, fontSize: '0.95rem', fontWeight: 700 }}>{activity?.title}</div>
          <div style={{ color: C.textSec, fontSize: '0.78rem', marginTop: '2px' }}>{course?.name} · {formatDate(sub?.submitted_at ?? null)}</div>
          {sub && !sub.reviewed && <div style={{ color: C.pending, fontSize: '0.72rem', marginTop: '0.25rem' }}>Aguardando revisão do professor</div>}
          {activity && <StudentAnswerKeyFile activityId={activity.id} />}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: sub?.grade == null ? C.textSec : gradeColor(sub.grade), fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{sub?.grade == null ? '—' : sub.grade.toFixed(1)}</div>
          <div style={{ color: C.textTer, fontSize: '0.68rem' }}>nota final</div>
        </div>
      </div>
      <h2 style={{ color: C.title, fontSize: '0.87rem', fontWeight: 700, margin: '0 0 0.625rem' }}>Detalhamento por Questão</h2>
      {error && <p style={{ color: C.error, fontSize: '0.8rem' }}>Não foi possível carregar a correção.</p>}
      {!rows && !error && <Loader2 size={20} color={C.primary} className="animate-spin" />}
      {rows && (
        <>
          <FeedbackList rows={rows} />
          <div style={{ ...sCard, marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.4375rem' }}><Sparkles size={13} color={C.primary} /><span style={{ color: C.primary, fontSize: '0.8rem', fontWeight: 700 }}>Feedback da Katherine</span></div>
            <div style={{ color: C.textSec, fontSize: '0.83rem', lineHeight: 1.6 }}><KatherineFeedback submissionId={submissionId} rows={rows} /></div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Corrections({ data }: { data: StudentData }) {
  const [params, setParams] = useSearchParams();
  const open = params.get('envio');
  const activity = new Map(data.activities.map(a => [a.id, a]));
  const course = new Map(data.courses.map(c => [c.id, c.name]));
  const kind = new Map(data.questions.map(q => [q.id, q]));
  const list = [...data.submissions].sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));

  return (
    <div style={{ padding: '0 1rem 1rem' }}>
      <Header title="Histórico de Correções" subtitle={`${list.length} atividade${list.length === 1 ? '' : 's'} corrigida${list.length === 1 ? '' : 's'}`} />
      {open ? <Detail data={data} submissionId={open} onBack={() => { params.delete('envio'); setParams(params); }} /> : (
        <div className="s-list">
          {list.length === 0 && <Empty icon={<ClipboardCheck size={24} />} title="Nenhuma correção ainda" text="Resolva uma atividade e a correção automática aparece aqui na hora." />}
          {list.map(s => {
            const a = activity.get(s.activity_id);
            const answers = data.answers.filter(x => x.submission_id === s.id).sort((x, y) => (kind.get(x.question_id)?.position ?? 0) - (kind.get(y.question_id)?.position ?? 0));
            return (
              <button key={s.id} onClick={() => { params.set('envio', s.id); setParams(params); }} style={{ ...sCard, textAlign: 'left', cursor: 'pointer', fontFamily: font, width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ color: C.title, fontSize: '0.88rem', fontWeight: 700 }}>{a?.title}</div>
                    <div style={{ color: C.textSec, fontSize: '0.75rem', marginTop: '1px' }}>{course.get(a?.course_id ?? '')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: C.textTer, fontSize: '0.7rem', marginTop: '0.25rem' }}><Calendar size={11} /><span>{formatDate(s.submitted_at)}</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: s.grade === null ? C.textSec : gradeColor(s.grade), fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{s.grade === null ? '—' : s.grade.toFixed(1)}</div>
                    <div style={{ color: C.textTer, fontSize: '0.65rem' }}>nota</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.3125rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {answers.map(x => {
                    const q = kind.get(x.question_id);
                    const objective = q?.kind === 'objective';
                    const ok = x.score === 100;
                    const color = objective ? (ok ? C.success : C.error) : essayStyle(x.score ?? 0).color;
                    return (
                      <div key={x.id} title={`Q${q?.position}`} style={{ width: '1.5625rem', height: '1.5625rem', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {objective ? (ok ? <Check size={11} color="white" /> : <X size={11} color="white" />) : <span style={{ color: 'white', fontSize: '0.5rem', fontWeight: 700 }}>{x.score}</span>}
                      </div>
                    );
                  })}
                  <span style={{ marginLeft: 'auto', color: C.textSec, fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: '2px' }}>Detalhes <ChevronRight size={13} /></span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
