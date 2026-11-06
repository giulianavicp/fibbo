import { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { C, essayStyle, font } from '../lib/tokens';

export type FeedbackRow = Database['public']['Functions']['submission_feedback']['Returns'][number];

const LETTERS = ['A', 'B', 'C', 'D'];

export function useFeedback(submissionId: string, version = 0) {
  const [rows, setRows] = useState<FeedbackRow[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    supabase.rpc('submission_feedback', { submission: submissionId }).then(({ data, error: e }) => {
      if (e) setError(true);
      else setRows(data ?? []);
    });
  }, [submissionId, version]);
  return { rows, error };
}

function ScoreEditor({ answerId, score, onSaved }: { answerId: string; score: number; onSaved: (grade: number) => void }) {
  const [value, setValue] = useState(String(score));
  const [saving, setSaving] = useState(false);
  const n = Number(value);
  const valid = value !== '' && n >= 0 && n <= 100 && n !== score;

  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase.rpc('review_answer', { answer: answerId, new_score: n });
    setSaving(false);
    if (!error && data !== null) onSaved(data);
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      <input type="number" min={0} max={100} value={value} onChange={e => setValue(e.target.value)} aria-label="Nova pontuação (0 a 100)" style={{ width: '4rem', padding: '0.25rem 0.375rem', border: `1.5px solid ${C.border}`, borderRadius: '0.4375rem', fontSize: '0.78rem', fontFamily: font }} />
      <button type="button" disabled={!valid || saving} onClick={save} style={{ background: valid ? C.primary : '#C9B9AE', color: 'white', border: 'none', borderRadius: '0.4375rem', padding: '0.3125rem 0.625rem', fontSize: '0.72rem', fontWeight: 600, cursor: valid ? 'pointer' : 'not-allowed', fontFamily: font }}>
        {saving ? <Loader2 size={12} className="animate-spin" /> : 'Ajustar'}
      </button>
    </span>
  );
}

export function FeedbackList({ rows, answerIds, onGradeChange }: { rows: FeedbackRow[]; answerIds?: Map<string, string>; onGradeChange?: (grade: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {rows.map(r => {
        const objective = r.kind === 'objective';
        const ok = objective && r.score === 100;
        const style = objective ? (ok ? { color: C.success, bg: C.successBg, border: C.successBorder, label: 'correta' } : { color: C.error, bg: C.errorBg, border: C.errorBorder, label: 'incorreta' }) : essayStyle(r.score ?? 0);
        const options = (r.options as string[] | null) ?? [];
        const answerId = answerIds?.get(r.question_id);
        return (
          <div key={r.question_id} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: '0.625rem', padding: '0.75rem 0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              <div style={{ width: '1.625rem', height: '1.625rem', borderRadius: '50%', background: style.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {objective ? (ok ? <Check size={14} /> : <X size={14} />) : <span style={{ fontSize: '0.62rem', fontWeight: 700 }}>{r.score}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.title, fontSize: '0.82rem', fontWeight: 600 }}>{r.pos}. {r.prompt}</div>
                <div style={{ color: C.textSec, fontSize: '0.7rem', marginTop: '1px' }}>{objective ? 'objetiva' : 'dissertativa'}{r.topic ? ` · ${r.topic}` : ''} · <strong style={{ color: style.color }}>{style.label}</strong></div>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', marginLeft: '2.25rem', fontSize: '0.78rem', color: C.title, lineHeight: 1.5 }}>
              {objective ? (
                <>
                  <div>Resposta: <strong>{r.response ? `${r.response}) ${options[LETTERS.indexOf(r.response)] ?? ''}` : 'em branco'}</strong></div>
                  {!ok && <div>Correta: <strong style={{ color: C.success }}>{r.correct_option}) {options[LETTERS.indexOf(r.correct_option ?? '')]}</strong></div>}
                </>
              ) : (
                <>
                  <div style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.6)', borderRadius: '0.4375rem', padding: '0.4375rem 0.5625rem' }}>{r.response || 'em branco'}</div>
                  <div style={{ marginTop: '0.375rem', display: 'flex', flexWrap: 'wrap', gap: '0.3125rem' }}>
                    {r.keywords.map(k => {
                      const hit = r.matched_keywords.includes(k);
                      return <span key={k} style={{ fontSize: '0.7rem', borderRadius: '6.1875rem', padding: '2px 0.5rem', background: hit ? C.successBg : C.card, color: hit ? C.success : C.textSec, border: `1px solid ${hit ? C.successBorder : C.border}` }}>{hit ? '✓ ' : ''}{k}</span>;
                    })}
                  </div>
                  <div style={{ color: C.textSec, fontSize: '0.72rem', marginTop: '0.375rem' }}>{r.matched_keywords.length} de {r.keywords.length} palavras-chave · {r.score}%</div>
                  {answerId && onGradeChange && <div style={{ marginTop: '0.5rem' }}><ScoreEditor answerId={answerId} score={r.score ?? 0} onSaved={onGradeChange} /></div>}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
